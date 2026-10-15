import { addProduct, getCart, syncGuestCart } from "../redux/slices/cartSlice";
import { getProductByIdApi } from "../api/productApi";

const GUEST_CART_KEY = "guestCart";

/**
 * Get guest cart from localStorage.
 * Always returns an array of snapshot objects:
 * { productId, quantity, name, price, image, slug, product }
 */
export const getGuestCart = () => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(GUEST_CART_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => {
        const pid = String(item.productId || item._id);
        const qty = Math.max(1, Number(item.quantity) || 1);
        const pr = Number(item.price ?? item.product?.price ?? 0);
        const nm = item.name || item.product?.name || "Product";
        const img = item.image || item.product?.images?.[0] || item.product?.image || "";
        const sl = item.slug || item.product?.slug || "";
        return {
          productId: pid,
          quantity: qty,
          name: nm,
          price: pr,
          image: img,
          slug: sl,
          product: {
            _id: pid,
            name: nm,
            price: pr,
            images: img ? [img] : [],
            slug: sl,
          },
        };
      });
    }
  } catch (error) {
    console.error("Error reading guestCart from localStorage:", error);
  }
  return [];
};

/**
 * Save guest cart items to localStorage with product snapshot.
 */
export const saveGuestCart = (cartItems) => {
  if (typeof window === "undefined") return;
  try {
    const sanitized = cartItems.map((item) => ({
      productId: String(item.productId || item._id),
      quantity: Math.max(1, Number(item.quantity) || 1),
      name: item.name || item.product?.name || "Product",
      price: Number(item.price ?? item.product?.price ?? 0),
      image: item.image || item.product?.images?.[0] || item.product?.image || "",
      slug: item.slug || item.product?.slug || "",
    }));
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(sanitized));
  } catch (error) {
    console.error("Error saving guestCart to localStorage:", error);
  }
};

/**
 * Add or increment item in localStorage guestCart with product snapshot.
 */
export const addItemToGuestCartStorage = ({
  productId,
  quantity = 1,
  name = "Product",
  price = 0,
  image = "",
  slug = "",
}) => {
  const current = getGuestCart();
  const requestedQty = Math.max(1, Number(quantity) || 1);
  const parsedPrice = Number(price) || 0;
  const existingIndex = current.findIndex(
    (item) => String(item.productId) === String(productId)
  );

  if (existingIndex > -1) {
    current[existingIndex].quantity += requestedQty;
    if (parsedPrice > 0) {
      current[existingIndex].price = parsedPrice;
      if (current[existingIndex].product) {
        current[existingIndex].product.price = parsedPrice;
      }
    }
    if (name && name !== "Product") {
      current[existingIndex].name = name;
      if (current[existingIndex].product) current[existingIndex].product.name = name;
    }
    if (image) {
      current[existingIndex].image = image;
      if (current[existingIndex].product) current[existingIndex].product.images = [image];
    }
    if (slug) {
      current[existingIndex].slug = slug;
      if (current[existingIndex].product) current[existingIndex].product.slug = slug;
    }
  } else {
    current.push({
      productId: String(productId),
      quantity: requestedQty,
      name: name || "Product",
      price: parsedPrice,
      image: image || "",
      slug: slug || "",
      product: {
        _id: String(productId),
        name: name || "Product",
        price: parsedPrice,
        images: image ? [image] : [],
        slug: slug || "",
      },
    });
  }

  saveGuestCart(current);
  return current;
};

/**
 * Enriches any guestCart items in localStorage that are missing price/name
 * by fetching product details from the existing getProductById API.
 */
export const enrichGuestCart = async (dispatch) => {
  if (typeof window === "undefined") return;
  try {
    const guestCart = getGuestCart();
    if (!guestCart || guestCart.length === 0) return;

    let hasUpdates = false;
    const updated = await Promise.all(
      guestCart.map(async (item) => {
        if (Number(item.price) > 0 && item.name && item.name !== "Product") {
          return item;
        }
        try {
          const res = await getProductByIdApi(item.productId);
          const p = res?.data?.data || res?.data?.product || res?.data;
          if (p) {
            hasUpdates = true;
            const validPrice = Number(p.price || p.salePrice || p.discountPrice || 0);
            const validName = p.name || item.name || "Product";
            const validImage = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (item.image || "");
            const validSlug = p.slug || item.slug || "";
            return {
              ...item,
              price: validPrice,
              name: validName,
              image: validImage,
              slug: validSlug,
              product: {
                _id: item.productId,
                name: validName,
                price: validPrice,
                images: validImage ? [validImage] : [],
                slug: validSlug,
              },
            };
          }
        } catch (err) {
          console.warn(`Could not enrich guest cart item ${item.productId}:`, err);
        }
        return item;
      })
    );

    if (hasUpdates) {
      saveGuestCart(updated);
      if (dispatch) {
        dispatch(syncGuestCart(updated));
      }
    }
  } catch (err) {
    console.error("Error enriching guest cart:", err);
  }
};

let isMerging = false;

/**
 * Merges items from guestCart into the logged-in user's database cart
 * using the existing addProduct API/thunk.
 */
export const mergeGuestCart = async (dispatch) => {
  if (typeof window === "undefined" || !dispatch) return;
  if (isMerging) return;

  const raw = localStorage.getItem(GUEST_CART_KEY);
  if (!raw) return;

  let guestCart = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      guestCart = parsed;
    }
  } catch (err) {
    console.error("Error reading guestCart from localStorage:", err);
  }

  if (guestCart.length === 0) {
    localStorage.removeItem(GUEST_CART_KEY);
    return;
  }

  // Clear guestCart IMMEDIATELY from localStorage and lock to prevent concurrent runs
  localStorage.removeItem(GUEST_CART_KEY);
  isMerging = true;

  const failedItems = [];

  try {
    for (const item of guestCart) {
      const pid = item?.productId || item?._id;
      if (!pid) continue;

      try {
        let price = Number(item.price ?? item.product?.price ?? 0);
        // If price was missing, fetch product price
        if (price <= 0) {
          try {
            const res = await getProductByIdApi(pid);
            const pData = res?.data?.data || res?.data?.product || res?.data;
            price = Number(pData?.price || pData?.salePrice || pData?.discountPrice || 0);
          } catch {
            price = 0;
          }
        }

        await dispatch(
          addProduct({
            productId: pid,
            quantity: Number(item.quantity) || 1,
            price: Number(price) || 0,
          })
        ).unwrap();
      } catch (err) {
        console.error(
          `Failed to merge guest cart item (productId: ${pid}):`,
          err
        );
        failedItems.push(item);
      }
    }
  } finally {
    isMerging = false;
  }

  if (failedItems.length > 0) {
    saveGuestCart(failedItems);
  }

  try {
    await dispatch(getCart()).unwrap();
  } catch (err) {
    console.error("Failed to refetch cart after guest cart merge:", err);
  }
};
