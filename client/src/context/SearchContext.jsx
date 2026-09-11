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

export const SearchProvider = ({ children }) => {
  const [searchCriteria, setSearchCriteria] = useState({
    crop: 'Tomato',
    quantity: 500,
    city: 'Ahmedabad',
    temperature: '8°C - 13°C',
    duration: 30,
  });

  const [cropsData, setCropsData] = useState(DEFAULT_CROPS_DATA);
  const [compareList, setCompareList] = useState([]);

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
      });
  }, []);

  const updateSearch = (newCriteria) => {
    setSearchCriteria((prev) => ({
      ...prev,
      ...newCriteria,
    }));
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
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
