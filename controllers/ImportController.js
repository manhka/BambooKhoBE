const xlsx = require("xlsx");
const { sequelize, ImportOrder, ImportDetail, Product, Supplier, User } = require("../models");
const { validateImportDetails, validateImportOrder } = require("../validators/ImportValidator");
const { Op } = require("sequelize");


// ----- Function 4.1: Nhập hàng từ file Excel -----
exports.uploadImportFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No Excel file uploaded." });
  }

  const transaction = await sequelize.transaction();

  try {
    // Đọc dữ liệu từ file Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return res.status(400).json({ message: "Excel file is empty or invalid format." });
    }

    // Lấy thông tin chung (UserID, SupplierID)
    const userId = req.body.UserID || req.user?.userId; // Lấy từ token hoặc body
    const supplierId = req.body.SupplierID || jsonData[0]?.SupplierID; // Lấy từ body hoặc dòng đầu Excel
    const importDate = req.body.ImportDate || new Date();

    // Validate thông tin chung của Order
    const { isOrderValid, orderErrors } = await validateImportOrder({ SupplierID: supplierId, UserID: userId, ImportDate: importDate });
    if (!isOrderValid) {
      // require('fs').unlinkSync(req.file.path); // Xóa file nếu lỗi validation
      return res.status(400).json({ message: "Invalid order data.", errors: orderErrors });
    }

    // Validate chi tiết từng dòng trong Excel
    const { isValid, errors, validDetails, productUpdates } =
      await validateImportDetails(jsonData);

    if (!isValid) {
      // require('fs').unlinkSync(req.file.path); // Xóa file nếu lỗi validation
      return res.status(400).json({ message: "Invalid data in Excel file.", errors });
    }

    // --- Bắt đầu Transaction sau khi validate thành công ---
    // const transaction = await sequelize.transaction(); // Bắt đầu transaction ở đây nếu validate thành công

    // Tính tổng tiền
    const totalOrderAmount = validDetails.reduce((sum, detail) => sum + detail.Total, 0);

    // Tạo ImportOrder
    const importOrder = await ImportOrder.create(
      {
        ImportDate: importDate,
        Total: totalOrderAmount,
        SupplierID: supplierId,
        UserID: userId,
      },
      { transaction }
    );

    // Tạo ImportDetails
    const importDetailData = validDetails.map((detail) => ({
      ...detail,
      ImportID: importOrder.ImportID,
    }));
    await ImportDetail.bulkCreate(importDetailData, { transaction });

    // Cập nhật số lượng sản phẩm trong kho
    for (const barcode in productUpdates) {
      // Dùng increment cho an toàn hơn khi có nhiều request đồng thời
      await Product.increment('NumberOfProduct', {
        by: productUpdates[barcode],
        where: { BarcodeProduct: barcode },
        transaction,
      });
    }

    // Commit transaction
    await transaction.commit();

    res.status(201).json({
      message: "Import successful!",
      importOrder: importOrder,
    });

  } catch (error) {
    // Rollback nếu có bất kỳ lỗi nào xảy ra trong khối try
    await transaction.rollback();
    console.error("Import Error:", error);
    res.status(500).json({ message: "Server error during import.", error: error.message });
  }
};


// ----- Function 4.2: Xem/Tìm kiếm lịch sử nhập hàng -----
exports.getImportHistory = async (req, res) => {
  try {
    const { fromDate, toDate, supplierId, userId, barcode } = req.query;

    const orderWhereClause = {};
    const includeOptions = [
      {
        model: ImportDetail,
        as: 'ImportDetails',
        include: [{
          model: Product,
          as: 'Product',
          attributes: ['ProductName']
        }]
      },
      {
        model: Supplier,
        as: 'Supplier',
        attributes: ['SupplierName']
      },
      {
        model: User,
        as: 'User',
        attributes: ['Username']
      }
    ];

    // Lọc theo ngày
    if (fromDate && toDate) {
      orderWhereClause.ImportDate = { [Op.between]: [new Date(fromDate), new Date(toDate)] };
    } else if (fromDate) {
      orderWhereClause.ImportDate = { [Op.gte]: new Date(fromDate) };
    } else if (toDate) {
      orderWhereClause.ImportDate = { [Op.lte]: new Date(toDate) };
    }

    // Lọc theo SupplierID và UserID
    if (supplierId) orderWhereClause.SupplierID = supplierId;
    if (userId) orderWhereClause.UserID = userId;

    // Lọc theo BarcodeProduct (trong ImportDetail)
    if (barcode) {
      const relevantImportIDs = await ImportDetail.findAll({
        attributes: ['ImportID'],
        where: { BarcodeProduct: barcode },
        group: ['ImportID']
      }).then(details => details.map(d => d.ImportID));

      if (relevantImportIDs.length === 0) {
        return res.status(200).json({
          message: "Import history retrieved successfully",
          count: 0,
          orders: [],
        });
      }
      orderWhereClause.ImportID = { [Op.in]: relevantImportIDs };
    }

    const orders = await ImportOrder.findAll({
      where: orderWhereClause,
      include: includeOptions,
      order: [['ImportDate', 'DESC'], ['ImportID', 'DESC']]
    });

    res.status(200).json({
      message: "Import history retrieved successfully",
      count: orders.length,
      orders: orders,
    });

  } catch (error) {
    console.error("Get Import History Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Lấy chi tiết một đơn nhập hàng
exports.getImportOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await ImportOrder.findByPk(id, {
      include: [
        {
          model: ImportDetail,
          as: 'ImportDetails',
          include: [{
            model: Product,
            as: 'Product',
            attributes: ['ProductName', 'Image', 'CostPrice', 'SalePrice']
          }]
        },
        { model: Supplier, as: 'Supplier', attributes: ['SupplierName', 'Address', 'Phone', 'Email'] },
        { model: User, as: 'User', attributes: ['Username', 'Phone'] }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: "Import order not found." });
    }

    res.status(200).json({ message: "Import order detail retrieved", order });

  } catch (error) {
    console.error("Get Import Order Detail Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};