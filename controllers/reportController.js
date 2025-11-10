const {
  ImportOrder,
  ImportDetail,
  ExportOrder,
  ExportDetail,
  Product,
  Supplier,
  Customer,
} = require("../models");
const { Op } = require("sequelize");
const ExcelJS = require("exceljs");

exports.getQuarterReport = async (req, res) => {
  try {
    const { quarter, year } = req.query;
    if (!quarter || !year)
      return res.status(400).json({ message: "Thiếu quý hoặc năm" });

    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = startMonth + 2;
    const startDate = new Date(
      `${year}-${String(startMonth).padStart(2, "0")}-01`
    );
    const endDate = new Date(year, endMonth, 0, 23, 59, 59);

    const imports = await ImportOrder.findAll({
      where: { ImportDate: { [Op.between]: [startDate, endDate] } },
      include: [
        {
          model: Supplier,
          as: "Supplier",
          attributes: ["SupplierID", "SupplierName"],
        },
        {
          model: ImportDetail,
          as: "ImportDetails",
          include: [
            {
              model: Product,
              as: "Product",
              attributes: ["BarcodeProduct", "ProductName"],
            },
          ],
        },
      ],
    });

    const exports = await ExportOrder.findAll({
      where: { ExportDate: { [Op.between]: [startDate, endDate] } },
      include: [
        {
          model: Customer,
          as: "Customer",
          attributes: ["CustomerID", "CustomerName"],
        },
        {
          model: ExportDetail,
          as: "ExportDetails",
          include: [
            {
              model: Product,
              as: "Product",
              attributes: ["BarcodeProduct", "ProductName"],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      imports,
      exports,
    });
  } catch (err) {
    console.error("🔥 Lỗi khi lấy báo cáo:", err);
    res.status(500).json({ message: "Lỗi server khi lấy báo cáo nhập/xuất" });
  }
};
exports.exportQuarterReport = async (req, res) => {
  try {
    const { quarter, year } = req.query;
    if (!quarter || !year)
      return res.status(400).json({ message: "Thiếu quý hoặc năm" });

    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = startMonth + 2;
    const startDate = new Date(
      `${year}-${String(startMonth).padStart(2, "0")}-01`
    );
    const endDate = new Date(year, endMonth, 0, 23, 59, 59);

    const imports = await ImportOrder.findAll({
      where: { ImportDate: { [Op.between]: [startDate, endDate] } },
      include: [
        { model: Supplier, as: "Supplier", attributes: ["SupplierName"] },
        {
          model: ImportDetail,
          as: "ImportDetails",
          include: [
            {
              model: Product,
              as: "Product",
              attributes: ["BarcodeProduct", "ProductName"],
            },
          ],
        },
      ],
      order: [["ImportDate", "ASC"]],
    });

    const exports = await ExportOrder.findAll({
      where: { ExportDate: { [Op.between]: [startDate, endDate] } },
      include: [
        { model: Customer, as: "Customer", attributes: ["CustomerName"] },
        {
          model: ExportDetail,
          as: "ExportDetails",
          include: [
            {
              model: Product,
              as: "Product",
              attributes: ["BarcodeProduct", "ProductName"],
            },
          ],
        },
      ],
      order: [["ExportDate", "ASC"]],
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Your App Name";
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet(`BaoCao_Q${quarter}_${year}`);

    worksheet.columns = [
      { header: "Loại", key: "type", width: 10 },
      {
        header: "Ngày",
        key: "date",
        width: 15,
        style: { numFmt: "dd/mm/yyyy" },
      },
      { header: "Sản Phẩm", key: "productName", width: 35 },
      {
        header: "Số Lượng",
        key: "quantity",
        width: 10,
        style: { numFmt: "#,##0" },
      },
      {
        header: "Đơn Giá",
        key: "unitPrice",
        width: 15,
        style: { numFmt: '#,##0 "VNĐ"' },
      },
      {
        header: "Thành Tiền",
        key: "total",
        width: 15,
        style: { numFmt: '#,##0 "VNĐ"' },
      },
      { header: "Đối Tác", key: "partner", width: 25 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = {
      name: "Arial",
      bold: true,
      size: 12,
      color: { argb: "FFFFFFFF" },
    };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0D6EFD" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    worksheet.insertRow(1, []);

    worksheet.mergeCells("A1:G1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `BÁO CÁO NHẬP XUẤT HÀNG QUÝ ${quarter} NĂM ${year}`;
    titleCell.font = { name: "Arial", size: 16, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 40;

    imports.forEach((imp) => {
      imp.ImportDetails.forEach((d) => {
        worksheet.addRow({
          type: "Nhập hàng",
          date: new Date(imp.ImportDate),
          productName: d.Product.ProductName,
          quantity: d.Quantity,
          unitPrice: d.UnitPrice,
          total: d.Total,
          partner: imp.Supplier?.SupplierName,
        });
      });
    });

    exports.forEach((exp) => {
      exp.ExportDetails.forEach((d) => {
        worksheet.addRow({
          type: "Xuất hàng",
          date: new Date(exp.ExportDate),
          productName: d.Product.ProductName,
          quantity: d.Quantity,
          unitPrice: d.UnitPrice,
          total: d.Total,
          partner: exp.Customer?.CustomerName,
        });
      });
    });

    const dataRowStartIndex = 3;
    for (let i = dataRowStartIndex; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        if (colNumber === 4 || colNumber === 5 || colNumber === 6) {
          cell.alignment = { horizontal: "right" };
        }
      });
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="BaoCao_Q${quarter}_${year}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("🔥 Lỗi khi xuất Excel:", err);
    res.status(500).json({ message: "Lỗi server khi xuất báo cáo" });
  }
};
