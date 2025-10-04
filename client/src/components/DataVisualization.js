import React from 'react';
import FinancialHealthScore from './FinancialHealthScore';
import CashFlowAnalysis from './CashFlowAnalysis';


const DataVisualization = ({ monthlyTrend }) => {
  const totalIncome = monthlyTrend.reduce((sum, item) => sum + (item?.totalIncome || 0), 0);
  const totalExpenses = monthlyTrend.reduce((sum, item) => sum + (item?.totalExpense || 0), 0);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-[#0B1F3A] mb-6">Advanced Data Visualization</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialHealthScore income={totalIncome} expenses={totalExpenses} />
        <CashFlowAnalysis data={monthlyTrend} />
      </div>
    </div>
  );
};

export default DataVisualization;