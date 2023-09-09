import mongoose from "mongoose";
const UserDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "USERACCOUNT",
    required: true,
  },
  wishlist: {
      type: [String],
      default: null,
  },
  cart: [
      {
          productId: String,
          quantity: Number
      }
  ],
  userPayment: {
      type: [String],
      default: null,
  },
  orders:{
      orderID:{
          type:mongoose.Schema.Types.ObjectId,
          ref:'ORDERS',
          }
  }
});


const USERDATA = mongoose.model("userdata", UserDataSchema);
export default USERDATA;
