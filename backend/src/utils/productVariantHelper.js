import { generateVariantSku } from "./common.js";

/**
 * Parse variants coming from JSON or FormData
 */
export const parseVariants = (variants) => {
  if (!variants) {
    return [];
  }

  if (Array.isArray(variants)) {
    return variants;
  }

  if (typeof variants === "string") {
    try {
      const parsed = JSON.parse(variants);

      if (!Array.isArray(parsed)) {
        throw new Error("Variants must be an array");
      }

      return parsed;
    } catch (error) {
      throw new Error("Invalid variants data");
    }
  }

  throw new Error("Invalid variants format");
};

/**
 * Create and validate product variants
 *
 * @param {Object} options
 * @param {Array|String} options.variants
 * @param {String} options.productName
 * @param {String} options.brand
 * @param {Boolean} options.hasVariants
 * @param {Boolean} options.isEdit
 */
export const prepareProductVariants = ({
  variants,
  productName,
  brand,
  hasVariants = false,
  isEdit = false,
}) => {
  const enabled =
    hasVariants === true ||
    hasVariants === "true";

  // Product does not use variants
  if (!enabled) {
    return [];
  }

  const parsedVariants = parseVariants(variants);

  if (parsedVariants.length === 0) {
    throw new Error(
      "At least one variant is required when variants are enabled"
    );
  }

  const preparedVariants = parsedVariants.map(
    (variant, index) => {
      // -----------------------------------------
      // Validate variant
      // -----------------------------------------

      if (!variant || typeof variant !== "object") {
        throw new Error(
          `Invalid variant at position ${index + 1}`
        );
      }

      // -----------------------------------------
      // Price
      // -----------------------------------------

      if (
        variant.price === undefined ||
        variant.price === null ||
        variant.price === ""
      ) {
        throw new Error(
          `Variant ${index + 1}: price is required`
        );
      }

      const price = Number(variant.price);

      if (!Number.isFinite(price) || price < 0) {
        throw new Error(
          `Variant ${index + 1}: price must be a valid positive number`
        );
      }

      // -----------------------------------------
      // MRP
      // -----------------------------------------

      let mrp = null;

      if (
        variant.mrp !== undefined &&
        variant.mrp !== null &&
        variant.mrp !== ""
      ) {
        mrp = Number(variant.mrp);

        if (!Number.isFinite(mrp) || mrp < 0) {
          throw new Error(
            `Variant ${index + 1}: MRP must be a valid positive number`
          );
        }
      }

      // -----------------------------------------
      // Stock
      // -----------------------------------------

      let stock = 0;

      if (
        variant.stock !== undefined &&
        variant.stock !== null &&
        variant.stock !== ""
      ) {
        stock = Number(variant.stock);

        if (!Number.isFinite(stock) || stock < 0) {
          throw new Error(
            `Variant ${index + 1}: stock must be a valid positive number`
          );
        }
      }

      // -----------------------------------------
      // Attributes
      // -----------------------------------------

      if (
        !Array.isArray(variant.attributes) ||
        variant.attributes.length === 0
      ) {
        throw new Error(
          `Variant ${index + 1}: at least one attribute is required`
        );
      }

      const attributes = variant.attributes.map(
        (attribute) => {
          if (
            !attribute ||
            !attribute.name ||
            !attribute.value
          ) {
            throw new Error(
              `Variant ${index + 1}: attribute name and value are required`
            );
          }

          return {
            name: String(attribute.name).trim(),
            value: String(attribute.value).trim(),
          };
        }
      );

      // -----------------------------------------
      // SKU
      // -----------------------------------------

      let sku = variant.sku;

      /*
       * Existing SKU is preserved during edit.
       *
       * New variants get a generated SKU.
       */
      if (!sku) {
        sku = generateVariantSku({
          brand,
          productName,
          attributes,
          index: index + 1,
        });
      }

      sku = String(sku)
        .trim()
        .toUpperCase();

      // -----------------------------------------
      // Final variant
      // -----------------------------------------

      return {
        ...(variant._id && {
          _id: variant._id,
        }),

        sku,

        price,

        mrp,

        stock,

        attributes,

        isActive:
          variant.isActive !== undefined
            ? Boolean(variant.isActive)
            : true,
      };
    }
  );

  // -----------------------------------------
  // Check duplicate SKUs
  // -----------------------------------------

  const skuSet = new Set();

  for (const variant of preparedVariants) {
    if (skuSet.has(variant.sku)) {
      throw new Error(
        `Duplicate variant SKU: ${variant.sku}`
      );
    }

    skuSet.add(variant.sku);
  }

  // -----------------------------------------
  // Check duplicate attribute combinations
  // -----------------------------------------

  const combinationSet = new Set();

  for (const variant of preparedVariants) {
    const combination = variant.attributes
      .map(
        (attribute) =>
          `${attribute.name
            .trim()
            .toLowerCase()}:${attribute.value
            .trim()
            .toLowerCase()}`
      )
      .sort()
      .join("|");

    if (combinationSet.has(combination)) {
      throw new Error(
        `Duplicate variant combination: ${combination}`
      );
    }

    combinationSet.add(combination);
  }

  return preparedVariants;
};