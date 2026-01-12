import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

const OfficialsManagement = () => {
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const officialsRef = collection(db, 'officials');
    const q = query(officialsRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const officialsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOfficials(officialsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching officials:', error);
        setError('Failed to load officials');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this official?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'officials', id));
    } catch (error) {
      console.error('Error deleting official:', error);
      alert('Failed to delete official');
    }
  };

  const moveOfficial = async (index, direction) => {
    const newOfficials = [...officials];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newOfficials.length) return;

    // Swap orders
    const currentOrder = newOfficials[index].order;
    const targetOrder = newOfficials[targetIndex].order;

    try {
      await Promise.all([
        updateDoc(doc(db, 'officials', newOfficials[index].id), {
          order: targetOrder
        }),
        updateDoc(doc(db, 'officials', newOfficials[targetIndex].id), {
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
          <p className="text-gray-600">Loading officials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Officials Showcase</h1>
          <p className="text-gray-600 mt-1">Manage officials displayed on homepage</p>
        </div>
        <Link
          to="/admin/officials/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Add Official
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Officials Grid */}
      {officials.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No officials yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first official</p>
          <Link
            to="/admin/officials/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            Add Official
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {officials.map((official, index) => (
            <div key={official.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Official Photo */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {official.photo ? (
                  <img
                    src={official.photo}
                    alt={official.name?.en || 'Official'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-center p-4">
                    <ImageIcon size={48} className="mx-auto mb-2" />
                    <p className="text-sm">No photo</p>
                  </div>
                )}
              </div>

              {/* Official Details */}
              <div className="p-4">
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">
                    {official.designation?.en || 'No designation'}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {official.name?.en || 'No name'}
                  </p>
                  {official.additionalInfo?.en && (
                    <p className="text-sm text-gray-600 mt-1">
                      {official.additionalInfo.en}
                    </p>
                  )}
                </div>

                {/* Order Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Order: {official.order}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveOfficial(index, 'up')}
                    disabled={index === 0}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUp size={18} />
                  </button>
                  <button
                    onClick={() => moveOfficial(index, 'down')}
                    disabled={index === officials.length - 1}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ArrowDown size={18} />
                  </button>
                  <div className="flex-1"></div>
                  <Link
                    to={`/admin/officials/edit/${official.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(official.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfficialsManagement;
