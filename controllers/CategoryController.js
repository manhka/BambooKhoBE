const Category = require("../models/Category");
const { Op } = require("sequelize");

/**
 * Lấy tất cả danh mục
 * ?archive=true để lấy danh mục đã lưu trữ
 */
exports.getAllCategories = async (req, res) => {
  try {
    const { archive } = req.query;
    const whereCondition = {};

    if (archive === "true") whereCondition.IsArchive = true;
    else if (archive === "false") whereCondition.IsArchive = false;

    const categories = await Category.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
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

/**
 * Tạo danh mục mới
 */
exports.createCategory = async (req, res) => {
  try {
    const { CategoryName, Description } = req.body;

    if (!CategoryName || CategoryName.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "category_name_required",
      });
    }

    const existingCategory = await Category.findOne({
      where: { CategoryName: CategoryName.trim() },
    });

    if (existingCategory) {
      return res.status(409).json({
        status: "error",
        message: "category_name_already_exists",
      });
    }

    const newCategory = await Category.create({
      CategoryName: CategoryName.trim(),
      Description: Description ? Description.trim() : null,
      IsArchive: false,
    });

    res.status(201).json({
      status: "success",
      message: "category_created",
      data: newCategory,
    });
  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};

/**
 * Cập nhật danh mục theo ID
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { CategoryName, Description, IsArchive } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "category_not_found",
      });
    }

    if (CategoryName !== undefined) {
      if (!CategoryName || CategoryName.trim() === "") {
        return res.status(400).json({
          status: "error",
          message: "category_name_required",
        });
      }

      const existingCategory = await Category.findOne({
        where: {
          CategoryName: CategoryName.trim(),
          CategoryID: { [Op.ne]: id },
        },
      });

      if (existingCategory) {
        return res.status(409).json({
          status: "error",
          message: "category_name_already_exists",
        });
      }
    }

    const updateData = {};
    if (CategoryName !== undefined)
      updateData.CategoryName = CategoryName.trim();
    if (Description !== undefined)
      updateData.Description = Description ? Description.trim() : null;
    if (IsArchive !== undefined) updateData.IsArchive = IsArchive;

    await category.update(updateData);

    res.status(200).json({
      status: "success",
      message: "category_updated",
      data: category,
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};

/**
 * Xóa mềm danh mục (Soft Delete)
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "category_not_found",
      });
    }

    if (category.IsArchive) {
      return res.status(400).json({
        status: "error",
        message: "category_already_archived",
      });
    }

    await category.update({ IsArchive: true });

    res.status(200).json({
      status: "success",
      message: "category_deleted",
      data: category,
    });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};

/**
 * Khôi phục danh mục đã xóa mềm
 */
exports.restoreCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "category_not_found",
      });
    }

    if (!category.IsArchive) {
      return res.status(400).json({
        status: "error",
        message: "category_not_archived",
      });
    }

    await category.update({ IsArchive: false });

    res.status(200).json({
      status: "success",
      message: "category_restored",
      data: category,
    });
  } catch (error) {
    console.error("Restore Category Error:", error);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};
