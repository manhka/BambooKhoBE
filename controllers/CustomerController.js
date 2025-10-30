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
