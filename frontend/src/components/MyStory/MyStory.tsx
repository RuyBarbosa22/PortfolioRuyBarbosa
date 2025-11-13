import React from 'react';
import foto01 from '/assets/images/foto_01.jpeg';
import foto02 from '/assets/images/foto_02.jpeg';
import foto03 from '/assets/images/foto_03.jpeg';
import foto04 from '/assets/images/foto_04.jpeg';
import foto05 from '/assets/images/foto_05.jpeg';
import foto06 from '/assets/images/foto_06.jpeg';
import { PolaroidCarousel } from '../PolaroidCarousel/PolaroidCarousel';
import { AnimatedStat } from '../AnimatedStat/AnimatedStat';

interface MyStoryProps {
  language?: 'pt' | 'en' | 'es';
}

export const MyStory: React.FC<MyStoryProps> = ({ language = 'pt' }) => {
  // Array de imagens - todas as 6 fotos disponíveis
  const images = [foto01, foto02, foto03, foto04, foto05, foto06];

  const contentByLang: Record<string, { title: string; description: string; stats: Array<{ value: string; label: string }> }> = {
    pt: {
      title: 'Minha história',
      description: 'Olá! Sou de São Paulo (SP), formado em Desenvolvimento de Sistemas pela Etec de Guaianases e atualmente cursando Sistemas de Informação na SPTech School. Nascido em 17 de novembro de 2003, adoro explorar novas experiências e jogar. Escolhi ser programador pela liberdade de viajar e a qualidade de vida. Sou criativo, comunicativo e resiliente, sempre buscando aprender e melhorar. Estou animado para contribuir com minhas habilidades e enfrentar novos desafios!',
        stats: [
        { value: '4+', label: 'Anos de experiência' },
        { value: '8+', label: 'Projetos realizados' },
        { value: '16+', label: 'Tecnologias utilizadas' },
        { value: '1', label: 'Empresas trabalhadas' }
      ]
    },
    en: {
      title: 'My story',
      description: 'Hello! I\'m from São Paulo (SP), graduated in Systems Development from Etec de Guaianases and currently studying Information Systems at SPTech School. Born on November 17, 2003, I love exploring new experiences and gaming. I chose to be a programmer for the freedom to travel and quality of life. I\'m creative, communicative, and resilient, always seeking to learn and improve. I\'m excited to contribute my skills and face new challenges!',
        stats: [
        { value: '4+', label: 'Years of experience' },
        { value: '8+', label: 'Projects completed' },
        { value: '16+', label: 'Technologies used' },
        { value: '1', label: 'Companies worked' }
      ]
    },
    es: {
      title: 'Mi historia',
      description: '¡Hola! Soy de São Paulo (SP), graduado en Desarrollo de Sistemas por Etec de Guaianases y actualmente estudiando Sistemas de Información en SPTech School. Nacido el 17 de noviembre de 2003, me encanta explorar nuevas experiencias y jugar. Elegí ser programador por la libertad de viajar y la calidad de vida. Soy creativo, comunicativo y resiliente, siempre buscando aprender y mejorar. ¡Estoy emocionado de contribuir con mis habilidades y enfrentar nuevos desafíos!',
        stats: [
        { value: '4+', label: 'Años de experiencia' },
        { value: '8+', label: 'Proyectos realizados' },
        { value: '16+', label: 'Tecnologías utilizadas' },
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
              <p className="text-md sm:text-base md:text-xl text-gray-200 font-['Roboto_Mono',monospace] font-normal leading-relaxed mb-8 text-justify">
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
