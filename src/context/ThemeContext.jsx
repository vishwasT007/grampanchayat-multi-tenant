/**
 * Theme Context
 * Provides dynamic theming based on tenant configuration
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { getTenant } from '../utils/tenant';
import paths from '../utils/firestorePaths';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Default theme configuration
const DEFAULT_THEME = {
  primaryColor: '#1e40af',      // Blue-700
  secondaryColor: '#059669',    // Green-600
  accentColor: '#f59e0b',       // Amber-500
  fontFamily: 'Inter, sans-serif',
  headerHeight: '80px',
  borderRadius: '8px',
  useCustomHomepage: false,
  useCustomNavbar: false,
  useCustomFooter: false,
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadTheme();
  }, []);
  
  const loadTheme = async () => {
    try {
      setLoading(true);
      const themeRef = doc(db, paths.themeConfig());
      const themeDoc = await getDoc(themeRef);
      
      if (themeDoc.exists()) {
        const themeData = { ...DEFAULT_THEME, ...themeDoc.data() };
        setTheme(themeData);
        applyTheme(themeData);
        console.log('🎨 Theme loaded for tenant:', getTenant());
      } else {
        // Use default theme
        console.log('🎨 Using default theme for tenant:', getTenant());
        applyTheme(DEFAULT_THEME);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      setError(error);
      // Fallback to default theme on error
      applyTheme(DEFAULT_THEME);
    } finally {
      setLoading(false);
    }
  };
  
  const applyTheme = (themeData) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary', themeData.primaryColor || DEFAULT_THEME.primaryColor);
    root.style.setProperty('--color-secondary', themeData.secondaryColor || DEFAULT_THEME.secondaryColor);
    root.style.setProperty('--color-accent', themeData.accentColor || DEFAULT_THEME.accentColor);
    root.style.setProperty('--font-family', themeData.fontFamily || DEFAULT_THEME.fontFamily);
    root.style.setProperty('--header-height', themeData.headerHeight || DEFAULT_THEME.headerHeight);
    root.style.setProperty('--border-radius', themeData.borderRadius || DEFAULT_THEME.borderRadius);
    
    // Apply to document body
    document.body.style.fontFamily = themeData.fontFamily || DEFAULT_THEME.fontFamily;
  };
  
  const updateTheme = async (newTheme) => {
    try {
      const themeRef = doc(db, paths.themeConfig());
      const updatedTheme = { ...theme, ...newTheme };
      
      await setDoc(themeRef, updatedTheme);
      setTheme(updatedTheme);
      applyTheme(updatedTheme);
      
      return true;
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  };
  
  const resetTheme = async () => {
    try {
      const themeRef = doc(db, paths.themeConfig());
      await setDoc(themeRef, DEFAULT_THEME);
      setTheme(DEFAULT_THEME);
      applyTheme(DEFAULT_THEME);
      
      return true;
    } catch (error) {
      console.error('Error resetting theme:', error);
      throw error;
    }
  };
  
  const value = {
    theme,
    loading,
    error,
    updateTheme,
    resetTheme,
    defaultTheme: DEFAULT_THEME
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {!loading && children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
