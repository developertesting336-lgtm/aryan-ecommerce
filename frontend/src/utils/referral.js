const STORAGE_KEY = "productRefs";
const EXPIRY_DAYS = 30;

const readRefs = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

// Save the code for one product (called when user B opens the link)
export const saveProductRef = (productId, code) => {
  const refs = readRefs();

  refs[productId] = {
    code,
    exp: Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(refs));
};

// Build the `referrals` array for the create-order request
export const getReferralsForItems = (items = []) => {
  const refs = readRefs();

  return items
    .map((item) => {
      const productId = item?.product?._id;
      const saved = refs[productId];

      if (!productId || !saved || saved.exp < Date.now()) {
        return null;
      }

      return { productId, refCode: saved.code };
    })
    .filter(Boolean);
};

// Remove codes for products that were ordered
export const clearProductRefs = (items = []) => {
  const refs = readRefs();

  items.forEach((item) => {
    delete refs[item?.product?._id];
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(refs));
};