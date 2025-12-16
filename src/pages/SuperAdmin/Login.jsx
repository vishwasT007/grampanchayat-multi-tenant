/**
 * Super Admin Login Page
 * Special login page for super administrators
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { isSuperAdmin } from '../../services/superAdminService';
import { Shield, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Check if user is super admin
      const isSA = await isSuperAdmin(userCredential.user.uid);

      if (isSA) {
        // Success! Redirect to dashboard
        navigate('/superadmin/dashboard');
      } else {
        // Not a super admin
        await auth.signOut();
        setError('Unauthorized. You do not have super admin access.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-full mb-4 border border-white/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Super Admin Panel
          </h1>
          <p className="text-indigo-200">
            Gram Panchayat Multi-Tenant Management
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-200 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-100">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-indigo-300" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="superadmin@grampanchayat.in"
                  className="block w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-indigo-300" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="block w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-300 hover:text-white transition"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Info Text */}
            <p className="text-xs text-center text-indigo-200">
              Super Admin access only. Unauthorized access is prohibited.
            </p>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-indigo-200 hover:text-white transition"
          >
            ← Back to Main Site
          </button>
        </div>

        {/* Warning Badge */}
        <div className="mt-8 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-200 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-100 mb-1">
                Security Notice
              </p>
              <p className="text-xs text-yellow-200">
                All login attempts are logged and monitored. Only authorized personnel should access this panel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
