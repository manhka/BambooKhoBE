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
  if (!isUpdate || data.Details !== undefined) {
    if (!Array.isArray(data.Details) || data.Details.length === 0) {
      errors.Details = "Details must be a non-empty array";
    } else {
      for (let i = 0; i < data.Details.length; i++) {
        const detail = data.Details[i];

        if (!detail.BarcodeProduct || detail.BarcodeProduct.trim() === "") {
          errors[`Details[${i}].BarcodeProduct`] = "BarcodeProduct is required";
          continue;
        }

        const product = await Product.findByPk(detail.BarcodeProduct);
        if (!product) {
          errors[
            `Details[${i}].BarcodeProduct`
          ] = `Product ${detail.BarcodeProduct} does not exist`;
          continue;
        }

        if (data.ExportID) {
          const exportDetail = await ExportDetail.findOne({
            where: {
              ExportID: data.ExportID,
              BarcodeProduct: detail.BarcodeProduct,
            },
          });
          if (!exportDetail) {
            errors[
              `Details[${i}].BarcodeProduct`
            ] = `Product ${detail.BarcodeProduct} was not included in ExportID ${data.ExportID}`;
            continue;
          }

          if (
            detail.Quantity === undefined ||
            detail.Quantity === null ||
            !Number.isInteger(detail.Quantity) ||
            detail.Quantity <= 0
          ) {
            errors[`Details[${i}].Quantity`] =
              "Quantity is required and must be a positive integer";
          } else if (detail.Quantity > exportDetail.Quantity) {
            errors[
              `Details[${i}].Quantity`
            ] = `Quantity to return (${detail.Quantity}) cannot exceed quantity exported (${exportDetail.Quantity})`;
          }
        }

        if (detail.Reason && detail.Reason.length > 500) {
          errors[`Details[${i}].Reason`] =
            "Reason must be under 500 characters";
        }
      }
    }
  }

  // Validate main Reason
  if (data.Reason && data.Reason.length > 500) {
    errors.Reason = "Reason must be under 500 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
