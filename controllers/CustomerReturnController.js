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
    const { customerId, barcodeProduct, warrantyStart, warrantyEnd } =
      req.query;

    // Build where clause cho ExportDetail
    const detailWhere = {
      WarrantyStatus: true, // chỉ lấy sản phẩm còn bảo hành
    };

    if (barcodeProduct) {
      detailWhere.BarcodeProduct = barcodeProduct;
    }

    if (warrantyStart && warrantyEnd) {
      detailWhere.WarrantyStartTime = { [Op.gte]: new Date(warrantyStart) };
      detailWhere.WarrantyEndTime = { [Op.lte]: new Date(warrantyEnd) };
    } else if (warrantyStart) {
      detailWhere.WarrantyEndTime = { [Op.gte]: new Date(warrantyStart) };
    } else if (warrantyEnd) {
      detailWhere.WarrantyStartTime = { [Op.lte]: new Date(warrantyEnd) };
    }

    // Build include clause
    const includeClause = [
      {
        model: ExportOrder,
        as: "ExportOrder",
        attributes: ["ExportID", "CustomerID", "ExportDate"],
        where: customerId ? { CustomerID: customerId } : undefined,
      },
      {
        model: Product,
        as: "Product",
        attributes: ["ProductName", "Image", "BrandID", "CategoryID"],
      },
    ];

    const warrantyProducts = await ExportDetail.findAll({
      where: detailWhere,
      include: includeClause,
      order: [["ExportDetailID", "DESC"]],
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

exports.createCustomerReturn = async (req, res) => {
  const transaction = await CustomerReturnOrder.sequelize.transaction();

  try {
    // ===== 1. Validate input =====
    const { isValid, errors } = await validateCustomerReturnInput(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    const { ReturnDate, Reason, UserID, ExportID, Details } = req.body;

    // ===== 2. Tạo CustomerReturnOrder =====
    const returnOrder = await CustomerReturnOrder.create(
      { ReturnDate, Reason: Reason || null, UserID, ExportID },
      { transaction }
    );

    // ===== 3. Duyệt từng sản phẩm trong danh sách trả =====
    for (const detail of Details) {
      const exportDetail = await ExportDetail.findOne({
        where: { ExportID, BarcodeProduct: detail.BarcodeProduct },
        transaction,
      });

      if (!exportDetail) {
        await transaction.rollback();
        return res.status(404).json({
          message: `Product ${detail.BarcodeProduct} not found in export order.`,
        });
      }

      // ===== 4. Kiểm tra hạn bảo hành (nếu có) =====
      if (exportDetail.WarrantyTime && exportDetail.WarrantyStartTime) {
        const start = new Date(exportDetail.WarrantyStartTime);
        const end = new Date(start);
        end.setMonth(end.getMonth() + exportDetail.WarrantyTime);
        const today = new Date(ReturnDate);

        if (today > end) {
          await transaction.rollback();
          return res.status(400).json({
            message: `Warranty expired for product ${detail.BarcodeProduct}.`,
          });
        }
      }

      // ===== 5. Kiểm tra số lượng trả hợp lệ =====
      const maxReturnable =
        exportDetail.Quantity - (exportDetail.ReturnedQuantity || 0);

      if (detail.Quantity > maxReturnable) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Invalid return quantity for product ${detail.BarcodeProduct}. You can only return up to ${maxReturnable} more.`,
        });
      }

      // ===== 6. Tạo CustomerReturnDetail =====
      await CustomerReturnDetail.create(
        {
          CustomerReturnOrderID: returnOrder.ReturnID,
          BarcodeProduct: detail.BarcodeProduct,
          Quantity: detail.Quantity,
          Reason: detail.Reason || null,
        },
        { transaction }
      );

      // ===== 7. Cập nhật ReturnedQuantity trong ExportDetail =====
      const newReturnedQty = exportDetail.ReturnedQuantity + detail.Quantity;
      await exportDetail.update(
        { ReturnedQuantity: newReturnedQty },
        { transaction }
      );

      // ===== 8. Cập nhật lại số lượng kho =====
      const product = await Product.findOne({
        where: { BarcodeProduct: detail.BarcodeProduct },
        transaction,
      });

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          message: `Product ${detail.BarcodeProduct} not found in warehouse.`,
        });
      }

      const newQuantity = product.Quantity + detail.Quantity;
      await product.update({ Quantity: newQuantity }, { transaction });
    }

    // ===== 9. Commit transaction =====
    await transaction.commit();

    res.status(201).json({
      message:
        "Customer return order created successfully. Stock and return history updated.",
      returnOrder,
    });
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    res.status(500).json({ message: "Server error", error });
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
      return res.status(404).json({ message: "Customer return not found" });
    }

    res.status(200).json(returnOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
