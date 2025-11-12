// controllers/ExportController.js

// 1. Import thêm StaffActivity
const {
  sequelize,
  ExportOrder,
  ExportDetail,
  Product,
  Customer,
  User,
  StaffActivity,
} = require("../models");
const {
  validateExportDetails,
  validateExportOrder,
} = require("../validators/ExportValidator");
const { Op } = require("sequelize");
const ExcelJS = require("exceljs");

// ----- Function 5.1: Tạo Phiếu Xuất Hàng (ĐÃ CẬP NHẬT) -----
exports.createExportOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userIdFromToken = req.user.userId;
    const userRoleFromToken = req.user.roleID;

    const { CustomerID, ExportDate, Details } = req.body;
    const effectiveDate = ExportDate || new Date();

    const { isOrderValid, orderErrors } = await validateExportOrder({
      CustomerID,
      UserID: userIdFromToken,
      ExportDate: effectiveDate,
    });
    if (!isOrderValid) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Invalid order data.", errors: orderErrors });
    }

    const { isValid, errors, validDetails, productUpdates } =
      await validateExportDetails(Details, transaction);
    if (!isValid) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Invalid export details.", errors });
    }

    const totalOrderAmount = validDetails.reduce(
      (sum, detail) => sum + detail.Total,
      0
    );

    const exportOrder = await ExportOrder.create(
      {
        ExportDate: effectiveDate,
        Total: totalOrderAmount,
        CustomerID: CustomerID,
        UserID: userIdFromToken,
      },
      { transaction }
    );

    const exportDetailData = validDetails.map((detail) => ({
      ExportID: exportOrder.ExportID,
      BarcodeProduct: detail.BarcodeProduct,
      Quantity: detail.Quantity,
      UnitPrice: detail.UnitPrice,
      Total: detail.Total,
      ReturnedQuantity: 0,
      WarrantyTime: detail.WarrantyTime,
      WarrantyStartTime: detail.WarrantyStartTime,
      WarrantyEndTime: detail.WarrantyEndTime,
      WarrantyStatus: detail.WarrantyStatus,
    }));
    await ExportDetail.bulkCreate(exportDetailData, { transaction });

    for (const barcode in productUpdates) {
      const product = await Product.findByPk(barcode, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (product) {
        if (product.NumberOfProduct < productUpdates[barcode]) {
          throw new Error(
            `Insufficient stock for ${barcode} during final update check.`
          );
        }
        product.NumberOfProduct -= productUpdates[barcode];
        await product.save({ transaction });
      } else {
        throw new Error(`Product ${barcode} not found during stock update.`);
      }
    }

    if (userRoleFromToken === 2) {
      await StaffActivity.create(
        {
          UserID: userIdFromToken,
          ActivityID: 1,
        },
        { transaction }
      );
    }

    await transaction.commit();
    res
      .status(201)
      .json({ message: "Export order created successfully!", exportOrder });
  } catch (error) {
    await transaction.rollback();
    console.error("Create Export Error:", error);
    res
      .status(500)
      .json({
        message: "Server error during export creation.",
        error: error.message,
      });
  }
};

// ----- Function 5.2: Xem/Tìm kiếm lịch sử xuất hàng  -----
exports.getExportHistory = async (req, res) => {
  try {
    const { fromDate, toDate, customerId, userId, barcode } = req.query;

    const orderWhereClause = {};
    const includeOptions = [
      {
        model: ExportDetail,
        as: "ExportDetails",
        include: [
          { model: Product, as: "Product", attributes: ["ProductName"] },
        ],
      },
      { model: Customer, as: "Customer", attributes: ["CustomerName"] },
      { model: User, as: "User", attributes: ["Username"] },
    ];

    if (fromDate && toDate) {
      orderWhereClause.ExportDate = {
        [Op.between]: [new Date(fromDate), new Date(toDate)],
      };
    } else if (fromDate) {
      orderWhereClause.ExportDate = { [Op.gte]: new Date(fromDate) };
    } else if (toDate) {
      orderWhereClause.ExportDate = { [Op.lte]: new Date(toDate) };
    }

    if (customerId) orderWhereClause.CustomerID = customerId;
    if (userId) orderWhereClause.UserID = userId;

    if (barcode) {
      const relevantExportIDs = await ExportDetail.findAll({
        attributes: ["ExportID"],
        where: { BarcodeProduct: barcode },
        group: ["ExportID"],
      }).then((details) => details.map((d) => d.ExportID));
      if (relevantExportIDs.length === 0) {
        return res
          .status(200)
          .json({
            message: "Export history retrieved successfully",
            count: 0,
            orders: [],
          });
      }
      orderWhereClause.ExportID = { [Op.in]: relevantExportIDs };
    }

    const orders = await ExportOrder.findAll({
      where: orderWhereClause,
      include: includeOptions,
      order: [
        ["ExportDate", "DESC"],
        ["ExportID", "DESC"],
      ],
    });

    res
      .status(200)
      .json({
        message: "Export history retrieved successfully",
        count: orders.length,
        orders,
      });
  } catch (error) {
    console.error("Get Export History Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ----- Function 5.2 (Detail): Lấy chi tiết một đơn xuất hàng  -----
exports.getExportOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await ExportOrder.findByPk(id, {
      include: [
        {
          model: ExportDetail,
          as: "ExportDetails",
          include: [
            {
              model: Product,
              as: "Product",
              attributes: ["ProductName", "Image", "CostPrice", "SalePrice"],
            },
          ],
        },
        {
          model: Customer,
          as: "Customer",
          attributes: ["CustomerName", "Address", "Phone"],
        },
        { model: User, as: "User", attributes: ["Username", "Phone"] },
      ],
    });
    if (!order) {
      return res.status(200).json({ message: "Export order not found." });
    }
    res.status(200).json({ message: "Export order detail retrieved", order });
  } catch (error) {
    console.error("Get Export Order Detail Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ----- Function 5.1 (Excel): Xuất file Excel -----
exports.exportOrderToExcel = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await ExportOrder.findByPk(id, {
      include: [
        {
          model: ExportDetail,
          as: "ExportDetails",
          include: [
            { model: Product, as: "Product", attributes: ["ProductName"] },
          ],
        },
        { model: Customer, as: "Customer", attributes: ["CustomerName"] },
        { model: User, as: "User", attributes: ["Username"] },
      ],
    });

    if (!order) {
      return res.status(200).json({ message: "Export order not found." });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "BambooKho";
    workbook.created = new Date();
    const worksheet = workbook.addWorksheet(`PhieuXuat_${order.ExportID}`);

    // Tiêu đề
    const titleRow = worksheet.addRow(["PHIẾU XUẤT KHO"]);
    const titleCell = titleRow.getCell(1);
    titleCell.font = { size: 16, bold: true };
    worksheet.mergeCells("A1:G1");
    worksheet.getCell("A1").alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.addRow([]);

    // Thông tin chung
    worksheet.addRow([
      "",
      "Mã Phiếu Xuất:",
      order.ExportID,
      "",
      "Ngày Xuất:",
      new Date(order.ExportDate).toLocaleDateString("vi-VN"),
    ]);
    worksheet.getRow(3).getCell("C").font = { bold: true };
    worksheet.getRow(3).getCell("C").alignment = { horizontal: "left" };
    worksheet.getRow(3).getCell("F").font = { bold: true };
    worksheet.addRow([
      "",
      "Khách Hàng:",
      order.Customer?.CustomerName || "N/A",
      "",
      "Người Tạo:",
      order.User?.Username || "N/A",
    ]);
    worksheet.getRow(4).getCell("C").font = { bold: true };
    worksheet.getRow(4).getCell("F").font = { bold: true };
    worksheet.addRow([]);

    // Header bảng chi tiết
    worksheet.addRow([
      "STT",
      "Mã Sản Phẩm",
      "Tên Sản Phẩm",
      "Số Lượng",
      "Đơn Giá",
      "Bảo Hành (Tháng)",
      "Thành Tiền",
    ]);
    const headerRow = worksheet.getRow(6);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Dữ liệu chi tiết
    let totalAmount = 0;
    order.ExportDetails.forEach((detail, index) => {
      const warrantyText =
        detail.WarrantyTime !== null
          ? `${detail.WarrantyTime} tháng`
          : "Không BH";
      const total = Number(detail.Total);
      totalAmount += total;

      const dataRow = worksheet.addRow([
        index + 1,
        detail.BarcodeProduct,
        detail.Product?.ProductName || "N/A",
        detail.Quantity,
        Number(detail.UnitPrice),
        warrantyText,
        total,
      ]);

      // Format
      dataRow.getCell(1).alignment = { horizontal: "center" };
      dataRow.getCell(4).alignment = { horizontal: "right" };
      dataRow.getCell(5).alignment = { horizontal: "right" };
      dataRow.getCell(5).numFmt = '#,##0"₫"';
      dataRow.getCell(6).alignment = { horizontal: "center" };
      dataRow.getCell(7).alignment = { horizontal: "right" };
      dataRow.getCell(7).numFmt = '#,##0"₫"';
    });

    // Dòng
    worksheet.addRow([]);
    const totalRow = worksheet.addRow([
      "",
      "",
      "",
      "",
      "",
      "Tổng Cộng:",
      totalAmount,
    ]);
    totalRow.getCell(6).font = { bold: true, size: 12 };
    totalRow.getCell(6).alignment = { horizontal: "right" };
    totalRow.getCell(7).font = { bold: true, size: 12 };
    totalRow.getCell(7).numFmt = '#,##0"₫"';
    totalRow.getCell(7).alignment = { horizontal: "right" };

    // Độ rộng cột
    worksheet.getColumn("A").width = 5; // STT
    worksheet.getColumn("B").width = 15; // Mã SP
    worksheet.getColumn("C").width = 30; // Tên SP
    worksheet.getColumn("D").width = 10; // SL
    worksheet.getColumn("E").width = 15; // Đơn Giá
    worksheet.getColumn("F").width = 20; // Bảo Hành
    worksheet.getColumn("G").width = 15; // Thành Tiền

    // Gửi file về client
    const fileName = `PhieuXuat_${order.ExportID}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export Order to Excel Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};
