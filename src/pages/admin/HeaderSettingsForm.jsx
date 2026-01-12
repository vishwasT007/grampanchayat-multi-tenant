import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { Save, Eye } from 'lucide-react';

const HeaderSettingsForm = () => {
  const [formData, setFormData] = useState({
    marathi: '',
    english: '',
    subtext: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadHeaderSettings();
  }, []);

  const loadHeaderSettings = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'headerConfig', 'main');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          marathi: data.marathi || '',
          english: data.english || '',
          subtext: data.subtext || ''
        });
      }
    } catch (error) {
      console.error('Error loading header settings:', error);
      setMessage({ type: 'error', text: 'Failed to load header settings' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.marathi.trim() || !formData.english.trim()) {
      setMessage({ type: 'error', text: 'Marathi and English text are required' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: '', text: '' });

      const docRef = doc(db, 'headerConfig', 'main');
      await setDoc(docRef, {
        marathi: formData.marathi.trim(),
        english: formData.english.trim(),
        subtext: formData.subtext.trim(),
        updatedAt: new Date().toISOString()
      });

      setMessage({ type: 'success', text: 'Header settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving header settings:', error);
      setMessage({ type: 'error', text: 'Failed to save header settings' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading header settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Header Settings</h1>
        <p className="text-gray-600 mt-2">Manage the main header text and branding information displayed on every page</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Marathi Text */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Department Name (Marathi) *
          </label>
          <textarea
            value={formData.marathi}
            onChange={(e) => handleChange('marathi', e.target.value)}
            placeholder="उदाहरण: ग्राम विकास व पंचायत राज विभाग"
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-colors resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">This will be displayed in Marathi</p>
        </div>

        {/* English Text */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Department Name (English) *
          </label>
          <textarea
            value={formData.english}
            onChange={(e) => handleChange('english', e.target.value)}
            placeholder="Example: Rural Development & Panchayat Raj Department"
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-colors resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">This will be displayed in English</p>
        </div>

        {/* Subtext */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Subtext (English)
          </label>
          <input
            type="text"
            value={formData.subtext}
            onChange={(e) => handleChange('subtext', e.target.value)}
            placeholder="Example: Government Of Maharashtra"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-colors"
          />
          <p className="text-xs text-gray-500 mt-2">Optional: Additional subtitle text</p>
        </div>

        {/* Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye size={18} />
            Preview
          </h3>
          <div className="bg-white rounded p-4 space-y-2">
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#000' }}>
              {formData.marathi || '(Marathi text will appear here)'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#000' }}>
              {formData.english || '(English text will appear here)'}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#000' }}>
              {formData.subtext || '(Subtext will appear here)'}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="reset"
            onClick={loadHeaderSettings}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Header Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HeaderSettingsForm;
