import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinancialChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="income" stroke="#2ECC71" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="expense" stroke="#E74C3C" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default FinancialChart;