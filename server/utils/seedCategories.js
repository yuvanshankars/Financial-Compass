const Category = require('../models/Category');
const defaultCategories = require('./defaultCategories');

/**
 * Seed default categories for a new user
 * @param {string} userId - The user ID to create categories for
 * @returns {Promise<Array>} Array of created categories
 */
const seedDefaultCategories = async (userId) => {
  try {
    const categoriesToCreate = defaultCategories.map(category => ({
      name: category.name,
      color: category.color,
      icon: category.icon,
      user: userId
    }));

    const createdCategories = await Category.insertMany(categoriesToCreate);
    console.log(`Created ${createdCategories.length} default categories for user ${userId}`);
    return createdCategories;
  } catch (error) {
    console.error('Error seeding default categories:', error);
    throw error;
  }
};

/**
 * Get default category suggestions (without creating them)
 * @returns {Array} Array of default category suggestions
 */
const getDefaultCategorySuggestions = () => {
  return defaultCategories.map(category => ({
    name: category.name,
    color: category.color,
    icon: category.icon,
    type: category.type
  }));
};

module.exports = {
  seedDefaultCategories,
  getDefaultCategorySuggestions
};
