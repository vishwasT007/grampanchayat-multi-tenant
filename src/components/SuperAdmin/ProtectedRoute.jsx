/**
 * Protected Route Component for Super Admin Pages
 * Ensures only authenticated super admins can access protected routes
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSuperAdmin } from '../../contexts/SuperAdminContext';
import { Shield, Loader } from 'lucide-react';

export default function ProtectedRoute({ children, requiredPermission = null }) {
  const { superAdmin, loading, isAuthenticated, hasPermission } = useSuperAdmin();
  const location = useLocation();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-full mb-4 border border-white/20">
            <Shield className="w-10 h-10 text-white animate-pulse" />
          </div>
          <div className="flex items-center justify-center gap-3 text-white">
            <Loader className="w-6 h-6 animate-spin" />
            <p className="text-lg">Verifying super admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !superAdmin) {
    return <Navigate to="/superadmin/login" state={{ from: location }} replace />;
  }

  // Check for specific permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md text-center border border-white/20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
            <Shield className="w-8 h-8 text-red-200" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-indigo-200 mb-6">
            You do not have permission to access this feature.
          </p>
          <p className="text-sm text-indigo-300 mb-6">
            Required permission: <span className="font-mono bg-white/10 px-2 py-1 rounded">{requiredPermission}</span>
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // All checks passed - render the protected content
  return children;
}
