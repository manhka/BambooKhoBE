const Variant = require("../models/Variant");
const VariantValidator = require("../validators/VariantValidator");
const Product = require("../models/Product");

exports.createVariants = async (req, res) => {
  const data = req.body; // data là mảng
  if (!Array.isArray(data) || data.length === 0) {
    return res
      .status(400)
      .json({ status: "error", message: "Input must be a non-empty array" });
  }

  try {
    const barcode = data[0].BarcodeProduct;
    const product = await Product.findByPk(barcode);
    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "product_not_found" });
    }

    const createdVariants = [];

    for (const item of data) {
      const { isValid, errors } = VariantValidator.validateVariantInput(
        item,
        false
      );
      if (!isValid) {
        return res
          .status(400)
          .json({ status: "error", message: "invalid_input", errors });
      }

      const variant = await Variant.create({
        AttributeName: item.AttributeName,
        Value: item.Value,
        Unit: item.Unit,
        Description: item.Description,
        BarcodeProduct: item.BarcodeProduct,
      });

      createdVariants.push(variant);
    }

    res.status(201).json({
      status: "success",
      message: "variants_created",
      data: createdVariants,
    });
  } catch (err) {
    console.error("Error creating variants:", err);
    res.status(500).json({ status: "error", message: "server_error" });
  }
};

exports.updateVariants = async (req, res) => {
  const data = req.body;

  if (!Array.isArray(data) || data.length === 0) {
    return res
      .status(400)
      .json({ status: "error", message: "Input must be a non-empty array" });
  }

  try {
    const updatedVariants = [];

    for (const item of data) {
      if (!item.VariantID) {
        return res.status(400).json({
          status: "error",
          message: "VariantID is required for each item",
        });
      }

      const variant = await Variant.findByPk(item.VariantID);
      if (!variant) {
        return res.status(404).json({
          status: "error",
          message: `VariantID ${item.VariantID} not found`,
        });
      }

      // Validate mỗi item
      const { isValid, errors } = VariantValidator.validateVariantInput(
        item,
        true
      );
      if (!isValid) {
        return res
          .status(400)
          .json({ status: "error", message: "invalid_input", errors });
      }

      await variant.update({
        AttributeName: item.AttributeName ?? variant.AttributeName,
        Value: item.Value ?? variant.Value,
        Unit: item.Unit ?? variant.Unit,
        Description: item.Description ?? variant.Description,
        BarcodeProduct: item.BarcodeProduct ?? variant.BarcodeProduct,
      });

      updatedVariants.push(variant);
    }

    res.json({
      status: "success",
      message: "variants_updated",
      data: updatedVariants,
    });
  } catch (err) {
    console.error("Error batch updating variants:", err);
    res.status(500).json({ status: "error", message: "server_error" });
  }
};

exports.getVariantsByProduct = async (req, res) => {
  const { barcode } = req.params;
  try {
    const variants = await Variant.findAll({
      where: { BarcodeProduct: barcode },
    });
    res.json({ status: "success", data: variants });
  } catch (err) {
    console.error("Error fetching variants:", err);
    res.status(500).json({ status: "error", message: "server_error" });
  }
};

exports.deleteVariant = async (req, res) => {
  const id = req.params.id;
  try {
    const variant = await Variant.findByPk(id);
    if (!variant)
      return res
        .status(404)
        .json({ status: "error", message: "variant_not_found" });

    await variant.destroy();
    res.json({ status: "success", message: "variant_deleted" });
  } catch (err) {
    console.error("Error deleting variant:", err);
    res.status(500).json({ status: "error", message: "server_error" });
  }
};
