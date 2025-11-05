const { ImportOrder, ExportOrder } = require("../models");
const { Sequelize } = require("sequelize");

exports.getImportExportChart = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Tạo mảng tháng mặc định 1–12
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    // Truy vấn tổng Import theo tháng
    const imports = await ImportOrder.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("ImportDate")), "month"],
        [Sequelize.fn("SUM", Sequelize.col("Total")), "totalImport"],
      ],
      where: Sequelize.where(
        Sequelize.fn("YEAR", Sequelize.col("ImportDate")),
        year
      ),
      group: ["month"],
      raw: true,
    });

    // Truy vấn tổng Export theo tháng
    const exports = await ExportOrder.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("ExportDate")), "month"],
        [Sequelize.fn("SUM", Sequelize.col("Total")), "totalExport"],
      ],
      where: Sequelize.where(
        Sequelize.fn("YEAR", Sequelize.col("ExportDate")),
        year
      ),
      group: ["month"],
      raw: true,
    });

    // Map dữ liệu 12 tháng
    const result = months.map((m) => {
      const importData = imports.find((x) => x.month === m);
      const exportData = exports.find((x) => x.month === m);
      return {
        month: `Tháng ${m}`,
        totalImport: importData ? parseFloat(importData.totalImport) : 0,
        totalExport: exportData ? parseFloat(exportData.totalExport) : 0,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
