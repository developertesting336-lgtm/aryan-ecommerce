/**
 * Migration: 20261028_add_refund_fields.js
 * Description: Additive migration to initialize totalRefunded, paymentIntentId, and stripeSessionId on existing orders
 * Rollback: Removes totalRefunded, paymentIntentId, and stripeSessionId fields from orders
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import database from "../config/db.js";

dotenv.config();

export async function up() {
  await database();
  console.log("Running migration: add refund fields to orders...");

  const result = await mongoose.connection.collection("orders").updateMany(
    { totalRefunded: { $exists: false } },
    {
      $set: {
        totalRefunded: 0,
        paymentIntentId: null,
        stripeSessionId: null,
      },
    }
  );

  console.log(`Migration complete. Updated ${result.modifiedCount} orders.`);
}

export async function down() {
  await database();
  console.log("Rolling back migration: remove refund fields from orders...");

  const result = await mongoose.connection.collection("orders").updateMany(
    {},
    {
      $unset: {
        totalRefunded: "",
        paymentIntentId: "",
        stripeSessionId: "",
      },
    }
  );

  console.log(`Rollback complete. Updated ${result.modifiedCount} orders.`);
}

if (process.argv[2] === "down") {
  down()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
} else if (process.argv[2] === "up") {
  up()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
