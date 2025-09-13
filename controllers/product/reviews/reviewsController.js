import mongoose from "mongoose";
import Product from "../../../models/product/productModel.js";
import { Review } from "../../../models/product/reviewModel.js";
import { addReviewValidation } from "../../../utils/validations.js";

export const addReviewController = async (req, res) => {
  const validation = addReviewValidation.safeParse(req.body);
  if (!validation.success) {
    const firstError = validation.error?.issues[0]?.message || "Invalid";
    return res.error(400, firstError);
  }

  const { productId, rating, comment } = validation.data;

  const userId = req.user?.id; 

  const productToValidate = await Product.findById(productId);
  if (!productToValidate) {
    return res.error(404, "Product does not exist!");
  }

  const review = new Review({
    product: productId,
    user: userId,
    rating,
    comment,
  });
  await review.save();

  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        numReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    const { numReviews, averageRating } = stats[0];
    await Product.findByIdAndUpdate(productId, { numReviews, averageRating });
  }

  return res.success(201, "Review added successfully", review);
};

// delete own review
export const deleteOwnReviewController = async (req, res) => {
  const userId = req.user?.id;
  const { reviewId } = req.params;

  if (!reviewId) {
    return res.error(400, "Review Id is required!");
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    return res.error(404, "Review not exist");
  }

  const productId = review.product;
  const isOwnReview = review.user.equals(userId);
  if (!isOwnReview) {
    return res.error(403, "Other users reviews cannot be deleted!");
  }

  await review.deleteOne();

  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        numReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    const { numReviews, averageRating } = stats[0];
    await Product.findByIdAndUpdate(productId, { numReviews, averageRating });
  }

  return res.success(200, "Review successfully deleted!");
};
