const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    maxlength: [100, 'Display name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for product count
categorySchema.virtual('productCount', {
  ref: 'Product',
  localField: 'name',
  foreignField: 'category',
  count: true
});

// Static method to get all categories with product count
categorySchema.statics.getAllWithCount = async function() {
  const Product = mongoose.model('Product');
  
  const categories = await this.find({ isActive: true }).lean();
  
  // Get product counts for each category
  const counts = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$totalStock' } } }
  ]);
  
  const countMap = {};
  counts.forEach(c => {
    countMap[c._id] = { count: c.count, totalStock: c.totalStock };
  });
  
  return categories.map(cat => ({
    ...cat,
    productCount: countMap[cat.name]?.count || 0,
    totalStock: countMap[cat.name]?.totalStock || 0
  }));
};

// Static method to check if category can be deleted
categorySchema.statics.canDelete = async function(categoryName) {
  const Product = mongoose.model('Product');
  const productCount = await Product.countDocuments({ category: categoryName });
  return productCount === 0;
};

module.exports = mongoose.model('Category', categorySchema);
