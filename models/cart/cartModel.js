import mongoose from "mongoose";
import CartItem from "./cartItemModel";
const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [CartItem],
  },
  { timestamps: true }
);

const cartSchema = mongoose.model("CartModel", CartSchema);
export default cartSchema;
