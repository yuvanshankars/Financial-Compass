import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CategorySuggestions from '../components/CategorySuggestions';

const Budgets = () => {
  // State for budgets and form
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentBudgetId, setCurrentBudgetId] = useState(null);
  
  // Filter state
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  
  // Progress data
  const [budgetProgress, setBudgetProgress] = useState([]);

  // Fetch budgets from API
  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/budgets/progress?month=${filterMonth}&year=${filterYear}`);
      setBudgetProgress(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setError('Failed to load budgets. Please try again later.');
      setLoading(false);
    }
  }, [filterMonth, filterYear]);

  // Fetch budgets and categories on component mount
  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, [fetchBudgets, filterMonth, filterYear]);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const budgetData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      
      if (isEditing) {
        await axios.put(`/api/budgets/${currentBudgetId}`, budgetData);
        toast.success('Budget updated successfully');
      } else {
        await axios.post('/api/budgets', budgetData);
        toast.success('Budget created successfully');
      }
      
      // Reset form and fetch updated budgets
      resetForm();
      fetchBudgets();
    } catch (err) {
      console.error('Error saving budget:', err);
      toast.error(err.response?.data?.error || 'Failed to save budget');
    }
  };

  // Handle budget deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await axios.delete(`/api/budgets/${id}`);
        toast.success('Budget deleted successfully');
        fetchBudgets();
      } catch (err) {
        console.error('Error deleting budget:', err);
        toast.error('Failed to delete budget');
      }
    }
  };

  // Handle budget edit
  const handleEdit = (budget) => {
    // Find the original budget (not the progress object)
    const originalBudget = {
      category: budget.category._id,
      amount: budget.budgetAmount,
      month: filterMonth,
      year: filterYear
    };
    
    setFormData(originalBudget);
    setCurrentBudgetId(budget._id);
    setIsEditing(true);
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      month: filterMonth,
      year: filterYear
    });
    setIsEditing(false);
    setCurrentBudgetId(null);
    setShowForm(false);
  };

  // Generate month options
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Generate year options (current year and 5 years before and after)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Budgets</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {showForm ? (
              <>
                <XMarkIcon className="-ml-1 mr-2 h-5 w-5" />
                Cancel
              </>
            ) : (
              <>
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Budget
              </>
            )}
          </button>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg leading-6 font-medium text-gray-900">Budget Period</h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-4">
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(parseInt(e.target.value))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Budget Form */}
        {showForm && (
          <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {isEditing ? 'Edit Budget' : 'Create New Budget'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isEditing
                    ? 'Update the budget amount for this category.'
                    : 'Set a budget for a specific category for the selected month and year.'}
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {categories.length === 0 && (
                        <p className="mt-2 text-sm text-gray-500">
                          No categories available. Add some categories below to create budgets.
                        </p>
                      )}
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        Budget Amount
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          required
                          min="0"
                          step="0.01"
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="month" className="block text-sm font-medium text-gray-700">
                        Month
                      </label>
                      <select
                        id="month"
                        name="month"
                        value={formData.month}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        {months.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                        Year
                      </label>
                      <select
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {isEditing ? 'Update Budget' : 'Create Budget'}
                    </button>
                  </div>
                </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Suggestions - Show when no categories or when form is open */}
      {(categories.length === 0 || showForm) && (
        <div className="mt-6">
          <CategorySuggestions 
            onCategoriesAdded={(newCategories) => {
              fetchCategories(); // Refresh categories list
              toast.success(`Added ${newCategories.length} new categories!`);
            }}
            existingCategories={categories}
          />
        </div>
      )}

      {/* Budget Progress */}
      <div className="mt-6">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-500">Loading budgets...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : budgetProgress.length === 0 ? (
            <div className="text-center py-10 bg-white shadow rounded-lg">
              <p className="text-gray-500">No budgets found for this period.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Create Your First Budget
              </button>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {budgetProgress.map((budget) => (
                  <li key={budget._id}>
                    <div className="px-4 py-5 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: budget.category.color + '20' }}
                          >
                            <span
                              className="h-6 w-6 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: budget.category.color }}
                            >
                              {budget.category.icon}
                            </span>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">{budget.category.name}</h3>
                            <p className="text-sm text-gray-500">
                              Budget: ${budget.budgetAmount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(budget)}
                            className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            <PencilIcon className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => handleDelete(budget._id)}
                            className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <TrashIcon className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                                {budget.percentage.toFixed(0)}% spent
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold inline-block text-primary-600">
                                ${budget.spent.toFixed(2)} / ${budget.budgetAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
                            <div
                              style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${budget.status === 'good' ? 'bg-green-500' : budget.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}
                            ></div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {budget.remaining > 0 ? (
                            <span className="text-green-600">
                              ${budget.remaining.toFixed(2)} remaining
                            </span>
                          ) : (
                            <span className="text-red-600">
                              ${Math.abs(budget.remaining).toFixed(2)} over budget
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budgets;