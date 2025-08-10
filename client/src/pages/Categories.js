import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  TagIcon,
  HomeIcon,
  ShoppingBagIcon,
  BanknotesIcon,
  FilmIcon,
  MusicalNoteIcon,
  GiftIcon,
  WifiIcon,
  TruckIcon,
  ShoppingCartIcon,
  CakeIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#0B1F3A', // Deep Navy Blue as default
    icon: 'tag'
  });

  // Available icons with Heroicons components
  const availableIcons = [
    { name: 'tag', component: <TagIcon className="h-5 w-5" /> },
    { name: 'home', component: <HomeIcon className="h-5 w-5" /> },
    { name: 'shopping', component: <ShoppingBagIcon className="h-5 w-5" /> },
    { name: 'money', component: <BanknotesIcon className="h-5 w-5" /> },
    { name: 'entertainment', component: <FilmIcon className="h-5 w-5" /> },
    { name: 'music', component: <MusicalNoteIcon className="h-5 w-5" /> },
    { name: 'gift', component: <GiftIcon className="h-5 w-5" /> },
    { name: 'internet', component: <WifiIcon className="h-5 w-5" /> },
    { name: 'transport', component: <TruckIcon className="h-5 w-5" /> },
    { name: 'groceries', component: <ShoppingCartIcon className="h-5 w-5" /> },
    { name: 'food', component: <CakeIcon className="h-5 w-5" /> },
    { name: 'health', component: <HeartIcon className="h-5 w-5" /> }
  ];

  // Available colors matching the financial theme
  const availableColors = [
    { name: 'Navy', value: '#0B1F3A' },
    { name: 'Emerald', value: '#2ECC71' },
    { name: 'Gold', value: '#D4AF37' },
    { name: 'Slate', value: '#64748B' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Teal', value: '#14B8A6' }
  ];

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

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddNew = () => {
    setFormData({
      name: '',
      color: '#0B1F3A',
      icon: 'tag'
    });
    setFormMode('add');
    setShowForm(true);
  };

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

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formMode === 'add') {
        await axios.post('/api/categories', formData);
        toast.success('Category added successfully');
      } else {
        await axios.put(`/api/categories/${currentCategory._id}`, formData);
        toast.success('Category updated successfully');
      }
      
      fetchCategories();
      handleCloseForm();
    } catch (err) {
      console.error('Error saving category:', err);
      toast.error(err.response?.data?.error || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? This will affect all transactions using this category.')) {
      try {
        await axios.delete(`/api/categories/${id}`);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
        toast.error(err.response?.data?.error || 'Failed to delete category');
      }
    }
  };

  const renderIcon = (iconName) => {
    const icon = availableIcons.find(i => i.name === iconName);
    return icon ? icon.component : <TagIcon className="h-5 w-5" />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0B1F3A]">Categories</h1>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] transition-colors"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Category
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-white shadow overflow-hidden rounded-xl border border-[#ECEFF1]">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37] mx-auto"></div>
            <p className="mt-4 text-[#64748B]">Loading categories...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : categories.length === 0 ? (
          <div className="p-6 text-center text-[#64748B]">
            <p>No categories found. Create your first category to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#ECEFF1]">
            {categories.map((category) => (
              <li key={category._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                      >
                        {renderIcon(category.icon)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-[#0B1F3A]">{category.name}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-1 rounded-lg text-[#64748B] hover:text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] transition-colors"
                      >
                        <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="p-1 rounded-lg text-[#64748B] hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
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
              <div className="absolute inset-0 bg-[#0B1F3A] opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-[#0B1F3A]">
                      {formMode === 'add' ? 'Add New Category' : 'Edit Category'}
                    </h3>
                    <div className="mt-2">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Category Name */}
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-[#0B1F3A]">
                            Category Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="mt-1 block w-full border border-[#CFD8DC] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-colors"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        </div>

                        {/* Color Selection */}
                        <div>
                          <label className="block text-sm font-medium text-[#0B1F3A] mb-2">
                            Color
                          </label>
                          <div className="grid grid-cols-6 gap-2">
                            {availableColors.map((color) => (
                              <div 
                                key={color.value} 
                                className={`h-8 w-8 rounded-full cursor-pointer border-2 ${formData.color === color.value ? 'border-[#0B1F3A]' : 'border-transparent'} transition-colors`}
                                style={{ backgroundColor: color.value }}
                                onClick={() => setFormData({...formData, color: color.value})}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Icon Selection */}
                        <div>
                          <label className="block text-sm font-medium text-[#0B1F3A] mb-2">
                            Icon
                          </label>
                          <div className="grid grid-cols-6 gap-2">
                            {availableIcons.map((icon) => (
                              <div
                                key={icon.name}
                                className={`h-10 w-10 rounded-lg flex items-center justify-center cursor-pointer ${formData.icon === icon.name ? 'bg-[#0B1F3A] text-white' : 'bg-[#ECEFF1] text-[#0B1F3A]'} transition-colors`}
                                onClick={() => setFormData({...formData, icon: icon.name})}
                                title={icon.name}
                              >
                                {React.cloneElement(icon.component, {
                                  className: `h-5 w-5 ${formData.icon === icon.name ? 'text-white' : 'text-current'}`
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-[#ECEFF1] px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-[#0B1F3A] text-base font-medium text-white hover:bg-[#0B1F3A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  onClick={handleSubmit}
                >
                  {formMode === 'add' ? 'Add Category' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-[#CFD8DC] shadow-sm px-4 py-2 bg-white text-base font-medium text-[#0B1F3A] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
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