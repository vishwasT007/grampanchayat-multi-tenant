import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Image as ImageIcon, MoveUp, MoveDown } from 'lucide-react';
import BilingualInput from '../../components/common/BilingualInput';
import { getSlides, updateSlides } from '../../services/slidesService';
import { uploadImage, deleteImage } from '../../services/storageService';

const SliderManagement = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const data = await getSlides();
      setSlides(data || []);
    } catch (error) {
      console.error('Error loading slides:', error);
      setMessage({ type: 'error', text: 'Failed to load slides' });
    } finally {
      setLoading(false);
    }
  };

  const addSlide = () => {
    setSlides([
      ...slides,
      {
        id: Date.now().toString(),
        image: '',
        title: { en: '', mr: '' },
        description: { en: '', mr: '' },
        order: slides.length,
      },
    ]);
  };

  const removeSlide = async (index) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    const slide = slides[index];
    
    // Delete image from storage if exists
    if (slide.image) {
      try {
        await deleteImage(slide.image);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    setSlides(slides.filter((_, i) => i !== index));
  };

  const moveSlide = (index, direction) => {
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    
    // Update order
    newSlides.forEach((slide, i) => {
      slide.order = i;
    });

    setSlides(newSlides);
  };

  const handleImageChange = async (index, file) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
      return;
    }

    try {
      // Show loading state
      const newSlides = [...slides];
      newSlides[index] = { ...newSlides[index], uploading: true };
      setSlides(newSlides);

      // Upload image
      const imageUrl = await uploadImage(file, 'slides');

      // Update slide
      newSlides[index] = { ...newSlides[index], image: imageUrl, uploading: false };
      setSlides(newSlides);

      setMessage({ type: 'success', text: 'Image uploaded successfully' });
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Failed to upload image' });
      
      // Remove loading state
      const newSlides = [...slides];
      newSlides[index] = { ...newSlides[index], uploading: false };
      setSlides(newSlides);
    }
  };

  const handleSlideChange = (index, field, value) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  const handleSave = async () => {
    // Validate
    const invalidSlides = slides.filter(s => !s.image);
    if (invalidSlides.length > 0) {
      setMessage({ type: 'error', text: 'All slides must have an image' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      await updateSlides(slides);

      setMessage({ type: 'success', text: 'Slides saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving slides:', error);
      setMessage({ type: 'error', text: 'Failed to save slides' });
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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Homepage Slider Management</h1>
          <p className="text-gray-600">Manage rotating banner images on the homepage</p>
        </div>
        <button
          onClick={addSlide}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus size={20} />
          Add Slide
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

      {/* Slides List */}
      <div className="space-y-6 mb-8">
        {slides.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No slides yet. Add your first slide to get started!</p>
            <button
              onClick={addSlide}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Add First Slide
            </button>
          </div>
        ) : (
          slides.map((slide, index) => (
            <div key={slide.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Slide {index + 1}</h3>
                <div className="flex items-center gap-2">
                  {/* Move buttons */}
                  <button
                    onClick={() => moveSlide(index, 'up')}
                    disabled={index === 0}
                    className="p-2 text-gray-600 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >
                    <MoveUp size={20} />
                  </button>
                  <button
                    onClick={() => moveSlide(index, 'down')}
                    disabled={index === slides.length - 1}
                    className="p-2 text-gray-600 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >
                    <MoveDown size={20} />
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={() => removeSlide(index)}
                    className="p-2 text-red-600 hover:text-red-700 transition-colors"
                    title="Delete slide"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slide Image * (Recommended: 1920x500px)
                  </label>
                  {slide.image ? (
                    <div className="relative group">
                      <img
                        src={slide.image}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <label className="px-4 py-2 bg-white text-gray-800 rounded cursor-pointer hover:bg-gray-100">
                          Change Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(index, e.target.files[0])}
                            className="hidden"
                            disabled={slide.uploading}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                      {slide.uploading ? (
                        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <ImageIcon size={40} className="text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Click to upload image</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(index, e.target.files[0])}
                        className="hidden"
                        disabled={slide.uploading}
                      />
                    </label>
                  )}
                </div>

                {/* Slide Details */}
                <div className="space-y-4">
                  <BilingualInput
                    label="Title (Optional)"
                    value={slide.title}
                    onChange={(value) => handleSlideChange(index, 'title', value)}
                    placeholder={{ en: 'Enter title in English', mr: 'मराठीत शीर्षक प्रविष्ट करा' }}
                  />

                  <BilingualInput
                    label="Description (Optional)"
                    value={slide.description}
                    onChange={(value) => handleSlideChange(index, 'description', value)}
                    placeholder={{ en: 'Enter description in English', mr: 'मराठीत वर्णन प्रविष्ट करा' }}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Save Button */}
      {slides.length > 0 && (
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
                Save All Slides
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SliderManagement;
