import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Bell, AlertCircle } from 'lucide-react';
import { getAnnouncements, deleteAnnouncement, toggleAnnouncementStatus } from '../../services/announcementsService';
import { useLanguage } from '../../context/LanguageContext';

function AnnouncementsManagement() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { getContent } = useLanguage();

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error loading announcements:', error);
      alert('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteAnnouncement(id);
        setAnnouncements(announcements.filter(a => a.id !== id));
        alert('Announcement deleted successfully');
      } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('Failed to delete announcement');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleAnnouncementStatus(id, !currentStatus);
      setAnnouncements(announcements.map(a => 
        a.id === id ? { ...a, isActive: !currentStatus } : a
      ));
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update status');
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      getContent(announcement.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getContent(announcement.message).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'active' && announcement.isActive) ||
      (filterType === 'inactive' && !announcement.isActive) ||
      (filterType === announcement.type);

    return matchesSearch && matchesFilter;
  });

  const typeColors = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    alert: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800'
  };

  const priorityBadges = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-800'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="text-orange-600" />
            Announcements Management
          </h1>
          <p className="text-gray-600 mt-1">Manage scrolling announcements for homepage</p>
        </div>
        <Link
          to="/admin/announcements/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={20} />
          Add Announcement
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <p className="text-sm opacity-90 mb-1">Total</p>
          <p className="text-3xl font-bold">{announcements.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <p className="text-sm opacity-90 mb-1">Active</p>
          <p className="text-3xl font-bold">{announcements.filter(a => a.isActive).length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
          <p className="text-sm opacity-90 mb-1">Inactive</p>
          <p className="text-3xl font-bold">{announcements.filter(a => !a.isActive).length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
          <p className="text-sm opacity-90 mb-1">High Priority</p>
          <p className="text-3xl font-bold">{announcements.filter(a => a.priority === 'high').length}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="alert">Alert</option>
            <option value="success">Success</option>
          </select>
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">No announcements found</p>
            <Link
              to="/admin/announcements/new"
              className="inline-block mt-4 text-orange-600 hover:text-orange-700 font-semibold"
            >
              Create your first announcement
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Title & Message
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAnnouncements.map((announcement) => (
                  <tr key={announcement.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {getContent(announcement.title)}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {getContent(announcement.message)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${typeColors[announcement.type] || typeColors.info}`}>
                        {announcement.type === 'alert' && <AlertCircle size={14} />}
                        {announcement.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityBadges[announcement.priority] || priorityBadges.low}`}>
                        {announcement.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(announcement.id, announcement.isActive)}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          announcement.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {announcement.isActive ? (
                          <>
                            <Eye size={14} />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff size={14} />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/announcements/edit/${announcement.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(announcement.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnnouncementsManagement;
