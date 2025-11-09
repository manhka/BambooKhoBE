const { Customer, StaffActivity } = require("../models"); // <-- Thêm StaffActivity
const { Op } = require("sequelize");

// Giả sử:
// ActivityID = 3 là 'Tạo Khách Hàng'
// ActivityID = 4 là 'Sửa Khách Hàng'


/**
 * Lấy thông tin toàn bộ khách hàng, lọc theo tên
 */
exports.getAllCustomers = async (req, res) => {
    try {
        const { name } = req.query;
        const whereCondition = {};

        if (name) {
            whereCondition.CustomerName = { [Op.like]: `%${name}%` }; 
        }

        const customers = await Customer.findAll({
            where: whereCondition,
            order: [["CustomerName", "ASC"]],
            attributes: ['CustomerID', 'CustomerName', 'Address', 'Phone'] 
        });

        res.status(200).json({
            status: "success",
            message: "fetch_success",
            count: customers.length,
            data: customers, 
        });
    } catch (error) {
        console.error("Get Customers Error:", error);
        res.status(500).json({
            status: "error",
            message: "server_error",
        });
    }
};


/**
 * Tạo khách hàng mới
 */
exports.createCustomer = async (req, res) => {
    const { CustomerName, Phone, Address } = req.body;
    
    // Lấy thông tin người dùng từ Token (được gắn bởi verifyToken middleware)
    const userIdFromToken = req.user.userId; 
    const userRoleFromToken = req.user.roleID; 

    // --- Validation (Không đổi) ---
    if (!CustomerName || CustomerName.trim() === "") {
        return res.status(400).json({ status: "error", message: "CustomerName_is_required" });
    }
    if (!Address || Address.trim() === "") {
        return res.status(400).json({ status: "error", message: "Address_is_required" });
    }

    const phoneRegex = /^0\d{9}$/;
    const trimmedPhone = Phone ? Phone.trim() : "";

    if (trimmedPhone === "") {
        return res.status(400).json({ status: "error", message: "Phone_is_required" });
    }

    if (!phoneRegex.test(trimmedPhone)) {
        return res.status(400).json({ status: "error", message: "Phone_format_invalid" });
    }
    
    try {
        // Kiểm tra trùng SĐT
        const phoneExists = await Customer.findOne({ where: { Phone: trimmedPhone } });
        if (phoneExists) {
            return res.status(400).json({ status: "error", message: "Phone_already_exists" });
        }

        const newCustomer = await Customer.create({
            CustomerName: CustomerName.trim(),
            Phone: trimmedPhone,
            Address: Address.trim(), 
        });

        // === LOGIC GHI NHẬT KÝ STAFF (RoleID = 2) ===
        if (userRoleFromToken === 2) {
            await StaffActivity.create({
                UserID: userIdFromToken,
                ActivityID: 3, // Giả sử ActivityID = 3 (Tạo Khách hàng)
            });
        }
        // === KẾT THÚC LOGIC ===

        res.status(201).json({
            status: "success",
            message: "Customer_created_successfully",
            data: newCustomer,
        });

    } catch (error) {
        console.error("Create Customer Error:", error);
        res.status(500).json({ status: "error", message: "server_error", error: error.message });
    }
};

/**
 * Lấy chi tiết một khách hàng bằng ID
 */
exports.getCustomerDetail = async (req, res) => {
    try {
        const customerId = req.params.id;
        const customer = await Customer.findByPk(customerId, {
            attributes: ['CustomerID', 'CustomerName', 'Address', 'Phone']
        });

        if (!customer) {
            return res.status(404).json({ status: "error", message: "customer_not_found" });
        }

        res.status(200).json({
            status: "success",
            message: "fetch_detail_success",
            data: customer,
        });

    } catch (error) {
        console.error("Get Customer Detail Error:", error);
        res.status(500).json({ status: "error", message: "server_error" });
    }
};

/**
 * Cập nhật thông tin khách hàng
 */
exports.updateCustomer = async (req, res) => {
    const customerId = req.params.id;
    const { CustomerName, Phone, Address } = req.body;
    
    // Lấy thông tin người dùng từ Token
    const userIdFromToken = req.user.userId; 
    const userRoleFromToken = req.user.roleID; 

    // --- Validation (Không đổi) ---
    if (!CustomerName || CustomerName.trim() === "") {
        return res.status(400).json({ status: "error", message: "CustomerName_is_required" });
    }
    if (!Address || Address.trim() === "") {
        return res.status(400).json({ status: "error", message: "Address_is_required" });
    }

    const phoneRegex = /^0\d{9}$/;
    const trimmedPhone = Phone ? Phone.trim() : "";

    if (trimmedPhone === "") {
        return res.status(400).json({ status: "error", message: "Phone_is_required" });
    }
    if (!phoneRegex.test(trimmedPhone)) {
        return res.status(400).json({ status: "error", message: "Phone_format_invalid" });
    }
    // --- Hết Validation ---

    try {
        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({ status: "error", message: "customer_not_found" });
        }

        // Kiểm tra SĐT có bị trùng với người khác không
        const phoneExists = await Customer.findOne({ 
            where: { 
                Phone: trimmedPhone,
                CustomerID: { [Op.ne]: customerId } 
            } 
        });
        if (phoneExists) {
            return res.status(400).json({ status: "error", message: "Phone_already_exists_on_another_customer" });
        }

        // Cập nhật thông tin
        customer.CustomerName = CustomerName.trim();
        customer.Phone = trimmedPhone;
        customer.Address = Address.trim();
        
        await customer.save();

        // === LOGIC GHI NHẬT KÝ STAFF (RoleID = 2) ===
        if (userRoleFromToken === 2) {
            await StaffActivity.create({
                UserID: userIdFromToken,
                ActivityID: 4, // Giả sử ActivityID = 4 (Sửa Khách hàng)
            });
        }
        // === KẾT THÚC LOGIC ===

        res.status(200).json({
            status: "success",
            message: "Customer_updated_successfully",
            data: customer, 
        });

    } catch (error) {
        console.error("Update Customer Error:", error);
        res.status(500).json({ status: "error", message: "server_error", error: error.message });
    }
};
// controllers/customerController.js
const { Customer } = require("../models");
const { Op } = require("sequelize");

exports.searchCustomers = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ message: "Keyword is required" });
    }

    const customers = await Customer.findAll({
      where: {
        CustomerName: { [Op.like]: `%${keyword}%` },
      },
      attributes: ["CustomerID", "CustomerName", "Phone", "Address"],
    });

    res.status(200).json({
      customers: customers,
      message: "Customers fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
