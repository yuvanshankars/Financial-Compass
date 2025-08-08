import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [categorySummary, setCategorySummary] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [upcomingRecurring, setUpcomingRecurring] = useState([]);
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch monthly summary
        const summaryResponse = await axios.get(`/api/transactions/summary/monthly?year=${currentYear}&month=${currentMonth}`);
        console.log('Monthly Summary Response:', summaryResponse.data);
        console.log('Monthly Summary Data:', summaryResponse.data.data);
        setMonthlySummary(summaryResponse.data.data || null);
        
        // Fetch category summary
        const categoryResponse = await axios.get(`/api/transactions/summary/category?year=${currentYear}&month=${currentMonth}`);
        setCategorySummary(categoryResponse.data.data || []);
        
        // Fetch recent transactions
        const transactionsResponse = await axios.get('/api/transactions?limit=5');
        setRecentTransactions(transactionsResponse.data.data || []);
        
        // Fetch budget alerts
        const budgetResponse = await axios.get(`/api/budgets/progress?year=${currentYear}&month=${currentMonth}`);
        // Filter to only show budgets that are over 80% spent
        const alerts = (budgetResponse.data.data || []).filter(budget => 
          (budget.percentage >= 80 && budget.percentage < 100) || budget.percentage > 100
        );
        setBudgetAlerts(alerts);
        
        // Fetch upcoming recurring transactions
        const recurringResponse = await axios.get('/api/recurring-transactions?active=true&limit=3');
        setUpcomingRecurring(recurringResponse.data.data || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentMonth, currentYear]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-50 border-l-4 border-danger-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-danger-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('Current monthlySummary state:', monthlySummary);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your financial status for {format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy')}
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <ArrowUpIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Income</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      ${monthlySummary?.totalIncome !== undefined && monthlySummary?.totalIncome !== null ? monthlySummary.totalIncome.toFixed(2) : '0.00'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <ArrowDownIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Expenses</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      ${monthlySummary?.totalExpense !== undefined && monthlySummary?.totalExpense !== null ? monthlySummary.totalExpense.toFixed(2) : '0.00'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <div className="h-6 w-6 text-blue-600 flex items-center justify-center font-bold">
                  =
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Balance</dt>
                  <dd>
                    <div className={`text-lg font-medium ${monthlySummary?.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${monthlySummary?.balance !== undefined && monthlySummary?.balance !== null ? monthlySummary.balance.toFixed(2) : '0.00'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Transactions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Transactions</h3>
            <Link 
              to="/transactions" 
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
          <div className="border-t border-gray-200">
            <div className="divide-y divide-gray-200">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction._id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${transaction.type === 'expense' ? 'bg-red-100' : 'bg-green-100'}`}>
                          {transaction.type === 'expense' ? (
                            <ArrowDownIcon className="h-4 w-4 text-red-600" />
                          ) : (
                            <ArrowUpIcon className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                          <div className="text-sm text-gray-500">{transaction.category?.name || 'Uncategorized'}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className={`text-sm font-medium ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                          {transaction.type === 'expense' ? '-' : '+'} ${transaction.amount !== undefined && transaction.amount !== null ? transaction.amount.toFixed(2) : '0.00'}
                        </div>
                        <div className="ml-4 text-xs text-gray-500">
                          {format(new Date(transaction.date), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-5 text-center text-sm text-gray-500">
                  No recent transactions found.
                </div>
              )}
              <div className="px-4 py-4 sm:px-6 flex justify-center">
                <Link
                  to="/transactions/new"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                  Add Transaction
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Alerts and Category Spending */}
        <div className="space-y-5">
          {/* Budget Alerts */}
          {budgetAlerts.length > 0 && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Budget Alerts</h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  {budgetAlerts.map((budget) => (
                    <div key={budget._id} className="relative">
                      <div className="flex justify-between mb-1">
                        <div>
                          <span className="text-sm font-medium text-gray-700">{budget.category.name}</span>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${budget.percentage > 100 ? 'text-danger-600' : 'text-warning-600'}`}>
                            ${budget.spent !== undefined && budget.spent !== null ? budget.spent.toFixed(2) : '0.00'} / ${budget.amount !== undefined && budget.amount !== null ? budget.amount.toFixed(2) : '0.00'}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div 
                          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${budget.percentage > 100 ? 'bg-danger-500' : 'bg-warning-500'}`}
                        ></div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 flex justify-between">
                        <span>{budget.percentage !== undefined && budget.percentage !== null ? budget.percentage.toFixed(0) : '0'}% spent</span>
                        {budget.percentage > 100 && (
                          <span className="text-danger-600">Exceeded by ${(budget.spent !== undefined && budget.amount !== undefined && budget.spent !== null && budget.amount !== null) ? (budget.spent - budget.amount).toFixed(2) : '0.00'}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 text-center">
                  <Link
                    to="/budgets"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    Manage Budgets
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Top Spending Categories */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Top Spending Categories</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {categorySummary.length > 0 ? (
                <div className="space-y-4">
                  {categorySummary.slice(0, 5).map((category) => (
                    <div key={category.categoryId} className="relative">
                      <div className="flex justify-between mb-1">
                        <div>
                          <span className="text-sm font-medium text-gray-700">{category.categoryName}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            ${category.amount !== undefined && category.amount !== null ? category.amount.toFixed(2) : '0.00'}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div 
                          style={{ width: `${category.percentage}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                        ></div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {category.percentage !== undefined && category.percentage !== null ? category.percentage.toFixed(1) : '0'}% of total expenses
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500 py-4">
                  No spending data available for this month.
                </div>
              )}
              <div className="mt-5 text-center">
                <Link
                  to="/reports"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  View Detailed Reports
                </Link>
              </div>
            </div>
          </div>

          {/* Upcoming Recurring Transactions */}
          {upcomingRecurring.length > 0 && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Recurring</h3>
                <Link 
                  to="/recurring" 
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  View all
                </Link>
              </div>
              <div className="border-t border-gray-200">
                <div className="divide-y divide-gray-200">
                  {upcomingRecurring.map((recurring) => (
                    <div key={recurring._id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${recurring.type === 'expense' ? 'bg-red-100' : 'bg-green-100'}`}>
                            <ArrowPathIcon className={`h-4 w-4 ${recurring.type === 'expense' ? 'text-red-600' : 'text-green-600'}`} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{recurring.description}</div>
                            <div className="text-sm text-gray-500">
                              {recurring.frequency.charAt(0).toUpperCase() + recurring.frequency.slice(1)}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          <span className={recurring.type === 'expense' ? 'text-red-600' : 'text-green-600'}>
                            {recurring.type === 'expense' ? '-' : '+'} ${recurring.amount !== undefined && recurring.amount !== null ? recurring.amount.toFixed(2) : '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;