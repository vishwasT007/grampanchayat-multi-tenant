import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Image as ImageIcon, Edit2 } from 'lucide-react';
import BilingualInput from '../../components/common/BilingualInput';
import { getOfficials, updateOfficials } from '../../services/officialsService';
import { uploadImage, deleteImage } from '../../services/storageService';

const OfficialsManagement = () => {
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadOfficials();
  }, []);

  const loadOfficials = async () => {
    try {
      setLoading(true);
      const data = await getOfficials();
      setOfficials(data || []);
    } catch (error) {
      console.error('Error loading officials:', error);
      setMessage({ type: 'error', text: 'Failed to load officials' });
    } finally {
      setLoading(false);
    }
  };

  const addOfficial = () => {
    const newOfficial = {
      id: Date.now().toString(),
      name: { en: '', mr: '' },
      honorific: { en: 'Shri.', mr: 'श्री.' },
      designation: { en: '', mr: '' },
      additionalInfo: { en: '', mr: '' },
      photo: '',
      order: officials.length,
    };
    setOfficials([...officials, newOfficial]);
    setEditingIndex(officials.length);
  };

  const removeOfficial = async (index) => {
    if (!confirm('Are you sure you want to delete this official?')) return;

    const official = officials[index];
    
    // Delete photo from storage if exists
    if (official.photo) {
      try {
        await deleteImage(official.photo);
      } catch (error) {
        console.error('Error deleting photo:', error);
      }
    }

    setOfficials(officials.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const handlePhotoChange = async (index, file) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 2MB' });
      return;
    }

    try {
      // Show loading state
      const newOfficials = [...officials];
      newOfficials[index] = { ...newOfficials[index], uploading: true };
      setOfficials(newOfficials);

      // Upload image
      const imageUrl = await uploadImage(file, 'officials');

      // Update official
      newOfficials[index] = { ...newOfficials[index], photo: imageUrl, uploading: false };
      setOfficials(newOfficials);

      setMessage({ type: 'success', text: 'Photo uploaded successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setMessage({ type: 'error', text: 'Failed to upload photo' });
      
      // Remove loading state
      const newOfficials = [...officials];
      newOfficials[index] = { ...newOfficials[index], uploading: false };
      setOfficials(newOfficials);
    }
  };

  const handleOfficialChange = (index, field, value) => {
    const newOfficials = [...officials];
    newOfficials[index] = { ...newOfficials[index], [field]: value };
    setOfficials(newOfficials);
  };

  const handleSave = async () => {
    // Validate
    const invalidOfficials = officials.filter(o => !o.name.en || !o.designation.en);
    if (invalidOfficials.length > 0) {
      setMessage({ type: 'error', text: 'Please fill in name and designation for all officials' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      await updateOfficials(officials);

      setMessage({ type: 'success', text: 'Officials saved successfully!' });
      setEditingIndex(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving officials:', error);
      setMessage({ type: 'error', text: 'Failed to save officials' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Government Officials Management</h1>
          <p className="text-gray-600">Manage ministers, secretaries, and other government officials displayed on homepage</p>
        </div>
        <button
          onClick={addOfficial}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus size={20} />
          Add Official
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Officials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {officials.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No officials yet. Add your first official to get started!</p>
            <button
              onClick={addOfficial}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Add First Official
            </button>
          </div>
        ) : (
          officials.map((official, index) => (
            <div key={official.id} className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
              editingIndex === index ? 'border-orange-500' : 'border-gray-200'
            }`}>
              {/* Photo Section */}
              <div className="relative bg-gradient-to-br from-orange-50 to-green-50 aspect-[3/4]">
                {official.photo ? (
                  <div className="relative group h-full">
                    <img
                      src={official.photo}
                      alt={official.name.en}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="px-4 py-2 bg-white text-gray-800 rounded cursor-pointer hover:bg-gray-100">
                        Change Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoChange(index, e.target.files[0])}
                          className="hidden"
                          disabled={official.uploading}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-orange-100/50 transition-colors">
                    {official.uploading ? (
                      <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <ImageIcon size={48} className="text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Click to upload photo</span>
                        <span className="text-xs text-gray-500 mt-1">Recommended: 300x400px</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(index, e.target.files[0])}
                      className="hidden"
                      disabled={official.uploading}
                    />
                  </label>
                )}
              </div>

              {/* Info Section */}
              <div className="p-4">
                {editingIndex === index ? (
                  <div className="space-y-3">
                    {/* Honorific */}
                    <BilingualInput
                      label="Honorific"
                      value={official.honorific}
                      onChange={(value) => handleOfficialChange(index, 'honorific', value)}
                      placeholder={{ en: 'Shri./Hon\'ble', mr: 'श्री./मा.' }}
                    />

                    {/* Name */}
                    <BilingualInput
                      label="Name *"
                      value={official.name}
                      onChange={(value) => handleOfficialChange(index, 'name', value)}
                      placeholder={{ en: 'Full Name', mr: 'पूर्ण नाव' }}
                    />

                    {/* Designation */}
                    <BilingualInput
                      label="Designation *"
                      value={official.designation}
                      onChange={(value) => handleOfficialChange(index, 'designation', value)}
                      placeholder={{ en: 'Chief Minister / Minister / Secretary', mr: 'मुख्यमंत्री / मंत्री / सचिव' }}
                    />

                    {/* Additional Info */}
                    <BilingualInput
                      label="Additional Info"
                      value={official.additionalInfo}
                      onChange={(value) => handleOfficialChange(index, 'additionalInfo', value)}
                      placeholder={{ en: 'Department / Ministry', mr: 'विभाग / मंत्रालय' }}
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => removeOfficial(index)}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
                      {official.honorific.en} {official.name.en || 'Unnamed Official'}
                    </h3>
                    <p className="text-xs text-orange-600 font-semibold mb-1 line-clamp-2">
                      {official.designation.en || 'No designation'}
                    </p>
                    {official.additionalInfo.en && (
                      <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                        {official.additionalInfo.en}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingIndex(index)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 transition-colors text-sm"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => removeOfficial(index)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Save Button */}
      {officials.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save All Officials
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default OfficialsManagement;
