import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";

// Add Product Controller
export const addProductController = async (req, res) => {
  try {
    const { name, description, price, categoryId } = req.body;
    console.log("Body", req.body);

    if (!name || !description || price === undefined || !categoryId) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const product = new Product({
      name,
      description,
      price,
      category: category._id,
    });

    await product.save();

    return res.status(201).json({ message: "Product successfully added!" });
  } catch (error) {
    console.error("Add Product Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Product by ID
export const getProductController = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate(
      "category",
      "name slug"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error("Get Product Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Products
export const getAllProductsController = async (req, res) => {
  try {
    const products = await Product.find(); 
    return res.status(200).json({ products });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Product
export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      product.category = category._id;
    }

    await product.save();
    return res.status(200).json({ message: "Product updated successfully!" });
  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Product
export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
