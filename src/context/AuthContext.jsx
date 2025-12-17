import { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signOut, getCurrentUser, onAuthChange } from '../services/authService';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getTenant } from '../utils/tenant';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email,
          role: 'ADMIN', // All Firebase users are admins for now
        });
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (credentials) => {
    try {
      const { email, password } = credentials;
      
      // Sign in with Firebase Authentication
      const firebaseUser = await signIn(email, password);
      
      // User state will be updated by onAuthChange listener
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      // If user not found or invalid credentials, try creating Auth user via Cloud Function
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        console.log('User not found, attempting to create Auth user...');
        try {
          const functions = getFunctions();
          const createAuthUser = httpsCallable(functions, 'createAuthUserOnLogin');
          
          const tenantId = getTenant();
          const result = await createAuthUser({ 
            email: credentials.email, 
            password: credentials.password,
            tenantId: tenantId
          });
          
          console.log('Auth user created:', result.data);
          
          // Now try logging in again
          const firebaseUser = await signIn(credentials.email, credentials.password);
          return { success: true };
        } catch (createError) {
          console.error('Failed to create Auth user:', createError);
          return { 
            success: false, 
            error: createError.message || 'Invalid credentials. Please check your email and password.' 
          };
        }
      }
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut();
      // User state will be updated by onAuthChange listener
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
