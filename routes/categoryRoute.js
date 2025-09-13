import express from 'express'
import isAuthenticated from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdmin.js';
import { addCategoryController, deleteCategoryController, getAllCategoriesController, getCategoryWithProductsController, updateCategoryController } from '../controllers/category/categoryController.js';

const router = express.Router();

router.get('/', getAllCategoriesController);
// router.get('/:id', getSingleCategoryController);
router.get('/:slug', getCategoryWithProductsController);



 
router.post('/',isAuthenticated, isAdmin, addCategoryController)

router.delete('/delete/:id', deleteCategoryController)
router.put('/update/:id', updateCategoryController)

export default router;