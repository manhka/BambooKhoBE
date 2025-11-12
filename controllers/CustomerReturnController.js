const CustomerReturnOrder = require("../models/CustomerReturnOrder");
const CustomerReturnDetail = require("../models/CustomerReturnDetail");
const ExportDetail = require("../models/ExportDetail");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const User = require("../models/User");
const { Op } = require("sequelize");
const ExportOrder = require("../models/ExportOrder");
const {
  validateCustomerReturnInput,
} = require("../validators/CustomerReturnValidator");
exports.getWarrantyProducts = async (req, res) => {
  try {
    const { customerId, barcodeProduct } = req.query;

    if (!customerId) {
      return res.status(400).json({ message: "customerId is required" });
    }

    // Build where clause
    const detailWhere = {};
    if (barcodeProduct) {
      detailWhere.BarcodeProduct = barcodeProduct;
    }

    // Include ExportOrder và Product
    const includeClause = [
      {
        model: ExportOrder,
        as: "ExportOrder",
        attributes: ["ExportID", "CustomerID", "ExportDate"],
        where: { CustomerID: customerId },
      },
      {
        model: Product,
        as: "Product",
        attributes: ["ProductName", "Image", "BrandID", "CategoryID"],
      },
    ];

    const exportDetails = await ExportDetail.findAll({
      where: detailWhere,
      include: includeClause,
      order: [["ExportDetailID", "DESC"]],
    });

    // Thêm trường ReturnedQuantity và RemainingQuantity
    const warrantyProducts = exportDetails.map((d) => {
      const returnedQty = d.ReturnedQuantity || 0;
      const remainingQty = (d.Quantity || 0) - returnedQty;

      return {
        ...d.toJSON(), // convert Sequelize instance to plain object
        ReturnedQuantity: returnedQty,
        RemainingQuantity: remainingQty,
        WarrantyStatus:
          d.WarrantyStartTime && d.WarrantyTime
            ? new Date() <=
              new Date(
                new Date(d.WarrantyStartTime).setMonth(
                  new Date(d.WarrantyStartTime).getMonth() + d.WarrantyTime
                )
              )
            : false,
      };
    });

    return res.status(200).json({
      message: "Warranty products fetched successfully",
      count: warrantyProducts.length,
      data: warrantyProducts,
    });
  } catch (error) {
    console.error("Error fetching warranty products:", error);
    return res.status(500).json({
      message: "Failed to fetch warranty products",
      error: error.message,
    });
  }
};

exports.getWarrantyProductById = async (req, res) => {
  try {
    const { exportDetailId } = req.params;

    if (!exportDetailId) {
      return res.status(400).json({ message: "exportDetailId is required" });
    }

    // Lấy ExportDetail kèm ExportOrder và Product
    const exportDetail = await ExportDetail.findOne({
      where: { ExportDetailID: exportDetailId },
      include: [
        {
          model: ExportOrder,
          as: "ExportOrder",
          attributes: ["ExportID", "CustomerID", "ExportDate"],
        },
        {
          model: Product,
          as: "Product",
          attributes: ["ProductName", "Image", "BrandID", "CategoryID"],
        },
      ],
    });

    if (!exportDetail) {
      return res.status(200).json({ message: "Export detail not found" });
    }

    // Tính RemainingQuantity
    const remainingQuantity =
      exportDetail.Quantity - (exportDetail.ReturnedQuantity || 0);

    // Tính trạng thái bảo hành
    let warrantyStatus = true;
    if (exportDetail.WarrantyTime && exportDetail.WarrantyStartTime) {
      const start = new Date(exportDetail.WarrantyStartTime);
      const end = new Date(start);
      end.setMonth(end.getMonth() + exportDetail.WarrantyTime);
      const today = new Date();
      if (today > end) warrantyStatus = false;
    }

    res.status(200).json({
      message: "Product fetched successfully",
      data: {
        ExportDetailID: exportDetail.ExportDetailID,
        ExportID: exportDetail.ExportID,
        BarcodeProduct: exportDetail.BarcodeProduct,
        Quantity: exportDetail.Quantity,
        ReturnedQuantity: exportDetail.ReturnedQuantity || 0,
        RemainingQuantity: remainingQuantity,
        UnitPrice: exportDetail.UnitPrice,
        Total: exportDetail.Total,
        WarrantyStartTime: exportDetail.WarrantyStartTime,
        WarrantyEndTime: exportDetail.WarrantyEndTime,
        WarrantyStatus: warrantyStatus,
        ProductName: exportDetail.Product.ProductName,
        ProductImage: exportDetail.Product.Image,
      },
    });
  } catch (error) {
    console.error("Error fetching warranty product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createCustomerReturn = async (req, res) => {
  const transaction = await CustomerReturnOrder.sequelize.transaction();

  try {
    // ===== 1. Validate input =====
    const { isValid, errors } = await validateCustomerReturnInput(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }
    const UserID = req.user.userId;
    console.log("userId:", UserID);
    const { ReturnDate, Reason, ExportID, BarcodeProduct, Quantity } = req.body;

    // ===== 2. Tạo CustomerReturnOrder =====
    const returnOrder = await CustomerReturnOrder.create(
      { ReturnDate, Reason: Reason || null, UserID, ExportID },
      { transaction }
    );

    // ===== 3. Lấy sản phẩm cần trả =====
    const exportDetail = await ExportDetail.findOne({
      where: { ExportID, BarcodeProduct },
      transaction,
    });

    if (!exportDetail) {
      await transaction.rollback();
      return res.status(200).json({
        message: `Sản phẩm ${BarcodeProduct} không tồn tại trong đơn xuất.`,
      });
    }

    // ===== 4. Kiểm tra hạn bảo hành =====
    if (exportDetail.WarrantyTime && exportDetail.WarrantyStartTime) {
      const start = new Date(exportDetail.WarrantyStartTime);
      const end = new Date(start);
      end.setMonth(end.getMonth() + exportDetail.WarrantyTime);
      const today = new Date(ReturnDate);

      if (today > end) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Sản phẩm ${BarcodeProduct} đã hết hạn bảo hành.`,
        });
      }
    }

    // ===== 5. Kiểm tra số lượng trả =====
    const maxReturnable =
      exportDetail.Quantity - (exportDetail.ReturnedQuantity || 0);
    if (Quantity > maxReturnable) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Số lượng trả không hợp lệ cho sản phẩm ${BarcodeProduct}. Bạn chỉ có thể trả tối đa ${maxReturnable}.`,
      });
    }

    // ===== 6. Tạo CustomerReturnDetail =====
    const returnDetail = await CustomerReturnDetail.create(
      {
        CustomerReturnOrderID: returnOrder.ReturnID,
        BarcodeProduct,
        Quantity,
        Reason: Reason || null,
      },
      { transaction }
    );

    // ===== 7. Cập nhật ReturnedQuantity trong ExportDetail =====
    const newReturnedQty = (exportDetail.ReturnedQuantity || 0) + Quantity;
    await exportDetail.update(
      { ReturnedQuantity: newReturnedQty },
      { transaction }
    );

    // ===== 8. Cập nhật số lượng kho =====
    const product = await Product.findOne({
      where: { BarcodeProduct },
      transaction,
    });

    if (!product) {
      await transaction.rollback();
      return res.status(200).json({
        message: `Sản phẩm ${BarcodeProduct} không tồn tại trong kho.`,
      });
    }

    await product.update(
      { Quantity: product.Quantity + Quantity },
      { transaction }
    );

    // ===== 9. Commit transaction =====
    await transaction.commit();

    res.status(201).json({
      message:
        "Trả sản phẩm thành công. Kho và lịch sử trả hàng đã được cập nhật.",
      returnOrder,
      returnDetail,
    });
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Lấy danh sách đơn trả hàng của khách
exports.getCustomerReturns = async (req, res) => {
  try {
    const { fromDate, toDate, userID, exportID, barcode } = req.query;

    // Build where clause cho CustomerReturnOrder
    const whereClause = {};
    if (fromDate && toDate) {
      whereClause.ReturnDate = {
        [Op.between]: [new Date(fromDate), new Date(toDate)],
      };
    } else if (fromDate) {
      whereClause.ReturnDate = { [Op.gte]: new Date(fromDate) };
    } else if (toDate) {
      whereClause.ReturnDate = { [Op.lte]: new Date(toDate) };
    }

    if (userID) whereClause.UserID = userID;
    if (exportID) whereClause.ExportID = exportID;

    // Build include clause
    const includeClause = [
      {
        model: CustomerReturnDetail,
        as: "CustomerReturnDetails", // trùng alias với hasMany association
        include: [
          {
            model: Product,
            as: "Product", // trùng alias với belongsTo association
            attributes: ["ProductName", "BarcodeProduct"],
            where: barcode ? { BarcodeProduct: barcode } : undefined,
          },
        ],
      },
      {
        model: User,
        as: "User", // nếu association có alias
        attributes: ["Username"],
      },
      {
        model: ExportOrder,
        as: "ExportOrder", // trùng alias với belongsTo association
        attributes: ["ExportID", "CustomerID", "ExportDate"],
        include: [
          {
            model: Customer,
            as: "Customer", // trùng alias với belongsTo association
            attributes: ["CustomerName", "Address", "Phone"],
          },
        ],
      },
    ];

    const returnOrders = await CustomerReturnOrder.findAll({
      where: whereClause,
      include: includeClause,
      order: [["ReturnDate", "DESC"]],
    });

    res.status(200).json({
      message: "Customer return orders fetched successfully",
      count: returnOrders.length,
      data: returnOrders,
    });
  } catch (error) {
    console.error("Error fetching customer returns:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// xem chi tiết đơn trả hàng
exports.getCustomerReturnById = async (req, res) => {
  try {
    const { id } = req.params;

    const returnOrder = await CustomerReturnOrder.findByPk(id, {
      include: [
        {
          model: CustomerReturnDetail,
          as: "CustomerReturnDetails", // phải trùng alias
          include: [
            {
              model: Product,
              as: "Product", // phải trùng alias
              attributes: ["ProductName", "BarcodeProduct"],
            },
          ],
        },
        {
          model: User,
          as: "User", // nếu association có alias
          attributes: ["Username"],
        },
        {
          model: ExportOrder,
          as: "ExportOrder", // phải trùng alias
          attributes: ["ExportID", "CustomerID", "ExportDate"],
          include: [
            {
              model: Customer,
              as: "Customer", // phải trùng alias
              attributes: ["CustomerName", "Address", "Phone"],
            },
          ],
        },
      ],
    });

    if (!returnOrder) {
      return res.status(200).json({ message: "Customer return not found" });
    }

    res.status(200).json(returnOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
