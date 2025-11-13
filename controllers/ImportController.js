const xlsx = require("xlsx");
const {
  sequelize,
  ImportOrder,
  ImportDetail,
  Product,
  Supplier,
  User,
  StaffActivity,
} = require("../models");
const {
  validateImportDetails,
  validateImportOrder,
} = require("../validators/ImportValidator");
const { Op } = require("sequelize");

// ----- Function 4.1: Nhập hàng từ file Excel -----
exports.uploadImportFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No Excel file uploaded." });
  }

  const transaction = await sequelize.transaction();

  try {
    const userIdFromToken = req.user.userId;
    const userRoleFromToken = req.user.roleID;

    // Đọc dữ liệu từ file Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Excel file is empty or invalid format." });
    }

    const supplierId = req.body.SupplierID || jsonData[0]?.SupplierID;
    const importDate = req.body.ImportDate || new Date();

    const { isOrderValid, orderErrors } = await validateImportOrder({
      SupplierID: supplierId,
      UserID: userIdFromToken,
      ImportDate: importDate,
    });
    if (!isOrderValid) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Invalid order data.", errors: orderErrors });
    }

    const { isValid, errors, validDetails, productUpdates } =
      await validateImportDetails(jsonData);

    if (!isValid) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Invalid data in Excel file.", errors });
    }

    const totalOrderAmount = validDetails.reduce(
      (sum, detail) => sum + detail.Total,
      0
    );

    const importOrder = await ImportOrder.create(
      {
        ImportDate: importDate,
        Total: totalOrderAmount,
        SupplierID: supplierId,
        UserID: userIdFromToken,
      },
      { transaction }
    );

    // Tạo ImportDetails
    const importDetailData = validDetails.map((detail) => ({
      ...detail,
      ImportID: importOrder.ImportID,
    }));
    await ImportDetail.bulkCreate(importDetailData, { transaction });

    // Cập nhật số lượng sản phẩm
    for (const barcode in productUpdates) {
      await Product.increment("NumberOfProduct", {
        by: productUpdates[barcode],
        where: { BarcodeProduct: barcode },
        transaction,
      });
    }

    // Không tạo StaffActivity nữa
    await transaction.commit();

    res.status(201).json({
      message: "Import successful!",
      importOrder: importOrder,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Import Error:", error);
    res
      .status(500)
      .json({ message: "Server error during import.", error: error.message });
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
        as: "ImportDetails",
        include: [
          {
            model: Product,
            as: "Product",
            attributes: ["ProductName"],
          },
        ],
      },
      {
        model: Supplier,
        as: "Supplier",
        attributes: ["SupplierName"],
      },
      {
        model: User,
        as: "User",
        attributes: ["Username"],
      },
    ];

    // Lọc theo ngày
    if (fromDate && toDate) {
      orderWhereClause.ImportDate = {
        [Op.between]: [new Date(fromDate), new Date(toDate)],
      };
    } else if (fromDate) {
      orderWhereClause.ImportDate = { [Op.gte]: new Date(fromDate) };
    } else if (toDate) {
      orderWhereClause.ImportDate = { [Op.lte]: new Date(toDate) };
    }

    if (supplierId) orderWhereClause.SupplierID = supplierId;
    if (userId) orderWhereClause.UserID = userId;

    if (barcode) {
      const relevantImportIDs = await ImportDetail.findAll({
        attributes: ["ImportID"],
        where: { BarcodeProduct: barcode },
        group: ["ImportID"],
      }).then((details) => details.map((d) => d.ImportID));

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
      order: [
        ["ImportDate", "DESC"],
        ["ImportID", "DESC"],
      ],
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
          as: "ImportDetails",
          include: [
            {
              model: Product,
              as: "Product",
              attributes: ["ProductName", "Image", "CostPrice", "SalePrice"],
            },
          ],
        },
        {
          model: Supplier,
          as: "Supplier",
          attributes: ["SupplierName", "Address", "Phone", "Email"],
        },
        { model: User, as: "User", attributes: ["Username", "Phone"] },
      ],
    });

    if (!order) {
      return res.status(200).json({ message: "Import order not found." });
    }

    res.status(200).json({ message: "Import order detail retrieved", order });
  } catch (error) {
    console.error("Get Import Order Detail Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
