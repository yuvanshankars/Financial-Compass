import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CategorySuggestions from '../components/CategorySuggestions';

const Budgets = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentBudgetId, setCurrentBudgetId] = useState(null);
  
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  
  const [budgetProgress, setBudgetProgress] = useState([]);

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

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, [fetchBudgets, filterMonth, filterYear]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err.response ? err.response.data : err.message);
      toast.error('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

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
      
      resetForm();
      fetchBudgets();
    } catch (err) {
      console.error('Error saving budget:', err);
      toast.error(err.response?.data?.error || 'Failed to save budget');
    }
  };

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

  const handleEdit = (budget) => {
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="min-h-screen bg-[#ECEFF1] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0B1F3A]">Budget Management</h1>
            <p className="mt-2 text-[#64748B]">Track and manage your monthly spending limits</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] transition-colors"
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
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#ECEFF1] mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-[#0B1F3A] mb-4">Budget Period</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-[#0B1F3A] mb-1">
                  Month
                </label>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                  className="block w-full border border-[#CFD8DC] rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-colors"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-[#0B1F3A] mb-1">
                  Year
                </label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(parseInt(e.target.value))}
                  className="block w-full border border-[#CFD8DC] rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-colors"
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
        </div>

        {/* Budget Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#ECEFF1] mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#0B1F3A] mb-4">
                {isEditing ? 'Edit Budget' : 'Create New Budget'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-[#0B1F3A] mb-1">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="block w-full border border-[#CFD8DC] rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-colors"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-[#0B1F3A] mb-1">
                      Budget Amount *
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-[#64748B]">₹</span>
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
                        className="block w-full pl-8 border border-[#CFD8DC] rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-colors"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="month" className="block text-sm font-medium text-[#0B1F3A] mb-1">
                      Month *
                    </label>
                    <select
                      id="month"
                      name="month"
                      value={formData.month}
                      onChange={handleChange}
                      required
                      className="block w-full border border-[#CFD8DC] rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-colors"
                    >
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-[#0B1F3A] mb-1">
                      Year *
                    </label>
                    <select
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      className="block w-full border border-[#CFD8DC] rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-colors"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="py-2 px-6 border border-[#CFD8DC] rounded-lg shadow-sm text-sm font-medium text-[#0B1F3A] bg-white hover:bg-[#ECEFF1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] transition-colors"
                  >
                    {isEditing ? 'Update Budget' : 'Create Budget'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Suggestions */}
        {(categories.length === 0 || showForm) && (
          <div className="mb-6">
            <CategorySuggestions 
              onCategoriesAdded={(newCategories) => {
                fetchCategories();
                toast.success(`Added ${newCategories.length} new categories!`);
              }}
              existingCategories={categories}
            />
          </div>
        )}

        {/* Budget Progress */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#ECEFF1]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37] mx-auto"></div>
              <p className="mt-4 text-[#64748B]">Loading budgets...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : budgetProgress.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[#64748B]">No budgets found for this period.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] transition-colors"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Create Your First Budget
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#ECEFF1]">
              {budgetProgress.map((budget) => (
                <li key={budget._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div 
                        className="h-12 w-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${budget.category.color}20` }}
                      >
                        <div 
                          className="h-8 w-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: budget.category.color, color: 'white' }}
                        >
                         
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-[#0B1F3A]">{budget.category.name}</h3>
                        <p className="text-sm text-[#64748B]">
                          Budget: ₹{budget.budgetAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="p-2 rounded-lg text-[#64748B] hover:text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] transition-colors"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(budget._id)}
                        className="p-2 rounded-lg text-[#64748B] hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-[#0B1F3A]">
                        {budget.percentage.toFixed(0)}% spent
                      </span>
                      <span className="text-[#0B1F3A]">
                        ₹{budget.spent.toFixed(2)} / ₹{budget.budgetAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-[#ECEFF1] rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${budget.percentage < 80 ? 'bg-[#2ECC71]' : budget.percentage < 100 ? 'bg-[#D4AF37]' : 'bg-[#EF4444]'}`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-sm">
                      {budget.remaining > 0 ? (
                        <span className="text-[#2ECC71]">
                          ₹{budget.remaining.toFixed(2)} remaining
                        </span>
                      ) : (
                        <span className="text-[#EF4444]">
                          ₹{Math.abs(budget.remaining).toFixed(2)} over budget
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budgets;