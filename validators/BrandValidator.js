const { body, param, query, validationResult } = require("express-validator");

/**
 * Middleware xử lý lỗi validation
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "validation_error",
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Validation cho tạo Brand mới
 */
exports.validateCreateBrand = [
  body("BrandName")
    .notEmpty()
    .withMessage("Brand name is required")
    .isLength({ max: 250 })
    .withMessage("Brand name must not exceed 250 characters")
    .trim(),
  body("Description")
    .optional()
    .isLength({ max: 250 })
    .withMessage("Description must not exceed 250 characters")
    .trim(),
  handleValidationErrors,
];

/**
 * Validation cho cập nhật Brand
 */
exports.validateUpdateBrand = [
  param("id").isInt().withMessage("Brand ID must be an integer"),
  body("BrandName")
    .notEmpty()
    .withMessage("Brand name is required")
    .isLength({ max: 250 })
    .withMessage("Brand name must not exceed 250 characters")
    .trim(),
  body("Description")
    .optional()
    .isLength({ max: 250 })
    .withMessage("Description must not exceed 250 characters")
    .trim(),
  handleValidationErrors,
];

/**
 * Validation cho lấy Brand theo ID
 */
exports.validateBrandId = [
  param("id").isInt().withMessage("Brand ID must be an integer"),
  handleValidationErrors,
];

/**
 * Validation cho tìm kiếm Brand theo tên
 */
exports.validateSearchByName = [
  query("name")
    .notEmpty()
    .withMessage("Search name is required")
    .isLength({ min: 1 })
    .withMessage("Search name must not be empty")
    .trim(),
  handleValidationErrors,
];
