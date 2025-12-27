import { useState, useEffect } from 'react';
import { Save, Building2, Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Image as ImageIcon, X } from 'lucide-react';
import BilingualInput from '../../components/common/BilingualInput';
import { mockSiteSettings } from '../../data/mockData';
import { getSettings, updateSettings } from '../../services/settingsService';
import { uploadImage, deleteImage } from '../../services/storageService';
import { useSiteSettings } from '../../context/SiteSettingsContext';

// Helper function to update favicon
const updateFavicon = (logoURL) => {
  // Remove existing favicon links
  const existingLinks = document.querySelectorAll("link[rel*='icon']");
  existingLinks.forEach(link => link.remove());
  
  // Add new favicon link
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = logoURL;
  document.head.appendChild(link);
  
  console.log('Favicon updated to:', logoURL);
};

function SiteSettings() {
  const { refresh } = useSiteSettings();
  const [formData, setFormData] = useState({
    panchayatName: { en: '', mr: '' },
    tagline: { en: '', mr: '' },
    phone: '',
    email: '',
    address: { en: '', mr: '' },
    officeTimings: { en: '', mr: '' },
    facebook: '',
    twitter: '',
    instagram: '',
    officePhoto: '',
    googleMapsLink: '',
    logo: '',
    headerLeftLogo: '',
    headerCenterEmblem: '',
    headerRightLogo1: '',
    headerRightLogo2: ''
  });

  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [officePhotoFile, setOfficePhotoFile] = useState(null);
  const [officePhotoPreview, setOfficePhotoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  
  // New state for header logos
  const [headerLeftLogoFile, setHeaderLeftLogoFile] = useState(null);
  const [headerLeftLogoPreview, setHeaderLeftLogoPreview] = useState('');
  const [headerCenterEmblemFile, setHeaderCenterEmblemFile] = useState(null);
  const [headerCenterEmblemPreview, setHeaderCenterEmblemPreview] = useState('');
  const [headerRightLogo1File, setHeaderRightLogo1File] = useState(null);
  const [headerRightLogo1Preview, setHeaderRightLogo1Preview] = useState('');
  const [headerRightLogo2File, setHeaderRightLogo2File] = useState(null);
  const [headerRightLogo2Preview, setHeaderRightLogo2Preview] = useState('');

  // Load settings from Firebase on mount
  useEffect(() => {
    const loadSettingsData = async () => {
      try {
        setLoading(true);
        const settings = await getSettings();
        
        if (settings) {
          setFormData({
            panchayatName: settings.panchayatName || { en: '', mr: '' },
            tagline: settings.tagline || { en: '', mr: '' },
            phone: settings.contact?.phone || '',
            email: settings.contact?.email || '',
            address: settings.contact?.address || { en: '', mr: '' },
            officeTimings: settings.officeTimings || { en: '', mr: '' },
            facebook: settings.socialMedia?.facebook || '',
            twitter: settings.socialMedia?.twitter || '',
            instagram: settings.socialMedia?.instagram || '',
            officePhoto: settings.officePhoto || '',
            googleMapsLink: settings.googleMapsLink || '',
            logo: settings.logo || '',
            headerLeftLogo: settings.headerLeftLogo || '',
            headerCenterEmblem: settings.headerCenterEmblem || '',
            headerRightLogo1: settings.headerRightLogo1 || '',
            headerRightLogo2: settings.headerRightLogo2 || ''
          });
          setOfficePhotoPreview(settings.officePhoto || '');
          setLogoPreview(settings.logo || '');
          setHeaderLeftLogoPreview(settings.headerLeftLogo || '');
          setHeaderCenterEmblemPreview(settings.headerCenterEmblem || '');
          setHeaderRightLogo1Preview(settings.headerRightLogo1 || '');
          setHeaderRightLogo2Preview(settings.headerRightLogo2 || '');
        } else {
          // Initialize with mock data
          setFormData({
            panchayatName: mockSiteSettings.panchayatName,
            tagline: mockSiteSettings.tagline,
            phone: mockSiteSettings.contact.phone,
            email: mockSiteSettings.contact.email,
            address: mockSiteSettings.contact.address,
            officeTimings: mockSiteSettings.officeTimings,
            facebook: mockSiteSettings.socialMedia.facebook,
            twitter: mockSiteSettings.socialMedia.twitter,
            instagram: mockSiteSettings.socialMedia.instagram,
            officePhoto: '',
            googleMapsLink: ''
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // Use mock data as fallback
        setFormData({
          panchayatName: mockSiteSettings.panchayatName,
          tagline: mockSiteSettings.tagline,
          phone: mockSiteSettings.contact.phone,
          email: mockSiteSettings.contact.email,
          address: mockSiteSettings.contact.address,
          officeTimings: mockSiteSettings.officeTimings,
          facebook: mockSiteSettings.socialMedia.facebook,
          twitter: mockSiteSettings.socialMedia.twitter,
          instagram: mockSiteSettings.socialMedia.instagram
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettingsData();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOfficePhotoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setOfficePhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo size should be less than 2MB');
        return;
      }
      setLogoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setOfficePhotoFile(null);
    setOfficePhotoPreview('');
    setFormData(prev => ({ ...prev, officePhoto: '' }));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setFormData(prev => ({ ...prev, logo: '' }));
  };

  // Header logo handlers
  const handleHeaderLeftLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('File size should be less than 2MB');
        return;
      }
      setHeaderLeftLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setHeaderLeftLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleHeaderCenterEmblemChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('File size should be less than 2MB');
        return;
      }
      setHeaderCenterEmblemFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setHeaderCenterEmblemPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleHeaderRightLogo1Change = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('File size should be less than 2MB');
        return;
      }
      setHeaderRightLogo1File(file);
      const reader = new FileReader();
      reader.onloadend = () => setHeaderRightLogo1Preview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleHeaderRightLogo2Change = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('File size should be less than 2MB');
        return;
      }
      setHeaderRightLogo2File(file);
      const reader = new FileReader();
      reader.onloadend = () => setHeaderRightLogo2Preview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveHeaderLeftLogo = () => {
    setHeaderLeftLogoFile(null);
    setHeaderLeftLogoPreview('');
    setFormData(prev => ({ ...prev, headerLeftLogo: '' }));
  };

  const handleRemoveHeaderCenterEmblem = () => {
    setHeaderCenterEmblemFile(null);
    setHeaderCenterEmblemPreview('');
    setFormData(prev => ({ ...prev, headerCenterEmblem: '' }));
  };

  const handleRemoveHeaderRightLogo1 = () => {
    setHeaderRightLogo1File(null);
    setHeaderRightLogo1Preview('');
    setFormData(prev => ({ ...prev, headerRightLogo1: '' }));
  };

  const handleRemoveHeaderRightLogo2 = () => {
    setHeaderRightLogo2File(null);
    setHeaderRightLogo2Preview('');
    setFormData(prev => ({ ...prev, headerRightLogo2: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.panchayatName.en.trim()) {
      newErrors.panchayatName = 'Panchayat name is required';
    }
    if (!formData.tagline.en.trim()) {
      newErrors.tagline = 'Tagline is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.address.en.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.officeTimings.en.trim()) {
      newErrors.officeTimings = 'Office timings are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      let officePhotoURL = formData.officePhoto;
      let logoURL = formData.logo;
      let headerLeftLogoURL = formData.headerLeftLogo;
      let headerCenterEmblemURL = formData.headerCenterEmblem;
      let headerRightLogo1URL = formData.headerRightLogo1;
      let headerRightLogo2URL = formData.headerRightLogo2;

      // Upload new logo if selected
      if (logoFile) {
        // Delete old logo if exists
        if (formData.logo) {
          try {
            await deleteImage(formData.logo);
          } catch (error) {
            console.warn('Failed to delete old logo:', error);
          }
        }
        // Upload new logo
        logoURL = await uploadImage(logoFile, 'site/logos');
      }

      // Upload new photo if selected
      if (officePhotoFile) {
        // Delete old photo if exists
        if (formData.officePhoto) {
          try {
            await deleteImage(formData.officePhoto);
          } catch (error) {
            console.warn('Failed to delete old office photo:', error);
          }
        }
        // Upload new photo
        officePhotoURL = await uploadImage(officePhotoFile, 'site');
      }

      // Upload header logos
      if (headerLeftLogoFile) {
        if (formData.headerLeftLogo) {
          try {
            await deleteImage(formData.headerLeftLogo);
          } catch (error) {
            console.warn('Failed to delete old header left logo:', error);
          }
        }
        headerLeftLogoURL = await uploadImage(headerLeftLogoFile, 'site/header-logos');
      }

      if (headerCenterEmblemFile) {
        if (formData.headerCenterEmblem) {
          try {
            await deleteImage(formData.headerCenterEmblem);
          } catch (error) {
            console.warn('Failed to delete old center emblem:', error);
          }
        }
        headerCenterEmblemURL = await uploadImage(headerCenterEmblemFile, 'site/header-logos');
      }

      if (headerRightLogo1File) {
        if (formData.headerRightLogo1) {
          try {
            await deleteImage(formData.headerRightLogo1);
          } catch (error) {
            console.warn('Failed to delete old right logo 1:', error);
          }
        }
        headerRightLogo1URL = await uploadImage(headerRightLogo1File, 'site/header-logos');
      }

      if (headerRightLogo2File) {
        if (formData.headerRightLogo2) {
          try {
            await deleteImage(formData.headerRightLogo2);
          } catch (error) {
            console.warn('Failed to delete old right logo 2:', error);
          }
        }
        headerRightLogo2URL = await uploadImage(headerRightLogo2File, 'site/header-logos');
      }

      const settingsData = {
        panchayatName: formData.panchayatName,
        tagline: formData.tagline,
        logo: logoURL,
        headerLeftLogo: headerLeftLogoURL,
        headerCenterEmblem: headerCenterEmblemURL,
        headerRightLogo1: headerRightLogo1URL,
        headerRightLogo2: headerRightLogo2URL,
        contact: {
          phone: formData.phone,
          email: formData.email,
          address: formData.address
        },
        officeTimings: formData.officeTimings,
        socialMedia: {
          facebook: formData.facebook,
          twitter: formData.twitter,
          instagram: formData.instagram
        },
        officePhoto: officePhotoURL,
        googleMapsLink: formData.googleMapsLink
      };

      // Save to Firebase
      await updateSettings(settingsData);
      
      // Update favicon if logo was uploaded
      if (logoURL) {
        updateFavicon(logoURL);
      }
      
      // Refresh context to update the site immediately
      await refresh();
      
      console.log('Settings saved successfully!', settingsData);

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        // Reload page to apply new settings
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure your Gram Panchayat website settings
          </p>
        </div>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          ✓ Settings saved successfully! Reloading page...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="text-primary-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Panchayat Name with Auto-Translation */}
            <BilingualInput
              label="Panchayat Name"
              name="panchayatName"
              value={formData.panchayatName}
              onChange={(value) => handleChange('panchayatName', value)}
              required
              placeholder="e.g., Gram Panchayat Pindkepar Lodha"
            />
            {errors.panchayatName && (
              <p className="text-red-500 text-sm mt-1">{errors.panchayatName}</p>
            )}

            {/* Tagline with Auto-Translation */}
            <BilingualInput
              label="Tagline"
              name="tagline"
              value={formData.tagline}
              onChange={(value) => handleChange('tagline', value)}
              required
              placeholder="e.g., Progress with Tradition"
            />
            {errors.tagline && (
              <p className="text-red-500 text-sm mt-1">{errors.tagline}</p>
            )}
          </div>
        </div>

        {/* Logo & Branding */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <ImageIcon className="text-primary-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Logo & Branding
            </h2>
          </div>

          <div className="space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gram Panchayat Logo
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Upload your Gram Panchayat logo. This will appear in the header and as the favicon. Recommended size: 200x200px, PNG or JPG format.
              </p>
              
              {logoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-32 h-32 object-contain rounded-lg border-2 border-gray-300 bg-white p-2"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG (MAX. 2MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Government Header Logos Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Government Header Logos</h3>
              <p className="text-sm text-gray-500 mb-6">
                These logos will appear in the professional government-style header. All fields are optional.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Header Left Logo (Indian Flag) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Left Logo (Flag/State Emblem)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Appears on the left side of header</p>
                  
                  {headerLeftLogoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={headerLeftLogoPreview}
                        alt="Left Logo Preview"
                        className="w-24 h-24 object-contain rounded-lg border-2 border-gray-300 bg-white p-2"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveHeaderLeftLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500">Click to upload</p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleHeaderLeftLogoChange}
                      />
                    </label>
                  )}
                </div>

                {/* Header Center Emblem */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Center Emblem (National/State)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Recommended: 52x90px, appears above title</p>
                  
                  {headerCenterEmblemPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={headerCenterEmblemPreview}
                        alt="Center Emblem Preview"
                        className="w-24 h-24 object-contain rounded-lg border-2 border-gray-300 bg-white p-2"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveHeaderCenterEmblem}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500">Click to upload</p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleHeaderCenterEmblemChange}
                      />
                    </label>
                  )}
                </div>

                {/* Header Right Logo 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Right Logo 1
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Recommended: 64x64px</p>
                  
                  {headerRightLogo1Preview ? (
                    <div className="relative inline-block">
                      <img
                        src={headerRightLogo1Preview}
                        alt="Right Logo 1 Preview"
                        className="w-24 h-24 object-contain rounded-lg border-2 border-gray-300 bg-white p-2"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveHeaderRightLogo1}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500">Click to upload</p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleHeaderRightLogo1Change}
                      />
                    </label>
                  )}
                </div>

                {/* Header Right Logo 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Right Logo 2
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Recommended: 119x64px</p>
                  
                  {headerRightLogo2Preview ? (
                    <div className="relative inline-block">
                      <img
                        src={headerRightLogo2Preview}
                        alt="Right Logo 2 Preview"
                        className="w-24 h-24 object-contain rounded-lg border-2 border-gray-300 bg-white p-2"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveHeaderRightLogo2}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500">Click to upload</p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleHeaderRightLogo2Change}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Phone className="text-primary-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Contact Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+91 1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contact@grampanchayat.gov.in"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Address with Auto-Translation */}
            <BilingualInput
              label="Address"
              name="address"
              type="textarea"
              rows={3}
              value={formData.address}
              onChange={(value) => handleChange('address', value)}
              required
              placeholder="Village, Taluka, District, State, PIN"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}

            {/* Office Timings with Auto-Translation */}
            <BilingualInput
              label="Office Timings"
              name="officeTimings"
              value={formData.officeTimings}
              onChange={(value) => handleChange('officeTimings', value)}
              required
              placeholder="e.g., Mon-Fri: 10:00 AM - 5:00 PM"
            />
            {errors.officeTimings && (
              <p className="text-red-500 text-sm mt-1">{errors.officeTimings}</p>
            )}

            {/* Google Maps Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-primary-600" />
                  Google Maps Embed Link
                </div>
              </label>
              <input
                type="url"
                value={formData.googleMapsLink}
                onChange={(e) => handleChange('googleMapsLink', e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                To get the embed link: Go to Google Maps → Search your location → Click "Share" → Click "Embed a map" → Copy the iframe src URL
              </p>
            </div>
          </div>
        </div>

        {/* Office Photo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <ImageIcon className="text-primary-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Office Photo
            </h2>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload a photo of your Gram Panchayat office. This will be displayed on the Panchayat page.
            </p>

            {/* Photo Preview */}
            {officePhotoPreview && (
              <div className="relative inline-block">
                <img
                  src={officePhotoPreview}
                  alt="Office"
                  className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {officePhotoPreview ? 'Change Photo' : 'Upload Photo'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100
                  cursor-pointer"
              />
              <p className="mt-1 text-xs text-gray-500">
                Recommended: 1200x800px or larger, JPG or PNG format
              </p>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Facebook className="text-primary-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Social Media Links
            </h2>
          </div>

          <div className="space-y-4">
            {/* Facebook */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Facebook size={16} className="inline mr-2" />
                Facebook URL
              </label>
              <input
                type="url"
                value={formData.facebook}
                onChange={(e) => handleChange('facebook', e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Twitter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Twitter size={16} className="inline mr-2" />
                Twitter URL
              </label>
              <input
                type="url"
                value={formData.twitter}
                onChange={(e) => handleChange('twitter', e.target.value)}
                placeholder="https://twitter.com/yourhandle"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Instagram size={16} className="inline mr-2" />
                Instagram URL
              </label>
              <input
                type="url"
                value={formData.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="https://instagram.com/yourprofile"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SiteSettings;
