/**
 * Add Gram Panchayat Form
 * Complete form to create new GP with admin user
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGramPanchayat, generateSecurePassword } from '../../services/superAdminService';
import {
  Building2,
  ArrowLeft,
  Save,
  Loader,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Globe,
  Mail,
  Phone,
  MapPin,
  User
} from 'lucide-react';

export default function AddGP() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);

  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    nameMarathi: '',
    district: '',
    state: 'Maharashtra',
    
    // Contact Info
    email: '',
    phone: '',
    address: '',
    pincode: '',
    
    // Domain
    customDomain: '',
    subdomain: '',
    
    // Admin User
    adminEmail: '',
    adminPassword: '',
    adminName: '',
    
    // Settings
    active: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
  };

  const generatePassword = () => {
    const password = generateSecurePassword(12);
    setFormData({
      ...formData,
      adminPassword: password
    });
  };

  const autoFillSubdomain = () => {
    const subdomain = formData.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setFormData({
      ...formData,
      subdomain: subdomain
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('GP name is required');
      return false;
    }
    if (!formData.district.trim()) {
      setError('District is required');
      return false;
    }
    if (!formData.customDomain && !formData.subdomain) {
      setError('Either custom domain or subdomain is required');
      return false;
    }
    if (!formData.adminEmail.trim() || !formData.adminEmail.includes('@')) {
      setError('Valid admin email is required');
      return false;
    }
    if (!formData.adminPassword || formData.adminPassword.length < 6) {
      setError('Admin password must be at least 6 characters');
      return false;
    }
    if (!formData.adminName.trim()) {
      setError('Admin name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate GP ID from name
      const gpId = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);
      
      // Determine domain (use custom domain if provided, otherwise FREE Firebase subdomain)
      const domain = formData.customDomain || `${formData.subdomain || gpId}.web.app`;
      
      // Prepare data for creation
      const gpData = {
        ...formData,
        id: gpId,
        domain: domain
      };
      
      const result = await createGramPanchayat(gpData);
      
      // Store credentials for display
      setGeneratedCredentials({
        gpName: formData.name,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        gpId: result.gpId
      });
      
      setSuccess(true);
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (err) {
      console.error('Error creating GP:', err);
      setError(err.message || 'Failed to create Gram Panchayat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnother = () => {
    setSuccess(false);
    setGeneratedCredentials(null);
    setFormData({
      name: '',
      nameMarathi: '',
      district: '',
      state: 'Maharashtra',
      email: '',
      phone: '',
      address: '',
      pincode: '',
      customDomain: '',
      subdomain: '',
      adminEmail: '',
      adminPassword: '',
      adminName: '',
      active: true
    });
  };

  // Success Screen
  if (success && generatedCredentials) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-bold text-gray-900">Add Gram Panchayat</h1>
              <button
                onClick={() => navigate('/superadmin/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </header>

        {/* Success Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Gram Panchayat Created Successfully! 🎉
              </h2>
              <p className="text-gray-600">
                {generatedCredentials.gpName} has been added to the system.
              </p>
            </div>

            {/* Credentials Box */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-600" />
                Admin Credentials (Save These!)
              </h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Admin Email</p>
                  <p className="font-mono font-semibold text-gray-900">
                    {generatedCredentials.adminEmail}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Admin Password</p>
                  <p className="font-mono font-semibold text-gray-900">
                    {generatedCredentials.adminPassword}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">GP ID</p>
                  <p className="font-mono font-semibold text-gray-900">
                    {generatedCredentials.gpId}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Important:</strong> Save these credentials securely. The admin will need them to login.
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Next Steps:</h3>
              <ol className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-indigo-600">1.</span>
                  <span>Share the admin credentials with the GP administrator</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-indigo-600">2.</span>
                  <span>If you added a custom domain, configure it in Firebase Hosting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-indigo-600">3.</span>
                  <span>Ask the admin to login and change their password</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-indigo-600">4.</span>
                  <span>The admin can start adding content to their GP portal</span>
                </li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCreateAnother}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
              >
                Add Another GP
              </button>
              <button
                onClick={() => navigate('/superadmin/gram-panchayats')}
                className="flex-1 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                View All GPs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form Screen
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/superadmin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Add New Gram Panchayat</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="w-4 h-4" />
              Create GP
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gram Panchayat Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={autoFillSubdomain}
                  placeholder="e.g., Pindkepar Lodha"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name in Marathi (Optional)
                </label>
                <input
                  type="text"
                  name="nameMarathi"
                  value={formData.nameMarathi}
                  onChange={handleChange}
                  placeholder="ग्रामपंचायत नाव"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g., Gondia"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  {/* Add more states as needed */}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="gp@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 1234567890"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full address"
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="441614"
                  maxLength="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Domain Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              Domain Configuration
            </h2>
            
            {/* Info Box */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> You can use FREE Firebase subdomains (like <code>pindkepar.web.app</code>) 
                for now. Custom domains can be added later without affecting your data!
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subdomain <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleChange}
                    placeholder="pindkepar-lodha"
                    required
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={autoFillSubdomain}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    title="Auto-generate from GP name"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  ✅ <strong>FREE Firebase URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{formData.subdomain || 'subdomain'}.web.app</code>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  This will be your GP's website address. You can create a Firebase hosting site for this later.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Domain (Optional - Can add later)
                </label>
                <input
                  type="text"
                  name="customDomain"
                  value={formData.customDomain}
                  onChange={handleChange}
                  placeholder="grampanchyatpindkepaarlodha.in"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  💰 Requires purchasing domain. Can be configured in Firebase Hosting console later.
                </p>
              </div>
            </div>
          </div>

          {/* Admin User */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Admin User
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  placeholder="Full name of the administrator"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  This email will be used to login to the admin panel
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Password <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="adminPassword"
                      value={formData.adminPassword}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition font-semibold"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Use a strong password. Click "Generate" for a secure random password.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="active"
                  id="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="active" className="text-sm text-gray-700">
                  Activate this Gram Panchayat immediately
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/superadmin/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating Gram Panchayat...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Gram Panchayat
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
