import React from 'react';
import Chart from 'react-apexcharts';

const ExpenseDistributionTreemap = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-[#0B1F3A] mb-4">Expense Distribution</h2>
        <div className="flex justify-center items-center h-[400px]">
          <p className="text-gray-500">No data to display.</p>
        </div>
      </div>
    );
  }

  const series = [
    {
      data: data.map(item => ({ x: item.name, y: item.totalAmount })),
    },
  ];

  const options = {
    chart: {
      type: 'treemap',
    },
    title: {
      text: 'Expense Distribution',
      align: 'center',
      style: {
        fontSize: '16px',
        fontWeight: '600',
      },
    },
    colors: [
      '#3B93A5',
      '#F7B844',
      '#ADD8C7',
      '#EC3C65',
      '#CDD7B6',
      '#C1F666',
      '#D43F97',
      '#1E5D8C',
      '#421243',
      '#7F94B0',
      '#EF6537',
      '#C0ADDB',
    ],
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: false,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold text-[#0B1F3A] mb-4">Expense Distribution</h2>
      <Chart options={options} series={series} type="treemap" height={400} />
    </div>
  );
};

export default ExpenseDistributionTreemap;