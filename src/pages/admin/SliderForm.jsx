import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection, query, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebaseConfig';
import { getTenant } from '../../utils/tenant';
import { ArrowLeft, Upload, X } from 'lucide-react';

const SliderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    titleEn: '',
    titleMr: '',
    descriptionEn: '',
    descriptionMr: '',
    image: '',
    order: 1
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      loadSlider();
    } else {
      loadNextOrder();
    }
  }, [id]);

  const loadSlider = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'sliders', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          titleEn: data.title?.en || '',
          titleMr: data.title?.mr || '',
          descriptionEn: data.description?.en || '',
          descriptionMr: data.description?.mr || '',
          image: data.image || '',
          order: data.order || 1
        });
        setImagePreview(data.image || '');
      } else {
        setError('Slider not found');
      }
    } catch (error) {
      console.error('Error loading slider:', error);
      setError('Failed to load slider');
    } finally {
      setLoading(false);
    }
  };

  const loadNextOrder = async () => {
    try {
      const q = query(collection(db, 'sliders'));
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.image;

    try {
      const tenant = getTenant();
      const fileName = `gramPanchayats/${tenant}/sliders/${Date.now()}_${imageFile.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imagePreview) {
      setError('Image is required');
      return;
    }

    if (!formData.titleEn) {
      setError('Title (English) is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const imageURL = await uploadImage();

      const sliderData = {
        title: {
          en: formData.titleEn,
          mr: formData.titleMr || formData.titleEn
        },
        description: {
          en: formData.descriptionEn,
          mr: formData.descriptionMr || formData.descriptionEn
        },
        image: imageURL,
        order: parseInt(formData.order),
        updatedAt: new Date().toISOString()
      };

      if (isEdit) {
        await updateDoc(doc(db, 'sliders', id), sliderData);
      } else {
        sliderData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'sliders'), sliderData);
      }

      navigate('/admin/sliders');
    } catch (error) {
      console.error('Error saving slider:', error);
      setError(error.message || 'Failed to save slider');
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
          onClick={() => navigate('/admin/sliders')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Sliders
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Slider' : 'Add New Slider'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Slider Image * (Recommended: 1920×500px)
          </label>
          
          {imagePreview ? (
            <div className="relative group mb-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg border border-gray-200"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <label className="px-4 py-2 bg-white text-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors font-medium">
                  Change Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-600 hover:bg-primary-50 transition-colors mb-4">
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700">Click to upload image</span>
              <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Text Fields Section */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (English) *
            </label>
            <input
              type="text"
              value={formData.titleEn}
              onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              placeholder="Enter title in English"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (Marathi)
            </label>
            <input
              type="text"
              value={formData.titleMr}
              onChange={(e) => setFormData({ ...formData, titleMr: e.target.value })}
              placeholder="मराठीत शीर्षक"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (English)
            </label>
            <textarea
              value={formData.descriptionEn}
              onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              placeholder="Enter description in English"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Marathi)
            </label>
            <textarea
              value={formData.descriptionMr}
              onChange={(e) => setFormData({ ...formData, descriptionMr: e.target.value })}
              placeholder="मराठीत वर्णन"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-colors resize-none"
            />
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/sliders')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
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
                <Upload size={18} />
                {isEdit ? 'Update Slider' : 'Create Slider'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SliderForm;
