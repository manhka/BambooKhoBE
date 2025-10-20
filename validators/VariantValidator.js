exports.validateVariantInput = (data, isUpdate = false) => {
  const errors = {};

  if (!isUpdate || data.AttributeName !== undefined) {
    if (!data.AttributeName || data.AttributeName.trim() === "") {
      errors.AttributeName = "AttributeName is required";
    } else if (data.AttributeName.length > 250) {
      errors.AttributeName = "AttributeName must be under 250 characters";
    }
  }

  if (!isUpdate || data.Value !== undefined) {
    if (data.Value === undefined || data.Value === null) {
      errors.Value = "Value is required";
    } else if (isNaN(data.Value)) {
      errors.Value = "Value must be a number";
    }
  }

  if (!isUpdate || data.Unit !== undefined) {
    if (!data.Unit || data.Unit.trim() === "") {
      errors.Unit = "Unit is required";
    } else if (data.Unit.length > 50) {
      errors.Unit = "Unit must be under 50 characters";
    }
  }

  if (data.Description !== undefined && data.Description.length > 500) {
    errors.Description = "Description must be under 500 characters";
  }

  if (!isUpdate || data.BarcodeProduct !== undefined) {
    if (!data.BarcodeProduct || data.BarcodeProduct.trim() === "") {
      errors.BarcodeProduct = "BarcodeProduct is required";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
