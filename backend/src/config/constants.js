export const CartStatus = {
  ACTIVE: 'ACTIVE',
  ABANDONED: 'ABANDONED',
  CONVERTED: 'CONVERTED',
};

export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const PaymentStatus = {
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  CANCELLED: 'CANCELLED',
};

export const PaymentMethod = {
  CARD: 'CARD',
  UPI: 'UPI',
  NET_BANKING: 'NET_BANKING',
  WALLET: 'WALLET',
  COD: 'COD',
};

export const FulfillmentStatus = {
  UNFULFILLED: 'UNFULFILLED',
  PROCESSING: 'PROCESSING',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  RETURNED: 'RETURNED',
};

export const CheckoutStatus = {
  OPEN: 'OPEN',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
};

export const CouponType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED: 'FIXED',
};

export const InventoryTransactionType = {
  STOCK_IN: 'STOCK_IN',
  RESERVED: 'RESERVED',
  RELEASED: 'RELEASED',
  SOLD: 'SOLD',
  RETURNED: 'RETURNED',
  ADJUSTMENT: 'ADJUSTMENT',
};

export const ShipmentStatus = {
  PENDING: 'PENDING',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  RETURNED: 'RETURNED',
};

export const ReturnStatus = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  RETURN_SHIPPED: 'RETURN_SHIPPED',
  RETURN_RECEIVED: 'RETURN_RECEIVED',
  REFUNDED: 'REFUNDED',
  COMPLETED: 'COMPLETED',
};


export const fulfillmentTransitions = {
  UNFULFILLED: ["PROCESSING"],
  PROCESSING: ["PACKED"],
  PACKED: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  RETURNED: [],
};

export const COUPON_MESSAGES = {
  INACTIVE: "This coupon is currently inactive.",
  DELETED: "This coupon is no longer available.",
  NOT_STARTED: "This coupon is not valid yet.",
  EXPIRED: "This coupon has expired.",
  GLOBAL_LIMIT_REACHED: "This coupon has reached its maximum usage limit.",
  USER_NOT_ELIGIBLE: "You are not eligible to use this coupon.",
  USER_LIMIT_REACHED: "You have reached the usage limit for this coupon.",
  MINIMUM_ORDER_NOT_MET: "Your cart does not meet the minimum order value for this coupon.",
  PRODUCT_NOT_ELIGIBLE: "This coupon is not applicable to the products in your cart.",
  DISCOUNT_CALCULATION_FAILED: "Unable to calculate the discount for this coupon.",
};
