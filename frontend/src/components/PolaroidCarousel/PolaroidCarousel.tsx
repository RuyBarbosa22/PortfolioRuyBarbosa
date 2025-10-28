import React, { useState } from 'react';

interface PolaroidCarouselProps {
  images: string[];
  alt?: string;
}

export const PolaroidCarousel: React.FC<PolaroidCarouselProps> = ({ images, alt = 'Photo' }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const nextImage = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentImageIndex(index);
  };

  return (
    <div 
      className="relative bg-white shadow-2xl transform hover:rotate-0 transition-all duration-500 ease-out
        w-auto min-h-[280px] p-6 pb-28 
        sm:w-[340px] sm:min-h-[420px] md:p-8 sm:pb-28 
        md:w-[380px] md:min-h-[420px] md:pb-32
        xl:w-[480px] xl:min-h-[620px] xl:p-10 xl:pb-24"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Div quadrada da foto */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        {/* Imagem */}
        <img 
          src={images[currentImageIndex]} 
          alt={alt}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {/* Controles de carrossel (aparecem no hover) */}
        {isHovering && images.length > 1 && (
          <>
            {/* Botão anterior */}
            <button
              onClick={(e) => prevImage(e)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all duration-200 hover:scale-110 z-10"
              aria-label="Foto anterior"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            {/* Botão próximo */}
            <button
              onClick={(e) => nextImage(e)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all duration-200 hover:scale-110 z-10"
              aria-label="Próxima foto"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {/* Indicadores */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => goToImage(index, e)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'bg-white w-6' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Ir para foto ${index + 1}`}
                  type="button"
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Texto opcional abaixo da foto (estilo Polaroid tradicional) */}
      <div className="absolute bottom-10 left-10 right-10 text-center">
        <p className="text-gray-600 font-['Permanent_Marker',cursive] text-lg">
          {/* Legenda opcional */}
        </p>
      </div>
    </div>
  );
};
