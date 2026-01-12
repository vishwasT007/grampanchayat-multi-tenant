import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

const SliderManagement = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const slidersRef = collection(db, 'sliders');
    const q = query(slidersRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const slidersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSliders(slidersData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching sliders:', error);
        setError('Failed to load sliders');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slider?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'sliders', id));
    } catch (error) {
      console.error('Error deleting slider:', error);
      alert('Failed to delete slider');
    }
  };

  const moveSlider = async (index, direction) => {
    const newSliders = [...sliders];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSliders.length) return;

    const currentOrder = newSliders[index].order;
    const targetOrder = newSliders[targetIndex].order;

    try {
      await Promise.all([
        updateDoc(doc(db, 'sliders', newSliders[index].id), {
          order: targetOrder
        }),
        updateDoc(doc(db, 'sliders', newSliders[targetIndex].id), {
          order: currentOrder
        })
      ]);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sliders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Home Slider Management</h1>
          <p className="text-gray-600 mt-1">Manage rotating banner images on the home page</p>
        </div>
        <Link
          to="/admin/sliders/new"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <Plus size={20} />
          Add Slider
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Sliders Grid */}
      {sliders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sliders yet</h3>
          <p className="text-gray-600 mb-6">Create your first slider to display on the home page</p>
          <Link
            to="/admin/sliders/new"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Create First Slider
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sliders.map((slider, index) => (
            <div key={slider.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Slider Image Preview */}
              <div className="relative h-40 bg-gray-200 overflow-hidden">
                {slider.image ? (
                  <img
                    src={slider.image}
                    alt={slider.title?.en || 'Slider'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {slider.title?.en || 'Untitled'}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {slider.description?.en || 'No description'}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <span className="bg-gray-100 px-2 py-1 rounded">Order: {slider.order}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/sliders/edit/${slider.id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded transition-colors text-sm font-medium"
                    >
                      <Edit size={16} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(slider.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded transition-colors text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>

                  {/* Reorder Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => moveSlider(index, 'up')}
                      disabled={index === 0}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 px-3 py-2 rounded transition-colors text-sm font-medium"
                      title="Move up"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => moveSlider(index, 'down')}
                      disabled={index === sliders.length - 1}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 px-3 py-2 rounded transition-colors text-sm font-medium"
                      title="Move down"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SliderManagement;
