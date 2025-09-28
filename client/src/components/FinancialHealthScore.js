import React from 'react';
import GaugeChart from 'react-gauge-chart';

const FinancialHealthScore = ({ income, expenses }) => {
  const score = income > 0 ? (income - expenses) / income : 0;

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-[#CFD8DC]">
      <h3 className="text-lg font-medium text-[#0B1F3A] mb-4">Financial Health Score</h3>
      <GaugeChart
        id="gauge-chart"
        nrOfLevels={3}
        colors={['#EB5757', '#F2C94C', '#2ECC71']}
        arcWidth={0.3}
        percent={score}
        textColor="#0B1F3A"
        needleColor="#D4AF37"
        needleBaseColor="#0B1F3A"
        hideText={false}
      />
    </div>
  );
};

export default FinancialHealthScore;