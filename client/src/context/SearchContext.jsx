import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SearchContext = createContext();

export const DEFAULT_CROPS_DATA = {
  Potato: { tempMin: 3, tempMax: 6, humidity: '90-95%', shelfLife: '6-10 months', defaultRate: 1.8, typicalQty: 2000 },
  Tomato: { tempMin: 8, tempMax: 13, humidity: '85-90%', shelfLife: '2-4 weeks', defaultRate: 2.5, typicalQty: 500 },
  Onion: { tempMin: 0, tempMax: 2, humidity: '65-70%', shelfLife: '5-8 months', defaultRate: 2.0, typicalQty: 1500 },
  Mango: { tempMin: 10, tempMax: 13, humidity: '85-90%', shelfLife: '3-6 weeks', defaultRate: 3.5, typicalQty: 800 },
  Apple: { tempMin: -1, tempMax: 2, humidity: '90-95%', shelfLife: '6-9 months', defaultRate: 3.0, typicalQty: 1000 },
  Banana: { tempMin: 13, tempMax: 15, humidity: '90-95%', shelfLife: '2-4 weeks', defaultRate: 2.2, typicalQty: 1200 },
  Grapes: { tempMin: -1, tempMax: 0, humidity: '90-95%', shelfLife: '2-4 months', defaultRate: 3.2, typicalQty: 600 },
  Chilli: { tempMin: 7, tempMax: 10, humidity: '90-95%', shelfLife: '3-5 weeks', defaultRate: 2.8, typicalQty: 400 },
  Carrot: { tempMin: 0, tempMax: 2, humidity: '95-98%', shelfLife: '4-6 months', defaultRate: 2.2, typicalQty: 800 },
};

// Extended crops data from server knowledge base
export const EXTENDED_CROPS_DATA = {
  Potato: { tempMin: 3, tempMax: 6, humidity: '90-95%', shelfLife: '6-10 months', defaultRate: 1.8 },
  Tomato: { tempMin: 8, tempMax: 13, humidity: '85-90%', shelfLife: '2-4 weeks', defaultRate: 2.5 },
  Onion: { tempMin: 0, tempMax: 2, humidity: '65-70%', shelfLife: '5-8 months', defaultRate: 2.0 },
  Mango: { tempMin: 10, tempMax: 13, humidity: '85-90%', shelfLife: '3-6 weeks', defaultRate: 3.5 },
  Apple: { tempMin: -1, tempMax: 2, humidity: '90-95%', shelfLife: '6-9 months', defaultRate: 3.0 },
  Banana: { tempMin: 13, tempMax: 15, humidity: '90-95%', shelfLife: '2-4 weeks', defaultRate: 2.2 },
  Grapes: { tempMin: -1, tempMax: 0, humidity: '90-95%', shelfLife: '2-4 months', defaultRate: 3.2 },
  Chilli: { tempMin: 7, tempMax: 10, humidity: '90-95%', shelfLife: '3-5 weeks', defaultRate: 2.8 },
  Carrot: { tempMin: 0, tempMax: 2, humidity: '95-98%', shelfLife: '4-6 months', defaultRate: 2.2 },
  Maize: { tempMin: 10, tempMax: 15, humidity: '70-80%', shelfLife: '3-5 months', defaultRate: 1.5 },
  Wheat: { tempMin: 13, tempMax: 18, humidity: '60-70%', shelfLife: '6-8 months', defaultRate: 1.2 },
  Soybean: { tempMin: 15, tempMax: 20, humidity: '55-65%', shelfLife: '5-7 months', defaultRate: 1.3 },
  Pulses: { tempMin: 10, tempMax: 15, humidity: '60-70%', shelfLife: '4-6 months', defaultRate: 1.4 },
};

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

  const [cropsData, setCropsData] = useState(DEFAULT_CROPS_DATA);
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
        // Fallback to local default crops
        setCropsData(DEFAULT_CROPS_DATA);
      });
  }, []);

  // Enhanced search with all criteria
  const updateSearch = (newCriteria) => {
    setSearchCriteria((prev) => ({
      ...prev,
      ...newCriteria,
    }));

    // Auto-trigger search when criteria change
    performSearch();
  };

  // Perform search with current criteria
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

  // Toggle comparison storage
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

  // Get crop profile by name
  const getCropProfile = (cropName) => {
    return cropsData[cropName] || DEFAULT_CROPS_DATA[cropName] || {};
  };

  // Calculate storage suitability based on criteria
  const calculateSuitability = (storage, cropName) => {
    const profile = getCropProfile(cropName);
    if (!profile) return 0;

    let score = 0;
    const explanations = [];

    // Temperature compatibility
    const tempMin = storage.temperatureMin || 0;
    const tempMax = storage.temperatureMax || 100;
    const idealMin = profile.tempMin;
    const idealMax = profile.tempMax;

    if (tempMin <= idealMax && tempMax >= idealMin) {
      score += 30;
      explanations.push('Temperature range matches crop requirements');
    }

    // Capacity check
    if (storage.availableCapacity >= searchCriteria.quantity) {
      score += 20;
      explanations.push('Adequate capacity available');
    }

    // Distance check
    const distance = Math.max(searchCriteria.maxDistance - 20, 0);
    if (true) { // would need user location
      score += 15;
      explanations.push('Within acceptable distance');
    }

    // Rating check
    if (storage.rating >= 4.5) {
      score += 15;
      explanations.push('Highly rated facility');
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
