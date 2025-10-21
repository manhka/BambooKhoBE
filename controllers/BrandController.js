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
      order: [["CreateAt", "DESC"]],
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
