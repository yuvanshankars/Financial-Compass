 import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { format, isToday } from 'date-fns';
import { Link } from 'react-router-dom';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,

  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import FinancialChart from '../components/FinancialChart';
import Calendar from 'react-calendar';
import '../Calendar.css';

const Dashboard = () => {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [categorySummary, setCategorySummary] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [upcomingRecurring, setUpcomingRecurring] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
    const [transactionsForSelectedDate, setTransactionsForSelectedDate] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [datesWithTransactions, setDatesWithTransactions] = useState(new Set());
  const [showTodaysSpendingList, setShowTodaysSpendingList] = useState(false);
  const [showSelectedDateTransactions, setShowSelectedDateTransactions] = useState(false);
  const [showAllTopSpending, setShowAllTopSpending] = useState(false);

  const handleDownload = () => {
    const formattedDate = format(calendarDate, 'yyyy-MM-dd');
    const reportData = transactionsForSelectedDate.map(t => ({
      Date: format(new Date(t.date), 'yyyy-MM-dd'),
      Description: t.description,
      Category: t.category.name,
      Amount: t.amount,
      Type: t.type,
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Transactions_${formattedDate}`);
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `Transactions_${formattedDate}.xlsx`);
  };


  const [viewedMonth, setViewedMonth] = useState(new Date().getMonth() + 1);
  const [viewedYear, setViewedYear] = useState(new Date().getFullYear());
  


  const { loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading) return; // Wait for auth to finish loading
      try {
        setLoading(true);
        const cacheBuster = `&_=${new Date().getTime()}`;
        
        const summaryResponse = await api.get(`/api/transactions/summary/monthly?year=${viewedYear}&month=${viewedMonth}${cacheBuster}`);
        setMonthlySummary(summaryResponse.data.data || null);
        
        const categoryResponse = await api.get(`/api/transactions/summary/category?year=${viewedYear}&month=${viewedMonth}${cacheBuster}`);
        setCategorySummary(categoryResponse.data.data || []);
        
        const transactionsResponse = await api.get(`/api/transactions?limit=5${cacheBuster}`);
        setRecentTransactions(transactionsResponse.data.data || []);
        
        const budgetResponse = await api.get(`/api/budgets/progress?year=${viewedYear}&month=${viewedMonth}${cacheBuster}`);
        const alerts = (budgetResponse.data.data || []).filter(budget => 
          (budget.percentage >= 80 && budget.percentage < 100) || budget.percentage > 100
        );
        setBudgetAlerts(alerts);
        
        const recurringResponse = await api.get(`/api/recurring-transactions?active=true&limit=3${cacheBuster}`);
        setUpcomingRecurring(recurringResponse.data.data || []);

        const performanceResponse = await api.get(`/api/transactions/summary/performance?year=${viewedYear}${cacheBuster}`);
        setPerformanceData(performanceResponse.data.data || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [viewedMonth, viewedYear, authLoading]);

  const handlePrevMonth = () => {
    setViewedMonth(prevMonth => {
      if (prevMonth === 1) {
        setViewedYear(prevYear => prevYear - 1);
        return 12;
      }
      return prevMonth - 1;
    });
  };

  const handleNextMonth = () => {
    setViewedMonth(prevMonth => {
      if (prevMonth === 12) {
        setViewedYear(prevYear => prevYear + 1);
        return 1;
      }
      return prevMonth + 1;
    });
  };

  useEffect(() => {
    const fetchAllTransactions = async () => {
      try {
        const response = await api.get('/api/transactions');
        const transactions = response.data.data || [];
        setAllTransactions(transactions);
        const dates = new Set(transactions.map(t => format(new Date(t.date), 'yyyy-MM-dd')));
        setDatesWithTransactions(dates);
      } catch (err) {
        console.error('Error fetching all transactions:', err);
      }
    };
    fetchAllTransactions();
  }, []);

  useEffect(() => {
    if (calendarDate) {
      const formattedDate = format(calendarDate, 'yyyy-MM-dd');
      const filtered = allTransactions.filter(transaction => {
        return format(new Date(transaction.date), 'yyyy-MM-dd') === formattedDate;
      });
      setTransactionsForSelectedDate(filtered);
    }
  }, [calendarDate, allTransactions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#ECEFF1] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#0B1F3A]">Financial Dashboard</h1>
            <div className="flex items-center mt-2">
              <button onClick={handlePrevMonth} className="p-1 rounded-md bg-gray-200 hover:bg-gray-300">
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <h2 className="text-xl font-semibold mx-4">{format(new Date(viewedYear, viewedMonth - 1), 'MMMM yyyy')}</h2>
              <button onClick={handleNextMonth} className="p-1 rounded-md bg-gray-200 hover:bg-gray-300">
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
          
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Income Card */}
          <div className="bg-white rounded-xl shadow border border-[#CFD8DC] overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#607D8B] uppercase tracking-wider">Income</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#0B1F3A]">
                    ₹{monthlySummary?.totalIncome?.toFixed(2) || '0.00'}
                  </h2>
                </div>
                <div className="bg-[#2ECC71]/10 p-3 rounded-lg">
                  <ArrowUpIcon className="h-6 w-6 text-[#2ECC71]" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-[#2ECC71]">
                
              </div>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="bg-white rounded-xl shadow border border-[#CFD8DC] overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#607D8B] uppercase tracking-wider">Expenses</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#0B1F3A]">
                    ₹{monthlySummary?.totalExpense?.toFixed(2) || '0.00'}
                  </h2>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <ArrowDownIcon className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-red-600">
                
              </div>
            </div>
          </div>

          {/* Net Worth Card */}
          <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1A3A6A] rounded-xl shadow overflow-hidden text-white">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white/90 uppercase tracking-wider">Net Worth</p>
                  <h2 className={`mt-1 text-2xl font-bold ${monthlySummary?.balance >= 0 ? 'text-white' : 'text-red-300'}`}>
                    ₹{monthlySummary?.balance?.toFixed(2) || '0.00'}
                  </h2>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Overview */}
            <div className="bg-white rounded-xl shadow border border-[#CFD8DC] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#ECEFF1] flex justify-between items-center">
                <h3 className="text-lg font-semibold text-[#0B1F3A]">Financial Overview</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-[#ECEFF1] rounded-lg text-[#0B1F3A]">Year</button>
                </div>
              </div>
              <div className="p-6">
                <FinancialChart data={performanceData} />
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow border border-[#CFD8DC] overflow-hidden">
              <div className="px-6 py-5 flex justify-between items-center border-b border-[#ECEFF1]">
                <h3 className="text-lg font-semibold text-[#0B1F3A]">Recent Transactions</h3>
                <Link 
                  to="/transactions" 
                  className="text-sm font-medium text-[#0B1F3A] hover:text-[#D4AF37] transition-colors"
                >
                  View all
                </Link>
              </div>
              <div className="divide-y divide-[#ECEFF1]">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div key={transaction._id} className="px-6 py-4 hover:bg-[#ECEFF1]/30 transition-colors">
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
                        <div className={`text-base font-medium ${transaction.type === 'expense' ? 'text-red-600' : 'text-[#2ECC71]'}`}>
                          {transaction.type === 'expense' ? '-' : '+'}₹{transaction.amount?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-sm text-[#607D8B]">
                    No recent transactions found.
                  </div>
                )}
                <div className="px-6 py-4 flex justify-center bg-[#ECEFF1]/30">
                  <Link
                    to="/transactions/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] transition-colors"
                  >
                    <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                    Add Transaction
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Calendar */}
            <div className="bg-white rounded-xl shadow border border-[#CFD8DC] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#ECEFF1]">
                <h3 className="text-lg font-semibold text-[#0B1F3A]">Calendar</h3>
              </div>
              <div className="p-6">
                <Calendar
                  onChange={setCalendarDate}
                  value={calendarDate}
                  className="w-full border-none"
                  tileContent={({ date, view }) => {
                    if (view === 'month') {
                      const formattedDate = format(date, 'yyyy-MM-dd');
                      if (datesWithTransactions.has(formattedDate)) {
                        return <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mx-auto"></div>;
                      }
                    }
                    return null;
                  }}
                />
              </div>
              {transactionsForSelectedDate.length > 0 && (
                <div className="p-6 border-t border-[#ECEFF1]">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-semibold text-[#0B1F3A]">
                      Transactions for {format(calendarDate, 'MMMM d, yyyy')}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleDownload}
                        className="px-3 py-1 text-xs font-medium text-white bg-[#0B1F3A] rounded-lg hover:bg-[#D4AF37] transition-colors"
                      >
                        Download Report
                      </button>
                      <button
                        onClick={() => setShowSelectedDateTransactions(!showSelectedDateTransactions)}
                        className="px-3 py-1 text-xs font-medium text-white bg-[#0B1F3A] rounded-lg hover:bg-[#D4AF37] transition-colors"
                      >
                        {showSelectedDateTransactions ? "Show Less" : "See More"}
                      </button>
                    </div>
                  </div>
                  {showSelectedDateTransactions && (
                    <div className="space-y-4">
                      {transactionsForSelectedDate.map((transaction) => (
                        <div key={transaction._id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[#0B1F3A]">{transaction.description}</p>
                            <p className="text-sm text-[#607D8B]">{transaction.category.name}</p>
                          </div>
                          <p className={`font-semibold ${transaction.type === 'income' ? 'text-[#2ECC71]' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Today's Spending */}
            <div className="bg-white rounded-xl shadow border border-[#CFD8DC] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#ECEFF1] flex justify-between items-center">
                <h3 className="text-lg font-semibold text-[#0B1F3A]">Today's Spending</h3>
                <button
                  onClick={() => setShowTodaysSpendingList(!showTodaysSpendingList)}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0B1F3A] rounded-lg hover:bg-[#D4AF37] transition-colors"
                >
                  {showTodaysSpendingList ? "Show Less" : "See More"}
                </button>
              </div>
              {showTodaysSpendingList && (
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {allTransactions
                      .filter(t => isToday(new Date(t.date)) && t.type === 'expense')
                      .map(transaction => (
                        <div key={transaction._id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[#0B1F3A]">{transaction.description}</p>
                            <p className="text-sm text-[#607D8B]">{transaction.category.name}</p>
                          </div>
                          <p className="font-semibold text-red-600">-₹{transaction.amount.toFixed(2)}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Budget Alerts */}
            {budgetAlerts.length > 0 && (
              <div className="bg-white rounded-xl shadow border border-[#CFD8DC] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#ECEFF1]">
                  <h3 className="text-lg font-semibold text-[#0B1F3A]">Budget Alerts</h3>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-5">
                    {budgetAlerts.map((budget) => (
                      <div key={budget._id} className="relative">
                        <div className="flex justify-between mb-1">
                          <div>
                            <span className="text-sm font-medium text-[#0B1F3A]">{budget.category.name}</span>
                          </div>
                          <div>
                            <span className={`text-sm font-medium ${budget.percentage > 100 ? 'text-red-600' : 'text-[#D4AF37]'}`}>
                              ₹{budget.spent?.toFixed(2) || '0.00'} / ₹{budget.amount?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-[#ECEFF1]">
                          <div 
                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${budget.percentage > 100 ? 'bg-red-500' : 'bg-[#D4AF37]'}`}
                          ></div>
                        </div>
                        <div className="mt-1 text-xs text-[#607D8B] flex justify-between">
                          <span>{budget.percentage?.toFixed(0) || '0'}% spent</span>
                          {budget.percentage > 100 && (
                            <span className="text-red-600">Exceeded by ₹{(budget.spent - budget.amount).toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 text-center">
                    <Link
                      to="/budgets"
                      className="text-sm font-medium text-[#0B1F3A] hover:text-[#D4AF37] transition-colors"
                    >
                      Manage Budgets
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Top Spending Categories */}
            <div className="bg-white rounded-xl shadow border border-[#CFD8DC] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#ECEFF1] flex justify-between items-center">
                <h3 className="text-lg font-semibold text-[#0B1F3A]">Top Spending Categories</h3>
                <button
                  onClick={() => setShowAllTopSpending(!showAllTopSpending)}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0B1F3A] rounded-lg hover:bg-[#D4AF37] transition-colors"
                >
                  {showAllTopSpending ? "Show Less" : "See More"}
                </button>
              </div>
              <div className="px-6 py-4">
                {categorySummary.length > 0 ? (
                  <div className="space-y-5">
                    {(showAllTopSpending ? categorySummary : categorySummary.slice(0, 2)).map((category) => (
                      <div key={category._id} className="relative">
                        <div className="flex justify-between mb-1">
                          <div>
                            <span className="text-sm font-medium text-[#0B1F3A]">{category.name}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-[#0B1F3A]">
                              ₹{category.totalAmount?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-[#ECEFF1]">
                          <div 
                            style={{ width: `${category.percentage}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#0B1F3A]"
                          ></div>
                        </div>
                        <div className="mt-1 text-xs text-[#607D8B]">
                          {category.percentage?.toFixed(1) || '0'}% of total expenses
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-sm text-[#607D8B] py-6">
                    No spending data available for this month.
                  </div>
                )}
                <div className="mt-5 text-center">
                  <Link
                    to="/reports"
                    className="text-sm font-medium text-[#0B1F3A] hover:text-[#D4AF37] transition-colors"
                  >
                    View Detailed Reports
                  </Link>
                </div>
              </div>
            </div>

            {/* Upcoming Recurring Transactions */}
            {upcomingRecurring.length > 0 && (
              <div className="bg-white rounded-xl shadow border border-[#CFD8DC] overflow-hidden">
                <div className="px-6 py-5 flex justify-between items-center border-b border-[#ECEFF1]">
                  <h3 className="text-lg font-semibold text-[#0B1F3A]">Upcoming Recurring</h3>
                  <Link 
                    to="/recurring" 
                    className="text-sm font-medium text-[#0B1F3A] hover:text-[#D4AF37] transition-colors"
                  >
                    View all
                  </Link>
                </div>
                <div className="divide-y divide-[#ECEFF1]">
                  {upcomingRecurring.map((recurring) => (
                    <div key={recurring._id} className="px-6 py-4 hover:bg-[#ECEFF1]/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${recurring.type === 'expense' ? 'bg-red-100' : 'bg-[#2ECC71]/10'}`}>
                            <ArrowPathIcon className={`h-5 w-5 ${recurring.type === 'expense' ? 'text-red-600' : 'text-[#2ECC71]'}`} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[#0B1F3A]">{recurring.description}</div>
                            <div className="text-xs text-[#607D8B] flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {recurring.frequency.charAt(0).toUpperCase() + recurring.frequency.slice(1)}
                            </div>
                          </div>
                        </div>
                        <div className="text-base font-medium">
                          <span className={recurring.type === 'expense' ? 'text-red-600' : 'text-[#2ECC71]'}>
                            {recurring.type === 'expense' ? '-' : '+'}${recurring.amount?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;