import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Bell } from 'lucide-react';
import BilingualInput from '../../components/common/BilingualInput';
import { createAnnouncement, updateAnnouncement, getAnnouncement } from '../../services/announcementsService';

function AnnouncementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: { en: '', mr: '' },
    message: { en: '', mr: '' },
    type: 'info',
    priority: 'medium',
    link: '',
    isActive: true
  });

  useEffect(() => {
    if (id) {
      loadAnnouncement();
    }
  }, [id]);

  const loadAnnouncement = async () => {
    try {
      setLoading(true);
      const data = await getAnnouncement(id);
      if (data) {
        setFormData({
          title: data.title || { en: '', mr: '' },
          message: data.message || { en: '', mr: '' },
          type: data.type || 'info',
          priority: data.priority || 'medium',
          link: data.link || '',
          isActive: data.isActive !== undefined ? data.isActive : true
        });
      }
    } catch (error) {
      console.error('Error loading announcement:', error);
      alert('Failed to load announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.en.trim() || !formData.message.en.trim()) {
      alert('Please fill in required fields (English title and message)');
      return;
    }

    try {
      setLoading(true);
      
      if (id) {
        await updateAnnouncement(id, formData);
        alert('Announcement updated successfully!');
      } else {
        await createAnnouncement(formData);
        alert('Announcement created successfully!');
      }
      
      navigate('/admin/announcements');
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Failed to save announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading && id) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/announcements')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Announcements
        </button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bell className="text-orange-600" />
          {id ? 'Edit Announcement' : 'Create New Announcement'}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Announcement Title</h2>
          <BilingualInput
            label="Title"
            value={formData.title}
            onChange={(value) => handleChange('title', value)}
            placeholder={{ en: 'Enter title in English', mr: 'मराठीत शीर्षक प्रविष्ट करा' }}
            required
          />
        </div>

        {/* Message */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Announcement Message</h2>
          <BilingualInput
            label="Message"
            value={formData.message}
            onChange={(value) => handleChange('message', value)}
            placeholder={{ en: 'Enter message in English', mr: 'मराठीत संदेश प्रविष्ट करा' }}
            rows={4}
            required
          />
        </div>

        {/* Type, Priority, and Settings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="alert">Alert</option>
                <option value="success">Success</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Determines the color scheme
              </p>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Higher priority shows first
              </p>
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <label className="flex items-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-gray-700 font-medium">
                  Show on Homepage
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Enable to display in banner
              </p>
            </div>
          </div>

          {/* Optional Link */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Link (Optional)
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => handleChange('link', e.target.value)}
              placeholder="https://example.com/details"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Add a link for "Read More" button
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl shadow-md p-6 border-2 border-dashed border-orange-200">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Bell size={20} className="text-orange-600" />
            Preview (English)
          </h2>
          <div className={`p-4 rounded-lg border-l-4 ${
            formData.type === 'info' ? 'bg-blue-50 border-blue-500' :
            formData.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
            formData.type === 'alert' ? 'bg-red-50 border-red-500' :
            'bg-green-50 border-green-500'
          }`}>
            <p className="font-bold text-gray-900">{formData.title.en || 'Title will appear here'}</p>
            <p className="text-gray-700 text-sm mt-1">{formData.message.en || 'Message will appear here'}</p>
            {formData.link && (
              <a href={formData.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
                Read More →
              </a>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {loading ? 'Saving...' : id ? 'Update Announcement' : 'Create Announcement'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/admin/announcements')}
            className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AnnouncementForm;
