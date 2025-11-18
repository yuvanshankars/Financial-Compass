import React, { useState, useEffect } from 'react';
import { getInvestments, addInvestment, updateInvestment, deleteInvestment } from '../services/investmentService';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [newInvestment, setNewInvestment] = useState({
    name: '',
    type: 'Fixed Deposit',
    amount: '',
    date: '',
    notes: ''
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const data = await getInvestments();
        setInvestments(data);
      } catch (error) {
        console.error('Error fetching investments:', error);
      }
    };
    fetchInvestments();
  }, []);

  const handleChange = (e) => {
    setNewInvestment({ ...newInvestment, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const addedInvestment = await addInvestment(newInvestment);
      setInvestments([addedInvestment, ...investments]);
      setNewInvestment({
        name: '',
        type: 'Fixed Deposit',
        amount: '',
        date: '',
        notes: ''
      });
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error adding investment:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    console.log('Updating investment:', editingInvestment);
    try {
      const updated = await updateInvestment(editingInvestment._id, editingInvestment);
      setInvestments(investments.map(inv => (inv._id === updated._id ? updated : inv)));
      setEditingInvestment(null);
    } catch (error) {
      console.error('Error updating investment:', error.response ? error.response.data : error.message);
    }
  };

  const handleDelete = async (id) => {
    console.log('Deleting investment with id:', id);
    try {
      await deleteInvestment(id);
      setInvestments(investments.filter(inv => inv._id !== id));
    } catch (error) {
      console.error('Error deleting investment:', error.response ? error.response.data : error.message);
    }
  };

  const startEditing = (investment) => {
    setEditingInvestment({ ...investment });
  };

  const cancelEditing = () => {
    setEditingInvestment(null);
  };

  const handleEditChange = (e) => {
    setEditingInvestment({ ...editingInvestment, [e.target.name]: e.target.value });
  };

  const investmentColors = [
    'bg-blue-200',
    'bg-green-200',
    'bg-yellow-200',
    'bg-purple-200',
    'bg-pink-200',
    'bg-indigo-200',
  ];

  const totalInvested = investments.reduce((acc, investment) => acc + investment.amount, 0);

  return (
    <div className="bg-[#ECEFF1] text-[#0B1F3A] min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#0B1F3A]">Investments</h1>
          <button onClick={() => setIsFormVisible(!isFormVisible)} className="bg-[#D4AF37] text-[#0B1F3A] px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-opacity-90 transition-colors">
            {isFormVisible ? 'Cancel' : '+ Add New Investment'}
          </button>
        </div>

        {isFormVisible && (
          <form onSubmit={handleSubmit} className="mb-6 p-6 bg-white rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" name="name" value={newInvestment.name} onChange={handleChange} placeholder="Name (e.g., SBI Fixed Deposit)" className="p-3 bg-white border border-[#CFD8DC] rounded-lg placeholder-[#607D8B] text-[#0B1F3A]" required />
              <select name="type" value={newInvestment.type} onChange={handleChange} className="p-3 bg-white border border-[#CFD8DC] rounded-lg text-[#0B1F3A]">
                <option>Fixed Deposit</option>
                <option>Mutual Fund (Lump Sum)</option>
                <option>Gold (One-Time)</option>
                <option>PPF / NPS</option>
                <option>Stocks (Lump Purchase)</option>
                <option>Others</option>
              </select>
              <input type="number" name="amount" value={newInvestment.amount} onChange={handleChange} placeholder="Amount" className="p-3 bg-white border border-[#CFD8DC] rounded-lg placeholder-[#607D8B] text-[#0B1F3A]" required />
              <input type="date" name="date" value={newInvestment.date} onChange={handleChange} className="p-3 bg-white border border-[#CFD8DC] rounded-lg text-[#0B1F3A]" required />
              <textarea name="notes" value={newInvestment.notes} onChange={handleChange} placeholder="Notes (Optional)" className="p-3 bg-white border border-[#CFD8DC] rounded-lg md:col-span-2 placeholder-[#607D8B] text-[#0B1F3A]"></textarea>
            </div>
            <button type="submit" className="mt-6 bg-[#D4AF37] text-[#0B1F3A] px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-opacity-90 transition-colors">Save Investment</button>
          </form>
        )}

        <div className="bg-white p-4 rounded-lg shadow-lg mb-6 text-xl font-bold text-[#0B1F3A]">Total Invested: ₹{totalInvested.toLocaleString()}</div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investments.map((investment, index) => (
            <div key={investment._id} className={`${investmentColors[index % investmentColors.length]} p-6 rounded-lg shadow-lg text-[#0B1F3A] transform hover:scale-105 transition-transform duration-300`}>
              {editingInvestment && editingInvestment._id === investment._id ? (
                <form onSubmit={handleUpdate}>
                  <input type="text" name="name" value={editingInvestment.name} onChange={handleEditChange} className="p-2 mb-2 w-full" />
                  <input type="number" name="amount" value={editingInvestment.amount} onChange={handleEditChange} className="p-2 mb-2 w-full" />
                  <input type="date" name="date" value={editingInvestment.date.split('T')[0]} onChange={handleEditChange} className="p-2 mb-2 w-full" />
                  <textarea name="notes" value={editingInvestment.notes} onChange={handleEditChange} className="p-2 mb-2 w-full"></textarea>
                  <button type="submit" className="bg-[#D4AF37] text-[#0B1F3A] px-4 py-2 rounded-lg mr-2">Save</button>
                  <button type="button" onClick={cancelEditing} className="bg-gray-500 text-white px-4 py-2 rounded-lg">Cancel</button>
                </form>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-[#0B1F3A]">{investment.name}</h2>
                  <p className="text-[#607D8B]">{investment.type}</p>
                  <p className="text-xl font-semibold text-[#0B1F3A] mt-2">₹{investment.amount.toLocaleString()}</p>
                  <p className="text-sm text-[#607D8B] mt-1">{new Date(investment.date).toLocaleDateString()}</p>
                  {investment.notes && <p className="mt-4 text-[#607D8B]">{investment.notes}</p>}
                  <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={() => startEditing(investment)} className="bg-[#D4AF37] text-[#0B1F3A] px-3 py-1 rounded-lg">Edit</button>
                    <button onClick={() => handleDelete(investment._id)} className="bg-red-600 text-white px-3 py-1 rounded-lg">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Investments;