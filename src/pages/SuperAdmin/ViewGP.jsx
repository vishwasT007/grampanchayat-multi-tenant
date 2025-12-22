/**
 * View Gram Panchayat Details Page
 * Displays comprehensive information about a specific GP
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Globe,
  Mail,
  MapPin,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Power,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  RefreshCw,
  Loader
} from 'lucide-react';
import {
  getGramPanchayat,
  toggleGPStatus,
  deleteGramPanchayat,
  getGPUsers,
  getGPStats,
  subscribeToGP
} from '../../services/superAdminService';

const ViewGP = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [gp, setGp] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [domainUpdating, setDomainUpdating] = useState(false);

  // Real-time listener for GP updates (especially domain changes)
  useEffect(() => {
    if (!id) return;

    // Set up real-time listener
    const unsubscribe = subscribeToGP(id, (updatedGP) => {
      if (updatedGP) {
        setGp(prevGP => {
          // Check if domain was updated
          if (prevGP && prevGP.domain !== updatedGP.domain) {
            setDomainUpdating(false);
            console.log('✅ Domain updated:', updatedGP.domain);
          }
          return updatedGP;
        });
      }
    });

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id]);

  useEffect(() => {
    loadGPData();
  }, [id]);

  const loadGPData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load GP details
      const gpData = await getGramPanchayat(id);
      if (!gpData) {
        setError('Gram Panchayat not found');
        return;
      }
      setGp(gpData);

      // Load GP users
      try {
        const gpUsers = await getGPUsers(id);
        setUsers(gpUsers || []);
      } catch (err) {
        console.error('Error loading users:', err);
        setUsers([]);
      }

      // Load GP statistics
      try {
        const gpStats = await getGPStats(id);
        setStats(gpStats);
      } catch (err) {
        console.error('Error loading stats:', err);
        setStats(null);
      }

    } catch (err) {
      console.error('Error loading GP:', err);
      setError(err.message || 'Failed to load Gram Panchayat details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!confirm(`Are you sure you want to ${gp.active ? 'deactivate' : 'activate'} this Gram Panchayat?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await toggleGPStatus(id, !gp.active);
      setGp({ ...gp, active: !gp.active });
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete the Gram Panchayat and all its data. This action cannot be undone. Are you sure?')) {
      return;
    }

    const confirmText = prompt('Type "DELETE" to confirm deletion:');
    if (confirmText !== 'DELETE') {
      alert('Deletion cancelled');
      return;
    }

    try {
      setActionLoading(true);
      const result = await deleteGramPanchayat(id);
      
      // Show automated success message
      alert(result.message + '\n\n' + (result.note || ''));
      navigate('/superadmin/gram-panchayats');
    } catch (err) {
      alert('Failed to delete: ' + err.message);
      setActionLoading(false);
    }
  };

  const togglePasswordVisibility = (userId) => {
    setShowPassword(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const decodePassword = (encoded) => {
    try {
      return atob(encoded);
    } catch {
      return '****';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Gram Panchayat details...</p>
        </div>
      </div>
    );
  }

  if (error || !gp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Gram Panchayat not found'}</p>
          <button
            onClick={() => navigate('/superadmin/gram-panchayats')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/superadmin/gram-panchayats')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Gram Panchayats
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{gp.name}</h1>
                {gp.active ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    Inactive
                  </span>
                )}
              </div>
              {gp.nameMarathi && (
                <p className="text-xl text-gray-600">{gp.nameMarathi}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">ID: {gp.id}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleStatus}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                  gp.active
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                <Power className="w-4 h-4" />
                {gp.active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => navigate(`/superadmin/gram-panchayats/edit/${id}`)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Domain</p>
                    <div className="flex items-center gap-2">
                      {domainUpdating ? (
                        <div className="flex items-center gap-2">
                          <Loader className="w-4 h-4 text-indigo-600 animate-spin" />
                          <p className="text-gray-600 italic">Deploying...</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-900 font-medium">{gp.domain || 'Not configured'}</p>
                          {gp.domain && (
                            <button
                              onClick={() => window.open(`https://${gp.domain}`, '_blank')}
                              className="text-indigo-600 hover:text-indigo-800"
                              title="Open site in new tab"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    {gp.subdomain && (
                      <p className="text-xs text-gray-500 mt-1">Subdomain: {gp.subdomain}</p>
                    )}
                    {gp.domainStatus && (
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                        gp.domainStatus === 'active' ? 'bg-green-100 text-green-700' :
                        gp.domainStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {gp.domainStatus}
                      </span>
                    )}
                    {!gp.domain && !domainUpdating && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⏳ Deployment in progress... Domain will appear here automatically.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-900 font-medium">
                      {[gp.district, gp.state].filter(Boolean).join(', ') || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Admin Email</p>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 font-medium">{gp.adminEmail}</p>
                      <button
                        onClick={() => copyToClipboard(gp.adminEmail, 'Email')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-gray-900 font-medium">
                      {gp.createdAt?.toDate?.().toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Fields */}
              {(gp.pincode || gp.contactNumber || gp.address) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Additional Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gp.pincode && (
                      <div>
                        <p className="text-sm text-gray-500">Pincode</p>
                        <p className="text-gray-900">{gp.pincode}</p>
                      </div>
                    )}
                    {gp.contactNumber && (
                      <div>
                        <p className="text-sm text-gray-500">Contact Number</p>
                        <p className="text-gray-900">{gp.contactNumber}</p>
                      </div>
                    )}
                    {gp.address && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-gray-900">{gp.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Users */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Admin Users ({users.length})
              </h2>
              
              {users.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No users found</p>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium text-gray-900">{user.email}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                              user.role === 'superAdmin' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {user.role}
                            </span>
                            {user.active === false && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                Inactive
                              </span>
                            )}
                          </div>
                          
                          {user.initialPassword && (
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-sm text-gray-500">Password:</p>
                              <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                                {showPassword[user.id] ? decodePassword(user.initialPassword) : '••••••••'}
                              </code>
                              <button
                                onClick={() => togglePasswordVisibility(user.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {showPassword[user.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => copyToClipboard(decodePassword(user.initialPassword), 'Password')}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-500 mt-1">
                            Created: {user.createdAt?.toDate?.().toLocaleDateString('en-IN') || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            
            {/* Statistics */}
            {stats && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Notices</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalNotices || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Grievances</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalGrievances || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Storage Used</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.storageUsed ? `${(stats.storageUsed / 1024 / 1024).toFixed(2)} MB` : '0 MB'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/superadmin/gram-panchayats/edit/${id}`)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Details
                </button>
                <button
                  onClick={() => navigate(`/superadmin/users?gp=${id}`)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Manage Users
                </button>
                {gp.domain && (
                  <button
                    onClick={() => window.open(`https://${gp.domain}`, '_blank')}
                    className="w-full px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-medium flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Website
                  </button>
                )}
                <button
                  onClick={loadGPData}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Data
                </button>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Created At</p>
                  <p className="text-gray-900">
                    {gp.createdAt?.toDate?.().toLocaleString('en-IN') || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="text-gray-900">
                    {gp.updatedAt?.toDate?.().toLocaleString('en-IN') || 'Never'}
                  </p>
                </div>
                {gp.createdBy && (
                  <div>
                    <p className="text-gray-500">Created By</p>
                    <p className="text-gray-900">{gp.createdBy}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewGP;
