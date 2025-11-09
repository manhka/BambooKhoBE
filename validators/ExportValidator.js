// validators/ExportValidator.js
const { Product, Customer, User } = require("../models");

async function validateExportDetails(details, transaction) {
  const errors = [];
  const validDetails = [];
  const productUpdates = {}; // { BarcodeProduct: quantityToSubtract }

  if (!Array.isArray(details) || details.length === 0) {
    return {
      isValid: false,
      errors: [{ general: "Export details cannot be empty." }],
      validDetails: [],
      productUpdates: {},
    };
  }

  for (let i = 0; i < details.length; i++) {
    const detail = details[i];
    const detailErrors = {};
    let product;

    // Validate BarcodeProduct (khóa dòng để check số lượng)
    if (!detail.BarcodeProduct) {
      detailErrors.BarcodeProduct = `Row ${i + 1}: BarcodeProduct is required.`;
    } else {
      product = await Product.findByPk(String(detail.BarcodeProduct), { transaction, lock: transaction.LOCK.UPDATE });
      if (!product) {
        detailErrors.BarcodeProduct = `Row ${i + 1}: Product with Barcode ${detail.BarcodeProduct} not found.`;
      } else if (product.IsArchive) {
         detailErrors.BarcodeProduct = `Row ${i + 1}: Product ${detail.BarcodeProduct} is archived.`;
      }
    }

    // Validate Quantity
    if (
      detail.Quantity === undefined ||
      detail.Quantity === null ||
      isNaN(detail.Quantity) ||
      Number(detail.Quantity) <= 0 ||
      !Number.isInteger(Number(detail.Quantity))
    ) {
      detailErrors.Quantity = `Row ${i + 1}: Quantity must be a positive integer.`;
    } else if (product && Number(detail.Quantity) > product.NumberOfProduct) {
      detailErrors.Quantity = `Row ${i + 1}: Not enough stock for ${detail.BarcodeProduct}. Available: ${product.NumberOfProduct}, Requested: ${detail.Quantity}.`;
    }

    // Validate UnitPrice (lấy từ product.SalePrice)
    const unitPrice = product ? Number(product.SalePrice) : 0;

    // --- Validate Warranty Fields (Optional inputs) ---
    if (detail.WarrantyTime !== undefined && detail.WarrantyTime !== null && (isNaN(detail.WarrantyTime) || Number(detail.WarrantyTime) < 0)) {
        detailErrors.WarrantyTime = `Row ${i + 1}: WarrantyTime must be a non-negative number (months).`;
    }
    
    let startTime = null;
    if (detail.WarrantyStartTime) {
        if (isNaN(Date.parse(detail.WarrantyStartTime))) {
            detailErrors.WarrantyStartTime = `Row ${i + 1}: WarrantyStartTime must be a valid date.`;
        } else {
            startTime = new Date(detail.WarrantyStartTime);
        }
    }

    let endTime = null;
    if (detail.WarrantyEndTime) {
         if (isNaN(Date.parse(detail.WarrantyEndTime))) {
            detailErrors.WarrantyEndTime = `Row ${i + 1}: WarrantyEndTime must be a valid date.`;
        } else {
            endTime = new Date(detail.WarrantyEndTime);
            if (startTime && endTime <= startTime) {
                 detailErrors.WarrantyEndTime = `Row ${i + 1}: WarrantyEndTime must be after WarrantyStartTime.`;
            }
        }
    } else if (startTime && detail.WarrantyTime !== undefined && detail.WarrantyTime !== null && !isNaN(detail.WarrantyTime) && Number(detail.WarrantyTime) >= 0) {
        // Tự động tính EndTime nếu có StartTime và WarrantyTime
        endTime = new Date(startTime);
        endTime.setMonth(endTime.getMonth() + Number(detail.WarrantyTime));
    }

    let warrantyStatus = true; // Mặc định là true theo DB mới
    if (detail.WarrantyStatus !== undefined && detail.WarrantyStatus !== null) {
         if (typeof detail.WarrantyStatus !== 'boolean' && ![0, 1, 'true', 'false'].includes(String(detail.WarrantyStatus).toLowerCase())) {
             detailErrors.WarrantyStatus = `Row ${i + 1}: WarrantyStatus must be true or false.`;
         } else {
             warrantyStatus = Boolean(detail.WarrantyStatus === 'true' || detail.WarrantyStatus === 1 || detail.WarrantyStatus === true);
         }
    }
    // --- End Validate Warranty Fields ---

    if (Object.keys(detailErrors).length > 0) {
      errors.push({ rowIndex: i + 1, errors: detailErrors });
    } else {
      const quantity = Number(detail.Quantity);
      const total = quantity * unitPrice;
      validDetails.push({
        BarcodeProduct: String(detail.BarcodeProduct),
        Quantity: quantity,
        UnitPrice: unitPrice,
        Total: total,
        WarrantyTime: detail.WarrantyTime !== undefined && detail.WarrantyTime !== null ? Number(detail.WarrantyTime) : null,
        WarrantyStartTime: startTime,
        WarrantyEndTime: endTime,
        WarrantyStatus: warrantyStatus,
      });
      productUpdates[String(detail.BarcodeProduct)] = (productUpdates[String(detail.BarcodeProduct)] || 0) + quantity;
    }
  }

  return { isValid: errors.length === 0, errors, validDetails, productUpdates };
}

async function validateExportOrder(data) {
  const errors = {};
  
  if (!data.CustomerID || !Number.isInteger(Number(data.CustomerID)) || Number(data.CustomerID) <= 0) {
    errors.CustomerID = "CustomerID is required and must be a positive integer.";
  } else {
    const customer = await Customer.findByPk(data.CustomerID);
    if (!customer) errors.CustomerID = `Customer with ID ${data.CustomerID} not found.`;
  }

  if (!data.UserID || !Number.isInteger(Number(data.UserID)) || Number(data.UserID) <= 0) {
    errors.UserID = "UserID is required and must be a positive integer.";
  } else {
    const user = await User.findByPk(data.UserID);
    if (!user) errors.UserID = `User with ID ${data.UserID} not found.`;
  }

   if (data.ExportDate && isNaN(Date.parse(data.ExportDate))) {
       errors.ExportDate = "ExportDate must be a valid date if provided.";
   }

  return { isOrderValid: Object.keys(errors).length === 0, orderErrors: errors };
}

module.exports = { validateExportDetails, validateExportOrder };