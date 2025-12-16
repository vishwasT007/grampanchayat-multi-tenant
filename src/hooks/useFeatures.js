/**
 * Feature Flags Hook
 * Enables/disables features per tenant
 */

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import paths from '../utils/firestorePaths';

// Default feature configuration
const DEFAULT_FEATURES = {
  showGallery: true,
  showVillageStats: true,
  showFinancials: true,
  showGrievances: true,
  showSchemes: true,
  showServices: true,
  showForms: true,
  showPrograms: true,
  showNotices: true,
  enableOnlinePayments: false,
  enablePublicGrievance: true,
  customDashboard: false,
  enableDownloads: true,
};

export function useFeatures() {
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadFeatures();
  }, []);
  
  const loadFeatures = async () => {
    try {
      setLoading(true);
      const featuresRef = doc(db, paths.featuresConfig());
      const featuresDoc = await getDoc(featuresRef);
      
      if (featuresDoc.exists()) {
        const featuresData = { ...DEFAULT_FEATURES, ...featuresDoc.data() };
        setFeatures(featuresData);
      } else {
        // Use default features
        setFeatures(DEFAULT_FEATURES);
      }
    } catch (error) {
      console.error('Error loading features:', error);
      setError(error);
      // Fallback to default features on error
      setFeatures(DEFAULT_FEATURES);
    } finally {
      setLoading(false);
    }
  };
  
  const isEnabled = (featureName) => {
    return features[featureName] === true;
  };
  
  const updateFeatures = async (newFeatures) => {
    try {
      const featuresRef = doc(db, paths.featuresConfig());
      const updatedFeatures = { ...features, ...newFeatures };
      
      await setDoc(featuresRef, updatedFeatures);
      setFeatures(updatedFeatures);
      
      return true;
    } catch (error) {
      console.error('Error updating features:', error);
      throw error;
    }
  };
  
  const toggleFeature = async (featureName) => {
    const newValue = !features[featureName];
    await updateFeatures({ [featureName]: newValue });
  };
  
  return {
    features,
    loading,
    error,
    isEnabled,
    updateFeatures,
    toggleFeature,
    defaultFeatures: DEFAULT_FEATURES
  };
}

export default useFeatures;
