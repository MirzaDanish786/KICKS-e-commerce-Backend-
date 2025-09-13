import Category from "../../models/category/categoryModel.js";
import Product from "../../models/product/productModel.js";
import { normalizePath } from "../../utils/helper.js";

// Add Product Controller
export const addProductController = async (req, res) => {
  const {
    title,
    description,
    price,
    stock,
    categoryId,
    warrantyInformation,
    shippingInformation,
  } = req.body;

  if (
    !title?.trim() ||
    !description?.trim() ||
    price === undefined ||
    stock === undefined ||
    !categoryId?.trim()
  ) {
    return res.error(400, "All fields are required!");
  }

  if (price < 0 || stock < 0) {
    return res.error(400, "Price and stock must be non-negative");
  }

  const imagePath = normalizePath(req.file?.path);
  if (!imagePath) {
    return res.error(400, "Product image is required!");
  }

  const category = await Category.findById(categoryId);
  if (!category) return res.error(404, "Category not found");

  const product = new Product({
    title,
    description,
    price,
    stock,
    image: imagePath,
    category: category._id,
    warrantyInformation,
    shippingInformation,
  });

  await product.save();
  return res.success(201, "Product successfully added!", product);
};

// Get Product by ID
export const getProductController = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id)
    .populate("category", "name slug url")
    .populate({path: 'reviews',
      select: 'comment rating reviewerName reviewerEmail -product',
      options: {sort: {createdAt: -1}, limit: 5},
    });
  if (!product) {
    return res.error(404, "Product not found");
  }

  return res.success(200, "Product successfully fetched!", product);
};

// Get All Products without reviews
export const getAllProductsController = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Number(req.query.limit) || 10;
  const minRating = Number(req.query?.minRating) || 0;
  const categorySlug = req.query.category;

  const filter = {};

  if (categorySlug) {
    const categoryDoc = await Category.findOne({ slug: categorySlug });
    if (!categoryDoc) return res.error(404, "Category not found");
    filter.category = categoryDoc._id;
  }
  if (minRating) {
    filter.averageRating = { $gte: minRating };
  }

  const countProd = await Product.countDocuments(filter);
  const totalPages = Math.max(Math.ceil(countProd / limit), 1);
  const currentPage = page > totalPages ? totalPages : page;
  const skip = (currentPage - 1) * limit;

  const products = await Product.find(filter)
    .populate("category", "name slug url")
    .skip(skip)
    .limit(limit)

  return res.success(200, "Products successfully fetched!", {
    products,
    totalProducts: countProd,
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  });
};

// Get All Products with reviews
export const getAllProductsWithReviewsController = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Number(req.query.limit) || 10;
  const minRating = Number(req.query?.minRating) || 0;
  const categorySlug = req.query.category;

  const filter = {};

  if (categorySlug) {
    const categoryDoc = await Category.findOne({ slug: categorySlug });
    if (!categoryDoc) return res.error(404, "Category not found");
    filter.category = categoryDoc._id;
  }
  if (minRating) {
    filter.averageRating = { $gte: minRating };
  }

  const countProd = await Product.countDocuments(filter);
  const totalPages = Math.max(Math.ceil(countProd / limit), 1);
  const currentPage = page > totalPages ? totalPages : page;
  const skip = (currentPage - 1) * limit;

  const products = await Product.find(filter)
    .populate("category", "name slug url")
    .skip(skip)
    .limit(limit)
    .populate({
      path: "reviews",
      select: "comment rating user -product",
      options: { sort: { createdAt: -1 }, limit: 5 },
      populate: {path: 'user', select:'username email profilePic'}
    });

  return res.success(200, "Products with reviews fetcehd successfully!", {
    products,
    totalProducts: countProd,
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  });
};

// Update Product
export const updateProductController = async (req, res) => {
  const { id } = req.params;
  const { categoryId, ...rest } = req.body;
  const imagePath = normalizePath(req.file?.path);

  const product = await Product.findById(id);
  if (!product) {
    return res.error(404, "Product not found");
  }

  if (categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.error(404, "Category not found");
    }
    rest.category = category._id;
  }

  Object.assign(product, rest);

  await product.save();

  return res.success(200, "Product updated successfully!", product);
};

// Delete Product
export const deleteProductController = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return res.error(404, "Product not found");
  }
  return res.success(200, "Product deleted successfully!", product);
};
