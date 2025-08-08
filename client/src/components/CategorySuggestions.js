import React, { useState, useEffect } from 'react';
import { getCategorySuggestions, createMultipleCategories } from '../services/categoryService';
import { toast } from 'react-toastify';
import {
  CheckIcon,
  PlusIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const CategorySuggestions = ({ onCategoriesAdded, existingCategories = [] }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await getCategorySuggestions();
      const availableSuggestions = response.data.filter(suggestion => 
        !existingCategories.some(existing => 
          existing.name.toLowerCase() === suggestion.name.toLowerCase()
        )
      );
      setSuggestions(availableSuggestions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching category suggestions:', error);
      toast.error('Failed to load category suggestions');
      setLoading(false);
    }
  };

  const toggleCategorySelection = (categoryIndex) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryIndex)) {
        return prev.filter(index => index !== categoryIndex);
      } else {
        return [...prev, categoryIndex];
      }
    });
  };

  const selectAllCategories = () => {
    if (selectedCategories.length === suggestions.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(suggestions.map((_, index) => index));
    }
  };

  const addSelectedCategories = async () => {
    if (selectedCategories.length === 0) {
      toast.warning('Please select at least one category to add');
      return;
    }

    setCreating(true);
    try {
      const categoriesToCreate = selectedCategories.map(index => suggestions[index]);
      const result = await createMultipleCategories(categoriesToCreate);

      if (result.successCount > 0) {
        toast.success(`Successfully added ${result.successCount} categories!`);
        setSelectedCategories([]);
        
        // Remove successfully created categories from suggestions
        const newSuggestions = suggestions.filter((_, index) => 
          !selectedCategories.includes(index) || 
          result.failed.some(failure => failure.response?.data?.error?.includes(suggestions[index].name))
        );
        setSuggestions(newSuggestions);
        
        if (onCategoriesAdded) {
          onCategoriesAdded(result.successful);
        }
      }

      if (result.failureCount > 0) {
        toast.warning(`${result.failureCount} categories could not be added (might already exist)`);
      }
    } catch (error) {
      console.error('Error creating categories:', error);
      toast.error('Failed to add categories');
    } finally {
      setCreating(false);
    }
  };

  const getCategoryIcon = (iconName) => {
    // Map icon names to actual icons or return a default
    const iconMap = {
      'briefcase': '💼',
      'computer-desktop': '💻',
      'chart-bar': '📈',
      'gift': '🎁',
      'plus-circle': '➕',
      'utensils': '🍽️',
      'shopping-cart': '🛒',
      'truck': '🚛',
      'fire': '⛽',
      'home': '🏠',
      'bolt': '⚡',
      'heart': '❤️',
      'film': '🎬',
      'shopping-bag': '🛍️',
      'academic-cap': '🎓',
      'airplane': '✈️',
      'shield-check': '🛡️',
      'credit-card': '💳',
      'sparkles': '✨',
      'user': '👤',
      'document-text': '📄',
      'ellipsis-horizontal': '⋯'
    };
    return iconMap[iconName] || '📁';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        <SparklesIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>All suggested categories have been added!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {!showSuggestions ? (
        <div className="p-6 text-center">
          <SparklesIcon className="h-12 w-12 mx-auto mb-4 text-primary-600" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Quick Setup with Default Categories
          </h3>
          <p className="text-gray-600 mb-4">
            Get started quickly by adding popular expense and income categories to your account.
          </p>
          <button
            onClick={() => setShowSuggestions(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            Browse {suggestions.length} Suggested Categories
          </button>
        </div>
      ) : (
        <>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Suggested Categories ({suggestions.length})
                </h3>
                <p className="text-sm text-gray-600">
                  Select categories you'd like to add to your account
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={selectAllCategories}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {selectedCategories.length === suggestions.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Hide
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {suggestions.map((category, index) => (
                <div
                  key={index}
                  onClick={() => toggleCategorySelection(index)}
                  className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCategories.includes(index)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <div 
                      className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3"
                      style={{ backgroundColor: category.color }}
                    >
                      {getCategoryIcon(category.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {category.name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {category.type}
                      </p>
                    </div>
                  </div>
                  {selectedCategories.includes(index) && (
                    <CheckIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {selectedCategories.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  {selectedCategories.length} categories selected
                </p>
                <button
                  onClick={addSelectedCategories}
                  disabled={creating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Selected Categories
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CategorySuggestions;
