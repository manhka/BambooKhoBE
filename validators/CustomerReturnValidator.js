const User = require("../models/User");
const ExportOrder = require("../models/ExportOrder");
const ExportDetail = require("../models/ExportDetail");
const Product = require("../models/Product");

exports.validateCustomerReturnInput = async (data, isUpdate = false) => {
  const errors = {};

  // Validate ReturnDate
  if (!isUpdate || data.ReturnDate !== undefined) {
    if (!data.ReturnDate || data.ReturnDate.trim() === "") {
      errors.ReturnDate = "Return date is required";
    } else if (isNaN(Date.parse(data.ReturnDate))) {
      errors.ReturnDate = "Return date must be a valid date";
    }
  }

  // Validate UserID
  if (!isUpdate || data.UserID !== undefined) {
    if (!data.UserID || !Number.isInteger(data.UserID) || data.UserID <= 0) {
      errors.UserID = "UserID is required and must be a positive integer";
    } else {
      const user = await User.findByPk(data.UserID);
      if (!user) errors.UserID = `UserID ${data.UserID} does not exist`;
    }
  }

  // Validate ExportID
  if (!isUpdate || data.ExportID !== undefined) {
    if (
      !data.ExportID ||
      !Number.isInteger(data.ExportID) ||
      data.ExportID <= 0
    ) {
      errors.ExportID = "ExportID is required and must be a positive integer";
    } else {
      const exportOrder = await ExportOrder.findByPk(data.ExportID);
      if (!exportOrder)
        errors.ExportID = `ExportID ${data.ExportID} does not exist`;
    }
  }

  // Validate Details
  const validateCustomerReturnInput = async (data) => {
    const errors = {};

    if (!data.ReturnDate || isNaN(new Date(data.ReturnDate))) {
      errors.ReturnDate = "ReturnDate is required and must be a valid date";
    }

    if (!data.UserID) {
      errors.UserID = "UserID is required";
    }

    if (!data.ExportID) {
      errors.ExportID = "ExportID is required";
    }

    if (!data.BarcodeProduct || data.BarcodeProduct.trim() === "") {
      errors.BarcodeProduct = "BarcodeProduct is required";
    } else {
      const product = await Product.findByPk(data.BarcodeProduct);
      if (!product) {
        errors.BarcodeProduct = `Product ${data.BarcodeProduct} does not exist`;
      }

      const exportDetail = await ExportDetail.findOne({
        where: {
          ExportID: data.ExportID,
          BarcodeProduct: data.BarcodeProduct,
        },
      });

      if (!exportDetail) {
        errors.BarcodeProduct = `Product ${data.BarcodeProduct} was not included in ExportID ${data.ExportID}`;
      } else {
        const maxReturnable =
          (exportDetail.Quantity || 0) - (exportDetail.ReturnedQuantity || 0);
        if (!Number.isInteger(data.Quantity) || data.Quantity <= 0) {
          errors.Quantity =
            "Quantity is required and must be a positive integer";
        } else if (data.Quantity > maxReturnable) {
          errors.Quantity = `Quantity to return (${data.Quantity}) cannot exceed quantity available (${maxReturnable})`;
        }
      }
    }

    if (data.Reason && data.Reason.length > 500) {
      errors.Reason = "Reason must be under 500 characters";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  module.exports = validateCustomerReturnInput;

  // Validate main Reason
  if (data.Reason && data.Reason.length > 500) {
    errors.Reason = "Reason must be under 500 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
