import { Cart, Order, OrderItem,Coupon } from "../models/index.js";
import Stripe from "stripe";
import { PaymentStatus } from "../config/constants.js";
import { sendEmailtoUser } from "../utils/mail.js";
import { ApiError,ApiResponse } from "../utils/apiResponse.js";
import {agenda} from '../config/agenda.js'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


const getcouponforEmail = async(user,orderid)=>{
  try {
    console.log("user mail",user)
    let orderItem = await OrderItem.findOne({order:orderid})
    const order = await Order.findOne({_id:orderid,user:user.userId});
    let coupon;
        
    if(order.subtotal>=2000 && order.subtotal<=2500){
      coupon = await Coupon.findOne({createdBy:orderItem.vendor,discountValue:20});
    }
    if(order.subtotal>=4000 && order.subtotal<=4500){
      coupon = await Coupon.findOne({createdBy:orderItem.vendor,discountValue:30});
    }
    console.log("coupon mail",coupon)
    if (!coupon) {
      throw new ApiError(404, "coupon not found");
    }
   return   sendEmailtoUser(coupon,user.email)
  } catch (error) {
    console.log("getcouponforEmail error:", error);
  }
}


export const payment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.body;

    // ==========================================
    // FIND ORDER
    // ==========================================

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==========================================
    // GET ORDER ITEMS
    // ==========================================

    const orderItems = await OrderItem.find({
      order: order._id,
    });

    if (!orderItems.length) {
      return res.status(400).json({
        success: false,
        message: "Order has no items",
      });
    }

    console.log("ORDER ITEMS:", orderItems);

    // ==========================================
    // CREATE STRIPE LINE ITEMS
    // ==========================================

   
const lineItems = orderItems.map((item) => {
  const unitPrice = Number(item.price);
  const quantity = Number(item.quantity);

  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    throw new Error(`Invalid price: ${item.price}`);
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error(`Invalid quantity: ${item.quantity}`);
  }

  return {
    price_data: {
      currency: "inr",

      product_data: {
        name: item.productName,
      },

      // IMPORTANT:
      // item.price = price of ONE unit
      unit_amount: Math.round(unitPrice * 100),
    },

    // Stripe multiplies unit_amount × quantity
    quantity,
  };
});

// ========================================== // CREATE STRIPE DISCOUNT // ========================================== 
const discounts = [];
 const discountAmount = Number(order.discount || 0);
 if (discountAmount > 0) {
 const stripeCoupon = await stripe.coupons.create({ amount_off: Math.round(discountAmount * 100), currency: "inr", duration: "once", }); 
discounts.push({ coupon: stripeCoupon.id, }); }
console.log( "STRIPE DISCOUNTS:", discounts );
//  // ========================================== // ADD SHIPPING // ==========================================
 const shippingCharge = Number( order.shippingCharge || 0 );
 if (shippingCharge > 0){ 
  lineItems.push({ price_data: { currency: "inr", product_data: { name: "Shipping", }, unit_amount: Math.round( shippingCharge * 100 ), }, quantity: 1, }); }
 console.log( "STRIPE LINE ITEMS:", JSON.stringify(lineItems, null, 2) );
 console.log( "STRIPE DISCOUNTS:", discounts );

    console.log("STRIPE LINE ITEMS:", JSON.stringify(lineItems, null, 2));

    // ==========================================
    // CREATE STRIPE SESSION
    // ==========================================

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: ["card"],

      line_items: lineItems,
  ...(discounts.length > 0 ? { discounts } : {}),

      success_url:
        `${process.env.CLIENT_URL}/payment-success` +
        "?session_id={CHECKOUT_SESSION_ID}",

      cancel_url: `${process.env.CLIENT_URL}/cart`,

      metadata: {
        userId: userId.toString(),
        email: req.user.email,
        orderId: order._id.toString(),

        type: "payment",
      },
    });

    // console.log("STRIPE SESSION:", session);

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      url: session.url,

      sessionId: session.id,
    });
  } catch (error) {
    console.error("Create payment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Centralized, idempotent helper to mark an order as PAID and clear ONLY
 * the purchased products from the user's cart in the database.
 */
export const fulfillOrderPayment = async ({ orderId, userId, session }) => {
  if (!orderId || !userId) {
    throw new Error("Missing orderId or userId for payment fulfillment");
  }

  // 1. Verify the order belongs to the user
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    console.error(`❌ Order not found or unauthorized: orderId=${orderId}, userId=${userId}`);
    return { success: false, message: "Order not found or unauthorized" };
  }

  // 2. Idempotency check: If already marked PAID, return without duplicate actions
  if (order.paymentStatus === PaymentStatus.PAID) {
    console.log(`ℹ️ Order ${orderId} is already marked as PAID. Skipping duplicate processing.`);
    return { success: true, order, alreadyPaid: true };
  }

  // 3. Update Order to PAID
  order.paymentStatus = PaymentStatus.PAID;
  order.status = "CONFIRMED";
  order.placedAt = new Date();
  await order.save();
  console.log(`✅ Order ${orderId} payment status updated to PAID`);

  // 4. Clear ONLY the ordered products from the user's DB cart
  try {
    const orderItems = await OrderItem.find({ order: order._id }).select("product");
    const orderedProductIds = new Set(
      orderItems.map((item) => item.product?.toString()).filter(Boolean)
    );

    if (orderedProductIds.size > 0) {
      const cart = await Cart.findOne({ user: userId });
      if (cart && Array.isArray(cart.items) && cart.items.length > 0) {
        const originalCount = cart.items.length;
        cart.items = cart.items.filter((item) => {
          const itemProdId = (item.product?._id || item.product)?.toString();
          return !orderedProductIds.has(itemProdId);
        });

        if (cart.items.length !== originalCount) {
          cart.totalPrice = cart.items.reduce(
            (total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 1),
            0
          );
          await cart.save();
          console.log(`🛒 Removed ${originalCount - cart.items.length} purchased item(s) from user cart.`);
        }
      }
    }
  } catch (cartError) {
    // "If clearing the cart fails, do NOT mark the payment or order as failed. Log the error and continue."
    console.error("⚠️ Error clearing purchased items from cart:", cartError);
  }

  // 5. Schedule Agenda fulfillment job
  try {
    const job = await agenda.schedule("in 15 seconds", "update-order-status", {
      orderId: order._id.toString(),
      fulfillmentStatus: "PROCESSING",
    });
    console.log("🟢 Agenda Job scheduled:", job?.attrs?._id);
  } catch (agendaError) {
    console.error("🔴 Agenda schedule error:", agendaError);
  }

  // 6. Send coupon email
  try {
    const email = session?.customer_details?.email || session?.metadata?.email || "";
    await getcouponforEmail({ userId, email }, order._id);
  } catch (couponError) {
    console.error("🔴 Coupon email error:", couponError);
  }

  // 7. Handle vendor commission
  try {
    await handleCommission(order._id);
  } catch (commissionError) {
    console.error("🔴 Commission handling error:", commissionError);
  }

  return { success: true, order, alreadyPaid: false };
};

export const verifyPayment = async (req, res) => {
  try {
    const sessionId = req.query.session_id || req.body.sessionId;
    const userId = req.user._id;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Payment session not found",
      });
    }

    // Security check: ensure session metadata userId matches logged-in user
    if (session.metadata?.userId !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: payment session does not belong to this user",
      });
    }

    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID missing from payment session metadata",
      });
    }

    // Check payment status from Stripe provider response
    if (session.payment_status === "paid") {
      const result = await fulfillOrderPayment({
        orderId,
        userId: userId.toString(),
        session,
      });

      return res.status(200).json({
        success: true,
        paid: true,
        order: result.order,
        message: "Payment verified successfully",
      });
    }

    return res.status(200).json({
      success: false,
      paid: false,
      status: session.payment_status,
      message: "Payment has not been completed",
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment",
    });
  }
};

export const stripeWebhook = async (req, res) => {
  try {
    console.log("stripeWebhook hit");
    const sig = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;

      if (orderId && userId && session.payment_status === "paid") {
        await fulfillOrderPayment({ orderId, userId, session });
      } else {
        console.log(`ℹ️ Session completed but payment_status is '${session?.payment_status}' or missing metadata.`);
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);

    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};


const handleCommission = async(id)=>{
  try {
    const orderItems = await OrderItem.find({order:id});
    const commissionRate = 20;

      
for (const orderItem of orderItems) {
   const commissionAmount =
            orderItem.total * commissionRate / 100;
   const vendorEarning =
            orderItem.total - commissionAmount; 
           orderItem. commissionRate = commissionRate;
        orderItem.commissionAmount = commissionAmount;
        orderItem.vendorEarning = vendorEarning;
  await orderItem.save();
}
        // const vendorEarning =
        //     orderItem.total - commissionAmount; 
        //    orderItem. commissionRate = commissionRate;
        // orderItem.commissionAmount = commissionAmount;
        // orderItem.vendorEarning = vendorEarning;
        //     await orderItem.save();
            console.log("commision check",orderItems)
  } catch (error) {
    console.error("Stripe webhook error:", error);
  }
}




const testing = async(user,orderid)=>{
  try {
    let orderItem =await OrderItem.find({order:orderid})
    let coupon;
    //  coupon = await Coupon.findById("6a98b01647e7bfe843ebf3f7");
     coupon = await Coupon.findOne({createdBy:orderItem.vendor,discountValue:20});
    //  if(orderItem?.vendor === coupon?.createdBy){

    //  }
    if (!coupon) {
      throw new ApiError(404, "coupon not found");
    }
    // const order = Order.countDocuments({user:user._id});
    const order =await  Order.findOne({user:user._id,_id:orderid});
    // if(order>5){
    //   coupon = await Coupon.findById("6a98b01647e7bfe843ebf3f7")
    // }
    // sendEmailtoUser(coupon,user.email)
    console.log("coupon",coupon)
    return {coupon,order,orderItem}
  } catch (error) {
    console.log("getcouponforEmail error:", error);
  }
}


export const testingapi = async (req, res) => {
  try {
    const {order} = req.body;
    console.log("orderbody",order)
     const test =await testing(req.user,order)
     return res.status(200).json(
 new ApiResponse(201,{test},  "testing "))

  } catch (error) {
    console.error("Stripe webhook error:", error);

    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};