import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";

export const addCategoryController = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const url = `${process.env.BASE_URL}/categories/${slug}`;

    const category = new Category({ name, slug, url });
    await category.save();

    return res.status(201).json({
      message: "Category successfully added!",
      category,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllCategoriesController = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).json({ categories });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// Get category along with product
export const getCategoryWithProductsController = async (req, res) => {
    try {
        const {slug} = req.params;
        const category = await Category.findOne({slug})

        if(!category){
            return res.status(404).json({message: 'Category not available'})
        }

        const product = await Product.find({category: category._id});
        if(!product){
            return res.status(404).json({message: 'Product not available'})
        }
        return res.status(200).json({product})
    } catch (error) {
        console.log(error );
    }
}


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
  try {
    const { name } = req.body;
    const { id } = req.params;

    if (!name || !name.trim()) {
      return res.status(400).json("Category name is required");
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json("Category not found");
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g, "-");
    const url = `${process.env.BASE_URL}/categories/${slug}`;

    category.name = name;
    category.slug = slug;
    category.url = url;
    await category.save();

    return res.status(200).json({
      message: "Category updated successfully!",
      category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteCategoryController = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOneAndDelete({slug});
    if (!category) {
      return res.status(404).json({message: "Category not found"});
    }

    return res.status(200).json({
      message: `${category.name} is successfully deleted!`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
