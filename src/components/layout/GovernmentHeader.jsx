import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Mic, Search, Eye } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const GovernmentHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, toggleLanguage, t, getContent } = useLanguage();
  const { settings: siteSettings, loading } = useSiteSettings();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/panchayat', label: t('nav.panchayat') },
    { path: '/services', label: t('nav.services') },
    { path: '/schemes', label: t('nav.schemes') },
    { path: '/downloads', label: t('nav.downloads') },
    { path: '/education', label: t('nav.education') },
    { path: '/gallery', label: t('nav.gallery') },
    { path: '/financials', label: t('nav.financials') },
    { path: '/village-statistics', label: language === 'en' ? 'Statistics' : 'सांख्यिकी' },
    { path: '/notices', label: t('nav.notices') },
    { path: '/contact', label: t('nav.contact') },
  ];

  const isActive = (path) => location.pathname === path;

  // Don't render header content until settings are loaded
  if (loading || !siteSettings) {
    return (
      <header className="sticky top-0 z-50 bg-white">
        <div className="h-36 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* 1️⃣ TOP UTILITY BAR - HEIGHT: 36px */}
      <div className="h-9 bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between">
        {/* LEFT SECTION */}
        <div className="flex items-center">
          {/* Indian Flag */}
          {siteSettings.headerLeftLogo ? (
            <img 
              src={siteSettings.headerLeftLogo} 
              alt="Flag" 
              className="w-6 h-4 mr-2 object-contain"
            />
          ) : (
            <div className="w-6 h-4 mr-2 bg-gradient-to-b from-[#FF9933] via-white to-[#138808] rounded-sm"></div>
          )}
          {/* Government Text */}
          <span className="text-[13px] font-medium text-[#374151]">
            {language === 'en' 
              ? 'GOVERNMENT OF MAHARASHTRA | महाराष्ट्र शासन' 
              : 'महाराष्ट्र शासन | GOVERNMENT OF MAHARASHTRA'}
          </span>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="text-[13px] font-medium text-[#374151] hover:text-[#F59E0B] transition-colors"
          >
            A | अ
          </button>
          {/* Accessibility Icon */}
          <button 
            className="text-[#374151] hover:text-[#F59E0B] transition-colors"
            aria-label="Accessibility"
          >
            <Eye className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      {/* 2️⃣ MAIN HEADER BAR - HEIGHT: 110px */}
      <div className="h-[110px] bg-white px-6 flex items-center justify-between">
        {/* LEFT BLOCK (LOGO + DEPARTMENT) */}
        <div className="flex items-center gap-3">
          {/* Ashoka Emblem */}
          {siteSettings.headerCenterEmblem ? (
            <img 
              src={siteSettings.headerCenterEmblem} 
              alt="Emblem" 
              className="w-14 h-14 object-contain"
            />
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-[#FF9933] to-[#138808] rounded-full flex items-center justify-center text-white text-xs font-bold">
              GP
            </div>
          )}

          {/* TEXT BLOCK */}
          <div>
            <h1 className="text-[20px] font-bold text-[#1F2937] leading-tight">
              {getContent(siteSettings.panchayatName) || 'Rural Development & Panchayat Raj Department'}
            </h1>
            <p className="text-[14px] font-medium text-[#374151] mt-0.5">
              {language === 'en' ? 'Government of Maharashtra' : 'महाराष्ट्र शासन'}
            </p>
          </div>
        </div>

        {/* CENTER BLOCK (SEARCH BAR) */}
        <div className="hidden lg:flex w-[420px] h-[42px] border-[1.5px] border-[#D97706] rounded-md px-3 items-center gap-2">
          <Mic className="w-[18px] h-[18px] text-[#111827] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search"
            className="flex-1 text-[14px] text-[#111827] placeholder-[#6B7280] bg-transparent outline-none border-none"
          />
          <Search className="w-[18px] h-[18px] text-[#111827] flex-shrink-0" />
        </div>

        {/* RIGHT BLOCK (GOVT LOGOS) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Golden Seal Image */}
          {siteSettings.headerRightLogo1 ? (
            <img 
              src={siteSettings.headerRightLogo1} 
              alt="Seal" 
              className="w-[60px] h-[60px] object-contain"
            />
          ) : (
            <div className="w-[60px] h-[60px] bg-gradient-to-br from-amber-400 to-amber-600 rounded-full"></div>
          )}

          {/* Azadi Ka Amrit Mahotsav Logo */}
          {siteSettings.headerRightLogo2 ? (
            <img 
              src={siteSettings.headerRightLogo2} 
              alt="Logo" 
              className="h-12 w-auto object-contain"
            />
          ) : (
            <div className="h-12 w-16 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] rounded"></div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden text-[#1F2937] p-2"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* NAVIGATION BAR */}
      <nav className="bg-[#F59E0B] shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-white bg-[#D97706]'
                    : 'text-white hover:bg-[#D97706] hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'text-white bg-[#D97706]'
                      : 'text-white hover:bg-[#D97706]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default GovernmentHeader;
