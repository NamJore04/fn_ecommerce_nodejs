const Category = require('../models/Category');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/async');
const AppError = require('../middleware/errorResponse');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.getAllWithCount();
  
  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  // Get product count
  const productCount = await Product.countDocuments({ category: category.name });
  
  res.json({
    success: true,
    data: {
      ...category.toObject(),
      productCount
    }
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, displayName, description } = req.body;
  
  // Normalize category name (lowercase, replace spaces with hyphens)
  const normalizedName = name.toLowerCase().trim().replace(/\s+/g, '-');
  
  // Check if category already exists
  const existingCategory = await Category.findOne({ name: normalizedName });
  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: 'Category already exists'
    });
  }
  
  const category = await Category.create({
    name: normalizedName,
    displayName: displayName || name,
    description,
    createdBy: req.user._id
  });
  
  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { displayName, description, isActive } = req.body;
  
  let category = await Category.findById(req.params.id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  // Only allow updating displayName, description, isActive (not name itself)
  category.displayName = displayName || category.displayName;
  category.description = description !== undefined ? description : category.description;
  category.isActive = isActive !== undefined ? isActive : category.isActive;
  
  await category.save();
  
  res.json({
    success: true,
    message: 'Category updated successfully',
    data: category
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  // Check if category has products
  const canDelete = await Category.canDelete(category.name);
  
  if (!canDelete) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete category with existing products. Please remove or reassign products first.'
    });
  }
  
  await Category.findByIdAndDelete(req.params.id);
  
  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// @desc    Get categories for dropdown (simple list)
// @route   GET /api/categories/list
// @access  Public
const getCategoryList = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .select('name displayName')
    .sort('displayName');
  
  res.json({
    success: true,
    data: categories.map(c => ({
      value: c.name,
      label: c.displayName
    }))
  });
});

// @desc    Sync categories from products (for migration)
// @route   POST /api/categories/sync
// @access  Private/Admin
const syncCategories = asyncHandler(async (req, res) => {
  // Get all unique categories from products
  const productCategories = await Product.distinct('category');
  
  let created = 0;
  let existing = 0;
  
  for (const catName of productCategories) {
    const exists = await Category.findOne({ name: catName });
    if (!exists) {
      await Category.create({
        name: catName,
        displayName: catName.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        createdBy: req.user._id
      });
      created++;
    } else {
      existing++;
    }
  }
  
  res.json({
    success: true,
    message: `Sync completed. Created: ${created}, Already existing: ${existing}`,
    data: { created, existing }
  });
});

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryList,
  syncCategories
};
