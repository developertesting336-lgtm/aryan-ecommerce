import { Cart, Order, OrderItem,Coupon } from "../models/index.js";
import Stripe from "stripe";
import { PaymentStatus } from "../config/constants.js";
import { sendEmailtoUser } from "../utils/mail.js";
import { ApiError,ApiResponse } from "../utils/apiResponse.js";

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

export const stripeWebhook = async (req, res) => {
  try {
    console.log("webhook");
    const sig = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      // console.log("event", event);
      const orderId = session.metadata?.orderId;
      const userId = session.metadata.userId;
      const email = session.metadata.email;
      const user = {
        userId,email
      }
      console.log("Order ID:", orderId);

      if (orderId) {
        const order = await Order.findById(orderId);

        console.log("Order found:", order);

        if (order) {
          order.paymentStatus = PaymentStatus.PAID;

          await order.save();
          if(order.paymentStatus===PaymentStatus.PAID){
       getcouponforEmail(user,orderId)
     }
         handleCommission(orderId)
          console.log("✅ Order payment status updated to PAID");
        } else {
          console.log("❌ Order not found:", orderId);
        }
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