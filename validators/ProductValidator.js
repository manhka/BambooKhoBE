class ProductValidator {
  /**
   * @param {Object} data - dữ liệu từ req.body
   * @param {boolean} isUpdate - true nếu là update, false nếu là create
   */
  static validate(data, isUpdate = false) {
    const errors = {};

    if (!isUpdate || "BarcodeProduct" in data) {
      if (!data.BarcodeProduct || data.BarcodeProduct.trim() === "") {
        errors.BarcodeProduct = "BarcodeProduct_is_required";
      }
    }

    if (!isUpdate || "ProductName" in data) {
      if (!data.ProductName || data.ProductName.trim() === "") {
        errors.ProductName = "ProductName_is_required";
      }
    }

    if (!isUpdate || "BrandID" in data) {
      if (!data.BrandID) {
        errors.BrandID = "BrandID_is_required";
      }
    }

    if (!isUpdate || "CategoryID" in data) {
      if (!data.CategoryID) {
        errors.CategoryID = "CategoryID_is_required";
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

module.exports = ProductValidator;
