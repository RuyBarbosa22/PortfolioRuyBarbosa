import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { projetos } from "./projetosData";

export type CarouselHandle = {
  scrollLeft: () => void;
  scrollRight: () => void;
};

const Carousel = forwardRef<CarouselHandle, {}>((_, ref) => {
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
        className="w-full flex overflow-x-scroll scroll-smooth no-scrollbar cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {cards.map((card, i) => (
          <a
            key={i}
            href={card.codigo || card.link || '#'}
            target="_blank"
            rel="noreferrer"
            className="w-full max-w-xs m-2 flex-shrink-0 block"
            title={`Abrir repositório de ${card.nome}`}
          >
            <div className="bg-[#18181b] rounded-2xl shadow-xl overflow-hidden border border-white/10 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="w-full h-40 sm:h-44 relative">
                <img
                  src={card.imagem}
                  alt={`${card.nome} Banner`}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              </div>
              <div className="p-4 flex flex-col gap-2">
                {/* Removido: icons */}
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
                  {card.nome}
                </h4>
                <p className="text-white/80 text-left text-sm mb-2">{card.descricao}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
});

export default Carousel;
