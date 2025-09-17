const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryList,
  syncCategories
} = require('../controllers/category.controller');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getCategories);
router.get('/list', getCategoryList);
router.get('/:id', getCategory);

// Protected admin routes
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);
router.post('/sync', protect, authorize('admin'), syncCategories);

module.exports = router;
