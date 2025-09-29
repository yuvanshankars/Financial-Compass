const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');
const { getDefaultCategorySuggestions } = require('../utils/seedCategories');

// @desc    Get all categories for a user
// @route   GET /api/categories
// @access  Private
exports.getCategories = async (req, res) => {
  try {
    let categories = await Category.find({ user: req.user.id }).sort({
      name: 1
    });

    // If no categories, create default ones
    if (categories.length === 0) {
      const defaultCategories = getDefaultCategorySuggestions().map(c => ({ ...c, user: req.user.id }));
      await Category.insertMany(defaultCategories);
      categories = await Category.find({ user: req.user.id }).sort({ name: 1 });
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Make sure user owns category
    if (category.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this category'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
exports.createCategory = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if category with same name already exists for this user
    const existingCategory = await Category.findOne({
      name: req.body.name,
      user: req.user.id
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name already exists'
      });
    }

    // Create category
    const category = await Category.create({
      ...req.body,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
exports.updateCategory = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Make sure user owns category
    if (category.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this category'
      });
    }

    // If name is being updated, check if it already exists
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await Category.findOne({
        name: req.body.name,
        user: req.user.id
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: 'Category with this name already exists'
        });
      }
    }

    // Update category
    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Make sure user owns category
    if (category.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this category'
      });
    }

    // Check if category is being used in any transactions
    const transactionCount = await Transaction.countDocuments({
      category: req.params.id
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category that is used in ${transactionCount} transactions`
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get default category suggestions
// @route   GET /api/categories/suggestions
// @access  Private
exports.getCategorySuggestions = async (req, res) => {
  try {
    const suggestions = getDefaultCategorySuggestions();
    
    res.status(200).json({
      success: true,
      count: suggestions.length,
      data: suggestions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};