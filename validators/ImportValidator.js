const { Product, Supplier, User } = require("../models/index");

async function validateImportDetails(details) {
    const errors = [];
    const validDetails = [];
    const productUpdates = {};

    if (!Array.isArray(details) || details.length === 0) {
        return {
            isValid: false,
            errors: [{ general: "Import details cannot be empty." }],
            validDetails: [],
            productUpdates: {},
        };
    }

    for (let i = 0; i < details.length; i++) {
        const detail = details[i];
        const detailErrors = {};

        // Validate BarcodeProduct
        if (!detail.BarcodeProduct) {
            detailErrors.BarcodeProduct = `Row ${i + 1}: BarcodeProduct is required.`;
        } else {
            const product = await Product.findByPk(String(detail.BarcodeProduct));
            if (!product) {
                detailErrors.BarcodeProduct = `Row ${i + 1
                    }: Product with Barcode ${detail.BarcodeProduct
                    } not found.`;
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
            detailErrors.Quantity = `Row ${i + 1
                }: Quantity must be a positive integer.`;
        }

        // Validate UnitPrice
        if (
            detail.UnitPrice === undefined ||
            detail.UnitPrice === null ||
            isNaN(detail.UnitPrice) ||
            Number(detail.UnitPrice) < 0
        ) {
            detailErrors.UnitPrice = `Row ${i + 1
                }: UnitPrice must be a non-negative number.`;
        }

        if (Object.keys(detailErrors).length > 0) {
            errors.push({ rowIndex: i + 1, errors: detailErrors });
        } else {
            const quantity = Number(detail.Quantity);
            const unitPrice = Number(detail.UnitPrice);
            const total = quantity * unitPrice;

            validDetails.push({
                BarcodeProduct: String(detail.BarcodeProduct),
                Quantity: quantity,
                UnitPrice: unitPrice,
                Total: total,
            });

            productUpdates[String(detail.BarcodeProduct)] =
                (productUpdates[String(detail.BarcodeProduct)] || 0) + quantity;
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        validDetails,
        productUpdates,
    };
}

async function validateImportOrder(data) {
    const errors = {};

    // Validate SupplierID 
    if (data.SupplierID) {
        if (!Number.isInteger(Number(data.SupplierID)) || Number(data.SupplierID) <= 0) {
            errors.SupplierID = "SupplierID must be a positive integer.";
        } else {
            const supplier = await Supplier.findByPk(data.SupplierID);
            if (!supplier) errors.SupplierID = `Supplier with ID ${data.SupplierID} not found.`;
        }
    } else {
        errors.SupplierID = "SupplierID is required from Excel.";
    }

    // Validate UserID 
    if (!data.UserID || !Number.isInteger(Number(data.UserID)) || Number(data.UserID) <= 0) {
        errors.UserID = "UserID is required and must be a positive integer.";
    } else {
        const user = await User.findByPk(data.UserID);
        if (!user) errors.UserID = `User with ID ${data.UserID} not found.`;
    }

    // Validate ImportDate 
    if (data.ImportDate && isNaN(Date.parse(data.ImportDate))) {
        errors.ImportDate = "ImportDate must be a valid date if provided.";
    }

    return {
        isOrderValid: Object.keys(errors).length === 0,
        orderErrors: errors,
    };
}


module.exports = { validateImportDetails, validateImportOrder };