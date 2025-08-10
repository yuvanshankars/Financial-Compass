import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const Transactions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // State for transactions and pagination
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: parseInt(queryParams.get('page')) || 1,
    limit: parseInt(queryParams.get('limit')) || 10,
    total: 0
  });

  // State for filters
  const [filters, setFilters] = useState({
    startDate: queryParams.get('startDate') ? new Date(queryParams.get('startDate')) : null,
    endDate: queryParams.get('endDate') ? new Date(queryParams.get('endDate')) : null,
    type: queryParams.get('type') || '',
    category: queryParams.get('category') || '',
    search: queryParams.get('search') || ''
  });

  // State for filter visibility
  const [showFilters, setShowFilters] = useState(false);

  // State for categories (for filter dropdown)
  const [categories, setCategories] = useState([]);

  // Fetch transactions with current filters and pagination
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query string from filters and pagination
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      
      if (filters.startDate) {
        params.append('startDate', filters.startDate.toISOString());
      }
      
      if (filters.endDate) {
        params.append('endDate', filters.endDate.toISOString());
      }
      
      if (filters.type) {
        params.append('type', filters.type);
      }
      
      if (filters.category) {
        params.append('category', filters.category);
      }
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      // Update URL with current filters and pagination
      navigate(`/transactions?${params.toString()}`, { replace: true });
      
      // Fetch transactions
      const response = await axios.get(`/api/transactions?${params.toString()}`);
      
      setTransactions(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0
      }));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, navigate]);

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
    fetchTransactions();
    fetchCategories();
  }, [fetchTransactions, pagination.page, pagination.limit]);

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
    fetchTransactions();
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      type: '',
      category: '',
      search: ''
    });
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    // We'll apply the reset filters in the next useEffect call
  };

  // Apply reset filters
  useEffect(() => {
    if (!filters.startDate && !filters.endDate && !filters.type && !filters.category && !filters.search) {
      fetchTransactions();
    }
  }, [filters, fetchTransactions]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage > 0) {
      setPagination(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };

  // Handle transaction deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`/api/transactions/${id}`);
        toast.success('Transaction deleted successfully');
        fetchTransactions(); // Refresh the list
      } catch (err) {
        console.error('Error deleting transaction:', err);
        toast.error('Failed to delete transaction');
      }
    }
  };

  return (
    <div className="bg-[#ECEFF1] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0B1F3A]">Transaction Ledger</h1>
            <p className="mt-2 text-[#0B1F3A]/80">
              Detailed record of all financial transactions
            </p>
          </div>
          <Link
            to="/transactions/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] transition-colors"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Transaction
          </Link>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow border border-[#CFD8DC] overflow-hidden mb-6">
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search Input */}
              <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-[#607D8B]" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-[#CFD8DC] rounded-lg leading-5 bg-white placeholder-[#607D8B] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] sm:text-sm"
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                />
              </div>

              {/* Filter Toggle Button */}
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-[#CFD8DC] shadow-sm text-sm font-medium rounded-lg text-[#0B1F3A] bg-white hover:bg-[#ECEFF1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] transition-colors"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FunnelIcon className="-ml-1 mr-2 h-5 w-5 text-[#607D8B]" aria-hidden="true" />
                Filters
                {(filters.startDate || filters.endDate || filters.type || filters.category) && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#D4AF37]/10 text-[#D4AF37]">
                    Active
                  </span>
                )}
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 border-t border-[#ECEFF1] pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date Range Filters */}
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-[#0B1F3A] mb-1">
                      Start Date
                    </label>
                    <DatePicker
                      selected={filters.startDate}
                      onChange={(date) => handleFilterChange('startDate', date)}
                      selectsStart
                      startDate={filters.startDate}
                      endDate={filters.endDate}
                      className="block w-full px-3 py-2 border border-[#CFD8DC] rounded-lg shadow-sm focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37] sm:text-sm"
                      placeholderText="Select start date"
                      isClearable
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-[#0B1F3A] mb-1">
                      End Date
                    </label>
                    <DatePicker
                      selected={filters.endDate}
                      onChange={(date) => handleFilterChange('endDate', date)}
                      selectsEnd
                      startDate={filters.startDate}
                      endDate={filters.endDate}
                      minDate={filters.startDate}
                      className="block w-full px-3 py-2 border border-[#CFD8DC] rounded-lg shadow-sm focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37] sm:text-sm"
                      placeholderText="Select end date"
                      isClearable
                    />
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-[#0B1F3A] mb-1">
                      Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      className="block w-full px-3 py-2 border border-[#CFD8DC] rounded-lg shadow-sm focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37] sm:text-sm"
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
                    <label htmlFor="category" className="block text-sm font-medium text-[#0B1F3A] mb-1">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      className="block w-full px-3 py-2 border border-[#CFD8DC] rounded-lg shadow-sm focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37] sm:text-sm"
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
                </div>

                {/* Filter Actions */}
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-[#CFD8DC] shadow-sm text-sm font-medium rounded-lg text-[#0B1F3A] bg-white hover:bg-[#ECEFF1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] transition-colors"
                    onClick={resetFilters}
                  >
                    <XMarkIcon className="-ml-1 mr-2 h-5 w-5 text-[#607D8B]" aria-hidden="true" />
                    Reset
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] transition-colors"
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow border border-[#CFD8DC] overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37] mx-auto"></div>
              <p className="mt-4 text-[#607D8B]">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-center text-[#607D8B]">
              <p className="mb-4">No transactions found.</p>
              {(filters.startDate || filters.endDate || filters.type || filters.category || filters.search) && (
                <p>
                  Try adjusting your filters or{' '}
                  <button
                    className="text-[#0B1F3A] hover:text-[#D4AF37] underline"
                    onClick={resetFilters}
                  >
                    clear all filters
                  </button>
                </p>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-[#ECEFF1]">
              {transactions.map((transaction) => (
                <li key={transaction._id} className="hover:bg-[#ECEFF1]/30 transition-colors">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${transaction.type === 'expense' ? 'bg-red-100' : 'bg-[#2ECC71]/10'}`}>
                          {transaction.type === 'expense' ? (
                            <ArrowDownIcon className="h-5 w-5 text-red-600" />
                          ) : (
                            <ArrowUpIcon className="h-5 w-5 text-[#2ECC71]" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[#0B1F3A]">{transaction.description}</div>
                          <div className="text-xs text-[#607D8B]">
                            {transaction.category?.name || 'Uncategorized'} • {format(new Date(transaction.date), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-4 text-right">
                          <div className={`text-sm font-medium ${transaction.type === 'expense' ? 'text-red-600' : 'text-[#2ECC71]'}`}>
                            {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                          </div>
                          {transaction.type === 'expense' && transaction.category?.budget && (
                            <div className="text-xs text-[#607D8B]">
                              {((transaction.amount / transaction.category.budget) * 100).toFixed(0)}% of budget
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/transactions/${transaction._id}/edit`)}
                            className="p-1 rounded-lg text-[#607D8B] hover:text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] transition-colors"
                          >
                            <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction._id)}
                            className="p-1 rounded-lg text-[#607D8B] hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          {!loading && !error && transactions.length > 0 && (
            <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-[#ECEFF1]">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-[#CFD8DC] text-sm font-medium rounded-lg ${pagination.page === 1 ? 'bg-[#ECEFF1] text-[#607D8B] cursor-not-allowed' : 'bg-white text-[#0B1F3A] hover:bg-[#ECEFF1]'} transition-colors`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-[#CFD8DC] text-sm font-medium rounded-lg ${pagination.page * pagination.limit >= pagination.total ? 'bg-[#ECEFF1] text-[#607D8B] cursor-not-allowed' : 'bg-white text-[#0B1F3A] hover:bg-[#ECEFF1]'} transition-colors`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-[#607D8B]">
                    Showing <span className="font-medium text-[#0B1F3A]">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                    <span className="font-medium text-[#0B1F3A]">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium text-[#0B1F3A]">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-lg border border-[#CFD8DC] bg-white text-sm font-medium ${pagination.page === 1 ? 'text-[#CFD8DC] cursor-not-allowed' : 'text-[#0B1F3A] hover:bg-[#ECEFF1]'} transition-colors`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Current Page Indicator */}
                    <span className="relative inline-flex items-center px-4 py-2 border border-[#CFD8DC] bg-white text-sm font-medium text-[#0B1F3A]">
                      Page {pagination.page}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page * pagination.limit >= pagination.total}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-lg border border-[#CFD8DC] bg-white text-sm font-medium ${pagination.page * pagination.limit >= pagination.total ? 'text-[#CFD8DC] cursor-not-allowed' : 'text-[#0B1F3A] hover:bg-[#ECEFF1]'} transition-colors`}
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
      </div>
    </div>
  );
};

export default Transactions;