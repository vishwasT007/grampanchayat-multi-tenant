import { useState } from "react";
import {
  Search,
  Mic,
  SkipForward,
  Headphones,
  Minus,
  Plus,
  Accessibility,
} from "lucide-react";

const HeaderV2 = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search logic here
    console.log("Searching for:", searchQuery);
  };

  const handleMicClick = () => {
    // Handle mic/voice search logic here
    console.log("Voice search activated");
  };

  return (
    <>
      {/* Top Header */}
      <div className="w-full bg-white h-10 border-b border-[#e5e5e5] px-6 flex items-center justify-between">
        {/* Left Section */}
        <section id="top-left" className="flex items-center gap-[10px]">
          <img
            src="https://rdd.maharashtra.gov.in/wp-content/themes/sdo-theme/images/flag.svg"
            alt="Indian Flag"
            className="object-contain"
            style={{
              width: "28px",
              height: "18px",
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
            className="bg-[#cccccc]"
            style={{
              width: "1px",
              height: "20px",
            }}
          />
          <div
            className="text-black whitespace-nowrap"
            style={{
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            GOVERNMENT OF MAHARASHTRA
          </div>
        </section>

        {/* Right Section */}
        <section id="top-right" className="flex items-center gap-[14px]">
          <button
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            aria-label="Skip to main content"
            title="Skip to main content"
          >
            <SkipForward size={16} className="text-gray-700" />
          </button>
          <button
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            aria-label="Screen reader access"
            title="Screen reader access"
          >
            <Headphones size={16} className="text-gray-700" />
          </button>
          <button
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            aria-label="Decrease font size"
            title="Decrease font size"
          >
            <Minus size={16} className="text-gray-700" />
          </button>
          <button
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
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
      <header className="w-full relative flex items-center justify-between bg-white min-h-[90px] pt-3 pb-3 px-[clamp(12px,2vw,24px)]">
        {/* Left Section - Branding */}
        <section
          id="left"
          className="flex items-center gap-3 flex-shrink-0 min-w-0"
        >
          <img
            src="https://rdd.maharashtra.gov.in/wp-content/themes/sdo-theme/images/emblem.svg"
            alt="Government Emblem"
            className="object-contain"
            style={{
              width: "55px",
              height: "70px",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div className="hidden sm:flex flex-col gap-1">
            <div
              className="whitespace-nowrap leading-tight text-black"
              style={{
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              ग्राम विकास व पंचायत राज विभाग
            </div>
            <div
              className="whitespace-nowrap leading-tight text-black"
              style={{
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              Rural Development & Panchayat Raj Department
            </div>
            <div
              className="whitespace-nowrap leading-tight text-black"
              style={{
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Government Of Maharashtra
            </div>
          </div>
        </section>

        {/* Center Section - Search */}
        <section
          id="center"
          className="hidden md:flex items-center justify-center flex-1 mx-6"
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
          className="hidden lg:flex items-center gap-4 flex-shrink-0"
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
        <div className="md:hidden flex items-center gap-2">
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
