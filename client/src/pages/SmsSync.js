import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button, FormInput, LoadingSpinner } from '../components/ui';
import { parseSms } from '../utils/smsParser';
import api from '../services/api';
import { createNotification } from '../services/notificationService';


const SmsSync = () => {
  const [smsText, setSmsText] = useState('');
  const [parsedTransactions, setParsedTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); 
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        setCategories(response.data.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleParseSms = () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      console.log("Parsing SMS text:", smsText);
      const parsed = parseSms(smsText);
      console.log("Parsed transactions:", parsed);
      const uncategorizedCategory = categories.find(c => c.name === 'Uncategorized');
      const defaultCategoryId = uncategorizedCategory ? uncategorizedCategory._id : (categories.length > 0 ? categories[0]._id : '');

      setParsedTransactions(parsed.map(t => ({
        ...t,
        selected: true,
        category: t.category ? t.category : defaultCategoryId
      })));
    } catch (err) {
      setError('Error parsing SMS messages. Please check the format and try again.');
      console.error('Error parsing SMS:', err);
    }
    setLoading(false);
  };

  const handleSaveTransactions = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const transactionsToSave = parsedTransactions
        .filter(t => t.selected)
        .map(t => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, selected, ...rest } = t;
          return rest;
        });

      if (transactionsToSave.some(t => !t.category)) {
        setError('Please select a category for all transactions you want to save.');
        setLoading(false);
        return;
      }

      await api.post('/api/sms/save', { transactions: transactionsToSave });

      // Create notifications for saved transactions
      for (const transaction of transactionsToSave) {
        await createNotification({
          title: `New ${transaction.type}`,
          message: `A new transaction of ${transaction.amount} has been added.`,
          type: transaction.type,
        });
      }

      setSuccessMessage('Transactions saved successfully!');
      setParsedTransactions([]);
      setSmsText('');
      setTimeout(() => setSuccessMessage(null), 5000); 
    } catch (err) {
      setError('Error saving transactions. Please try again.');
      console.error('Error saving transactions:', err.response ? err.response.data : err.message);
    }
    setLoading(false);
  };

  const handleTransactionChange = (index, field, value) => {
    const updatedTransactions = [...parsedTransactions];
    updatedTransactions[index][field] = value;
    setParsedTransactions(updatedTransactions);
  };

  const handleSelectTransaction = (index, selected) => {
    const updatedTransactions = [...parsedTransactions];
    updatedTransactions[index].selected = selected;
    setParsedTransactions(updatedTransactions);
  };

  const handleSelectAll = (selected) => {
    const updatedTransactions = parsedTransactions.map(t => ({ ...t, selected }));
    setParsedTransactions(updatedTransactions);
  };

  return (
    <div className="container mx-auto p-6 bg-[#ECEFF1] text-gray-800 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-[#0B1F3A] border-b-2 border-gray-300 pb-2">Add from SMS</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-[#0B1F3A]">Paste SMS Messages</h2>
          <textarea
            className="w-full p-4 border border-gray-300 bg-gray-50 rounded-lg focus:ring-2 focus:ring-[#D4AF37] transition duration-200 text-gray-800"
            rows="12"
            placeholder="Paste your bank or UPI SMS messages here. Each message should be on a new line."
            value={smsText}
            onChange={(e) => setSmsText(e.target.value)}
          ></textarea>
          <Button
            onClick={handleParseSms}
            className="mt-6 w-full py-3 text-lg font-semibold bg-[#0B1F3A] hover:bg-opacity-90 transition-all duration-300 ease-in-out transform hover:scale-105 text-white rounded-lg shadow-lg"
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : 'Parse SMS'}
          </Button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-[#0B1F3A]">Parsed Transactions</h2>
          {error && <p className="text-red-600 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
          {successMessage && <p className="text-green-600 bg-green-100 p-3 rounded-lg mb-4">{successMessage}</p>}

          {parsedTransactions.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  <Button onClick={() => handleSelectAll(true)} className="px-4 py-2 text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors duration-200">Select All</Button>
                  <Button onClick={() => handleSelectAll(false)} className="px-4 py-2 text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors duration-200">Deselect All</Button>
                </div>
                <Button
                  onClick={handleSaveTransactions}
                  className="px-6 py-2 text-base font-semibold bg-[#0B1F3A] hover:bg-opacity-90 transition-all duration-300 ease-in-out transform hover:scale-105 text-white rounded-lg shadow-lg"
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner /> : 'Save Selected'}
                </Button>
              </div>
              <div className="space-y-4">
                {parsedTransactions.map((transaction, index) => (
                  <div key={index} className={`p-4 rounded-xl transition duration-200 ${transaction.selected ? 'bg-gray-100 shadow-md' : 'bg-white'}`}>
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-1 flex items-center">
                        <input
                          type="checkbox"
                          checked={transaction.selected || false}
                          onChange={(e) => handleSelectTransaction(index, e.target.checked)}
                          className="bg-gray-200 border-gray-300 h-5 w-5 rounded text-[#0B1F3A] focus:ring-[#D4AF37]"
                        />
                      </div>
                      <div className="col-span-11 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormInput
                          type="date"
                          value={format(new Date(transaction.date), 'yyyy-MM-dd')}
                          onChange={(e) => handleTransactionChange(index, 'date', e.target.value)}
                          className="w-full bg-gray-50 border-gray-300 text-gray-800 p-2 rounded-md focus:ring-2 focus:ring-[#D4AF37] transition-shadow"
                        />
                        <FormInput
                          value={transaction.description}
                          onChange={(e) => handleTransactionChange(index, 'description', e.target.value)}
                          className="w-full bg-gray-50 border-gray-300 text-gray-800 p-2 rounded-md md:col-span-2 focus:ring-2 focus:ring-[#D4AF37] transition-shadow"
                          placeholder="Description"
                        />
                        <FormInput
                          type="number"
                          value={transaction.amount}
                          onChange={(e) => handleTransactionChange(index, 'amount', parseFloat(e.target.value))}
                          className="w-full bg-gray-50 border-gray-300 text-gray-800 p-2 rounded-md focus:ring-2 focus:ring-[#D4AF37] transition-shadow"
                          placeholder="Amount"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-12 gap-4 mt-3">
                        <div className="col-start-2 col-span-11 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                value={transaction.type}
                                onChange={(e) => handleTransactionChange(index, 'type', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:ring-2 focus:ring-[#D4AF37] transition-shadow"
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                            <select
                                value={transaction.category}
                                onChange={(e) => handleTransactionChange(index, 'category', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:ring-2 focus:ring-[#D4AF37] transition-shadow"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No transactions parsed yet.</p>
              <p>Paste your SMS messages on the left and click "Parse SMS" to see the results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmsSync;