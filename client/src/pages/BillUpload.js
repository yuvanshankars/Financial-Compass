
import React, { useState } from 'react';
import { createTransaction, scanBill } from '../services';
import { Button, FormInput, LoadingSpinner } from '../components/ui';

const BillUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedDetails, setExtractedDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: '',
    category: '',
  });

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleScanBill = async () => {
    if (!selectedFile) {
      setError('Please select a bill image to scan.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('bill', selectedFile);

      const data = await scanBill(formData);
      setExtractedDetails(data);
      setFormData(data);
    } catch (err) {
      console.error('Error scanning bill:', err.response ? err.response.data : err.message);
      setError('Failed to scan the bill. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async (event) => {
    event.preventDefault();
    try {
      await createTransaction(formData);
      setSuccess('Transaction added successfully!');
      setExtractedDetails(null);
      setFormData({
        description: '',
        amount: '',
        date: '',
        category: '',
      });
    } catch (err) {
      setError('Failed to add the transaction. Please try again.');
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Scan Your Bill</h1>
      <div className="mb-4">
        <FormInput
          type="file"
          label="Upload Bill Image"
          onChange={handleFileChange}
          accept="image/*"
        />
      </div>
      <Button onClick={handleScanBill} disabled={isLoading}>
        {isLoading ? <LoadingSpinner /> : 'Scan Bill'}
      </Button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}

      {extractedDetails && (
        <form onSubmit={handleAddTransaction} className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Extracted Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            />
          </div>
          <Button type="submit" className="mt-4">
            Add Transaction
          </Button>
        </form>
      )}
    </div>
  );
};

export default BillUpload;