import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  PlusIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6', // Default blue color
    icon: 'tag' // Default icon
  });

  // Available icons for selection
  const availableIcons = ['tag', 'home', 'shopping-bag', 'car', 'utensils', 'briefcase', 'heart', 'gift', 'plane', 'book', 'film', 'music', 'coffee'];
  
  // Available colors for selection
  const availableColors = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Green', value: '#10B981' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Gray', value: '#6B7280' }
  ];

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/categories');
      setCategories(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open form for adding a new category
  const handleAddNew = () => {
    setFormData({
      name: '',
      color: '#3B82F6',
      icon: 'tag'
    });
    setFormMode('add');
    setShowForm(true);
  };

  // Open form for editing an existing category
  const handleEdit = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon
    });
    setFormMode('edit');
    setShowForm(true);
  };

  // Close the form
  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentCategory(null);
  };

  // Submit the form (add or edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formMode === 'add') {
        // Add new category
        await axios.post('/api/categories', formData);
        toast.success('Category added successfully');
      } else {
        // Edit existing category
        await axios.put(`/api/categories/${currentCategory._id}`, formData);
        toast.success('Category updated successfully');
      }
      
      // Refresh the categories list
      fetchCategories();
      handleCloseForm();
    } catch (err) {
      console.error('Error saving category:', err);
      toast.error(err.response?.data?.error || 'Failed to save category');
    }
  };

  // Delete a category
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? This will affect all transactions using this category.')) {
      try {
        await axios.delete(`/api/categories/${id}`);
        toast.success('Category deleted successfully');
        fetchCategories(); // Refresh the list
      } catch (err) {
        console.error('Error deleting category:', err);
        toast.error(err.response?.data?.error || 'Failed to delete category');
      }
    }
  };

  // Render icon based on name
  const renderIcon = (iconName, color) => {
    // This is a simplified version - in a real app, you might use a proper icon library
    return (
      <div 
        className="h-8 w-8 rounded-full flex items-center justify-center" 
        style={{ backgroundColor: `${color}20` }} // 20 is for opacity
      >
        <span className="text-sm" style={{ color }}>
          {iconName.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Category
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading categories...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : categories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No categories found. Create your first category to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {renderIcon(category.icon, category.color)}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="p-1 rounded-full text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add/Edit Category Form Modal */}
      {showForm && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {formMode === 'add' ? 'Add New Category' : 'Edit Category'}
                    </h3>
                    <div className="mt-2">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Category Name */}
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Category Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        </div>

                        {/* Color Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color
                          </label>
                          <div className="grid grid-cols-5 gap-2">
                            {availableColors.map((color) => (
                              <div 
                                key={color.value} 
                                className={`h-8 w-8 rounded-full cursor-pointer border-2 ${formData.color === color.value ? 'border-gray-900' : 'border-transparent'}`}
                                style={{ backgroundColor: color.value }}
                                onClick={() => setFormData({...formData, color: color.value})}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Icon Selection - Simplified */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Icon
                          </label>
                          <select
                            name="icon"
                            id="icon"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={formData.icon}
                            onChange={handleInputChange}
                          >
                            {availableIcons.map((icon) => (
                              <option key={icon} value={icon}>
                                {icon.charAt(0).toUpperCase() + icon.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSubmit}
                >
                  {formMode === 'add' ? 'Add Category' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCloseForm}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;