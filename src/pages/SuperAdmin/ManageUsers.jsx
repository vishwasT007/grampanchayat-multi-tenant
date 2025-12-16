import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Mail,
  Shield,
  Building2,
  Calendar,
  KeyRound,
  User,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Copy
} from 'lucide-react';
import { 
  getAllAdminUsers, 
  resetAdminPassword,
  getInitialPassword,
  generateAndSetNewPassword
} from '../../services/superAdminService';

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGP, setFilterGP] = useState('all');
  const [resetLoading, setResetLoading] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [passwordData, setPasswordData] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get unique GPs for filter
  const uniqueGPs = [...new Set(users.map(u => u.gpName))].sort();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (email, userId) => {
    if (!confirm(`Send password reset email to ${email}?`)) return;

    try {
      setResetLoading({ ...resetLoading, [userId]: true });
      await resetAdminPassword(email);
      setSuccessMessage(`Password reset email sent to ${email}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error resetting password:', err);
      alert('Failed to send password reset email. Please try again.');
    } finally {
      setResetLoading({ ...resetLoading, [userId]: false });
    }
  };

  const handleViewPassword = async (user) => {
    try {
      setSelectedUser(user);
      setShowPasswordModal(true);
      setPasswordLoading(true);
      setShowPassword(false);
      
      const data = await getInitialPassword(user.gpId, user.id);
      setPasswordData(data);
    } catch (err) {
      console.error('Error fetching password:', err);
      alert('Failed to fetch password. It may not be available.');
      setShowPasswordModal(false);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleGenerateNewPassword = async () => {
    if (!confirm('Generate a new password for this user? This will update the stored password.')) return;

    try {
      setPasswordLoading(true);
      const result = await generateAndSetNewPassword(
        selectedUser.gpId,
        selectedUser.id,
        selectedUser.email
      );
      
      setPasswordData({
        password: result.password,
        passwordLastChanged: new Date(),
        isNew: true
      });
      
      setSuccessMessage(`New password generated for ${selectedUser.email}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error generating password:', err);
      alert('Failed to generate new password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccessMessage('Password copied to clipboard!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setSelectedUser(null);
    setPasswordData(null);
    setShowPassword(false);
  };

  const exportToCSV = () => {
    const csvData = filteredUsers.map(user => ({
      Name: user.displayName || 'N/A',
      Email: user.email,
      'Gram Panchayat': user.gpName,
      Role: user.role,
      'Created At': new Date(user.createdAt?.toDate()).toLocaleDateString('en-IN'),
      'Last Login': user.lastLogin ? new Date(user.lastLogin.toDate()).toLocaleDateString('en-IN') : 'Never'
    }));

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.gpName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGP = filterGP === 'all' || user.gpName === filterGP;

    return matchesSearch && matchesGP;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/superadmin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Admin Users</h1>
                <p className="text-sm text-gray-600">
                  {filteredUsers.length} of {users.length} users
                </p>
              </div>
            </div>

            <button
              onClick={exportToCSV}
              disabled={filteredUsers.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or GP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* GP Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterGP}
                onChange={(e) => setFilterGP(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Gram Panchayats</option>
                {uniqueGPs.map(gp => (
                  <option key={gp} value={gp}>{gp}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {searchTerm || filterGP !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No admin users have been created yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.displayName || 'No Name'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      {/* GP Name */}
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Gram Panchayat</p>
                          <p className="text-sm font-medium text-gray-900">{user.gpName}</p>
                        </div>
                      </div>

                      {/* Role */}
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Role</p>
                          <p className="text-sm font-medium text-gray-900 capitalize">{user.role}</p>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Created</p>
                          <p className="text-sm font-medium text-gray-900">
                            {user.createdAt 
                              ? new Date(user.createdAt.toDate()).toLocaleDateString('en-IN')
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Last Login */}
                      <div className="flex items-center gap-2">
                        {user.lastLogin ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <div>
                          <p className="text-xs text-gray-500">Last Login</p>
                          <p className="text-sm font-medium text-gray-900">
                            {user.lastLogin 
                              ? new Date(user.lastLogin.toDate()).toLocaleDateString('en-IN')
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => handleViewPassword(user)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Password
                    </button>
                    <button
                      onClick={() => handleResetPassword(user.email, user.id)}
                      disabled={resetLoading[user.id]}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <KeyRound className="w-4 h-4" />
                      {resetLoading[user.id] ? 'Sending...' : 'Reset Password'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">User Password</h3>
              <button
                onClick={closePasswordModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {selectedUser && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">User</p>
                <p className="font-semibold text-gray-900">{selectedUser.displayName || 'No Name'}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedUser.email}</p>
                <p className="text-xs text-gray-500 mt-1">GP: {selectedUser.gpName}</p>
              </div>
            )}

            {passwordLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading password...</p>
              </div>
            ) : passwordData ? (
              <div>
                {passwordData.isNew && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ New password generated. A password reset email has been sent.
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.password || 'Not available'}
                      readOnly
                      className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg bg-gray-50 font-mono"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                        title={showPassword ? 'Hide' : 'Show'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                      {passwordData.password && (
                        <button
                          onClick={() => copyToClipboard(passwordData.password)}
                          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {passwordData.passwordLastChanged && (
                  <p className="text-xs text-gray-500 mb-4">
                    Last changed: {new Date(passwordData.passwordLastChanged.toDate?.() || passwordData.passwordLastChanged).toLocaleString('en-IN')}
                  </p>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-amber-800">
                    ⚠️ <strong>Security Notice:</strong> This password is stored in encoded format (not encrypted). 
                    Users should change their password after first login for security.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateNewPassword}
                    disabled={passwordLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Generate New
                  </button>
                  <button
                    onClick={closePasswordModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600">Password not available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
