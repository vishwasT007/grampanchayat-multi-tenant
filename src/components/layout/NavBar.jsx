import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { language } = useLanguage();

  const navItems = [
    { path: "/", labelEn: "Home", labelMr: "घर" },
    { path: "/about", labelEn: "About Village", labelMr: "गावाबद्दल" },
    { path: "/panchayat", labelEn: "Gram Panchayat", labelMr: "ग्राम पंचायत" },
    { path: "/services", labelEn: "Services", labelMr: "सेवा" },
    { path: "/schemes", labelEn: "Schemes", labelMr: "योजना" },
    { path: "/downloads", labelEn: "Forms & Downloads", labelMr: "अर्ज व डाउनलोड" },
    { path: "/education", labelEn: "Education & Anganwadi", labelMr: "शिक्षा व अंगणवाडी" },
    { path: "/gallery", labelEn: "Gallery", labelMr: "गॅलरी" },
    { path: "/financials", labelEn: "Financials", labelMr: "आर्थिक" },
    { path: "/village-statistics", labelEn: "Statistics", labelMr: "आकडेवारी" },
    { path: "/notices", labelEn: "Notices & Tenders", labelMr: "सूचना व निविदा" },
    { path: "/contact", labelEn: "Contact", labelMr: "संपर्क" },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getLabel = (item) => {
    return language === "mr" ? item.labelMr : item.labelEn;
  };

  return (
    <nav className="bg-gradient-to-r from-blue-900 via-gray-800 to-blue-900 w-full sticky top-0 z-50 shadow-md">
      {/* Desktop Navigation */}
      <div className="hidden md:block w-full px-4 md:px-6 lg:px-8">
        <ul className="flex flex-row items-center justify-center gap-0.5">
          {navItems.map((item) => (
            <li key={item.path} className="relative group">
              <Link
                to={item.path}
                className={`block px-3 lg:px-4 py-2.5 text-white font-medium transition-all relative overflow-hidden text-sm ${
                  isActive(item.path) 
                    ? "bg-orange-600 lg:bg-transparent" 
                    : "hover:bg-white/10"
                }`}
              >
                {/* Active Indicator */}
                {isActive(item.path) && (
                  <span className="hidden lg:block absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"></span>
                )}
                
                {/* Hover Effect */}
                <span className="hidden lg:block absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                
                <span className="relative z-10">{getLabel(item)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden px-4 py-2">
        <button
          onClick={toggleMobileMenu}
          className="flex items-center justify-between w-full p-2 text-white hover:bg-white/10 rounded transition-colors"
          aria-label="Toggle navigation menu"
        >
          <span className="font-medium text-sm">Menu</span>
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile Menu Items */}
        {isMobileMenuOpen && (
          <div className="mt-2 bg-blue-900/50 rounded-lg overflow-hidden">
            <ul className="flex flex-col">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-sm font-medium transition-colors border-b border-blue-800/30 ${
                      isActive(item.path)
                        ? "bg-orange-600 text-white"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    {getLabel(item)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
