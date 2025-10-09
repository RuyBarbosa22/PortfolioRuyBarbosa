import React from 'react';
import { TypewriterText } from '../TypewriterText/TypewriterText';

interface HeroLeftProps {
  onPrimaryClick?: () => void;
  language?: 'pt' | 'en' | 'es';
}

export const HeroLeft: React.FC<HeroLeftProps> = ({ onPrimaryClick, language = 'pt' }) => {
  // translations and typewriter words
  const wordsByLang: Record<string, string[]> = {
    pt: ['Frontend', 'Backend', 'Cloud', 'Fullstack'],
    en: ['Frontend Developer', 'Backend Developer', 'Cloud Engineer', 'Fullstack Developer'],
    es: ['Frontend', 'Backend', 'Cloud', 'Fullstack']
  };

  const greetingByLang: Record<string, string> = {
    pt: 'Olá, me chamo',
    en: 'Hi, my name is',
    es: 'Hola, me llamo'
  };

  const ctaPrimary = language === 'pt' ? 'Vamos conversar 💬' : language === 'es' ? 'Hablemos 💬' : "Let's talk 💬";
  const ctaDownload = language === 'pt' ? 'Download CV' : language === 'es' ? 'Descargar CV' : 'Download CV';
  return (
    <div className="text-center lg:text-left flex flex-col xl:flex-1 max-w-[800px] md:items-center lg:items-start xl:justify-center xl:pr-8">
      <div className="w-full flex flex-col items-center lg:items-start mt-8 md:mt-0">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-[var(--font-montserrat)] leading-[1.4] pb-2 overflow-visible text-center lg:text-left">
          {greetingByLang[language]}{' '}
          <span
            className="bg-gradient-radial from-[#E204F5] via-[#CC12F7] to-[#7D44FF] bg-clip-text text-transparent"
            style={{
              background:
                'radial-gradient(circle, #E204F5 0%, #CC12F7 22%, #B321FA 46%, #9733FC 74%, #7D44FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Ruy
          </span>
          .
        </h1>

        <h2
          className="
            text-2xl sm:text-3xl md:text-4xl lg:text-5xl
            font-bold font-[var(--font-montserrat)]
            leading-[1.4] pb-3 overflow-visible mb-6 sm:mb-6 md:mb-6 lg:mb-10
            w-full lg:max-w-[90%]
          "
        >
          <div
            className="
              flex flex-col items-center justify-center
              lg:flex-row lg:items-center lg:justify-start lg:gap-3 w-full
              text-center lg:text-left
              transition-all duration-500 ease-out
            "
          >
            {language === 'pt' && <span className="inline-block lg:whitespace-nowrap">E sou um desenvolvedor</span>}
            {language === 'es' && <span className="inline-block lg:whitespace-nowrap">Y soy un desarrollador</span>}
            {language === 'en' && <span className="inline-block lg:whitespace-nowrap">I'm a</span>}
            <TypewriterText
              words={wordsByLang[language]}
              typingSpeed={120}
              deletingSpeed={80}
              pauseDuration={2000}
              fullstackPauseDuration={8000}
            />
          </div>
        </h2>
      </div>

        <p className="text-sm sm:text-base md:text-lg text-gray-400 font-['Roboto_Mono',monospace] font-normal mb-10 md:mb-12 xl:mb-14 max-w-[90vw] sm:max-w-280px] xl:max-w-xl leading-relaxed mx-auto lg:mx-0 text-justify px-[5%] lg:px-0">
        {language === 'pt' && (
          <>Explore minhas paixões tecnológicas e projetos. Clique à vontade e descubra uma surpresa interativa que responde suas perguntas. Vamos criar algo incrível juntos!</>
        )}
        {language === 'es' && (
          <>Explora mis pasiones tecnológicas y proyectos. Haz clic para descubrir una sorpresa interactiva que responde tus preguntas. ¡Vamos a crear algo increíble juntos!</>
        )}
        {language === 'en' && (
          <>Explore my tech passions and projects. Click around to discover an interactive surprise that answers your questions. Let's build something amazing together!</>
        )}
      </p>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center lg:justify-start mb-0 md:mb-0">
        <button onClick={onPrimaryClick} className="w-auto min-w-[200px] px-6 md:px-8 py-3 sm:py-3.5 bg-[var(--color-primary)] text-white font-[var(--font-montserrat)] font-semibold text-sm sm:text-base rounded-full hover:bg-[var(--color-primary-light)] hover:drop-shadow-[0_0_12px_rgba(125,68,255,0.6)] transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap mx-auto lg:mx-0">
          {ctaPrimary}
        </button>

        <button className="w-auto min-w-[200px] px-6 md:px-8 py-3 sm:py-3.5 bg-transparent border-2 border-[var(--color-primary)]/60 text-white font-[var(--font-montserrat)] font-semibold text-sm sm:text-base rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center justify-center gap-2 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/15 hover:shadow-[0_0_16px_rgba(125,68,255,0.5),0_0_8px_rgba(125,68,255,0.3)] hover:-translate-y-px whitespace-nowrap mx-auto lg:mx-0">
          {ctaDownload}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};
