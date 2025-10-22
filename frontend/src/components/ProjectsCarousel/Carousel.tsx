import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { projetos } from "./projetosData";
import { translations } from "../../i18n";
import type { Lang } from "../../i18n";

export type CarouselHandle = {
  scrollLeft: () => void;
  scrollRight: () => void;
};

type Props = { language?: Lang };

const Carousel = forwardRef<CarouselHandle, Props>(({ language = "pt" }, ref) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollAmount = clientWidth * 0.8;
      carouselRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useImperativeHandle(ref, () => ({
    scrollLeft: () => scroll("left"),
    scrollRight: () => scroll("right"),
  }));

  // --- Drag com mouse/touch ---
  let isDown = false;
  let startX = 0;
  let scrollLeftStart = 0;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return;
    isDown = true;
    startX = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftStart = carouselRef.current.scrollLeft;
  };

  const handleMouseLeave = () => (isDown = false);
  const handleMouseUp = () => (isDown = false);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDown || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.2;
    carouselRef.current.scrollLeft = scrollLeftStart - walk;
  };

  const cards = projetos;

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div
        ref={carouselRef}
        className="w-full flex overflow-x-scroll scroll-smooth no-scrollbar h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {cards.map((card, i) => (
          <a
            key={i}
            href={card.codigo || '#'}
            target="_blank"
            rel="noreferrer"
            className="w-full max-w-[220px] sm:max-w-[300px] md:max-w-sm lg:max-w-md flex-shrink-0 block min-h-[260px] sm:min-h-[320px] md:h-[520px] mr-6"
            title={`Abrir repositório de ${card.nome}`}
          >
            <div className="bg-[#18181b] rounded-2xl shadow-xl overflow-hidden border border-white/10 transform transition-all duration-300 hover:shadow-[0_0_16px_rgba(125,68,255,0.5),0_0_8px_rgba(125,68,255,0.3)] hover:-translate-y-px hover:border-[var(--color-primary)]/30 h-full flex flex-col">
              <div className="w-full relative h-32 sm:h-36 md:h-[60%]">
                <img
                  src={card.imagem}
                  alt={`${card.nome} Banner`}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                <h4
                  className="text-2xl text-left font-bold mb-1 bg-gradient-radial from-[#E204F5] via-[#CC12F7] to-[#7D44FF] bg-clip-text text-transparent"
                  style={{
                    background:
                      'radial-gradient(circle, #E204F5 0%, #CC12F7 22%, #B321FA 46%, #9733FC 74%, #7D44FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {language === "en" ? card.nome_en : language === "es" ? card.nome_es : card.nome}
                </h4>
                {card.icons && card.icons.length > 0 && (
                  <div className="items-center gap-2 mt-1 inline-flex flex-wrap md:flex md:flex-row">
                    {card.icons.map((ico: string, idx: number) => (
                      <img
                        key={idx}
                        src={ico}
                        alt={`tech-${idx}`}
                        className="w-6 h-6 object-contain rounded-sm bg-[#0f0f10] p-0.5"
                      />
                    ))}
                  </div>
                )}
                <p className="text-white/80 text-justify text-sm mt-4 mb-2">{language === "en" ? card.descricao_en : language === "es" ? card.descricao_es : card.descricao}</p>
                  {/* Status badge */}
                  {card.status && (
                    <span
                      className={`self-start inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mt-2 ${
                        card.status === 'Concluido'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-600/20'
                          : card.status === 'Em desenvolvimento'
                          ? 'bg-amber-400/15 text-amber-300 border border-amber-500/20'
                          : 'bg-red-500/12 text-red-300 border border-red-600/20'
                      }`}
                      style={{ letterSpacing: '0.02em' }}
                    >
                      {translations[language].projects.status[card.statusKey || 'notstarted']}
                    </span>
                  )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
});

export default Carousel;
