import React, { useState, useEffect, useCallback } from 'react';
import { getCategorySuggestions, createMultipleCategories } from '../services/categoryService';
import { toast } from 'react-toastify';
import {
  CheckIcon,
  PlusIcon,
  SparklesIcon,
  ArrowLeftIcon,
  HomeIcon,
  ShoppingBagIcon,
  BanknotesIcon,
  FilmIcon,
  MusicalNoteIcon,
  GiftIcon,
  WifiIcon,
  TruckIcon,
  ShoppingCartIcon,
  CakeIcon,
  HeartIcon,
  BriefcaseIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  PlusCircleIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  UserIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const iconComponents = {
  'home': HomeIcon,
  'shopping': ShoppingBagIcon,
  'money': BanknotesIcon,
  'entertainment': FilmIcon,
  'music': MusicalNoteIcon,
  'gift': GiftIcon,
  'internet': WifiIcon,
  'transport': TruckIcon,
  'groceries': ShoppingCartIcon,
  'food': CakeIcon,
  'health': HeartIcon,
  'briefcase': BriefcaseIcon,
  'computer-desktop': ComputerDesktopIcon,
  'chart-bar': ChartBarIcon,
  'plus-circle': PlusCircleIcon,
  'academic-cap': AcademicCapIcon,
  'shield-check': ShieldCheckIcon,
  'credit-card': CreditCardIcon,
  'user': UserIcon,
  'document-text': DocumentTextIcon,
  'ellipsis-horizontal': EllipsisHorizontalIcon,
  'tag': TagIcon
};

const CategorySuggestions = ({ onCategoriesAdded, existingCategories = [] }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = useCallback(async () => {
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
  }, [existingCategories]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center p-6 text-[#64748B] bg-white rounded-xl shadow border border-[#ECEFF1]">
        <SparklesIcon className="h-12 w-12 mx-auto mb-2 text-[#D4AF37]" />
        <p>All suggested categories have been added!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-[#ECEFF1] overflow-hidden">
      {!showSuggestions ? (
        <div className="p-6 text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-[#0B1F3A] text-white mb-4">
            <SparklesIcon className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-[#0B1F3A] mb-2">
            Quick Setup with Default Categories
          </h3>
          <p className="text-[#64748B] mb-4">
            Get started quickly by adding popular expense and income categories to your account.
          </p>
          <button
            onClick={() => setShowSuggestions(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] transition-colors"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            Browse {suggestions.length} Suggested Categories
          </button>
        </div>
      ) : (
        <>
          <div className="px-6 py-4 border-b border-[#ECEFF1] bg-[#0B1F3A] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="mr-2 p-1 rounded-lg hover:bg-[#0B1F3A]/80 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <div>
                  <h3 className="text-lg font-semibold">
                    Suggested Categories ({suggestions.length})
                  </h3>
                  <p className="text-sm text-[#94A3B8]">
                    Select categories you'd like to add to your account
                  </p>
                </div>
              </div>
              <button
                onClick={selectAllCategories}
                className="text-sm text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors"
              >
                {selectedCategories.length === suggestions.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {suggestions.map((category, index) => {
                const IconComponent = iconComponents[category.icon] || SparklesIcon;
                return (
                  <div
                    key={index}
                    onClick={() => toggleCategorySelection(index)}
                    className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedCategories.includes(index)
                        ? 'border-[#0B1F3A] bg-[#0B1F3A]/10'
                        : 'border-[#CFD8DC] hover:border-[#D4AF37] hover:bg-[#ECEFF1]'
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <div 
                        className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-white mr-3"
                        style={{ backgroundColor: category.color }}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0B1F3A] truncate">
                          {category.name}
                        </p>
                        <p className="text-xs text-[#64748B] capitalize">
                          {category.type}
                        </p>
                      </div>
                    </div>
                    {selectedCategories.includes(index) && (
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-[#0B1F3A] text-white flex items-center justify-center">
                        <CheckIcon className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedCategories.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t border-[#ECEFF1]">
                <p className="text-sm text-[#64748B]">
                  {selectedCategories.length} categories selected
                </p>
                <button
                  onClick={addSelectedCategories}
                  disabled={creating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
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