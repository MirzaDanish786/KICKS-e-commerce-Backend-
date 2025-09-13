import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', 
    required: true,
  },
  quantity: {
    type: Number,
    min: 1,
    default: 1,
  },
});
const CartItem = mongoose.model('CartItemModel', CartItemSchema)
export default CartItem;

