import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection, query, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebaseConfig';
import { getTenant } from '../../utils/tenant';
import { ArrowLeft, Upload, X } from 'lucide-react';

const OfficialForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    nameEn: '',
    nameMr: '',
    designationEn: '',
    designationMr: '',
    additionalInfoEn: '',
    additionalInfoMr: '',
    honorificEn: '',
    honorificMr: '',
    photo: '',
    order: 1
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      loadOfficial();
    } else {
      loadNextOrder();
    }
  }, [id]);

  const loadOfficial = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'officials', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          nameEn: data.name?.en || '',
          nameMr: data.name?.mr || '',
          designationEn: data.designation?.en || '',
          designationMr: data.designation?.mr || '',
          additionalInfoEn: data.additionalInfo?.en || '',
          additionalInfoMr: data.additionalInfo?.mr || '',
          honorificEn: data.honorific?.en || '',
          honorificMr: data.honorific?.mr || '',
          photo: data.photo || '',
          order: data.order || 1
        });
        setPhotoPreview(data.photo || '');
      } else {
        setError('Official not found');
      }
    } catch (error) {
      console.error('Error loading official:', error);
      setError('Failed to load official');
    } finally {
      setLoading(false);
    }
  };

  const loadNextOrder = async () => {
    try {
      const q = query(collection(db, 'officials'));
      const snapshot = await getDocs(q);
      const maxOrder = snapshot.docs.reduce((max, doc) => {
        const order = doc.data().order || 0;
        return order > max ? order : max;
      }, 0);
      setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
    } catch (error) {
      console.error('Error loading order:', error);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const uploadPhoto = async () => {
    if (!photoFile) return formData.photo;

    try {
      const tenant = getTenant();
      const fileName = `gramPanchayats/${tenant}/officials/${Date.now()}_${photoFile.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, photoFile);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw new Error('Failed to upload photo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nameEn || !formData.designationEn) {
      setError('Name and Designation (English) are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const photoURL = await uploadPhoto();

      const officialData = {
        name: {
          en: formData.nameEn,
          mr: formData.nameMr || formData.nameEn
        },
        designation: {
          en: formData.designationEn,
          mr: formData.designationMr || formData.designationEn
        },
        additionalInfo: {
          en: formData.additionalInfoEn,
          mr: formData.additionalInfoMr || formData.additionalInfoEn
        },
        honorific: {
          en: formData.honorificEn,
          mr: formData.honorificMr
        },
        photo: photoURL,
        order: parseInt(formData.order),
        updatedAt: new Date().toISOString()
      };

      if (isEdit) {
        await updateDoc(doc(db, 'officials', id), officialData);
      } else {
        officialData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'officials'), officialData);
      }

      navigate('/admin/officials');
    } catch (error) {
      console.error('Error saving official:', error);
      setError(error.message || 'Failed to save official');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/officials')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Officials
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Official' : 'Add New Official'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo *
          </label>
          <div className="flex items-start gap-4">
            <div className="w-40 h-40 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Upload size={32} className="text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Upload size={18} />
                Choose Photo
              </label>
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview('');
                    setFormData(prev => ({ ...prev, photo: '' }));
                  }}
                  className="ml-2 inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X size={18} />
                  Remove
                </button>
              )}
              <p className="text-sm text-gray-600 mt-2">
                Recommended: Square image, at least 300×300px, max 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name (English) *
            </label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name (Marathi)
            </label>
            <input
              type="text"
              value={formData.nameMr}
              onChange={(e) => setFormData({ ...formData, nameMr: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Designation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Designation (English) *
            </label>
            <input
              type="text"
              value={formData.designationEn}
              onChange={(e) => setFormData({ ...formData, designationEn: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Sarpanch"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Designation (Marathi)
            </label>
            <input
              type="text"
              value={formData.designationMr}
              onChange={(e) => setFormData({ ...formData, designationMr: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., सरपंच"
            />
          </div>
        </div>

        {/* Honorific */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Honorific (English)
            </label>
            <input
              type="text"
              value={formData.honorificEn}
              onChange={(e) => setFormData({ ...formData, honorificEn: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Shri, Smt."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Honorific (Marathi)
            </label>
            <input
              type="text"
              value={formData.honorificMr}
              onChange={(e) => setFormData({ ...formData, honorificMr: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., श्री, श्रीमती"
            />
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Info (English)
            </label>
            <input
              type="text"
              value={formData.additionalInfoEn}
              onChange={(e) => setFormData({ ...formData, additionalInfoEn: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Panchayat Leadership"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Info (Marathi)
            </label>
            <input
              type="text"
              value={formData.additionalInfoMr}
              onChange={(e) => setFormData({ ...formData, additionalInfoMr: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., पंचायत नेतृत्व"
            />
          </div>
        </div>

        {/* Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Order
          </label>
          <input
            type="number"
            min="1"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: e.target.value })}
            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-600 mt-1">Lower numbers appear first</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Saving...' : isEdit ? 'Update Official' : 'Add Official'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/officials')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfficialForm;
