export const slugify = (text) => {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Returns the slug to use in product URLs.
 * If product has a slug field, use it.
 * Otherwise, build one from product name + "-" + product ID.
 */
export const getProductSlug = (product) => {
  if (!product) return "";
  if (product.slug && typeof product.slug === "string" && product.slug.trim()) {
    return product.slug.trim();
  }
  const id = product._id || product.id || "";
  const nameSlug = slugify(product.name || product.title || "product");
  return id ? `${nameSlug}-${id}` : nameSlug;
};

/**
 * Extracts product ID from slug or ID parameter.
 * If slugOrId is a 24-character hex string or numeric string, returns it directly.
 * Otherwise, extracts the part after the last "-".
 */
export const extractIdFromSlug = (slugOrId) => {
  if (!slugOrId) return "";
  const trimmed = String(slugOrId).trim();
  // If it's already an ObjectId (24 hex) or pure digits
  if (/^[0-9a-fA-F]{24}$/.test(trimmed) || /^\d+$/.test(trimmed)) {
    return trimmed;
  }
  const lastDashIndex = trimmed.lastIndexOf("-");
  if (lastDashIndex !== -1) {
    const candidate = trimmed.slice(lastDashIndex + 1);
    if (candidate) {
      return candidate;
    }
  }
  return trimmed;
};
