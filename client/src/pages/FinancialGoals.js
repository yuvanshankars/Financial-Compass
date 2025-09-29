import React, { useState, useEffect, useCallback } from 'react';
import { getFinancialGoals, addFinancialGoal, updateFinancialGoal, deleteFinancialGoal } from '../services/financialGoalService';
import { toast } from 'react-hot-toast';

const FinancialGoals = () => {
  const [goals, setGoals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
  });

  const fetchGoals = useCallback(async () => {
    try {
      const res = await getFinancialGoals();
      setGoals(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch financial goals');
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await updateFinancialGoal(editingGoal._id, formData);
        toast.success('Financial goal updated successfully');
      } else {
        await addFinancialGoal(formData);
        toast.success('Financial goal added successfully');
      }
      fetchGoals();
      setIsModalOpen(false);
      setEditingGoal(null);
    } catch (error) {
      toast.error(`Failed to ${editingGoal ? 'update' : 'add'} financial goal`);
    }
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingGoal(null);
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
    });
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Financial Goals</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Financial Goal
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
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{editingGoal ? 'Edit' : 'Add'} Financial Goal</h3>
                  <div className="mt-2">
                    <input type="text" name="name" placeholder="Goal Name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded" />
                    <input type="number" name="targetAmount" placeholder="Target Amount" value={formData.targetAmount} onChange={handleInputChange} className="w-full p-2 border rounded mt-2" />
                    {editingGoal && <input type="number" name="currentAmount" placeholder="Current Amount" value={formData.currentAmount} onChange={handleInputChange} className="w-full p-2 border rounded mt-2" />}
                    <input type="date" name="targetDate" value={formData.targetDate} onChange={handleInputChange} className="w-full p-2 border rounded mt-2" />
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm">
                    Save
                  </button>
                  <button onClick={() => { setIsModalOpen(false); setEditingGoal(null); }} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map(goal => (
          <div key={goal._id} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold">{goal.name}</h2>
            <p>Target: ₹{goal.targetAmount}</p>
            <p>Saved: ₹{goal.currentAmount}</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}></div>
            </div>
            <p className="text-sm text-gray-500">Target Date: {new Date(goal.targetDate).toLocaleDateString()}</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => openEditModal(goal)}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteFinancialGoal(goal._id);
                    fetchGoals();
                    toast.success('Financial goal deleted successfully');
                  } catch (error) {
                    toast.error('Failed to delete financial goal');
                  }
                }}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialGoals;