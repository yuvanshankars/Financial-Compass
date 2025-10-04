import React, { useState, useEffect } from 'react';
import {
  getRecurringTransactions,
  addRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
} from '../services';
import { getCategories } from '../services/categoryService';
import { toast } from 'react-hot-toast';

const RecurringTransactions = () => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'Expense',
    category: '',
    frequency: 'Monthly',
    startDate: '',
    endDate: '',
    paymentMethod: 'UPI',
    notes: ''
  });

  useEffect(() => {
    fetchRecurringTransactions();
    fetchCategories();
  }, []);

  const fetchRecurringTransactions = async () => {
    try {
      const res = await getRecurringTransactions();
      setRecurringTransactions(res.data);
    } catch (error) {
      toast.error('Failed to fetch recurring transactions');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
      setFormData(prevState => ({ ...prevState, category: res.data[0]._id }));
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      handleUpdate();
      return;
    }
    try {
      await addRecurringTransaction(formData);
      fetchRecurringTransactions();
      setIsModalOpen(false);
      toast.success('Recurring transaction added successfully');
    } catch (error) {
      toast.error('Failed to add recurring transaction');
    }
  };

  const handleEdit = (transaction) => {
    setIsEditing(true);
    setCurrentTransactionId(transaction._id);
    setFormData({
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category?._id || '',
      frequency: transaction.frequency,
      startDate: new Date(transaction.startDate).toISOString().split('T')[0],
      endDate: new Date(transaction.endDate).toISOString().split('T')[0],
      paymentMethod: transaction.paymentMethod,
      notes: transaction.notes
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await updateRecurringTransaction(currentTransactionId, formData);
      fetchRecurringTransactions();
      setIsModalOpen(false);
      setIsEditing(false);
      toast.success('Recurring transaction updated successfully');
    } catch (error) {
      toast.error('Failed to update recurring transaction');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRecurringTransaction(id);
      fetchRecurringTransactions();
      toast.success('Recurring transaction deleted successfully');
    } catch (error) {
      toast.error('Failed to delete recurring transaction');
    }
  };

  const handleRecurring = (transaction) => {
    const today = new Date();
    const startDate = new Date(transaction.startDate);

    if (transaction.frequency === 'Monthly' && today.getDate() === startDate.getDate()) {
      addRecurringTransaction(transaction);
      toast.success('Recurring transaction processed successfully');
    } else {
      toast.error(`The due date is on the ${startDate.getDate()} of every month`);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentTransactionId(null);
    setFormData({
      title: '',
      amount: '',
      type: 'Expense',
      category: categories.length > 0 ? categories[0]._id : '',
      frequency: 'Monthly',
      startDate: '',
      endDate: '',
      paymentMethod: 'UPI',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentTransactionId(null);
    setFormData({
      title: '',
      amount: '',
      type: 'Expense',
      category: categories.length > 0 ? categories[0]._id : '',
      frequency: 'Monthly',
      startDate: '',
      endDate: '',
      paymentMethod: 'UPI',
      notes: ''
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Recurring Transactions</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Recurring Transaction
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{isEditing ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}</h3>
                  <div className="mt-2">
                    <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleInputChange} className="w-full p-2 border rounded" />
                    <input type="number" name="amount" placeholder="Amount" value={formData.amount} onChange={handleInputChange} className="w-full p-2 border rounded mt-2" />
                    <select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-2 border rounded mt-2">
                      <option value="Expense">Expense</option>
                      <option value="Income">Income</option>
                    </select>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2 border rounded mt-2">
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                      ))}
                    </select>
                    <select name="frequency" value={formData.frequency} onChange={handleInputChange} className="w-full p-2 border rounded mt-2">
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Every 2 Weeks">Every 2 Weeks</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full p-2 border rounded mt-2" />
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full p-2 border rounded mt-2" />
                    <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="w-full p-2 border rounded mt-2">
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                    <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleInputChange} className="w-full p-2 border rounded mt-2"></textarea>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm">
                    {isEditing ? 'Update' : 'Save'}
                  </button>
                  <button onClick={handleCancel} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Due Date</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recurringTransactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{transaction.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{transaction.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{transaction.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{transaction.category?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{transaction.frequency}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(transaction.startDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEdit(transaction)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                        <button onClick={() => handleDelete(transaction._id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                        <button onClick={() => handleRecurring(transaction)} className="text-green-600 hover:text-green-900 ml-4">Recurring</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringTransactions;