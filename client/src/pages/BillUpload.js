
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
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);

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
      setFileName(file.name);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setImageSrc(imageData);
        handleScanBill(imageData);
      };
      reader.readAsDataURL(file);
      setFileName(file.name);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
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
      <div
        className="mb-6 rounded-lg p-6"
        style={{
          background: 'linear-gradient(90deg, rgba(212,175,55,0.06), rgba(46,204,113,0.03))',
          backgroundColor: '#f9fafb',
          border: '1px solid rgba(212,175,55,0.12)',
          boxShadow: '0 4px 12px rgba(16,24,40,0.04)'
        }}
      >
        <h1 className="text-3xl font-bold mb-1" style={{
          background: 'linear-gradient(90deg, #D4AF37, #2ECC71)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent'
        }}>
          Scan Your Bill
        </h1>
        <p className="text-sm" style={{color: '#374151'}}>
          <span style={{color: '#2ECC71', fontWeight: 600}}>Quickly capture a receipt or upload an image and extract transaction details automatically.</span>
        </p>
      </div>

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
          <div
            onDrop={handleDrop}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className={`mt-2 flex items-center justify-center w-full px-4 py-8 border-2 rounded-lg cursor-pointer transition ${dragActive ? 'border-yellow-400 bg-yellow-50' : 'border-dashed border-gray-200 bg-white'}`}
          >
            <div className="text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-2">
                <path d="M12 3v10" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 7l4-4 4 4" stroke="#2ECC71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="3" y="13" width="18" height="6" rx="2" stroke="#94a3b8" strokeWidth="1.2" />
              </svg>
              <p className="text-gray-700 font-semibold">Upload Bill Image</p>
              <p className="text-sm text-gray-500 mt-1">Drag &amp; drop or click to select an image (JPG, PNG)</p>
              {fileName && <p className="text-sm text-gray-600 mt-2">Selected: <span className="font-medium">{fileName}</span></p>}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-4 mt-4">
            <Button
              onClick={() => setShowWebcam(true)}
              className="px-4 py-2 text-white"
              style={{ backgroundColor: '#2ECC71', borderRadius: 6, border: '1px solid rgba(0,0,0,0.04)' }}
            >
              Open Webcam
            </Button>
            <Button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="px-4 py-2 text-white"
              style={{ backgroundColor: '#D4AF37', borderRadius: 6, border: '1px solid rgba(0,0,0,0.04)' }}
            >
              Choose File
            </Button>
          </div>
        </div>
      )}

      {imageSrc && (
        <div className="my-4">
          <h2 className="text-2xl font-bold mb-2" style={{color: '#111827'}}>Preview</h2>
          <div className="rounded-md overflow-hidden border" style={{borderColor: '#e5e7eb'}}>
            <img src={imageSrc} alt="Bill" className="max-w-full h-auto block" />
          </div>
        </div>
      )}

      <div className="mt-4">
        <Button
          onClick={() => handleScanBill(imageSrc)}
          disabled={isLoading || !imageSrc}
          className={`px-6 py-2 rounded-md text-white ${isLoading || !imageSrc ? 'opacity-50' : ''}`}
          style={{backgroundColor: '#D4AF37'}}
        >
          {isLoading ? <LoadingSpinner /> : 'Scan Bill'}
        </Button>
      </div>
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
                {categories && categories.length > 0 ? (
                  <>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const isSelected = formData.category === String(cat._id);
                        return (
                          <button
                            key={cat._id}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, category: String(cat._id) }))}
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm focus:outline-none ${isSelected ? 'shadow-md' : ''}`}
                            style={{
                              borderColor: isSelected ? '#D4AF37' : (cat.color || '#e5e7eb'),
                              backgroundColor: isSelected ? '#fff7e6' : '#ffffff'
                            }}
                          >
                            <span
                              className="w-3 h-3 rounded-full inline-block"
                              style={{ backgroundColor: cat.color || '#D4AF37' }}
                            />
                            <span>{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    {/* keep a hidden select for form compatibility */}
                    <select id="category" name="category" value={formData.category} onChange={handleInputChange} className="hidden">
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">No categories available. <a href="/categories" className="text-green-600 underline">Create categories</a> to assign transactions.</p>
                )}
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