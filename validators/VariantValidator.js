exports.validateVariantInput = (data, isUpdate = false) => {
  const errors = {};

  //  AttributeName
  if (!isUpdate || data.AttributeName !== undefined) {
    if (!data.AttributeName || data.AttributeName.trim() === "") {
      errors.AttributeName = "AttributeName is required";
    } else if (data.AttributeName.length > 250) {
      errors.AttributeName = "AttributeName must not exceed 250 characters";
    }
  }

  //  Value
  if (!isUpdate || data.Value !== undefined) {
    if (data.Value === undefined || data.Value === null || data.Value === "") {
      errors.Value = "Value is required";
    }
  }

  //  Description (optional)
  // if (data.Description !== undefined) {
  //   if (typeof data.Description !== "string") {
  //     errors.Description = "Description must be a string";
  //   } else if (data.Description.length > 500) {
  //     errors.Description = "Description must not exceed 500 characters";
  //   }
  // }

  // //  BarcodeProduct
  // if (!isUpdate || data.BarcodeProduct !== undefined) {
  //   if (!data.BarcodeProduct || data.BarcodeProduct.trim() === "") {
  //     errors.BarcodeProduct = "BarcodeProduct is required";
  //   } else if (data.BarcodeProduct.length > 100) {
  //     errors.BarcodeProduct = "BarcodeProduct must not exceed 100 characters";
  //   }
  // }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
