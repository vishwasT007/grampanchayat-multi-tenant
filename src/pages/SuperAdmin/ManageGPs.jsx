/**
 * Manage Gram Panchayats Page
 * View, edit, activate/deactivate all GPs
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllGramPanchayats, 
  toggleGPStatus, 
  deleteGramPanchayat 
} from '../../services/superAdminService';
import {
  Building2,
  Plus,
  Search,
  Edit,
  Power,
  Trash2,
  Globe,
  MapPin,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

export default function ManageGPs() {
  const navigate = useNavigate();
  const [gps, setGps] = useState([]);
  const [filteredGps, setFilteredGps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [error, setError] = useState('');

  useEffect(() => {
    loadGPs();
  }, []);

  useEffect(() => {
    filterGPList();
  }, [searchQuery, filterStatus, gps]);

  const loadGPs = async () => {
    try {
      setLoading(true);
      const data = await getAllGramPanchayats();
      setGps(data);
      setFilteredGps(data);
    } catch (err) {
      console.error('Error loading GPs:', err);
      setError('Failed to load Gram Panchayats');
    } finally {
      setLoading(false);
    }
  };

  const filterGPList = () => {
    let filtered = gps;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(gp =>
        gp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gp.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gp.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (gp.customDomain && gp.customDomain.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(gp => gp.active);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(gp => !gp.active);
    }

    setFilteredGps(filtered);
  };

  const handleToggleStatus = async (gpId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this Gram Panchayat?`)) {
      return;
    }

    try {
      await toggleGPStatus(gpId, !currentStatus);
      await loadGPs(); // Reload to get updated data
    } catch (err) {
      console.error('Error toggling GP status:', err);
      alert('Failed to update GP status');
    }
  };

  const handleDelete = async (gpId, gpName) => {
    if (!confirm(`Are you sure you want to delete "${gpName}"?\n\nThis will remove the GP from the system but preserve its data.`)) {
      return;
    }

    const confirmText = prompt(`Type "${gpName}" to confirm deletion:`);
    if (confirmText !== gpName) {
      alert('GP name did not match. Deletion cancelled.');
      return;
    }

    try {
      await deleteGramPanchayat(gpId);
      await loadGPs(); // Reload to get updated data
    } catch (err) {
      console.error('Error deleting GP:', err);
      alert('Failed to delete GP');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader className="w-6 h-6 animate-spin" />
          <p>Loading Gram Panchayats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/superadmin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Manage Gram Panchayats</h1>
                <p className="text-sm text-gray-500">{gps.length} total GPs</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/superadmin/gram-panchayats/add')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" />
              Add New GP
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, district, state, or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'all'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({gps.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Active ({gps.filter(g => g.active).length})
              </button>
              <button
                onClick={() => setFilterStatus('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'inactive'
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Inactive ({gps.filter(g => !g.active).length})
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* GP List */}
        {filteredGps.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No GPs Found' : 'No Gram Panchayats Yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first Gram Panchayat to get started'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button
                onClick={() => navigate('/superadmin/gram-panchayats/add')}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add First GP
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredGps.map((gp) => (
              <div
                key={gp.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  {/* GP Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Logo/Initial */}
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                        {gp.name.charAt(0)}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{gp.name}</h3>
                            {gp.nameMarathi && (
                              <p className="text-sm text-gray-500">{gp.nameMarathi}</p>
                            )}
                          </div>
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

                        {/* Meta Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {gp.district}, {gp.state}
                          </div>
                          {gp.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {gp.email}
                            </div>
                          )}
                          {gp.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {gp.phone}
                            </div>
                          )}
                          {gp.customDomain && (
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              {gp.customDomain}
                            </div>
                          )}
                        </div>

                        {/* Timestamps */}
                        <div className="text-xs text-gray-500">
                          Created: {new Date(gp.createdAt.seconds * 1000).toLocaleDateString('en-IN')}
                          {gp.updatedAt && (
                            <span className="ml-4">
                              Updated: {new Date(gp.updatedAt.seconds * 1000).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/superadmin/gram-panchayats/edit/${gp.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(gp.id, gp.active)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                      gp.active
                        ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    {gp.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(gp.id, gp.name)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition font-medium ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
