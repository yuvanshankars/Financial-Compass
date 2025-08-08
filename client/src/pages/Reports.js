import React, { useState, useEffect, useCallback } from 'react';
import { reportService } from '../services';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const Reports = () => {
  const [activeTab, setActiveTab] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [yearlyComparison, setYearlyComparison] = useState([]);
  
  // Filter states
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  // Years for filter dropdown (current year and 2 previous years)
  const years = [
    selectedYear,
    selectedYear - 1,
    selectedYear - 2
  ];
  
  // Month names for labels
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch monthly trend data for the selected year
  const fetchMonthlyTrend = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reportService.getMonthlyTrend(selectedYear);
      console.log('Monthly trend response:', response);
      
      // Handle different response structures - be more flexible
      let monthlyData = [];
      if (response && response.success && response.data && response.data.monthlyData) {
        monthlyData = response.data.monthlyData;
      } else if (response && response.data && Array.isArray(response.data)) {
        monthlyData = response.data;
      } else if (response && Array.isArray(response.monthlyData)) {
        monthlyData = response.monthlyData;
      } else if (response && Array.isArray(response)) {
        monthlyData = response;
      }
      
      console.log('Processed monthly data:', monthlyData);
      setMonthlyTrend(monthlyData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching monthly trend:', err);
      console.error('Error details:', err.response?.data || err.message);
      
      // Set empty data instead of error to allow page to render
      setMonthlyTrend([]);
      setError(null);
      setLoading(false);
    }
  }, [selectedYear]);

  // Fetch category summary for the selected month and year
  const fetchCategorySummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reportService.getCategorySummary(selectedYear, selectedMonth);
      console.log('Category summary response:', response);
      
      // Handle different response structures - be more flexible
      let categories = [];
      if (response && response.success && response.data) {
        categories = response.data.categories || response.data || [];
      } else if (response && response.categories) {
        categories = response.categories;
      } else if (response && Array.isArray(response)) {
        categories = response;
      }
      
      // Add percentage calculation for pie chart
      if (categories && categories.length > 0) {
        const total = categories.reduce((sum, category) => sum + (category.totalAmount || category.total || 0), 0);
        const categoriesWithPercentage = categories.map(category => ({
          ...category,
          totalAmount: category.totalAmount || category.total || 0,
          percentage: total > 0 ? ((category.totalAmount || category.total || 0) / total) * 100 : 0
        }));
        setCategorySummary(categoriesWithPercentage);
      } else {
        setCategorySummary([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching category summary:', err);
      // Set empty data instead of error to allow page to render
      setCategorySummary([]);
      setError(null);
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  // Fetch yearly comparison data
  const fetchYearlyComparison = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data for current year and previous year
      const currentYearData = await reportService.getMonthlyTrend(selectedYear);
      const prevYearData = await reportService.getMonthlyTrend(selectedYear - 1);
      
      console.log('Yearly comparison - current year:', currentYearData);
      console.log('Yearly comparison - previous year:', prevYearData);
      
      // Handle different response structures
      const currentYearMonthlyData = currentYearData.data?.monthlyData || currentYearData.monthlyData || [];
      const prevYearMonthlyData = prevYearData.data?.monthlyData || prevYearData.monthlyData || [];
      
      setYearlyComparison({
        currentYear: currentYearMonthlyData,
        prevYear: prevYearMonthlyData
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching yearly comparison:', err);
      setError('Failed to load yearly comparison data. Please check your connection and try again.');
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    // Load data based on active tab
    if (activeTab === 'monthly') {
      fetchMonthlyTrend();
    } else if (activeTab === 'category') {
      fetchCategorySummary();
    } else if (activeTab === 'yearly') {
      fetchYearlyComparison();
    }
  }, [activeTab, selectedYear, selectedMonth, fetchMonthlyTrend, fetchCategorySummary, fetchYearlyComparison]);

  // Monthly trend chart data with validation
  const monthlyTrendData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Income',
        data: Array.isArray(monthlyTrend) ? monthlyTrend.map(item => item?.totalIncome || 0) : Array(12).fill(0),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.1
      },
      {
        label: 'Expenses',
        data: Array.isArray(monthlyTrend) ? monthlyTrend.map(item => item?.totalExpense || 0) : Array(12).fill(0),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.1
      },
      {
        label: 'Balance',
        data: Array.isArray(monthlyTrend) ? monthlyTrend.map(item => item?.balance || 0) : Array(12).fill(0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1
      }
    ]
  };

  // Category summary chart data with validation
  const categorySummaryData = {
    labels: Array.isArray(categorySummary) && categorySummary.length > 0 
      ? categorySummary.map(category => category.name || 'Unknown Category')
      : ['No Data'],
    datasets: [
      {
        data: Array.isArray(categorySummary) && categorySummary.length > 0
          ? categorySummary.map(category => category.totalAmount || 0)
          : [0],
        backgroundColor: Array.isArray(categorySummary) && categorySummary.length > 0
          ? categorySummary.map(category => category.color || '#' + Math.floor(Math.random()*16777215).toString(16))
          : ['#e5e7eb'],
        borderWidth: 1
      }
    ]
  };

  // Yearly comparison chart data with validation
  const yearlyComparisonData = {
    labels: monthNames,
    datasets: [
      {
        label: `Income ${selectedYear}`,
        data: Array.isArray(yearlyComparison.currentYear) 
          ? yearlyComparison.currentYear.map(item => item?.totalIncome || 0)
          : Array(12).fill(0),
        backgroundColor: 'rgba(34, 197, 94, 0.7)'
      },
      {
        label: `Income ${selectedYear - 1}`,
        data: Array.isArray(yearlyComparison.prevYear)
          ? yearlyComparison.prevYear.map(item => item?.totalIncome || 0)
          : Array(12).fill(0),
        backgroundColor: 'rgba(34, 197, 94, 0.3)'
      },
      {
        label: `Expenses ${selectedYear}`,
        data: Array.isArray(yearlyComparison.currentYear)
          ? yearlyComparison.currentYear.map(item => item?.totalExpense || 0)
          : Array(12).fill(0),
        backgroundColor: 'rgba(239, 68, 68, 0.7)'
      },
      {
        label: `Expenses ${selectedYear - 1}`,
        data: Array.isArray(yearlyComparison.prevYear)
          ? yearlyComparison.prevYear.map(item => item?.totalExpense || 0)
          : Array(12).fill(0),
        backgroundColor: 'rgba(239, 68, 68, 0.3)'
      }
    ]
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Monthly Financial Trend - ${selectedYear}`
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: `Expense Categories - ${monthNames[selectedMonth - 1]} ${selectedYear}`
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Yearly Comparison - ${selectedYear} vs ${selectedYear - 1}`
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Financial Reports</h1>
      
      {/* Report Type Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('monthly')}
            className={`${activeTab === 'monthly' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Monthly Trends
          </button>
          <button
            onClick={() => setActiveTab('category')}
            className={`${activeTab === 'category' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Category Breakdown
          </button>
          <button
            onClick={() => setActiveTab('yearly')}
            className={`${activeTab === 'yearly' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Yearly Comparison
          </button>
        </nav>
      </div>
      
      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          {activeTab === 'category' && (
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          {/* Monthly Trend Chart */}
          {activeTab === 'monthly' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Financial Trend</h2>
              <div className="h-96">
                <Line data={monthlyTrendData} options={lineChartOptions} />
              </div>
              
              {/* Summary Table */}
              <div className="mt-8 overflow-x-auto">
                {Array.isArray(monthlyTrend) && monthlyTrend.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {monthlyTrend.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {monthNames[(item?.month || index + 1) - 1]}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            ${(item?.totalIncome || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            ${(item?.totalExpense || 0).toFixed(2)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${(item?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${(item?.balance || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item?.transactionCount || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No financial data available for {selectedYear}.
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Category Breakdown Chart */}
          {activeTab === 'category' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Expense Categories</h2>
              
              {categorySummary.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="h-96">
                    <Doughnut data={categorySummaryData} options={pieChartOptions} />
                  </div>
                  
                  <div className="overflow-y-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {categorySummary.map((category, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color || '#ccc' }}></div>
                                <span className="ml-2 text-sm font-medium text-gray-900">{category.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${category.totalAmount.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.percentage.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No expense data available for {monthNames[selectedMonth - 1]} {selectedYear}.
                </div>
              )}
            </div>
          )}
          
          {/* Yearly Comparison Chart */}
          {activeTab === 'yearly' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Yearly Comparison</h2>
              <div className="h-96">
                <Bar data={yearlyComparisonData} options={barChartOptions} />
              </div>
              
              {/* Summary Comparison */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedYear} Summary</h3>
                  {yearlyComparison.currentYear && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Income</p>
                        <p className="text-xl font-semibold text-green-600">
                          ${yearlyComparison.currentYear.reduce((sum, item) => sum + item.totalIncome, 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Expenses</p>
                        <p className="text-xl font-semibold text-red-600">
                          ${yearlyComparison.currentYear.reduce((sum, item) => sum + item.totalExpense, 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Net Balance</p>
                        <p className={`text-xl font-semibold ${yearlyComparison.currentYear.reduce((sum, item) => sum + item.balance, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${yearlyComparison.currentYear.reduce((sum, item) => sum + item.balance, 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedYear - 1} Summary</h3>
                  {yearlyComparison.prevYear && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Income</p>
                        <p className="text-xl font-semibold text-green-600">
                          ${yearlyComparison.prevYear.reduce((sum, item) => sum + item.totalIncome, 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Expenses</p>
                        <p className="text-xl font-semibold text-red-600">
                          ${yearlyComparison.prevYear.reduce((sum, item) => sum + item.totalExpense, 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Net Balance</p>
                        <p className={`text-xl font-semibold ${yearlyComparison.prevYear.reduce((sum, item) => sum + item.balance, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${yearlyComparison.prevYear.reduce((sum, item) => sum + item.balance, 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;