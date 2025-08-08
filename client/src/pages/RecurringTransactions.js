import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  PlusIcon,
  FunnelIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const RecurringTransactions = () => {
  // State for recurring transactions and pagination
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // State for filters
  const [filters, setFilters] = useState({
    active: '',
    type: '',
    category: '',
    frequency: ''
  });

  // State for filter visibility
  const [showFilters, setShowFilters] = useState(false);

  // State for categories (for filter dropdown)
  const [categories, setCategories] = useState([]);

  // State for form
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    type: 'expense',
    category: '',
    frequency: 'monthly',
    startDate: new Date(),
    endDate: null,
    dayOfMonth: 1,
    dayOfWeek: 1,
    active: true
  });

  // Fetch recurring transactions with current filters and pagination
  const fetchRecurringTransactions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query string from filters and pagination
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      
      if (filters.active) {
        params.append('active', filters.active);
      }
      
      if (filters.type) {
        params.append('type', filters.type);
      }
      
      if (filters.category) {
        params.append('category', filters.category);
      }
      
      if (filters.frequency) {
        params.append('frequency', filters.frequency);
      }
      
      // Fetch recurring transactions
      const response = await axios.get(`/api/recurring-transactions?${params.toString()}`);
      
      setRecurringTransactions(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0
      }));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recurring transactions:', err);
      setError('Failed to load recurring transactions. Please try again.');
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Fetch categories for filter dropdown
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Don't set error state here to avoid blocking transaction loading
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchRecurringTransactions();
    fetchCategories();
  }, [fetchRecurringTransactions, pagination.page, pagination.limit]);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setPagination(prev => ({
      ...prev,
      page: 1 // Reset to first page when applying new filters
    }));
    fetchRecurringTransactions();
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      active: '',
      type: '',
      category: '',
      frequency: ''
    });
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    fetchRecurringTransactions();
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage > 0) {
      setPagination(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date changes
  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      
      // Remove fields that are not applicable to the selected frequency
      if (data.frequency !== 'weekly') {
        delete data.dayOfWeek;
      }
      
      if (data.frequency !== 'monthly') {
        delete data.dayOfMonth;
      }
      
      if (isEditing) {
        await axios.put(`/api/recurring-transactions/${currentId}`, data);
        toast.success('Recurring transaction updated successfully');
      } else {
        await axios.post('/api/recurring-transactions', data);
        toast.success('Recurring transaction created successfully');
      }
      
      // Reset form and fetch updated data
      setShowForm(false);
      setIsEditing(false);
      setCurrentId(null);
      setFormData({
        amount: '',
        description: '',
        type: 'expense',
        category: '',
        frequency: 'monthly',
        startDate: new Date(),
        endDate: null,
        dayOfMonth: 1,
        dayOfWeek: 1,
        active: true
      });
      fetchRecurringTransactions();
    } catch (err) {
      console.error('Error saving recurring transaction:', err);
      toast.error(err.response?.data?.error || 'Failed to save recurring transaction');
    }
  };

  // Handle edit
  const handleEdit = (transaction) => {
    setIsEditing(true);
    setCurrentId(transaction._id);
    setFormData({
      amount: transaction.amount,
      description: transaction.description,
      type: transaction.type,
      category: transaction.category._id,
      frequency: transaction.frequency,
      startDate: new Date(transaction.startDate),
      endDate: transaction.endDate ? new Date(transaction.endDate) : null,
      dayOfMonth: transaction.dayOfMonth || 1,
      dayOfWeek: transaction.dayOfWeek !== undefined ? transaction.dayOfWeek : 1,
      active: transaction.active
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      try {
        await axios.delete(`/api/recurring-transactions/${id}`);
        toast.success('Recurring transaction deleted successfully');
        fetchRecurringTransactions();
      } catch (err) {
        console.error('Error deleting recurring transaction:', err);
        toast.error('Failed to delete recurring transaction');
      }
    }
  };

  // Process recurring transactions
  const processRecurringTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/recurring-transactions/process');
      
      if (response.data.count > 0) {
        toast.success(`${response.data.count} transactions created successfully`);
      } else {
        toast.info('No transactions were due for processing');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error processing recurring transactions:', err);
      toast.error('Failed to process recurring transactions');
      setLoading(false);
    }
  };

  // Get frequency display text
  const getFrequencyText = (frequency, dayOfWeek, dayOfMonth) => {
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `Weekly on ${days[dayOfWeek]}`;
      case 'monthly':
        return `Monthly on day ${dayOfMonth}`;
      case 'yearly':
        return 'Yearly';
      default:
        return frequency;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recurring Transactions</h1>
        <div className="flex space-x-2">
          <button
            onClick={processRecurringTransactions}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Process Now
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setCurrentId(null);
              setFormData({
                amount: '',
                description: '',
                type: 'expense',
                category: '',
                frequency: 'monthly',
                startDate: new Date(),
                endDate: null,
                dayOfMonth: 1,
                dayOfWeek: 1,
                active: true
              });
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Recurring
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4">
              {/* Status Filter */}
              <div>
                <label htmlFor="active" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="active"
                  name="active"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filters.active}
                  onChange={(e) => handleFilterChange('active', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frequency Filter */}
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                  Frequency
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filters.frequency}
                  onChange={(e) => handleFilterChange('frequency', e.target.value)}
                >
                  <option value="">All Frequencies</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={resetFilters}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={applyFilters}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => setShowForm(false)}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {isEditing ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
                  </h3>
                  <div className="mt-4">
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        {/* Description */}
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <input
                            type="text"
                            name="description"
                            id="description"
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={formData.description}
                            onChange={handleChange}
                          />
                        </div>

                        {/* Amount */}
                        <div>
                          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                            Amount
                          </label>
                          <input
                            type="number"
                            name="amount"
                            id="amount"
                            required
                            step="0.01"
                            min="0.01"
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={formData.amount}
                            onChange={handleChange}
                          />
                        </div>

                        {/* Type */}
                        <div>
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                            Type
                          </label>
                          <select
                            id="type"
                            name="type"
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                            value={formData.type}
                            onChange={handleChange}
                          >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                          </select>
                        </div>

                        {/* Category */}
                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                            Category
                          </label>
                          <select
                            id="category"
                            name="category"
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                            value={formData.category}
                            onChange={handleChange}
                          >
                            <option value="" disabled>
                              Select a category
                            </option>
                            {categories.map((category) => (
                              <option key={category._id} value={category._id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Frequency */}
                        <div>
                          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                            Frequency
                          </label>
                          <select
                            id="frequency"
                            name="frequency"
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                            value={formData.frequency}
                            onChange={handleChange}
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                        </div>

                        {/* Day of Week (for weekly) */}
                        {formData.frequency === 'weekly' && (
                          <div>
                            <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700">
                              Day of Week
                            </label>
                            <select
                              id="dayOfWeek"
                              name="dayOfWeek"
                              required
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                              value={formData.dayOfWeek}
                              onChange={handleChange}
                            >
                              <option value={0}>Sunday</option>
                              <option value={1}>Monday</option>
                              <option value={2}>Tuesday</option>
                              <option value={3}>Wednesday</option>
                              <option value={4}>Thursday</option>
                              <option value={5}>Friday</option>
                              <option value={6}>Saturday</option>
                            </select>
                          </div>
                        )}

                        {/* Day of Month (for monthly) */}
                        {formData.frequency === 'monthly' && (
                          <div>
                            <label htmlFor="dayOfMonth" className="block text-sm font-medium text-gray-700">
                              Day of Month
                            </label>
                            <select
                              id="dayOfMonth"
                              name="dayOfMonth"
                              required
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                              value={formData.dayOfMonth}
                              onChange={handleChange}
                            >
                              {[...Array(31)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Start Date */}
                        <div>
                          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                            Start Date
                          </label>
                          <DatePicker
                            selected={formData.startDate}
                            onChange={(date) => handleDateChange('startDate', date)}
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            dateFormat="yyyy-MM-dd"
                          />
                        </div>

                        {/* End Date (optional) */}
                        <div>
                          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                            End Date (Optional)
                          </label>
                          <DatePicker
                            selected={formData.endDate}
                            onChange={(date) => handleDateChange('endDate', date)}
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            dateFormat="yyyy-MM-dd"
                            isClearable
                            placeholderText="No end date"
                            minDate={formData.startDate}
                          />
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center">
                          <input
                            id="active"
                            name="active"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                          />
                          <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                            Active
                          </label>
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm"
                        >
                          {isEditing ? 'Update' : 'Create'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                          onClick={() => setShowForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Transactions List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading recurring transactions...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : recurringTransactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No recurring transactions found. Create your first one!
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {recurringTransactions.map((transaction) => (
              <li key={transaction._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${transaction.type === 'expense' ? 'bg-red-100' : 'bg-green-100'}`}>
                        {transaction.type === 'expense' ? (
                          <ArrowDownIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                        ) : (
                          <ArrowUpIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                        <div className="text-sm text-gray-500">
                          {transaction.category?.name || 'No Category'} • 
                          {getFrequencyText(transaction.frequency, transaction.dayOfWeek, transaction.dayOfMonth)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 flex flex-col items-end">
                        <div className={`text-sm font-semibold ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                          {transaction.type === 'expense' ? '-' : '+'}
                          ${transaction.amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.active ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="p-1 rounded-full text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        Starts: {format(new Date(transaction.startDate), 'MMM d, yyyy')}
                      </div>
                      {transaction.endDate && (
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                          Ends: {format(new Date(transaction.endDate), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                    {transaction.lastProcessedDate && (
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <ArrowPathIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        Last processed: {format(new Date(transaction.lastProcessedDate), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && recurringTransactions.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-md shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page * pagination.limit >= pagination.total}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${pagination.page * pagination.limit >= pagination.total ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                {/* Page numbers would go here */}
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {pagination.page}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${pagination.page * pagination.limit >= pagination.total ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringTransactions;