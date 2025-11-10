const { sequelize, Product, Variant, Brand, Category } = require("../models");
const ProductValidator = require("../validators/ProductValidator");
const VariantValidator = require("../validators/VariantValidator");
const { Op } = require("sequelize");
exports.createProductWithVariants = async (req, res) => {
  const {
    BarcodeProduct,
    ProductName,
    NumberOfProduct,
    Image,
    Description,
    BrandID,
    CategoryID,
    CostPrice,
    SalePrice,
    Variants,
  } = req.body;

  //  Step 1: Validate Product
  const { isValid: isProductValid, errors: productErrors } =
    ProductValidator.validate(req.body);

  if (!isProductValid) {
    return res.status(400).json({
      message: "Invalid product data",
      errors: productErrors,
    });
  }

  //  Step 2: Validate Variants (nếu có)
  if (Array.isArray(Variants) && Variants.length > 0) {
    const variantErrors = [];

    Variants.forEach((variant, index) => {
      const { isValid, errors } = validateVariantInput(variant);
      if (!isValid) {
        variantErrors.push({ index, errors });
      }
    });

    if (variantErrors.length > 0) {
      return res.status(400).json({
        message: "Invalid variant data",
        variantErrors,
      });
    }
  }

  //  Step 3: Bắt đầu transaction
  const transaction = await sequelize.transaction();

  try {
    //  Tạo Product
    const product = await Product.create(
      {
        BarcodeProduct,
        ProductName,
        NumberOfProduct,
        Image,
        Description,
        BrandID,
        CategoryID,
        CostPrice,
        SalePrice,
      },
      { transaction }
    );

    //  Tạo Variants nếu có
    if (Array.isArray(Variants) && Variants.length > 0) {
      const variantData = Variants.map((v) => ({
        AttributeName: v.AttributeName,
        Value: v.Value,
        Unit: v.Unit || null,
        Description: v.Description || null,
        BarcodeProduct: product.BarcodeProduct,
      }));

      await Variant.bulkCreate(variantData, { transaction });
    }

    //  Commit transaction
    await transaction.commit();

    return res.status(201).json({
      message: "Product created successfully with variants",
      product,
    });
  } catch (error) {
    //  Rollback nếu lỗi
    await transaction.rollback();
    console.error("Error creating product:", error);

    return res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

exports.updateProductWithVariants = async (req, res) => {
  const { barcode } = req.params;
  const {
    ProductName,
    NumberOfProduct,
    Image,
    Description,
    BrandID,
    CategoryID,
    CostPrice,
    SalePrice,
    Variants,
  } = req.body;

  const transaction = await sequelize.transaction();

  try {
    // 1️ Kiểm tra product có tồn tại không
    const existingProduct = await Product.findByPk(barcode);
    if (!existingProduct) {
      await transaction.rollback();
      return res.status(404).json({ message: "Product not found" });
    }

    // 2️ Validate product input
    const { isValid, errors } = ProductValidator.validate(
      {
        BarcodeProduct: barcode,
        ProductName,
        BrandID,
        CategoryID,
      },
      true // isUpdate = true
    );

    if (!isValid) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Invalid product input",
        errors,
      });
    }

    // 3️ Cập nhật product
    await existingProduct.update(
      {
        ProductName,
        NumberOfProduct,
        Image,
        Description,
        BrandID,
        CategoryID,
        CostPrice,
        SalePrice,
        UpdateAt: new Date(),
      },
      { transaction }
    );

    // 4️ Xử lý cập nhật variants (nếu có)
    if (Array.isArray(Variants)) {
      // Xóa hết variants cũ rồi thêm lại (đơn giản, tránh lỗi mismatch)
      await Variant.destroy({
        where: { BarcodeProduct: barcode },
        transaction,
      });

      // Validate từng variant
      for (const v of Variants) {
        const { isValid: validV, errors: errorsV } =
          VariantValidator.validateVariantInput(v, true);
        if (!validV) {
          await transaction.rollback();
          return res.status(400).json({
            message: "Invalid variant input",
            errors: errorsV,
          });
        }
      }

      // Tạo lại danh sách variants
      const newVariants = Variants.map((v) => ({
        AttributeName: v.AttributeName,
        Value: v.Value,
        Unit: v.Unit || null,
        Description: v.Description || null,
        BarcodeProduct: barcode,
      }));

      await Variant.bulkCreate(newVariants, { transaction });
    }

    // 5️ Commit nếu mọi thứ OK
    await transaction.commit();

    return res.status(200).json({
      message: "Product updated successfully with variants",
      product: existingProduct,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating product:", error);
    return res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { keyword, BrandID, CategoryID } = req.query;

    const whereClause = {};

    // 🔹 Lọc theo Brand và Category nếu có
    if (BrandID) whereClause.BrandID = Number(BrandID);
    if (CategoryID) whereClause.CategoryID = Number(CategoryID);

    // 🔹 Nếu có keyword → tìm trong ProductName hoặc BarcodeProduct
    if (keyword && keyword.trim() !== "") {
      whereClause[Op.or] = [
        { ProductName: { [Op.like]: `%${keyword.trim()}%` } },
        { BarcodeProduct: { [Op.like]: `%${keyword.trim()}%` } },
      ];
    }

    console.log("===== 🟡 WHERE CLAUSE BUILT =====");
    console.log(whereClause);

    // ✅ Truy vấn
    const products = await Product.findAll({
      where: whereClause,
      include: [
        {
          model: Brand,
          as: "Brand",
          attributes: ["BrandID", "BrandName"],
        },
        {
          model: Category,
          as: "Category",
          attributes: ["CategoryID", "CategoryName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    console.log("===== 🔵 QUERY RESULT =====");
    console.log("Total products found:", products.length);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách sản phẩm",
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
exports.getLowStockCount = async (req, res) => {
  try {
    const threshold = 5;

    const count = await Product.count({
      where: {
        NumberOfProduct: { [Op.lte]: threshold },
        IsArchive: false,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "low_stock_count_retrieved",
      threshold,
      count,
    });
  } catch (error) {
    console.error("Error fetching low stock count:", error);
    res.status(500).json({
      status: "error",
      message: "failed_to_retrieve_low_stock_count",
    });
  }
};
exports.getTotalProducts = async (req, res) => {
  try {
    // lấy tất cả sản phẩm đang kinh doanh
    const products = await Product.findAll({
      where: {
        IsArchive: false,
      },
      attributes: ["NumberOfProduct"],
    });

    // tính tổng số lượng
    const totalProducts = products.reduce(
      (acc, p) => acc + (p.NumberOfProduct || 0),
      0
    );

    res.status(200).json({
      status: "success",
      message: "total_products_calculated",
      totalProducts,
    });
  } catch (error) {
    console.error("Error calculating total products:", error);
    res.status(500).json({
      status: "error",
      message: "failed_to_calculate_total_products",
    });
  }
};
exports.getLowStockProducts = async (req, res) => {
  try {
    const threshold = 5;
    const { keyword, BrandID, CategoryID } = req.query;

    // build điều kiện where
    const whereClause = {
      NumberOfProduct: { [Op.lte]: threshold },
      IsArchive: false,
    };

    // lọc theo BrandID / CategoryID nếu có
    if (BrandID) whereClause.BrandID = Number(BrandID);
    if (CategoryID) whereClause.CategoryID = Number(CategoryID);

    // tìm theo keyword nếu có
    if (keyword && keyword.trim() !== "") {
      whereClause[Op.or] = [
        { ProductName: { [Op.like]: `%${keyword.trim()}%` } },
        { BarcodeProduct: { [Op.like]: `%${keyword.trim()}%` } },
      ];
    }

    // query
    const products = await Product.findAll({
      where: whereClause,
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
      count: products.length,
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

exports.getProductDetail = async (req, res) => {
  const { barcode } = req.params;

  try {
    const product = await Product.findOne({
      where: { BarcodeProduct: barcode },
      include: [
        {
          model: Brand,
          as: "Brand",
          attributes: ["BrandID", "BrandName"],
        },
        {
          model: Category,
          as: "Category",
          attributes: ["CategoryID", "CategoryName"],
        },
        {
          model: Variant,
          as: "Variants",
          attributes: [
            "VariantID",
            "AttributeName",
            "Value",
            "Unit",
            "Description",
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product detail retrieved successfully",
      product,
    });
  } catch (error) {
    console.error("Error fetching product detail:", error);
    return res.status(500).json({
      message: "Failed to fetch product detail",
      error: error.message,
    });
  }
};

// doanh thu tháng
const { ExportOrder } = require("../models");
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11

    // ngày đầu tháng
    const startDate = new Date(currentYear, currentMonth, 1);
    // ngày cuối tháng
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // lấy tất cả export order trong tháng
    const exportOrders = await ExportOrder.findAll({
      where: {
        ExportDate: { [Op.between]: [startDate, endDate] },
      },
      attributes: ["Total"],
    });

    // tính tổng doanh thu
    const totalRevenue = exportOrders.reduce(
      (acc, order) => acc + parseFloat(order.Total || 0),
      0
    );

    res.status(200).json({
      status: "success",
      message: "monthly_revenue_calculated",
      totalRevenue,
    });
  } catch (error) {
    console.error("Error calculating monthly revenue:", error);
    res.status(500).json({
      status: "error",
      message: "failed_to_calculate_monthly_revenue",
    });
  }
};
exports.getProductsForLookup = async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: [
        "BarcodeProduct",
        "ProductName",
        "NumberOfProduct",
        "SalePrice",
        "CostPrice",
      ],
      include: [
        {
          model: Brand,
          as: "Brand",
          attributes: ["BrandName"],
        },
      ],
      order: [["ProductName", "ASC"]],
    });

    if (products.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy bất kỳ sản phẩm nào trong hệ thống.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "All product barcodes fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("Get Products For Lookup Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
