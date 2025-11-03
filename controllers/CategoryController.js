const Category = require("../models/Category");
const { Op } = require("sequelize");

/**
 * Lấy tất cả danh mục
 * ?archive=true để lấy danh mục đã lưu trữ
 */
exports.getAllCategories = async (req, res) => {
  try {
    const { archive } = req.query; // ?archive=true/false
    const whereCondition = {};

    // Nếu có filter archive
    if (archive === "true") whereCondition.IsArchive = true;
    else if (archive === "false") whereCondition.IsArchive = false;

    const categories = await Category.findAll({
      where: whereCondition,
      order: [["CreatedAt", "DESC"]],
    });

    if (categories.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "category_not_found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "fetch_success",
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};

/**
 * Lấy danh mục theo ID
 */
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "category_not_found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "fetch_success",
      data: category,
    });
  } catch (error) {
    console.error("Get Category By ID Error:", error);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};

/**
 * Tìm danh mục theo tên (gần đúng, không phân biệt hoa thường)
 * /api/categories/search?name=điện tử
 */
exports.getCategoryByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "missing_name_query",
      });
    }

    const categories = await Category.findAll({
      where: {
        CategoryName: {
          [Op.like]: `%${name}%`,
        },
      },
    });

    if (categories.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "category_not_found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "fetch_success",
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Get Category By Name Error:", error);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};
