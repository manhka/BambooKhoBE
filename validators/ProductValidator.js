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
        errors.BarcodeProduct = "BarcodeProduct_is_required";
      } else if (data.BarcodeProduct.length > 100) {
        errors.BarcodeProduct = "BarcodeProduct_must_not_exceed_100_characters";
      }
    }

    // 🟦 ProductName
    if (!isUpdate || "ProductName" in data) {
      if (!data.ProductName || data.ProductName.trim() === "") {
        errors.ProductName = "ProductName_is_required";
      } else if (data.ProductName.length > 250) {
        errors.ProductName = "ProductName_must_not_exceed_250_characters";
      }
    }

    // 🟦 NumberOfProduct
    if (!isUpdate || "NumberOfProduct" in data) {
      if (data.NumberOfProduct == null || isNaN(data.NumberOfProduct)) {
        errors.NumberOfProduct = "NumberOfProduct_must_be_a_number";
      } else if (data.NumberOfProduct < 0) {
        errors.NumberOfProduct = "NumberOfProduct_cannot_be_negative";
      }
    }

    // 🟦 BrandID
    if (!isUpdate || "BrandID" in data) {
      if (!data.BrandID) {
        errors.BrandID = "BrandID_is_required";
      } else if (!Number.isInteger(Number(data.BrandID))) {
        errors.BrandID = "BrandID_must_be_an_integer";
      }
    }

    // 🟦 CategoryID
    if (!isUpdate || "CategoryID" in data) {
      if (!data.CategoryID) {
        errors.CategoryID = "CategoryID_is_required";
      } else if (!Number.isInteger(Number(data.CategoryID))) {
        errors.CategoryID = "CategoryID_must_be_an_integer";
      }
    }

    // 🟦 CostPrice
    if (!isUpdate || "CostPrice" in data) {
      if (data.CostPrice == null || isNaN(data.CostPrice)) {
        errors.CostPrice = "CostPrice_must_be_a_number";
      } else if (data.CostPrice < 0) {
        errors.CostPrice = "CostPrice_must_be_positive";
      }
    }

    // 🟦 SalePrice
    if (!isUpdate || "SalePrice" in data) {
      if (data.SalePrice == null || isNaN(data.SalePrice)) {
        errors.SalePrice = "SalePrice_must_be_a_number";
      } else if (data.SalePrice < 0) {
        errors.SalePrice = "SalePrice_must_be_positive";
      } else if (
        data.CostPrice != null &&
        !isNaN(data.CostPrice) &&
        Number(data.SalePrice) < Number(data.CostPrice)
      ) {
        errors.SalePrice = "SalePrice_cannot_be_less_than_CostPrice";
      }
    }

    // 🟦 Image (optional, max length)
    if (!isUpdate || "Image" in data) {
      if (data.Image && data.Image.length > 250) {
        errors.Image = "Image_path_must_not_exceed_250_characters";
      }
    }

    // 🟦 Description (optional, no limit but check type)
    if (!isUpdate || "Description" in data) {
      if (data.Description && typeof data.Description !== "string") {
        errors.Description = "Description_must_be_a_string";
      }
    }

    // 🟦 IsArchive (optional)
    if (!isUpdate || "IsArchive" in data) {
      if (
        data.IsArchive != null &&
        typeof data.IsArchive !== "boolean" &&
        !(data.IsArchive === 0 || data.IsArchive === 1)
      ) {
        errors.IsArchive = "IsArchive_must_be_a_boolean";
      }
    }

    // 🟦 CreateAt & UpdateAt (optional, but must be valid date if provided)
    const dateFields = ["CreateAt", "UpdateAt"];
    for (const field of dateFields) {
      if (!isUpdate || field in data) {
        if (data[field] && isNaN(Date.parse(data[field]))) {
          errors[field] = `${field}_must_be_a_valid_date`;
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

module.exports = ProductValidator;
