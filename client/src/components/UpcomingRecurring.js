import React from 'react';
import { format } from 'date-fns';
import { ClockIcon } from '@heroicons/react/24/outline';

const UpcomingRecurring = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="px-6 py-8 text-center text-sm text-[#607D8B]">
        No upcoming recurring transactions.
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#ECEFF1]">
      {transactions.map((transaction) => (
        <div key={transaction._id} className="px-6 py-4 hover:bg-[#ECEFF1]/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center bg-blue-100">
                <ClockIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-[#0B1F3A]">{transaction.description}</div>
                <div className="text-xs text-[#607D8B]">
                  Next due date: {format(new Date(transaction.nextDate), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
            <div className="text-base font-medium text-blue-600">
              ${transaction.amount?.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpcomingRecurring;