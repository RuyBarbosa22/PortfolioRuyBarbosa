import React from 'react';
import ruy01 from '../../assets/images/ruy01.jpeg';
import ruy02 from '../../assets/images/ruy02.jpeg';
import ruy03 from '../../assets/images/ruy03.jpeg';
import { PolaroidCarousel } from '../PolaroidCarousel/PolaroidCarousel';
import { AnimatedStat } from '../AnimatedStat/AnimatedStat';

interface MyStoryProps {
  language?: 'pt' | 'en' | 'es';
}

export const MyStory: React.FC<MyStoryProps> = ({ language = 'pt' }) => {
  // Array de imagens - adicione mais quando disponível
  const images = [ruy01, ruy02, ruy03];

  const contentByLang: Record<string, { title: string; description: string; stats: Array<{ value: string; label: string }> }> = {
    pt: {
      title: 'Minha história',
      description: 'Olá! Sou de São Paulo (SP), formado em Desenvolvimento de Sistemas pela Etec Doutor José Coury e atualmente cursando Sistemas de Informação na SPTech School. Nascido em 17 de novembro de 2003, adoro explorar novas experiências e jogar. Escolhi ser programador pela liberdade de viajar e a qualidade de vida. Sou criativo, simpático e detalhista, sempre buscando aprender e melhorar. Estou animado para contribuir com minhas habilidades e enfrentar novos desafios!',
      stats: [
        { value: '4+', label: 'Anos de experiência' },
        { value: '8+', label: 'Projetos realizados' },
        { value: '12+', label: 'Tecnologias utilizadas' },
        { value: '1', label: 'Empresas trabalhadas' }
      ]
    },
    en: {
      title: 'My story',
      description: 'Hello! I\'m from São Paulo (SP), graduated in Systems Development from Etec Doutor José Coury and currently studying Information Systems at SPTech School. Born on November 17, 2003, I love exploring new experiences and gaming. I chose to be a programmer for the freedom to travel and quality of life. I\'m creative, friendly and detail-oriented, always seeking to learn and improve. I\'m excited to contribute my skills and face new challenges!',
      stats: [
        { value: '4+', label: 'Years of experience' },
        { value: '8+', label: 'Projects completed' },
        { value: '12+', label: 'Technologies used' },
        { value: '1', label: 'Companies worked' }
      ]
    },
    es: {
      title: 'Mi historia',
      description: '¡Hola! Soy de São Paulo (SP), graduado en Desarrollo de Sistemas por Etec Doutor José Coury y actualmente estudiando Sistemas de Información en SPTech School. Nacido el 17 de noviembre de 2003, me encanta explorar nuevas experiencias y jugar. Elegí ser programador por la libertad de viajar y la calidad de vida. Soy creativo, simpático y detallista, siempre buscando aprender y mejorar. ¡Estoy emocionado de contribuir con mis habilidades y enfrentar nuevos desafíos!',
      stats: [
        { value: '4+', label: 'Años de experiencia' },
        { value: '8+', label: 'Proyectos realizados' },
        { value: '12+', label: 'Tecnologías utilizadas' },
        { value: '1', label: 'Empresas trabajadas' }
      ]
    }
  };

  const content = contentByLang[language];

  return (
    <section 
      id="historia"
      className="relative w-full bg-black py-24 lg:py-40"
    >
      <div className="px-6 sm:px-8 md:px-8 lg:px-12 xl:px-20">
        {/* Layout Mobile: Grid 1 coluna */}
        {/* Layout Tablet/Desktop (≥768px): Flex com proporções 40%/60% */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-6 lg:gap-12 xl:gap-16 items-start xl:items-stretch">
          {/* Foto - Polaroid realista com carrossel - 40% em md+ */}
          <div className="w-full md:w-[40%] flex justify-center md:justify-start xl:block">
            <PolaroidCarousel images={images} alt="Ruy Barbosa" />
          </div>

          {/* Conteúdo - texto e stats - 60% em md+ */}
          {/* Em XL, usa flex-col com justify-end para alinhar stats ao bottom */}
          <div className="w-full md:w-[60%] text-white xl:flex xl:flex-col xl:justify-end">
            <div className="xl:mb-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold text-center md:text-left mb-4 text-[var(--color-primary)] font-['Montserrat',sans-serif]">
                {content.title}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-200 font-['Roboto_Mono',monospace] font-normal leading-relaxed mb-8 text-justify">
                {content.description}
              </p>
            </div>

            {/* Stats Grid - visível apenas em mobile e desktop XL+ (>1280px) */}
            {/* Em XL, fica no bottom da div, alinhado com o Polaroid */}
            <div className="grid grid-cols-2 gap-4 md:hidden xl:grid">
              {content.stats.map((stat, index) => (
                <AnimatedStat 
                  key={index}
                  value={stat.value}
                  label={stat.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid - para tablet e desktop até XL (768-1279px) - 4 colunas em linha */}
        <div className="hidden md:grid xl:hidden grid-cols-4 gap-4 mt-12">
          {content.stats.map((stat, index) => (
            <AnimatedStat 
              key={index}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
