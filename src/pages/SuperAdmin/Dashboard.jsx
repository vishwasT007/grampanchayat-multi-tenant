/**
 * Super Admin Dashboard - Main Layout
 * Central hub for managing all Gram Panchayats
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '../../contexts/SuperAdminContext';
import { getSystemStats, getAllGramPanchayats } from '../../services/superAdminService';
import { auth } from '../../config/firebaseConfig';
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  LogOut,
  Shield,
  Globe,
  CheckCircle,
  XCircle,
  Loader,
  Plus,
  BarChart3
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { superAdmin } = useSuperAdmin();
  const [stats, setStats] = useState(null);
  const [gramPanchayats, setGramPanchayats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [systemStats, gps] = await Promise.all([
        getSystemStats(),
        getAllGramPanchayats()
      ]);
      setStats(systemStats);
      setGramPanchayats(gps);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await auth.signOut();
      navigate('/superadmin/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader className="w-6 h-6 animate-spin" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Super Admin Panel</h1>
                <p className="text-xs text-gray-500">Multi-Tenant Management</p>
              </div>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{superAdmin?.displayName || 'Super Admin'}</p>
                <p className="text-xs text-gray-500">{superAdmin?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {superAdmin?.displayName?.split(' ')[0] || 'Admin'}! 👋
          </h2>
          <p className="text-gray-600">
            Manage all Gram Panchayats from this central dashboard.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total GPs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Building2 className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Gram Panchayats</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalGPs || 0}</p>
          </div>

          {/* Active GPs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Active GPs</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.activeGPs || 0}</p>
          </div>

          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Admin Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
          </div>

          {/* Domains */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Custom Domains</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.customDomains || 0}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/superadmin/gram-panchayats/add')}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition shadow-md"
            >
              <Plus className="w-5 h-5" />
              <div className="text-left">
                <p className="font-semibold">Add New GP</p>
                <p className="text-sm text-indigo-100">Create a new Gram Panchayat</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/superadmin/gram-panchayats')}
              className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition"
            >
              <Building2 className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-900">Manage GPs</p>
                <p className="text-sm text-gray-600">View and edit all GPs</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/superadmin/users')}
              className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition"
            >
              <Users className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-600">View all admin users</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Gram Panchayats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Gram Panchayats</h3>
            <button
              onClick={() => navigate('/superadmin/gram-panchayats')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All →
            </button>
          </div>

          {gramPanchayats.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No Gram Panchayats yet</p>
              <button
                onClick={() => navigate('/superadmin/gram-panchayats/add')}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Add your first Gram Panchayat →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {gramPanchayats.slice(0, 5).map((gp) => (
                <div
                  key={gp.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition cursor-pointer"
                  onClick={() => navigate(`/superadmin/gram-panchayats/${gp.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {gp.name?.charAt(0) || gp.id?.charAt(0) || 'G'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{gp.name || gp.id || 'Unnamed GP'}</h4>
                      <p className="text-sm text-gray-500">{gp.district || 'N/A'}, {gp.state || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {gp.customDomain && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="w-4 h-4" />
                        {gp.customDomain}
                      </div>
                    )}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      gp.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {gp.active ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
