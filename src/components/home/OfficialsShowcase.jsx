import { useLanguage } from '../../context/LanguageContext';

const OfficialsShowcase = ({ officials = [] }) => {
  const { getContent } = useLanguage();

  if (!officials || officials.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-12">
      <div className="mx-auto" style={{ maxWidth: '1200px', paddingLeft: '24px', paddingRight: '24px' }}>
        {/* Officials Grid - 3 columns with professional layout and centered incomplete rows */}
        <div 
          className="grid gap-x-16 gap-y-14 justify-items-center"
          style={{
            gridTemplateColumns: 'repeat(3, 1fr)',
            maxWidth: '900px',
            margin: '0 auto'
          }}
        >
          {officials.map((official, index) => (
            <div key={index} className="flex flex-col items-center w-full">
              {/* CIRCULAR IMAGE - 140px × 140px, 1.5px border */}
              <div 
                className="rounded-full bg-white overflow-hidden mb-4 flex-shrink-0"
                style={{
                  width: '140px',
                  height: '140px',
                  border: '1.5px solid #D1D5DB'
                }}
              >
                {official.photo ? (
                  <img
                    src={official.photo}
                    alt={getContent(official.name)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white text-4xl font-semibold text-gray-400">
                    {getContent(official.name)?.charAt(0)}
                  </div>
                )}
              </div>

              {/* TEXT BLOCK - Center aligned, professional typography */}
              <div className="text-center" style={{ maxWidth: '200px' }}>
                {/* DESIGNATION - 15px, 600 weight, professional color */}
                <p 
                  className="font-semibold text-center mb-2 leading-relaxed"
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#1F2937'
                  }}
                >
                  {getContent(official.designation)}
                </p>

                {/* NAME - 14px, 400 weight, subtle color */}
                <p 
                  className="text-center leading-relaxed"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#374151'
                  }}
                >
                  {getContent(official.name)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OfficialsShowcase;
