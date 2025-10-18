import React, { useRef, useState, useEffect } from 'react';

interface ProjectCard {
  id: string;
  title: string;
  description: string;
  img?: string;
  tech?: string[];
}

const placeholderCards: ProjectCard[] = [
  { id: 'p1', title: 'Nike clone', description: 'Esse foi meu primeiro projeto aplicando React e Tailwind, foi a partir daqui que comecei.', img: 'projeto_nikeclone.png', tech: ['React','Tailwind','JS','Node'] },
  { id: 'p2', title: 'ERP para varejo', description: 'Estou trabalhando em uma plataforma de vendas completa para o nicho de varejo, atualmente estou desenvolvendo a parte de vendas e gestão de estoque.', img: 'projeto_ecommerce.png', tech: ['React','Tailwind','JS','Node', 'Kotlin', 'MySQL', 'Swagger'] },
  { id: 'p3', title: 'Pedepet', description: 'Projeto academico desenvolvido para gerenciar listas de espera por futuras ninhadas de filhotes de cachorro.', img: 'projeto_pedepet.png', tech: ['HTML','CSS', 'JS','Kotlin', 'Swagger'] },
  { id: 'p4', title: 'Auth com Angular', description: 'Projeto de login e autenticação, primeiras experiências com Angular.', img: 'projeto_authangular.png', tech: ['Angular','TS', 'Java','AWS'] },
  { id: 'p5', title: 'Algoritmos com Kotlin', description: 'Problemas de lógica e algoritimos utilizando Kotlin.', img: 'ruy01.jpeg', tech: ['Kotlin'] },
];

export const ProjectsCarousel: React.FC = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      const overflowing = el.scrollWidth > el.clientWidth + 2;
      setIsOverflowing(overflowing);
      setShowLeft(el.scrollLeft > 40);
      setShowRight(el.scrollLeft < (maxScroll - 40) && maxScroll > 0);
    };

    // Resize observer to update when container size changes
    const ro = new ResizeObserver(() => requestAnimationFrame(update));
    ro.observe(el);

    // Update on scroll
    el.addEventListener('scroll', update);

    // initial update after layout
    requestAnimationFrame(update);

    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', update);
    };
  }, []);

  // Inject helper styles once: hide native scrollbars and define animation for mobile indicator
  useEffect(() => {
    const id = 'projects-carousel-helper-style';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `
      #projects-carousel-list { -ms-overflow-style: none; scrollbar-width: none; }
      #projects-carousel-list::-webkit-scrollbar { display: none; }
      @keyframes carouselIndicatorX { 0% { transform: translateX(-6px); } 50% { transform: translateX(6px); } 100% { transform: translateX(-6px); } }
      .projects-carousel-indicator { animation: carouselIndicatorX 1.2s ease-in-out infinite; }
    `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Use Pointer Events when available to capture mouse/touch/pens and allow pointer capture.
    // Fallback to touch events for environments that don't implement PointerEvent (older iOS Safari).
    const supportsPointer = typeof window !== 'undefined' && 'PointerEvent' in window;

    // enable smooth momentum scrolling on iOS
    try {
      (el.style as any).WebkitOverflowScrolling = 'touch';
    } catch (err) {
      // ignore if not supported
    }

  let isDown = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;

  // collect cleanup functions so we can call them in the effect cleanup
  const cleanupFns: Array<() => void> = [];

  if (supportsPointer) {
      const onPointerDown = (e: PointerEvent) => {
        // only handle primary button/primary touch
        if ((e as any).button === 2) return;
        isDown = true;
        startX = (e as any).clientX - el.getBoundingClientRect().left;
        scrollLeft = el.scrollLeft;
        try {
          // capture pointer so moves outside the element are still received
          (e.target as Element).setPointerCapture?.((e as any).pointerId);
        } catch (err) {
          // ignore
        }
        el.classList.add('cursor-grabbing');
        document.body.style.userSelect = 'none';
      };

      const onPointerUp = (e: PointerEvent) => {
        if (!isDown) return;
        isDown = false;
        try {
          (e.target as Element).releasePointerCapture?.((e as any).pointerId);
        } catch (err) {}
        el.classList.remove('cursor-grabbing');
        document.body.style.userSelect = '';
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!isDown) return;
        const x = (e as any).clientX - el.getBoundingClientRect().left;
        const walk = (x - startX) * 1; // speed
        el.scrollLeft = scrollLeft - walk;
      };

      // Allow vertical native scrolling while we handle horizontal dragging
      el.style.touchAction = 'pan-y';

      el.addEventListener('pointerdown', onPointerDown as EventListener);
      window.addEventListener('pointerup', onPointerUp as EventListener);
      window.addEventListener('pointermove', onPointerMove as EventListener);

      // cleanup pointer listeners on unmount
      const cleanupPointer = () => {
        el.removeEventListener('pointerdown', onPointerDown as EventListener);
        window.removeEventListener('pointerup', onPointerUp as EventListener);
        window.removeEventListener('pointermove', onPointerMove as EventListener);
      };

      cleanupFns.push(cleanupPointer);

      // attach keyboard and return cleanup later (keyboard handled below too)
      // We'll return cleanupPointer at the end of this effect as part of generic cleanup.

    } else {
      // fallback to touch events for older platforms
      const onTouchStart = (e: TouchEvent) => {
        if (!e.touches || e.touches.length === 0) return;
        const t = e.touches[0];
        isDown = true;
        startX = t.clientX - el.getBoundingClientRect().left;
        startY = t.clientY - el.getBoundingClientRect().top;
        scrollLeft = el.scrollLeft;
      };

      const onTouchMove = (e: TouchEvent) => {
        if (!isDown || !e.touches || e.touches.length === 0) return;
        const t = e.touches[0];
        const x = t.clientX - el.getBoundingClientRect().left;
        const y = t.clientY - el.getBoundingClientRect().top;
        const dx = x - startX;
        const dy = y - startY;
        // if horizontal movement is dominant, prevent vertical page scroll and handle carousel
        if (Math.abs(dx) > Math.abs(dy)) {
          e.preventDefault();
          el.scrollLeft = scrollLeft - dx;
        }
      };

      const onTouchEnd = () => {
        isDown = false;
      };

      el.addEventListener('touchstart', onTouchStart, { passive: true });
      // touchmove must be non-passive to allow preventDefault
      el.addEventListener('touchmove', onTouchMove as EventListener, { passive: false } as AddEventListenerOptions);
      el.addEventListener('touchend', onTouchEnd);

      const cleanupTouch = () => {
        el.removeEventListener('touchstart', onTouchStart as EventListener);
        el.removeEventListener('touchmove', onTouchMove as EventListener);
        el.removeEventListener('touchend', onTouchEnd as EventListener);
      };

      cleanupFns.push(cleanupTouch);
    }

    // keyboard navigation (works for both pointer and touch fallbacks)
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'ArrowRight') {
        el.scrollBy({ left: 320, behavior: 'smooth' });
      } else if (ev.key === 'ArrowLeft') {
        el.scrollBy({ left: -320, behavior: 'smooth' });
      }
    };
    el.setAttribute('tabIndex', '0');
    el.addEventListener('keydown', onKey as any);

    return () => {
      // call any collected cleanup functions (pointer/touch)
      try {
        cleanupFns.forEach((fn) => fn());
      } catch (err) {
        // ignore
      }
      // remove keyboard listener
      el.removeEventListener('keydown', onKey as any);
      el.style.touchAction = '';
      try {
        (el.style as any).WebkitOverflowScrolling = '';
      } catch (err) {}
    };
  }, []);

  const scroll = (delta: number) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  // track current index for indicators (fallback if external controls don't work)
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const computeIndex = () => {
      const children = el.children;
      if (!children || children.length === 0) return;
      const first = children[0] as HTMLElement;
      const style = getComputedStyle(el);
      const gap = parseFloat((style.gap as string) || style.columnGap || '16') || 16;
      const cardWithGap = first.getBoundingClientRect().width + gap;
      const idx = Math.round(el.scrollLeft / cardWithGap);
      setCurrentIndex(Math.min(Math.max(idx, 0), children.length - 1));
    };

    el.addEventListener('scroll', computeIndex, { passive: true });
    window.addEventListener('resize', computeIndex);
    requestAnimationFrame(computeIndex);
    return () => {
      el.removeEventListener('scroll', computeIndex as EventListener);
      window.removeEventListener('resize', computeIndex);
    };
  }, []);

  return (
    <div className="md:flex">
      <div
        ref={ref}
        id="projects-carousel-list"
  className="flex gap-4 lg:gap-8 overflow-x-auto no-scrollbar pb-4 px-0 lg:px-2 h-[420px] sm:h-[480px] md:h-[460px] lg:h-[360px] items-start snap-x snap-mandatory min-h-0"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        role="list"
        aria-label="Projetos carousel"
      >
        {placeholderCards.map((c) => (
          <article role="listitem" key={c.id} className="snap-start bg-[#18181b] rounded-2xl shadow-lg w-[300px] min-w-[220px] sm:w-[300px]
           sm:min-w-[260px] md:w-[320px] md:min-w-[300px] lg:w-[320px] lg:min-w-[320px] flex-shrink-0 h-auto min-h-[380px] md:min-h-[420px] flex flex-col overflow-hidden">
            {/* Thumbnail area: allocate larger vertical space for imagery on mobile to make cards taller */}
            <div className="w-full h-[64%] bg-gradient-to-b from-[#0b1320] to-[#0f1724] min-h-[150px] rounded-t-2xl overflow-hidden relative flex items-end">
              {/* Image (cover) with gradient overlay and title placed on bottom-left */}
              {c.img ? (
                (() => {
                  try {
                    const imgUrl = new URL(`../../assets/images/${c.img}`, import.meta.url).href;
                    return (
                      <>
                        <img src={imgUrl} alt={c.title} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                      </>
                    );
                  } catch (e) {
                    // fallback to svg label if resolution fails
                    return (
                      <svg width="100%" height="100%" viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100%" height="100%" fill="rgba(15,23,36,0.85)" />
                        <text x="18" y="28" fill="#fff" fontSize="18" fontFamily="Montserrat, sans-serif">{c.title}</text>
                      </svg>
                    );
                  }
                })()
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="90%" height="90%" viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100%" height="100%" fill="rgba(15,23,36,0.85)" />
                    <text x="18" y="28" fill="#fff" fontSize="18" fontFamily="Montserrat, sans-serif">{c.title}</text>
                  </svg>
                </div>
              )}
            </div>
            <div className="p-6 flex-none h-[36%]">
              <div className="flex gap-2 mb-2">
                {c.tech?.map((t, i) => {
                  const map: Record<string, string> = {
                    html: '../../assets/icons/icons8-html.svg',
                    css: '../../assets/icons/icons8-css.svg',
                    js: '../../assets/icons/icons8-js.svg',
                    javascript: '../../assets/icons/icons8-js.svg',
                    node: '../../assets/icons/node-js-svgrepo-com.svg',
                    nodejs: '../../assets/icons/node-js-svgrepo-com.svg',
                    angular: '../../assets/icons/icons8-angular.svg',
                    java: '../../assets/icons/icons8-java.svg',
                    react: '../../assets/icons/react-svgrepo-com.svg',
                    ts: '../../assets/icons/icons8-typescript.svg',
                    typescript: '../../assets/icons/icons8-typescript.svg',
                    aws: '../../assets/icons/icons8-aws.svg',
                    kotlin: '../../assets/icons/icons8-kotlin.svg',
                    mysql: '../../assets/icons/mysql-svgrepo-com.svg',
                    tailwind: '../../assets/icons/icons8-tailwind-css.svg',
                    python: '../../assets/icons/python-svgrepo-com.svg',
                    docker: '../../assets/icons/docker-svgrepo-com.svg',
                    swagger: '../../assets/icons/swagger-svgrepo-com.svg'
                  };
                  const key = t.toLowerCase();
                  const url = map[key] ? new URL(map[key], import.meta.url).href : undefined;
                  return url ? (
                    <img key={i} src={url} alt={t} title={t} className="w-7 h-7 bg-[#0f1724] rounded p-1" />
                  ) : (
                    <span key={i} className="w-7 h-7 bg-[#0f1724] rounded flex items-center justify-center text-xs text-white/80">{t[0]}</span>
                  );
                })}
              </div>
              {/* keep a small title here for screen readers and consistency (desktop cards already show title on image) */}
              <h4 className="text-2xl font-extrabold text-[var(--color-primary)] mb-2 hidden lg:block">{c.title}</h4>
              <p className="text-sm text-white/80 font-['Roboto_Mono',monospace] mb-2">{c.description}</p>
            </div>
          </article>
        ))}
      </div>

      {/* Arrows - aparecem somente se houver overflow */}
      {isOverflowing && showLeft && (
        <button
          aria-label="Scroll left"
          onClick={() => scroll(-360)}
          className={`hidden lg:block absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 p-3 rounded-full backdrop-blur-sm transition-opacity z-50 pointer-events-auto ${isHovering ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {isOverflowing && showRight && (
        <button
          aria-label="Scroll right"
          onClick={() => scroll(360)}
          className={`hidden lg:block absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 p-3 rounded-full backdrop-blur-sm transition-opacity z-50 pointer-events-auto ${isHovering ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Mobile/tablet controls (fallback) */}
      <div className="w-full flex flex-col items-center gap-3 mt-4 lg:hidden">
        <div className="flex gap-3">
          <button onClick={() => scroll(-280)} className="px-3 py-2 bg-white/6 hover:bg-white/10 rounded-full text-white/90">Anterior</button>
          <button onClick={() => scroll(280)} className="px-3 py-2 bg-[var(--color-primary)] rounded-full text-white font-semibold">Próximo</button>
        </div>
        <div className="flex gap-2 items-center">
          {placeholderCards.map((_, i) => (
            <button
              key={i}
              aria-label={`Ir para slide ${i + 1}`}
              onClick={() => {
                const el = ref.current;
                if (!el) return;
                const first = el.children[0] as HTMLElement | undefined;
                if (!first) return;
                const style = getComputedStyle(el);
                const gap = parseFloat((style.gap as string) || style.columnGap || '16') || 16;
                const cardWithGap = first.getBoundingClientRect().width + gap;
                el.scrollTo({ left: i * cardWithGap, behavior: 'smooth' });
              }}
              className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-[var(--color-primary)]' : 'bg-white/20'}`}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default ProjectsCarousel;
