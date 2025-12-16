/**
 * Super Admin Context
 * Manages super admin authentication state and permissions
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { 
  isSuperAdmin, 
  getSuperAdminProfile, 
  updateSuperAdminLastLogin 
} from '../services/superAdminService';

const SuperAdminContext = createContext();

export const useSuperAdmin = () => {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error('useSuperAdmin must be used within SuperAdminProvider');
  }
  return context;
};

export const SuperAdminProvider = ({ children }) => {
  const [superAdmin, setSuperAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setError(null);

      if (user) {
        try {
          // Check if user is super admin
          const isSA = await isSuperAdmin(user.uid);
          
          if (isSA) {
            // Get full profile
            const profile = await getSuperAdminProfile(user.uid);
            
            setSuperAdmin({
              uid: user.uid,
              email: user.email,
              ...profile
            });
            
            // Update last login
            await updateSuperAdminLastLogin(user.uid);
          } else {
            setSuperAdmin(null);
            setError('You do not have super admin permissions');
          }
        } catch (err) {
          console.error('Error checking super admin status:', err);
          setError(err.message);
          setSuperAdmin(null);
        }
      } else {
        setSuperAdmin(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hasPermission = (permission) => {
    if (!superAdmin) return false;
    return superAdmin.permissions?.includes(permission) || false;
  };

  const value = {
    superAdmin,
    loading,
    error,
    isAuthenticated: !!superAdmin,
    hasPermission
  };

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  );
};

export default SuperAdminContext;
