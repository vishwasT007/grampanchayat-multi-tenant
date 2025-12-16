import { useState, useEffect } from 'react';
import { X, ExternalLink, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { getActiveAnnouncements } from '../services/announcementsService';
import { useLanguage } from '../context/LanguageContext';

function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { getContent } = useLanguage();

  useEffect(() => {
    loadAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 5000); // Change announcement every 5 seconds

      return () => clearInterval(interval);
    }
  }, [announcements.length]);

  const loadAnnouncements = async () => {
    try {
      const data = await getActiveAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || announcements.length === 0) {
    return null;
  }

  const announcement = announcements[currentIndex];
  
  const typeStyles = {
    info: {
      bg: 'bg-blue-500',
      icon: Info
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: AlertTriangle
    },
    alert: {
      bg: 'bg-red-500',
      icon: AlertCircle
    },
    success: {
      bg: 'bg-green-500',
      icon: CheckCircle
    }
  };

  const style = typeStyles[announcement?.type] || typeStyles.info;
  const Icon = style.icon;

  return (
    <div className={`${style.bg} text-white shadow-lg relative overflow-hidden`}>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 relative z-10">
        <div className="flex items-center justify-between gap-4">
          {/* Icon and Content */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Icon className="flex-shrink-0 animate-pulse" size={24} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-sm sm:text-base">
                  {getContent(announcement.title)}
                </p>
                <span className="text-white/80 text-sm hidden sm:inline">•</span>
                <p className="text-white/90 text-sm">
                  {getContent(announcement.message)}
                </p>
              </div>
            </div>
          </div>

          {/* Link and Close */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {announcement.link && (
              <a
                href={announcement.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors backdrop-blur-sm"
              >
                <span className="hidden sm:inline">Read More</span>
                <ExternalLink size={14} />
              </a>
            )}
            
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Pagination Dots (if multiple announcements) */}
        {announcements.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-2">
            {announcements.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-6 bg-white'
                    : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
                title={`Announcement ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnnouncementsBanner;
