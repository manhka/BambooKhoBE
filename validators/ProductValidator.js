const { Product } = require("../models");

class ProductValidator {
  /**
   * @param {Object} data - Dữ liệu từ req.body
   * @param {boolean} isUpdate - true nếu là update, false nếu là create
   */
  static validate(data, isUpdate = false) {
    const errors = {};

    // 🟦 BarcodeProduct
    if (!isUpdate || "BarcodeProduct" in data) {
      if (!data.BarcodeProduct || data.BarcodeProduct.trim() === "") {
        errors.message = "Mã sản phẩm không được để trống";
      } else if (data.BarcodeProduct.length > 100) {
        errors.message = "Mã sản phẩm không được vượt quá 100 ký tự";
      }
    }

    // 🟦 ProductName
    if (!isUpdate || "ProductName" in data) {
      if (!data.ProductName || data.ProductName.trim() === "") {
        errors.message = "Tên sản phẩm không được để trống";
      } else if (data.ProductName.length > 250) {
        errors.message = "Tên sản phẩm không được vượt quá 250 ký tự";
      }
    }

    // 🟦 NumberOfProduct
    if (!isUpdate || "NumberOfProduct" in data) {
      if (data.NumberOfProduct == null || isNaN(data.NumberOfProduct)) {
        errors.message = "Số lượng sản phẩm phải là một số";
      } else if (data.NumberOfProduct < 0) {
        errors.message = "Số lượng sản phẩm không được âm";
      }
    }

    // 🟦 BrandID
    if (!isUpdate || "BrandID" in data) {
      if (!data.BrandID) {
        errors.message = "Thương hiệu là bắt buộc";
      } else if (!Number.isInteger(Number(data.BrandID))) {
        errors.message = "Thương hiệu phải là số nguyên";
      }
    }

    // 🟦 CategoryID
    if (!isUpdate || "CategoryID" in data) {
      if (!data.CategoryID) {
        errors.message = "Danh mục là bắt buộc";
      } else if (!Number.isInteger(Number(data.CategoryID))) {
        errors.message = "Danh mục phải là số nguyên";
      }
    }

    // 🟦 CostPrice
    if (!isUpdate || "CostPrice" in data) {
      if (data.CostPrice == null || isNaN(data.CostPrice)) {
        errors.message = "Giá vốn phải là một số";
      } else if (data.CostPrice < 0) {
        errors.message = "Giá vốn phải lớn hơn hoặc bằng 0";
      }
    }

    // 🟦 SalePrice
    if (!isUpdate || "SalePrice" in data) {
      if (data.SalePrice == null || isNaN(data.SalePrice)) {
        errors.message = "Giá bán phải là một số";
      } else if (data.SalePrice < 0) {
        errors.message = "Giá bán phải lớn hơn hoặc bằng 0";
      }
    }

    // 🟦 Image (optional, max length)
    if (!isUpdate || "Image" in data) {
      if (data.Image && data.Image.length > 250) {
        errors.message = "Đường dẫn hình ảnh không được vượt quá 250 ký tự";
      }
    }

    // 🟦 Description (optional, must be string)
    if (!isUpdate || "Description" in data) {
      if (data.Description && typeof data.Description !== "string") {
        errors.message = "Mô tả phải là chuỗi ký tự";
      }
    }

    // 🟦 IsArchive (optional)
    if (!isUpdate || "IsArchive" in data) {
      if (
        data.IsArchive != null &&
        typeof data.IsArchive !== "boolean" &&
        !(data.IsArchive === 0 || data.IsArchive === 1)
      ) {
        errors.message = "Trạng thái lưu trữ phải là boolean";
      }
    }

    // 🟦 CreateAt & UpdateAt (optional, must be valid date if provided)
    const dateFields = ["CreateAt", "UpdateAt"];
    for (const field of dateFields) {
      if (!isUpdate || field in data) {
        if (data[field] && isNaN(Date.parse(data[field]))) {
          errors[field] = `${field} phải là một ngày hợp lệ`;
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // 🟦 Async check barcode đã tồn tại (BE dùng nội bộ)
  static async checkBarcodeExists(barcode) {
    if (!barcode || barcode.trim() === "") return false;

    const product = await Product.findByPk(barcode.trim());
    return !!product;
  }
}

module.exports = ProductValidator;
