import { useLanguage } from '../../context/LanguageContext';

const OfficialsShowcase = ({ officials = [] }) => {
  const { getContent } = useLanguage();

  if (!officials || officials.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-12">
      <div className="mx-auto" style={{ maxWidth: '1200px', paddingLeft: '24px', paddingRight: '24px' }}>
        {/* Officials Grid - EXACT 3 columns, 64px gap horizontal, 56px gap vertical */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ columnGap: '64px', rowGap: '56px' }}>
          {officials.map((official, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* CIRCULAR IMAGE - 140px × 140px, 1.5px border */}
              <div 
                className="rounded-full bg-white overflow-hidden mb-4"
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

              {/* TEXT BLOCK - Center aligned */}
              <div className="text-center" style={{ maxWidth: '260px' }}>
                {/* DESIGNATION - 15px, 600 weight, #1F2937 */}
                <p 
                  className="font-semibold text-center mb-1.5"
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#1F2937',
                    lineHeight: '1.4'
                  }}
                >
                  {getContent(official.designation)}
                </p>

                {/* NAME - 14px, 400 weight, #374151 */}
                <p 
                  className="text-center"
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
