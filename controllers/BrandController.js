const Brand = require("../models/Brand");
const { Op } = require("sequelize");

/**
 * Lấy tất cả thương hiệu
 * ?archive=true để lấy thương hiệu đã lưu trữ
 */
exports.getAllBrands = async (req, res) => {
  try {
    const { archive } = req.query; // ?archive=true/false
    const whereCondition = {};

    if (archive === "true") whereCondition.IsArchive = true;
    else if (archive === "false") whereCondition.IsArchive = false;

    const brands = await Brand.findAll({
      where: whereCondition,

      order: [["CreatedAt", "DESC"]],
    });

    if (brands.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "brand_not_found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "fetch_success",
      count: brands.length,
      data: brands,
    });
  } catch (error) {
    console.error("Get Brands Error:", error);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};

/**
 * Lấy thương hiệu theo ID
 */
exports.getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByPk(id);
    if (!brand) {
      return res.status(404).json({
        status: "error",
        message: "brand_not_found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "fetch_success",
      data: brand,
    });
  } catch (error) {
    console.error("Get Brand By ID Error:", error);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};

/**
 * Tìm thương hiệu theo tên (gần đúng, không phân biệt hoa thường)
 * /api/brands/search?name=samsung
 */
exports.getBrandByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "missing_name_query",
      });
    }

    const brands = await Brand.findAll({
      where: {
        BrandName: {
          [Op.like]: `%${name}%`,
        },
      },
    });

    if (brands.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "brand_not_found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "fetch_success",
      count: brands.length,
      data: brands,
    });
  } catch (error) {
    console.error("Get Brand By Name Error:", error);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};

/**
 * Tạo thương hiệu mới
 */
exports.createBrand = async (req, res) => {
  try {
    const { BrandName, Description } = req.body;

    if (!BrandName || BrandName.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "brand_name_required",
      });
    }

    // Kiểm tra trùng tên
    const existingBrand = await Brand.findOne({
      where: { BrandName: BrandName.trim() },
    });

    if (existingBrand) {
      return res.status(409).json({
        status: "error",
        message: "brand_name_exists",
      });
    }

    const newBrand = await Brand.create({
      BrandName: BrandName.trim(),
      Description: Description?.trim() || null,
      IsArchive: false,
    });

    res.status(201).json({
      status: "success",
      message: "brand_created",
      data: newBrand,
    });
  } catch (error) {
    console.error("Create Brand Error:", error);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};

/**
 * Cập nhật thương hiệu
 */
exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { BrandName, Description } = req.body;

    const brand = await Brand.findByPk(id);
    if (!brand) {
      return res.status(404).json({
        status: "error",
        message: "brand_not_found",
      });
    }

    if (!BrandName || BrandName.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "brand_name_required",
      });
    }

    // Kiểm tra trùng tên (trừ chính nó)
    const existingBrand = await Brand.findOne({
      where: {
        BrandName: BrandName.trim(),
        BrandID: { [Op.ne]: id },
      },
    });

    if (existingBrand) {
      return res.status(409).json({
        status: "error",
        message: "brand_name_exists",
      });
    }

    await brand.update({
      BrandName: BrandName.trim(),
      Description: Description?.trim() || null,
    });

    res.status(200).json({
      status: "success",
      message: "brand_updated",
      data: brand,
    });
  } catch (error) {
    console.error("Update Brand Error:", error);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};

/**
 * Xóa mềm thương hiệu (soft delete)
 */
exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByPk(id);
    if (!brand) {
      return res.status(404).json({
        status: "error",
        message: "brand_not_found",
      });
    }

    if (brand.IsArchive) {
      return res.status(400).json({
        status: "error",
        message: "brand_already_archived",
      });
    }

    await brand.update({ IsArchive: true });

    res.status(200).json({
      status: "success",
      message: "brand_deleted",
      data: brand,
    });
  } catch (error) {
    console.error("Delete Brand Error:", error);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};

/**
 * Khôi phục thương hiệu đã xóa
 */
exports.restoreBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByPk(id);
    if (!brand) {
      return res.status(404).json({
        status: "error",
        message: "brand_not_found",
      });
    }

    if (!brand.IsArchive) {
      return res.status(400).json({
        status: "error",
        message: "brand_not_archived",
      });
    }

    await brand.update({ IsArchive: false });

    res.status(200).json({
      status: "success",
      message: "brand_restored",
      data: brand,
    });
  } catch (error) {
    console.error("Restore Brand Error:", error);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};
