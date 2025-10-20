const ProductValidator = require("../validators/ProductValidator");
const { Op } = require("sequelize");
const Brand = require("../models/Brand");
const Category = require("../models/Category");
const { Product, Variant } = require("../models");
exports.createProduct = async (req, res) => {
  const data = req.body;
  const { isValid, errors } = ProductValidator.validate(data, false); // false = create

  if (!isValid) {
    return res.status(400).json({
      status: "error",
      message: "invalid_input",
      errors,
    });
  }

  try {
    const existing = await Product.findByPk(data.BarcodeProduct);
    if (existing) {
      return res.status(409).json({
        status: "error",
        message: "product_already_exists",
      });
    }

    const product = await Product.create(data);
    res.status(201).json({
      status: "success",
      message: "product_created",
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};

exports.updateProduct = async (req, res) => {
  const { barcode } = req.params;
  const data = req.body;
  const { isValid, errors } = ProductValidator.validate(data, true); // true = update

  if (!isValid) {
    return res.status(400).json({
      status: "error",
      message: "invalid_input",
      errors,
    });
  }

  try {
    const product = await Product.findByPk(barcode);
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "product_not_found",
      });
    }

    await product.update(data);
    res.status(200).json({
      status: "success",
      message: "product_updated",
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};
exports.getProducts = async (req, res) => {
  try {
    const { keyword, brand, category } = req.query;

    // --- Where cho Product ---
    const productConditions = {};
    if (keyword) {
      productConditions[Op.or] = [
        { BarcodeProduct: { [Op.like]: `%${keyword}%` } },
        { ProductName: { [Op.like]: `%${keyword}%` } },
      ];
    }

    // --- Where cho Brand ---
    const brandConditions = {};
    if (brand) {
      brandConditions.BrandName = { [Op.like]: `%${brand}%` };
    }

    // --- Where cho Category ---
    const categoryConditions = {};
    if (category) {
      categoryConditions.CategoryName = { [Op.like]: `%${category}%` };
    }

    // --- Truy vấn ---
    const products = await Product.findAll({
      where: productConditions,
      include: [
        {
          model: Brand,
          attributes: ["BrandName"],
          where: Object.keys(brandConditions).length
            ? brandConditions
            : undefined,
          required: false,
        },
        {
          model: Category,
          attributes: ["CategoryName"],
          where: Object.keys(categoryConditions).length
            ? categoryConditions
            : undefined,
          required: false,
        },
      ],
      order: [["CreateAt", "DESC"]],
    });

    if (products.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "product_not_found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "fetch_success",
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};

exports.archiveProduct = async (req, res) => {
  try {
    const { barcode } = req.params;
    const { archive } = req.query; // ?archive=true hoặc ?archive=false

    const product = await Product.findByPk(barcode);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "product_not_found",
      });
    }

    const newStatus = archive === "true";
    await product.update({
      IsArchive: newStatus,
      UpdateAt: new Date(),
    });

    res.status(200).json({
      status: "success",
      message: newStatus ? "product_archived" : "product_restored",
      data: product,
    });
  } catch (error) {
    console.error("Archive Product Error:", error);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5;

    const products = await Product.findAll({
      where: {
        NumberOfProduct: { [Op.lte]: threshold },
        IsArchive: false,
      },
      include: [
        { model: Brand, attributes: ["BrandName"] },
        { model: Category, attributes: ["CategoryName"] },
      ],
      order: [["NumberOfProduct", "ASC"]],
    });

    return res.status(200).json({
      status: "success",
      message: "low_stock_products_retrieved",
      threshold,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    res.status(500).json({
      status: "error",
      message: "failed_to_retrieve_low_stock_products",
    });
  }
};

exports.viewProductDetails = async (req, res) => {
  const { barcode } = req.params;

  try {
    const product = await Product.findOne({
      where: { BarcodeProduct: barcode },
      include: [
        {
          model: Variant,
          attributes: [
            "VariantID",
            "AttributeName",
            "Value",
            "Unit",
            "Description",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });

    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "product_not_found" });
    }

    res.json({
      status: "success",
      data: product,
    });
  } catch (err) {
    console.error("Error fetching product details:", err);
    res.status(500).json({ status: "error", message: "server_error" });
  }
};
