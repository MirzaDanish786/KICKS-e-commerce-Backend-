import cartSchema from "../models/cartModel";
import Product from "../models/productModel";

export const addToCart = async(req, res)=>{
    try {
        const {productId} = req.body || '';
        const userId = req.user?.id;
        if(!productId){
            return res.json({message: 'Product Id is required!', success: false})
        }
        const product = await Product.findById(productId);
        if(!product){
            return res.json({message: 'Product not available', success: false})
        }
        const cart = await cartSchema({userId: userId, items: productId})
    } catch (error) {
        
    }
}