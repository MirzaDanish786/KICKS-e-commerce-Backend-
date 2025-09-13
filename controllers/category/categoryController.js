import Category from "../../models/category/categoryModel.js";
import Product from "../../models/product/productModel.js";

export const addCategoryController = async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.error(400, "Name is required");
  }

  const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

  const existing = await Category.findOne({ slug });
  if (existing) {
    return res.error(409, "Category already exists");
  }

  const products_url = `${process.env.BASE_URL}/api/categories/${slug}`;

  const category = new Category({ name, slug, products_url });
  await category.save();

  return res.success(201, "Category successfully added!", category);
};

export const getAllCategoriesController = async (req, res) => {
  const categories = await Category.find();
  return res.success(200, "Category fetched successfully!", categories);
};

// Get category along with product
export const getCategoryWithProductsController = async (req, res) => {
  const { slug } = req.params;
  const category = await Category.findOne({ slug });

  if (!category) {
    return res.error(404, "Category not available!");
  }

  const product = await Product.find({ category: category._id });

  return res.success(
    200,
    "Category with product fetched successfully!",
    product
  );
};

// export const getSingleCategoryController = async (req, res) => {
//     try {
//         const {id} = req.params;
//         const category = await Category.findById(id);
//         if(!category){
//                return res.status(404).json("Category not found");
//         }
//         return res.status(200).json({category})
//     } catch (error) {

//     }
// }

export const updateCategoryController = async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  if (!name || !name.trim()) {
    return res.error(400, "Category name is required");
  }

  const category = await Category.findById(id);
  if (!category) {
    return res.error(404, "Category not found!");
  }

  const slug = name.toLowerCase().trim().replace(/\s+/g, "-");
  const products_url = `${process.env.BASE_URL}/categories/${slug}`;

  category.name = name;
  category.slug = slug;
  category.products_url = products_url;
  await category.save();

  return res.success(200, "Category updated successfully!", category);
};

export const deleteCategoryController = async (req, res) => {
  const id = req.params.id;
  const category = await Category.findByIdAndDelete(id);
  await Product.deleteMany({ category: id });
  if (!category) {
    return res.error(404, "Category not found!");
  }

  return res.success(
    200,
    `${category.name} is successfully deleted!`,
    category
  );
};
