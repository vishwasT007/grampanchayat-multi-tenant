import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const location = useLocation();

  const navItems = [
    {
      id: "home",
      label: "Home",
      route: "/",
      active: true,
    },
    {
      id: "about",
      label: "About Us",
      route: "/about",
      hasDropdown: true,
      children: [
        {
          id: "overview",
          label: "Overview",
          route: "/about/overview",
        },
        {
          id: "organization",
          label: "Organization Structure",
          route: "/about/organization",
        },
      ],
    },
    {
      id: "directory",
      label: "Directory",
      route: "/directory",
    },
    {
      id: "report",
      label: "100 Day Program Report",
      route: "/100-day-report",
    },
    {
      id: "schemes",
      label: "Schemes",
      route: "/schemes",
      hasDropdown: true,
      children: [],
    },
    {
      id: "documents",
      label: "Documents",
      route: "/documents",
      hasDropdown: true,
      children: [],
    },
    {
      id: "notices",
      label: "Notices",
      route: "/notices",
      hasDropdown: true,
      children: [],
    },
    {
      id: "citizens-corner",
      label: "Citizen's Corner",
      route: "/citizens-corner",
      hasDropdown: true,
      children: [],
    },
    {
      id: "rts",
      label: "Right to Service (RTS)",
      route: "/rts",
    },
    {
      id: "rti",
      label: "RTI",
      route: "/rti",
      hasDropdown: true,
      children: [],
    },
  ];

  const currentRoute = location.pathname;

  const isItemActive = (item) => {
    // Check if the item itself is active
    if (currentRoute === item.route) {
      return true;
    }
    // Check if any child route is active (for dropdowns)
    if (item.children && item.children.length > 0) {
      return item.children.some((child) => currentRoute === child.route);
    }
    return false;
  };

  const isChildActive = (childRoute) => {
    return currentRoute === childRoute;
  };

  const toggleDropdown = (itemId) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenDropdowns({});
  };

  return (
    <nav className="w-full h-12 bg-[#f7f2ec] px-6 flex items-center justify-between relative">
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center w-full h-full">
        {navItems.map((item) => (
          <div key={item.id} className="relative group  h-full">
            {item.hasDropdown ? (
              <div className="relative h-full ">
                <button
                  onClick={() => toggleDropdown(item.id)}
                  className={`px-4 h-full  py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1 ${
                    isItemActive(item)
                      ? "bg-[#f5a300] text-white"
                      : "text-black hover:bg-[#f5a300] hover:text-white"
                  }`}
                >
                  {item.label}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      openDropdowns[item.id] ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openDropdowns[item.id] && (
                  <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md min-w-[200px] z-50 border border-gray-200">
                    {item.children && item.children.length > 0 ? (
                      item.children.map((child) => (
                        <Link
                          key={child.id}
                          to={child.route}
                          onClick={closeMobileMenu}
                          className={`block px-4 py-2 text-sm transition-colors ${
                            isChildActive(child.route)
                              ? "bg-[#f5a300] text-white"
                              : "text-black hover:bg-gray-100"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        No items available
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={item.route}
                className={`px-4 h-full  py-2 text-sm font-semibold transition-colors flex items-center justify-center ${
                  isItemActive(item)
                    ? "bg-[#f5a300] text-white"
                    : "text-black hover:bg-[#f5a300] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden p-2 text-black hover:text-[#f5a300] transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#f7f2ec] border-t border-gray-200 shadow-lg z-50 max-h-[calc(100vh-48px)] overflow-y-auto">
          <div className="flex flex-col">
            {navItems.map((item) => (
              <div key={item.id} className="border-b border-gray-200">
                {item.hasDropdown ? (
                  <div>
                    <button
                      onClick={() => toggleDropdown(item.id)}
                      className={`w-full px-6 py-3 text-left flex items-center justify-between text-sm font-semibold transition-colors ${
                        isItemActive(item)
                          ? "bg-[#f5a300] text-white"
                          : "text-black hover:bg-[#f5a300] hover:text-white"
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          openDropdowns[item.id] ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openDropdowns[item.id] && (
                      <div className="bg-white">
                        {item.children && item.children.length > 0 ? (
                          item.children.map((child) => (
                            <Link
                              key={child.id}
                              to={child.route}
                              onClick={closeMobileMenu}
                              className={`block px-8 py-2 text-sm transition-colors ${
                                isChildActive(child.route)
                                  ? "bg-[#f5a300] text-white"
                                  : "text-black hover:bg-gray-100"
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))
                        ) : (
                          <div className="px-8 py-2 text-sm text-gray-500">
                            No items available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.route}
                    onClick={closeMobileMenu}
                    className={`block px-6 py-3 text-sm font-semibold transition-colors ${
                      isItemActive(item)
                        ? "bg-[#f5a300] text-white"
                        : "text-black hover:bg-[#f5a300] hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
