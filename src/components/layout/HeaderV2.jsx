import { useState, useEffect } from "react";
import {
  Search,
  Mic,
  SkipForward,
  Globe,
  Minus,
  Plus,
  Accessibility,
} from "lucide-react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useLanguage } from "../../context/LanguageContext";

const HeaderV2 = () => {
  const { language, toggleLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [headerText, setHeaderText] = useState({
    marathi: "ग्राम विकास व पंचायत राज विभाग",
    english: "Rural Development & Panchayat Raj Department",
    subtext: "Government Of Maharashtra"
  });

  useEffect(() => {
    // Load accessibility font size settings from localStorage
    const savedFontSize = localStorage.getItem("accessibility_fontSize");
    
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, []);

  useEffect(() => {
    // Apply font size to document
    document.documentElement.style.fontSize = fontSize + "px";
    localStorage.setItem("accessibility_fontSize", fontSize);
  }, [fontSize]);

  useEffect(() => {
    const docRef = doc(db, "headerConfig", "main");
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setHeaderText({
            marathi: data.marathi || "ग्राम विकास व पंचायत राज विभाग",
            english: data.english || "Rural Development & Panchayat Raj Department",
            subtext: data.subtext || "Government Of Maharashtra"
          });
        }
      },
      (error) => {
        console.log("Using default header text:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const handleMicClick = () => {
    console.log("Voice search activated");
  };

  const handleDecreaseFontSize = () => {
    setFontSize(prev => Math.max(12, prev - 2));
  };

  const handleIncreaseFontSize = () => {
    setFontSize(prev => Math.min(24, prev + 2));
  };

  const skipToMainContent = () => {
    const mainContent = document.querySelector("main") || document.querySelector("body");
    mainContent?.focus();
    mainContent?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Top Header */}
      <div className="w-full bg-white h-auto md:h-10 border-b border-[#e5e5e5] px-3 sm:px-4 md:px-6 py-2 md:py-0 flex flex-wrap md:flex-row items-center justify-between gap-2 md:gap-0">
        {/* Left Section */}
        <section id="top-left" className="flex items-center gap-[6px] sm:gap-[10px] text-xs sm:text-sm">
          <img
            src="https://rdd.maharashtra.gov.in/wp-content/themes/sdo-theme/images/flag.svg"
            alt="Indian Flag"
            className="object-contain hidden sm:block"
            style={{
              width: "clamp(20px, 4vw, 28px)",
              height: "clamp(12px, 2.5vw, 18px)",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div
            className="text-black whitespace-nowrap"
            style={{
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            महाराष्ट्र शासन
          </div>
          <div
            className="bg-[#cccccc] hidden sm:block"
            style={{
              width: "1px",
              height: "clamp(16px, 3vw, 20px)",
            }}
          />
          <div
            className="text-black whitespace-nowrap hidden sm:block"
            style={{
              fontSize: "clamp(11px, 2vw, 13px)",
              fontWeight: 600,
            }}
          >
            GOVERNMENT OF MAHARASHTRA
          </div>
        </section>

        {/* Right Section */}
        <section id="top-right" className="flex items-center gap-2 sm:gap-[14px]">
          <button
            onClick={skipToMainContent}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            aria-label="Skip to main content"
            title="Skip to main content"
          >
            <SkipForward size={16} className="text-gray-700" />
          </button>
          
          <button
            onClick={toggleLanguage}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors relative group"
            aria-label={`Change language to ${language === "en" ? "Marathi" : "English"}`}
            title={`Language: ${language === "en" ? "English" : "Marathi"}`}
          >
            <Globe size={16} className="text-gray-700" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              {language === "en" ? "EN" : "MR"}
            </span>
          </button>
          
          <button
            onClick={handleDecreaseFontSize}
            disabled={fontSize <= 12}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Decrease font size"
            title="Decrease font size"
          >
            <Minus size={16} className="text-gray-700" />
          </button>
          
          <span className="text-xs text-gray-600 px-1 min-w-[24px] text-center font-semibold">
            {fontSize}
          </span>
          
          <button
            onClick={handleIncreaseFontSize}
            disabled={fontSize >= 24}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Increase font size"
            title="Increase font size"
          >
            <Plus size={16} className="text-gray-700" />
          </button>
          
          <button
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            aria-label="Accessibility options"
            title="Accessibility options"
          >
            <Accessibility size={16} className="text-gray-700" />
          </button>
        </section>
      </div>

      {/* Main Header */}
      <header className="w-full relative flex flex-wrap items-center justify-between bg-white min-h-auto md:min-h-[90px] pt-3 pb-3 px-3 sm:px-4 md:px-[clamp(12px,2vw,24px)] gap-4">
        {/* Left Section - Branding */}
        <section
          id="left"
          className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0 order-1 sm:order-1"
        >
          <img
            src="https://rdd.maharashtra.gov.in/wp-content/themes/sdo-theme/images/emblem.svg"
            alt="Government Emblem"
            className="object-contain"
            style={{
              width: "clamp(40px, 10vw, 55px)",
              height: "clamp(50px, 12vw, 70px)",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div className="hidden md:flex flex-col gap-1">
            {language === "mr" && (
              <>
                <div
                  className="whitespace-nowrap leading-tight text-black"
                  style={{
                    fontSize: "clamp(12px, 1.5vw, 14px)",
                    fontWeight: 500,
                  }}
                >
                  शासन
                </div>
                <div
                  className="whitespace-nowrap leading-tight text-black"
                  style={{
                    fontSize: "clamp(14px, 2.2vw, 18px)",
                    fontWeight: 700,
                  }}
                >
                  {headerText.marathi}
                </div>
                <div
                  className="whitespace-nowrap leading-tight text-black"
                  style={{
                    fontSize: "clamp(12px, 1.8vw, 14px)",
                    fontWeight: 600,
                  }}
                >
                  महाराष्ट्र सरकार
                </div>
              </>
            )}
            
            {language === "en" && (
              <>
                <div
                  className="whitespace-nowrap leading-tight text-black"
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  {headerText.marathi}
                </div>
                <div
                  className="whitespace-nowrap leading-tight text-black"
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                  }}
                >
                  {headerText.english}
                </div>
                <div
                  className="whitespace-nowrap leading-tight text-black"
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {headerText.subtext}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Center Section - Search */}
        <section
          id="center"
          className="hidden lg:flex items-center justify-center flex-1 mx-6 order-3 lg:order-2"
        >
          <form
            onSubmit={handleSearch}
            className="relative w-full"
            style={{
              maxWidth: "520px",
            }}
          >
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 rounded-lg border-2 border-solid pl-4 pr-[100px] text-base outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
              style={{
                borderColor: "#d6a23c",
              }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleMicClick}
                className="flex items-center justify-center w-8 h-8 rounded-full border-0 bg-transparent cursor-pointer hover:bg-yellow-50 transition-colors"
                style={{
                  color: "#d6a23c",
                }}
                aria-label="Voice search"
              >
                <Mic size={18} />
              </button>
              <button
                type="submit"
                className="flex items-center justify-center w-8 h-8 rounded-full border-0 bg-transparent cursor-pointer hover:bg-yellow-50 transition-colors"
                style={{
                  color: "#d6a23c",
                }}
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </div>
          </form>
        </section>

        {/* Right Section - Logos */}
        <section
          id="right"
          className="hidden 2xl:flex items-center gap-4 flex-shrink-0 order-4"
        >
          <img
            src="https://cdnbbsr.s3waas.gov.in/s3e6c2dc3dee4a51dcec3a876aa2339a78/uploads/2023/07/2023072135.png"
            alt="State Seal"
            className="object-contain"
            style={{
              width: "70px",
              height: "70px",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <img
            src="https://cdnbbsr.s3waas.gov.in/s3e6c2dc3dee4a51dcec3a876aa2339a78/uploads/2023/07/2023072114.png"
            alt="Azadi Ka Amrit Mahotsav"
            className="object-contain"
            style={{
              width: "110px",
              height: "55px",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </section>

        {/* Mobile Search Toggle */}
        <div className="lg:hidden flex items-center gap-2 order-2 md:order-3">
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Mobile Search Bar */}
        {isMobileSearchOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 p-4 z-50 shadow-lg">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 rounded-lg border-2 border-solid pl-4 pr-[100px] text-base outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
                style={{
                  borderColor: "#d6a23c",
                }}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMicClick}
                  className="p-2 hover:bg-yellow-50 rounded-full transition-colors"
                  aria-label="Voice search"
                >
                  <Mic size={18} color="#d6a23c" />
                </button>
                <button
                  type="submit"
                  className="p-2 hover:bg-yellow-50 rounded-full transition-colors"
                  aria-label="Search"
                >
                  <Search size={18} color="#d6a23c" />
                </button>
              </div>
            </form>
          </div>
        )}
      </header>
    </>
  );
};

export default HeaderV2;
