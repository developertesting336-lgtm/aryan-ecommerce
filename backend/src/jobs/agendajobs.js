import {agenda} from '../config/agenda.js'
import { fulfillmentTransitions } from '../config/constants.js';



import {Order} from "../models/orders.model.js";

agenda.define("update-order-status", async (job) => {
  const { orderId, fulfillmentStatus } = job.attrs.data;

  const order = await Order.findOne({
    _id: orderId,
    status: { $ne: "CANCELLED" },
  });

  if (!order) {
    console.log(`Order ${orderId} not found`);
    return;
  }

  const currentStatus = order.fulfillmentStatus;

  const allowedStatuses =
    fulfillmentTransitions[currentStatus];

  if (!allowedStatuses) {
    console.log(`Invalid current status: ${currentStatus}`);
    return;
  }

  if (!allowedStatuses.includes(fulfillmentStatus)) {
    console.log(
      `Cannot change status from ${currentStatus} to ${fulfillmentStatus}`
    );
    return;
  }

  // Update current status
  order.fulfillmentStatus = fulfillmentStatus;

  await order.save();

  console.log(
    `Order ${orderId}: ${currentStatus} → ${fulfillmentStatus}`
  );

  // Find next status
  const nextStatuses =
    fulfillmentTransitions[fulfillmentStatus];

  if (nextStatuses?.length > 0) {
    const nextStatus = nextStatuses[0];

    await agenda.schedule(
      "in 1 minute",
      "update-order-status",
      {
        orderId: order._id.toString(),
        fulfillmentStatus: nextStatus,
      }
    );

    console.log(
      `Next status scheduled: ${fulfillmentStatus} → ${nextStatus}`
    );
  }
});




// agenda.define("updateProductStatus", async (job) => {
//   // const { postId } = job.attrs.data;

//   // console.log("Running delete job for post:", postId);
//   // await deletePost(postId);
//   console.log("akm")
// });


   // scheduleDeletePost(post._id)
  // await agenda.every("in 10 seconds", "deletePostJob", {
  //     postId: post._id.toString(),
  //   }); 
