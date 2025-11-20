
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { createTransaction, scanBill, getCategories } from '../services';
import { Button, FormInput, LoadingSpinner } from '../components/ui';

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'environment',
};

const BillUpload = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [extractedDetails, setExtractedDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: '',
    category: '',
    shopName: '',
    type: 'expense',
  });

  const webcamRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        if (response.success) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
    setShowWebcam(false);
    handleScanBill(imageSrc);
  }, [webcamRef, setImageSrc, setShowWebcam]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setImageSrc(imageData);
        handleScanBill(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanBill = async (image) => {
    if (!image) {
      setError('Please upload or capture a bill image to scan.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const blob = await (await fetch(image)).blob();
      const formData = new FormData();
      formData.append('bill', blob, 'bill.jpg');

      const response = await scanBill(formData);

      if (response.success) {
        setExtractedDetails(response.data);
        setFormData((prev) => ({ ...prev, ...response.data, amount: response.data.amount, date: response.data.date }));
      } else {
        setError(response.error || 'Failed to scan the bill. Please try again.');
        setExtractedDetails(null);
      }
    } catch (err) {
      const errorMessage =
        err.response && err.response.data && err.response.data.error
          ? err.response.data.error
          : 'Failed to scan the bill. Please try again.';
      console.error('Error scanning bill:', errorMessage);
      setError(errorMessage);
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
      setImageSrc(null);
      setFormData({
        description: '',
        amount: '',
        date: '',
        category: '',
        shopName: '',
        type: 'expense',
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

      {showWebcam ? (
        <div className="mb-4">
          <Webcam
            audio={false}
            height={720}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={1280}
            videoConstraints={videoConstraints}
          />
          <div className="flex justify-center mt-4">
            <Button onClick={capture}>Capture photo</Button>
            <Button onClick={() => setShowWebcam(false)} className="ml-4">
              Close Webcam
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <FormInput
            type="file"
            label="Upload Bill Image"
            onChange={handleFileChange}
            accept="image/*"
          />
          <Button onClick={() => setShowWebcam(true)} className="mt-4">
            Open Webcam
          </Button>
        </div>
      )}

      {imageSrc && (
        <div className="my-4">
          <h2 className="text-2xl font-bold mb-2">Preview</h2>
          <img src={imageSrc} alt="Bill" className="max-w-full h-auto" />
        </div>
      )}

      <Button disabled={isLoading || !imageSrc}>
        {isLoading ? <LoadingSpinner /> : 'Scan Bill'}
      </Button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}

      {extractedDetails && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Extracted Details</h2>
          <form onSubmit={handleAddTransaction}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <FormInput
                label="Shop Name"
                name="shopName"
                value={formData.shopName}
                onChange={handleInputChange}
              />
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <Button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-700 text-white"
              >
                Add Transaction
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BillUpload;