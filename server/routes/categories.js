const express = require('express');
const { check } = require('express-validator');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategorySuggestions
} = require('../controllers/categories');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get category suggestions
router.get('/suggestions', getCategorySuggestions);

// Get all categories and create a category
router
  .route('/')
  .get(getCategories)
  .post(
    [
      check('name', 'Name is required').not().isEmpty(),
      check('color', 'Color must be a valid hex color')
        .optional()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    ],
    createCategory
  );

// Get, update, and delete a category
router
  .route('/:id')
  .get(getCategory)
  .put(
    [
      check('name', 'Name is required').optional().not().isEmpty(),
      check('color', 'Color must be a valid hex color')
        .optional()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    ],
    updateCategory
  )
  .delete(deleteCategory);

module.exports = router;