import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 0,
    },
    comment: {
      type: String,
      trim: true,
    },
    // reviewerName: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    // reviewerEmail: {
    //   type: String,
    //   required: true,
    //   lowercase: true,
    //   trim: true,
    // },
  },
  { timestamps: true }
);
reviewSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const Review = mongoose.model("Review", reviewSchema);
