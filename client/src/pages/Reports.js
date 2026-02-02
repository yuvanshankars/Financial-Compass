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
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import DataVisualization from '../components/DataVisualization';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
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
  const [dailyTrend, setDailyTrend] = useState([]); // New daily trend state

  // Filter states
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const getExportData = () => {
    let data;
    let headers;

    if (activeTab === 'monthly') {
      headers = ['Month', 'Income', 'Expenses', 'Balance', 'Transactions'];
      data = monthlyTrend.map(item => ({
        Month: monthNames[(item?.month || 0) - 1],
        Income: item?.totalIncome || 0,
        Expenses: item?.totalExpense || 0,
        Balance: item?.balance || 0,
        Transactions: item?.transactionCount || 0,
      }));
    } else if (activeTab === 'daily') { // Daily export logic
      headers = ['Date', 'Income', 'Expenses', 'Balance', 'Transactions'];
      data = dailyTrend.map(item => ({
        Date: item.date,
        Income: item.totalIncome || 0,
        Expenses: item.totalExpense || 0,
        Balance: item.balance || 0,
        Transactions: item.transactionCount || 0
      }));
    } else if (activeTab === 'category') {
      headers = ['Category', 'Amount', 'Percentage'];
      data = categorySummary.map(item => ({
        Category: item.name,
        Amount: item.totalAmount,
        Percentage: item.percentage.toFixed(1) + '%',
      }));
    } else if (activeTab === 'yearly') {
      headers = ['Year', 'Month', 'Income', 'Expenses', 'Balance'];
      const currentYearRows = yearlyComparison.currentYear.map((item, index) => ({
        Year: selectedYear,
        Month: monthNames[index],
        Income: item?.totalIncome || 0,
        Expenses: item?.totalExpense || 0,
        Balance: item?.balance || 0,
        Transactions: item?.transactionCount || 0,
      }));
      const prevYearRows = yearlyComparison.prevYear.map((item, index) => ({
        Year: selectedYear - 1,
        Month: monthNames[index],
        Income: item?.totalIncome || 0,
        Expenses: item?.totalExpense || 0,
        Balance: item?.balance || 0,
        Transactions: item?.transactionCount || 0,
      }));
      data = [...currentYearRows, ...prevYearRows];
    } else if (activeTab === 'visualization') {
      headers = ['Metric', 'Value'];
      const totalIncome = monthlyTrend.reduce((sum, item) => sum + (item?.totalIncome || 0), 0);
      const totalExpenses = monthlyTrend.reduce((sum, item) => sum + (item?.totalExpense || 0), 0);
      const score = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

      data = [
        { Metric: 'Financial Health Score', Value: score.toFixed(2) + '%' },
        { Metric: 'Total Income', Value: totalIncome.toFixed(2) },
        { Metric: 'Total Expenses', Value: totalExpenses.toFixed(2) },
        ...monthlyTrend.map(item => ({
          Metric: `Cash Flow - ${monthNames[(item?.month || 0) - 1]}`,
          Value: item.balance.toFixed(2)
        }))
      ];
    }

    return { headers, data };
  };

  const downloadCSV = () => {
    const { headers, data } = getExportData();

    if (!data || data.length === 0) {
      alert('No data to download.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `report_${activeTab}_${selectedYear}.csv`);
  };

  const downloadExcel = () => {
    const { headers, data } = getExportData();

    if (!data || data.length === 0) {
      alert('No data to download.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

    const cols = headers.map(header => ({ wch: Math.max(header.length, ...data.map(row => String(row[header]).length)) + 2 }));
    worksheet['!cols'] = cols;

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

    saveAs(blob, `report_${activeTab}_${selectedYear}.xlsx`);
  };

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

  // Fetch daily trend data
  const fetchDailyTrend = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportService.getDailyTrend(selectedYear, selectedMonth);
      console.log('Daily trend response:', response);
      if (response && response.success) {
        setDailyTrend(response.data);
      } else {
        setDailyTrend([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching daily trend:', err);
      setDailyTrend([]);
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  // Fetch monthly trend data for the selected year
  const fetchMonthlyTrend = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await reportService.getMonthlyTrend(selectedYear);
      console.log('Monthly trend response:', response);

      // Handle different response structures
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

      // Handle different response structures
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
    } else if (activeTab === 'daily') { // Fetch daily
      fetchDailyTrend();
    }
  }, [activeTab, selectedYear, selectedMonth, fetchMonthlyTrend, fetchCategorySummary, fetchYearlyComparison, fetchDailyTrend]);

  // Monthly trend chart data with validation
  const monthlyTrendData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Income',
        data: Array.isArray(monthlyTrend) ? monthlyTrend.map(item => item?.totalIncome || 0) : Array(12).fill(0),
        borderColor: '#2ECC71',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        tension: 0.1,
        borderWidth: 2
      },
      {
        label: 'Expenses',
        data: Array.isArray(monthlyTrend) ? monthlyTrend.map(item => item?.totalExpense || 0) : Array(12).fill(0),
        borderColor: '#EB5757',
        backgroundColor: 'rgba(235, 87, 87, 0.1)',
        tension: 0.1,
        borderWidth: 2
      },
      {
        label: 'Balance',
        data: Array.isArray(monthlyTrend) ? monthlyTrend.map(item => item?.balance || 0) : Array(12).fill(0),
        borderColor: '#0B1F3A',
        backgroundColor: 'rgba(11, 31, 58, 0.1)',
        tension: 0.1,
        borderWidth: 2
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
          ? categorySummary.map(category => category.color || '#D4AF37')
          : ['#ECEFF1'],
        borderWidth: 1,
        borderColor: '#FFFFFF'
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
        backgroundColor: 'rgba(46, 204, 113, 0.7)'
      },
      {
        label: `Income ${selectedYear - 1}`,
        data: Array.isArray(yearlyComparison.prevYear)
          ? yearlyComparison.prevYear.map(item => item?.totalIncome || 0)
          : Array(12).fill(0),
        backgroundColor: 'rgba(46, 204, 113, 0.3)'
      },
      {
        label: `Expenses ${selectedYear}`,
        data: Array.isArray(yearlyComparison.currentYear)
          ? yearlyComparison.currentYear.map(item => item?.totalExpense || 0)
          : Array(12).fill(0),
        backgroundColor: 'rgba(235, 87, 87, 0.7)'
      },
      {
        label: `Expenses ${selectedYear - 1}`,
        data: Array.isArray(yearlyComparison.prevYear)
          ? yearlyComparison.prevYear.map(item => item?.totalExpense || 0)
          : Array(12).fill(0),
        backgroundColor: 'rgba(235, 87, 87, 0.3)'
      }
    ]
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter, sans-serif'
          }
        }
      },
      title: {
        display: true,
        text: `Monthly Financial Trend - ${selectedYear}`,
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: '600'
        },
        color: '#0B1F3A'
      },
      tooltip: {
        backgroundColor: '#0B1F3A',
        titleFont: {
          family: 'Inter, sans-serif'
        },
        bodyFont: {
          family: 'Inter, sans-serif'
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#607D8B'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#ECEFF1'
        },
        ticks: {
          color: '#607D8B'
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: 'Inter, sans-serif'
          },
          padding: 20
        }
      },
      title: {
        display: true,
        text: `Expense Categories - ${monthNames[selectedMonth - 1]} ${selectedYear}`,
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: '600'
        },
        color: '#0B1F3A'
      },
      tooltip: {
        backgroundColor: '#0B1F3A',
        titleFont: {
          family: 'Inter, sans-serif'
        },
        bodyFont: {
          family: 'Inter, sans-serif'
        }
      }
    },
    cutout: '70%'
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter, sans-serif'
          }
        }
      },
      title: {
        display: true,
        text: `Yearly Comparison - ${selectedYear} vs ${selectedYear - 1}`,
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: '600'
        },
        color: '#0B1F3A'
      },
      tooltip: {
        backgroundColor: '#0B1F3A',
        titleFont: {
          family: 'Inter, sans-serif'
        },
        bodyFont: {
          family: 'Inter, sans-serif'
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#607D8B'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#ECEFF1'
        },
        ticks: {
          color: '#607D8B'
        }
      }
    }
  };

  return (
    <div className="bg-[#ECEFF1] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0B1F3A]">Financial Analytics</h1>
            <p className="mt-2 text-[#0B1F3A]/80">
              Comprehensive financial reports and visualizations
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={downloadCSV}
              className="bg-[#D4AF37] text-[#0B1F3A] font-bold py-2 px-4 rounded-lg shadow-md hover:bg-[#CFD8DC] transition-colors"
            >
              Download CSV
            </button>
            <button
              onClick={downloadExcel}
              className="bg-[#D4AF37] text-[#0B1F3A] font-bold py-2 px-4 rounded-lg shadow-md hover:bg-[#CFD8DC] transition-colors"
            >
              Download Excel
            </button>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="bg-white rounded-xl shadow border border-[#CFD8DC] overflow-hidden mb-6">
          <div className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('monthly')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm ${activeTab === 'monthly' ? 'text-[#0B1F3A] border-b-2 border-[#D4AF37]' : 'text-[#607D8B] hover:text-[#0B1F3A]'}`}
            >
              Monthly Trends
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm ${activeTab === 'daily' ? 'text-[#0B1F3A] border-b-2 border-[#D4AF37]' : 'text-[#607D8B] hover:text-[#0B1F3A]'}`}
            >
              Day by Day
            </button>
            <button
              onClick={() => setActiveTab('category')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm ${activeTab === 'category' ? 'text-[#0B1F3A] border-b-2 border-[#D4AF37]' : 'text-[#607D8B] hover:text-[#0B1F3A]'}`}
            >
              Category Breakdown
            </button>
            <button
              onClick={() => setActiveTab('yearly')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm ${activeTab === 'yearly' ? 'text-[#0B1F3A] border-b-2 border-[#D4AF37]' : 'text-[#607D8B] hover:text-[#0B1F3A]'}`}
            >
              Yearly Comparison
            </button>
            <button
              onClick={() => setActiveTab('visualization')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm ${activeTab === 'visualization' ? 'text-[#0B1F3A] border-b-2 border-[#D4AF37]' : 'text-[#607D8B] hover:text-[#0B1F3A]'}`}
            >
              Data Visualization
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow border border-[#CFD8DC] p-6 mb-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="year" className="block text-sm font-medium text-[#0B1F3A] mb-2">
                Fiscal Year
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="block w-full px-4 py-2 border border-[#CFD8DC] rounded-lg shadow-sm focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37] sm:text-sm"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {activeTab === 'category' && (
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="month" className="block text-sm font-medium text-[#0B1F3A] mb-2">
                  Period
                </label>
                <select
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="block w-full px-4 py-2 border border-[#CFD8DC] rounded-lg shadow-sm focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37] sm:text-sm"
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
          <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow border border-[#CFD8DC]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow border border-[#CFD8DC] overflow-hidden">
            {activeTab === 'visualization' && <DataVisualization monthlyTrend={monthlyTrend} />}
            {/* Monthly Trend Chart */}
            {activeTab === 'monthly' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-[#0B1F3A] mb-6">Monthly Financial Performance</h2>
                <div className="h-[400px] mb-8">
                  <Line data={monthlyTrendData} options={lineChartOptions} />
                </div>

                {/* Summary Table */}
                <div className="overflow-x-auto">
                  {Array.isArray(monthlyTrend) && monthlyTrend.length > 0 ? (
                    <table className="min-w-full divide-y divide-[#ECEFF1]">
                      <thead className="bg-[#F5F7FA]">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#607D8B] uppercase tracking-wider">Month</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#607D8B] uppercase tracking-wider">Income</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#607D8B] uppercase tracking-wider">Expenses</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#607D8B] uppercase tracking-wider">Balance</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#607D8B] uppercase tracking-wider">Transactions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-[#ECEFF1]">
                        {monthlyTrend.map((item, index) => (
                          <tr key={index} className="hover:bg-[#ECEFF1]/30">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0B1F3A]">
                              {monthNames[(item?.month || index + 1) - 1]}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2ECC71]">
                              ₹{(item?.totalIncome || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#EB5757]">
                              ₹{(item?.totalExpense || 0).toFixed(2)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${(item?.balance || 0) >= 0 ? 'text-[#2ECC71]' : 'text-[#EB5757]'}`}>
                              ₹{(item?.balance || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#607D8B]">
                              {item?.transactionCount || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12 text-[#607D8B]">
                      No financial data available for {selectedYear}.
                    </div>
                  )}
                </div>
              </div>
            )}



            {/* Daily Trend Chart */}
            {activeTab === 'daily' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-[#0B1F3A] mb-6">Daily Financial Performance - {monthNames[selectedMonth - 1]} {selectedYear}</h2>
                <div className="h-[400px] mb-8">
                  <Line
                    data={{
                      labels: dailyTrend.map(item => item.day),
                      datasets: [
                        {
                          label: 'Income',
                          data: dailyTrend.map(item => item.totalIncome),
                          borderColor: '#2ECC71',
                          backgroundColor: 'rgba(46, 204, 113, 0.1)',
                          tension: 0.3,
                          borderWidth: 2
                        },
                        {
                          label: 'Expenses',
                          data: dailyTrend.map(item => item.totalExpense),
                          borderColor: '#EB5757',
                          backgroundColor: 'rgba(235, 87, 87, 0.1)',
                          tension: 0.3,
                          borderWidth: 2
                        },
                      ]
                    }}
                    options={{
                      ...lineChartOptions,
                      plugins: {
                        ...lineChartOptions.plugins,
                        title: {
                          ...lineChartOptions.plugins.title,
                          text: `Daily Trend - ${monthNames[selectedMonth - 1]} ${selectedYear}`
                        }
                      }
                    }}
                  />
                </div>

                {/* Daily Summary Table */}
                <div className="overflow-x-auto max-h-[500px]">
                  {Array.isArray(dailyTrend) && dailyTrend.length > 0 ? (
                    <table className="min-w-full divide-y divide-[#ECEFF1]">
                      <thead className="bg-[#F5F7FA] sticky top-0">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#607D8B] uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#607D8B] uppercase tracking-wider">Income</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#607D8B] uppercase tracking-wider">Expenses</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#607D8B] uppercase tracking-wider">Balance</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#607D8B] uppercase tracking-wider">Transactions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-[#ECEFF1]">
                        {dailyTrend.map((item, index) => (
                          <tr key={index} className="hover:bg-[#ECEFF1]/30">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0B1F3A]">
                              {item.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2ECC71]">
                              ₹{(item?.totalIncome || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#EB5757]">
                              ₹{(item?.totalExpense || 0).toFixed(2)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${(item?.balance || 0) >= 0 ? 'text-[#2ECC71]' : 'text-[#EB5757]'}`}>
                              ₹{(item?.balance || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#607D8B]">
                              {item?.transactionCount || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12 text-[#607D8B]">
                      No daily data available for {monthNames[selectedMonth - 1]} {selectedYear}.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Category Breakdown Chart */}
            {activeTab === 'category' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-[#0B1F3A] mb-6">Expense Allocation</h2>

                {categorySummary.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="h-[400px]">
                      <Doughnut data={categorySummaryData} options={pieChartOptions} />
                    </div>

                    <div className="overflow-y-auto max-h-[400px]">
                      <table className="min-w-full divide-y divide-[#ECEFF1]">
                        <thead className="bg-[#F5F7FA]">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#607D8B] uppercase tracking-wider">Category</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#607D8B] uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#607D8B] uppercase tracking-wider">Percentage</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#ECEFF1]">
                          {categorySummary.map((category, index) => (
                            <tr key={index} className="hover:bg-[#ECEFF1]/30">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: category.color || '#D4AF37' }}></div>
                                  <span className="text-sm font-medium text-[#0B1F3A]">{category.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0B1F3A]">₹{category.totalAmount.toFixed(2)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0B1F3A]">{category.percentage.toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#607D8B]">
                    No expense data available for {monthNames[selectedMonth - 1]} {selectedYear}.
                  </div>
                )}
              </div>
            )}

            {/* Yearly Comparison Chart */}
            {activeTab === 'yearly' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-[#0B1F3A] mb-6">Year-over-Year Analysis</h2>
                <div className="h-[400px] mb-8">
                  <Bar data={yearlyComparisonData} options={barChartOptions} />
                </div>

                {/* Summary Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#F5F7FA] rounded-lg p-6 border border-[#ECEFF1]">
                    <h3 className="text-lg font-medium text-[#0B1F3A] mb-4">{selectedYear} Summary</h3>
                    {yearlyComparison.currentYear && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-[#607D8B]">Total Income</p>
                          <p className="text-xl font-semibold text-[#2ECC71]">
                            ₹{yearlyComparison.currentYear.reduce((sum, item) => sum + (item?.totalIncome || 0), 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#607D8B]">Total Expenses</p>
                          <p className="text-xl font-semibold text-[#EB5757]">
                            ₹{yearlyComparison.currentYear.reduce((sum, item) => sum + (item?.totalExpense || 0), 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#607D8B]">Net Balance</p>
                          <p className={`text-xl font-semibold ${yearlyComparison.currentYear.reduce((sum, item) => sum + (item?.balance || 0), 0) >= 0 ? 'text-[#2ECC71]' : 'text-[#EB5757]'}`}>
                            ₹{yearlyComparison.currentYear.reduce((sum, item) => sum + (item?.balance || 0), 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#F5F7FA] rounded-lg p-6 border border-[#ECEFF1]">
                    <h3 className="text-lg font-medium text-[#0B1F3A] mb-4">{selectedYear - 1} Summary</h3>
                    {yearlyComparison.prevYear && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-[#607D8B]">Total Income</p>
                          <p className="text-xl font-semibold text-[#2ECC71]">
                            ₹{yearlyComparison.prevYear.reduce((sum, item) => sum + (item?.totalIncome || 0), 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#607D8B]">Total Expenses</p>
                          <p className="text-xl font-semibold text-[#EB5757]">
                            ₹{yearlyComparison.prevYear.reduce((sum, item) => sum + (item?.totalExpense || 0), 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#607D8B]">Net Balance</p>
                          <p className={`text-xl font-semibold ${yearlyComparison.prevYear.reduce((sum, item) => sum + (item?.balance || 0), 0) >= 0 ? 'text-[#2ECC71]' : 'text-[#EB5757]'}`}>
                            ₹{yearlyComparison.prevYear.reduce((sum, item) => sum + (item?.balance || 0), 0).toFixed(2)}
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
    </div>
  );
};

export default Reports;