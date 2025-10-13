import React from 'react';

interface AboutProps {
  language?: 'pt' | 'en' | 'es';
}

export const About: React.FC<AboutProps> = ({ language = 'pt' }) => {
  const titleByLang: Record<string, string> = {
    pt: 'Sobre Mim',
    en: 'About Me',
    es: 'Sobre Mí'
  };

  return (
    <section 
      id="sobre"
      className="relative w-full bg-gradient-to-br from-[#7D44FF] via-[#8B4FFF] to-[#9C5EFF] py-20 md:py-32 lg:py-40"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        <h2 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-[var(--font-montserrat)] text-white text-center"
          style={{
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}
        >
          {titleByLang[language]}
        </h2>
      </div>
    </section>
  );
};
