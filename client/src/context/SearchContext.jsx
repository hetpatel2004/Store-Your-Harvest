import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchCriteria, setSearchCriteria] = useState({
    crop: 'Tomato',
    quantity: 500,
    city: 'Ahmedabad',
    temperature: '8°C - 13°C',
    duration: 30,
    minCapacity: 500,
    maxDistance: 50,
  });

  const [cropsData, setCropsData] = useState({});
  const [compareList, setCompareList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Fetch dynamic crops knowledge base from server if available
    api.get('/crops')
      .then((res) => {
        if (res.data.success && res.data.crops) {
          setCropsData(res.data.crops);
        }
      })
      .catch((err) => {
        // Fallback to empty object - server data will be used when available
      });
  }, []);

  const updateSearch = (newCriteria) => {
    setSearchCriteria((prev) => ({
      ...prev,
      ...newCriteria,
    }));
  };

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const res = await api.get('/storages', {
        params: {
          crop: searchCriteria.crop,
          quantity: searchCriteria.quantity,
          city: searchCriteria.city,
          minCapacity: searchCriteria.minCapacity,
          maxDistance: searchCriteria.maxDistance,
        },
      });
      if (res.data.success) {
        setSearchResults(res.data.storages || []);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleCompare = (storage) => {
    setCompareList((prev) => {
      const exists = prev.find((s) => s._id === storage._id);
      if (exists) {
        return prev.filter((s) => s._id !== storage._id);
      } else {
        if (prev.length >= 3) {
          return [...prev.slice(1), storage];
        }
        return [...prev, storage];
      }
    });
  };

  const removeCompare = (storageId) => {
    setCompareList((prev) => prev.filter((s) => s._id !== storageId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isComparing = (storageId) => {
    return compareList.some((s) => s._id === storageId);
  };

  const getCropProfile = (cropName) => {
    return cropsData[cropName] || {};
  };

  const calculateSuitability = (storage, cropName) => {
    const profile = getCropProfile(cropName);
    if (!profile) return 0;

    let score = 0;

    // Temperature compatibility
    const tempMin = storage.temperatureMin || 0;
    const tempMax = storage.temperatureMax || 100;
    const idealMin = profile.tempMin;
    const idealMax = profile.tempMax;

    if (tempMin <= idealMax && tempMax >= idealMin) {
      score += 30;
    }

    // Capacity check
    if (storage.availableCapacity >= searchCriteria.quantity) {
      score += 20;
    }

    // Rating check
    if (storage.rating >= 4.5) {
      score += 15;
    }

    return Math.min(score, 100);
  };

  return (
    <SearchContext.Provider
      value={{
        searchCriteria,
        updateSearch,
        cropsData,
        compareList,
        toggleCompare,
        removeCompare,
        clearCompare,
        isComparing,
        isSearching,
        searchResults,
        performSearch,
        getCropProfile,
        calculateSuitability,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);