const { Supplier, Product } = require("../models");

/**
 * Lấy thông tin toàn bộ nhà cung cấp
 */
exports.getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.findAll({
            attributes: ['SupplierID', 'SupplierName', 'Phone', 'Email'],
            order: [["SupplierName", "ASC"]],
        });

        res.status(200).json({
            status: "success",
            message: "fetch_suppliers_success",
            data: suppliers,
        });
    } catch (error) {
        console.error("Get All Suppliers Error:", error);
        res.status(500).json({
            status: "error",
            message: "server_error",
        });
    }
};

