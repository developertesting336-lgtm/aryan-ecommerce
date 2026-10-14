export function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


export function generateCouponCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 10; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}


const normalizeSkuPart = (value) => {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const generateVariantSku = ({
  brand,
  productName,
  attributes = [],
  index,
}) => {
  const parts = [];

  if (brand) {
    parts.push(normalizeSkuPart(brand));
  }

  if (productName) {
    const productPart = productName
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .join("-");

    parts.push(normalizeSkuPart(productPart));
  }

  for (const attribute of attributes) {
    if (attribute?.value) {
      parts.push(
        normalizeSkuPart(attribute.value)
      );
    }
  }

  parts.push(
    String(index).padStart(3, "0")
  );

  return parts.join("-");
};