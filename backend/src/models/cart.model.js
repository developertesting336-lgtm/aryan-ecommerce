import mongoose from 'mongoose'

const cartSchema  = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
        },
        
              vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
            index: true
          },
      },
    ],

    totalPrice: {
      type: Number,
      default: 0,
    },

},{timestamps:true});

export const Cart = mongoose.model("Cart",cartSchema);