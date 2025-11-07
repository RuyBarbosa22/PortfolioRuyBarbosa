// Arquivo: src/components/Navbar/Navbar.tsx

import { useState, useRef, useEffect } from 'react';
import { useMenebotChat } from '../../context/MenebotChatContext';
import { FaWhatsapp, FaGithub, FaLinkedin } from 'react-icons/fa';
import { MdTranslate } from 'react-icons/md';
import { LanguageSwitch } from '../LanguageSwitch/LanguageSwitch';
import { translations } from '../../i18n';



interface NavbarProps {
  selectedLanguage: 'pt' | 'en' | 'es';
  onLanguageChange: (lang: 'pt'|'en'|'es') => void;
}

export function Navbar({ selectedLanguage, onLanguageChange }: NavbarProps) {
  const { isChatOpen, requestClose } = useMenebotChat();
  // Sections order must match the labels in translations.nav exactly.
  // Desired order: home, sobre, habilidades, menebot, projetos, contato
  const sectionIds = ['home','sobre','habilidades','chat-with-menebot-section','projetos','contato'];
  // Buffer in pixels used to decide when the section top is considered "under" the header.
  // Increase this to switch the active nav a bit earlier, decrease to switch later.
  const SECTION_SWITCH_BUFFER = 0; // tweak this value as desired (was 4/8 previously)
  const [activeLink, setActiveLink] = useState(translations[selectedLanguage].nav[0]);
  const navLinks: { name: string; href: string; id: string }[] = translations[selectedLanguage].nav.map((name: string, idx: number) => ({ name, href: `#${sectionIds[idx]}`, id: sectionIds[idx] }));
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const languageToggleRef = useRef<HTMLButtonElement>(null);
  // (underline removed per preference)

  // Bloqueia/desbloqueia scroll quando menu mobile abre/fecha
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup ao desmontar
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll spy: switch active item when a section's top crosses the header top (stable and predictable)
  useEffect(() => {
    // We'll locate the section that contains the point just under the header (offset),
    // which reliably identifies which section the user is 'in' regardless of viewport size.
    const ids = sectionIds;

    const getSections = () => ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    let ticking = false;

    const updateActive = () => {
      const sections = getSections();
      if (sections.length === 0) return;

      const header = document.querySelector('header') as HTMLElement | null;
      const headerHeight = header?.offsetHeight ?? 0;
      const offset = headerHeight + SECTION_SWITCH_BUFFER;

      // Prefer the section that contains the offset (top <= offset < bottom)
      let found = -1;
      for (let i = 0; i < sections.length; i++) {
        const rect = sections[i].getBoundingClientRect();
        if (rect.top <= offset && rect.bottom > offset) {
          found = i;
          break;
        }
      }

      // Fallback: if none contains the offset (e.g., scrolled past last), pick the closest by distance to offset
      if (found === -1) {
        let best = 0;
        let bestDist = Infinity;
        for (let i = 0; i < sections.length; i++) {
          const rect = sections[i].getBoundingClientRect();
          const dist = Math.abs(rect.top - offset);
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        }
        found = best;
      }

      const newLabel = translations[selectedLanguage].nav[found];
  setActiveLink((prev: string) => (prev === newLabel ? prev : newLabel));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateActive();
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // initialize once
    updateActive();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [selectedLanguage]);

  // (animated underline removed)

  // Keep "first" nav item selected when language changes while we're at the top
  useEffect(() => {
    // Build array of first/nav0 labels across all languages
    const firstLabels: string[] = Object.keys(translations).map((k) => translations[k].nav[0]);
    const newFirst = translations[selectedLanguage].nav[0];

    const topThreshold = 120; // px from top considered "first section"
    if (window.scrollY <= topThreshold) {
      setActiveLink(newFirst);
      return;
    }

    // If current active link is any language's first label, update it to the new language label
    if (firstLabels.includes(activeLink)) {
      setActiveLink(newFirst);
    }
  }, [selectedLanguage, activeLink]);

  return (
    <>
      {/* Mobile Menu Overlay - com blur forte - FORA do header para cobrir toda a página */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[45] animate-fadeIn"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Mobile Menu - FORA do header para z-index funcionar corretamente */}
      <div className={`
        lg:hidden fixed top-0 left-0 h-screen w-[280px] bg-black/95 backdrop-blur-md border-r border-[var(--color-primary)]/20 
        transition-transform duration-300 ease-out z-[50]
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col gap-6 p-6 pt-20">
          {/* Mobile Nav Links */}
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                setActiveLink(link.name);
                setIsMobileMenuOpen(false);
                if (isChatOpen) {
                  requestClose(link.id);
                } else {
                  const el = document.getElementById(link.id);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }
              }}
              className={`
                px-4 py-3 rounded-lg font-[var(--font-montserrat)] text-base font-medium
                transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${activeLink === link.name
                  ? 'bg-[var(--color-primary)] text-white font-semibold shadow-[0_4px_12px_rgba(125,68,255,0.4)]'
                  : 'text-white/75 hover:bg-[var(--color-primary)]/15 hover:text-white'
                }
              `}
            >
              {link.name}
            </a>
          ))}

          {/* Mobile Social Icons */}
          <div className="relative flex gap-3 items-center pt-6 border-t border-[var(--color-primary)]/20">
            {[
              { icon: FaWhatsapp, label: 'WhatsApp', href: 'https://wa.me/5511946706513?text=Ol%C3%A1%20Ruy!%20Vim%20pelo%20seu%20portf%C3%B3lio%2C%20vamos%20conversar%3F' },
                { icon: FaLinkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/ruy-barbosa/' },
                { icon: FaGithub, label: 'GitHub', href: 'https://github.com/RuyBarbosa22' },
            ].map(({ icon: Icon, label, href }) => (
              <a 
                key={label}
                href={href} 
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex items-center justify-center p-2.5 rounded-full text-[var(--color-primary)] transition-all duration-300 hover:bg-[var(--color-primary)]/15"
              >
                <Icon size={20} />
              </a>
            ))}
            
            {/* Mobile Language Toggle */}
            <button
              ref={languageToggleRef}
              onClick={(e) => {
                e.stopPropagation();
                setIsLanguageOpen(!isLanguageOpen);
              }}
              aria-label="Toggle language selector"
              className="inline-flex items-center justify-center p-2.5 rounded-full text-[var(--color-primary)] transition-all duration-300 hover:bg-[var(--color-primary)]/15"
            >
              <MdTranslate size={20} />
            </button>

            {/* Render LanguageSwitch inside mobile menu so dropdown positions relative to this container */}
              <LanguageSwitch
                anchorRef={languageToggleRef}
                mobileMode={true}
                isOpen={isLanguageOpen}
                selectedLanguage={selectedLanguage}
                onLanguageChange={(lang) => {
                  onLanguageChange(lang as 'pt'|'en'|'es');
                  setIsLanguageOpen(false); // Fecha após selecionar
                }}
                onClose={() => {
                  setIsLanguageOpen(false);
                }}
              />
          </div>
        </div>
      </div>

      <header className={`fixed top-0 left-0 w-full z-[55] transition-all duration-300 ${
        isScrolled ? 'bg-black/60 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.5)]' : ''
      }`}>
        <nav className="flex lg:grid lg:grid-cols-[1fr_auto_1fr] items-center justify-between lg:gap-8 px-4 sm:px-6 lg:px-12 xl:px-20 py-3.5 text-white">
          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex flex-col gap-1.5 p-2 z-[60] relative"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-[var(--color-primary)] transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-[var(--color-primary)] transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-[var(--color-primary)] transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>

          {/* Brand - Centered on mobile, left on desktop */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              const homeLabel = translations[selectedLanguage].nav[0];
              setActiveLink(homeLabel);
              // if chat is open, request close with 'home' section id so ChatWithMenebot shows confirmation
              if (isChatOpen) {
                requestClose('home');
              } else {
                const el = document.getElementById('home');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="font-[var(--font-montserrat)] font-bold text-[1.1rem] md:text-[1.3rem] text-[var(--color-primary)] tracking-[-0.02em] lg:justify-self-start transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-[var(--color-primary-lighter)] hover:drop-shadow-[0_0_12px_rgba(125,68,255,0.8)] hover:drop-shadow-[0_0_6px_rgba(125,68,255,0.6)] absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
          >
            Ruy Barbosa
          </a>

        {/* Center links - Desktop Only (with animated sliding underline) */}
        <div className="hidden lg:flex gap-1.5 items-center bg-black/40 border border-[var(--color-primary)]/20 px-2.5 py-[0.45rem] rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] justify-self-center">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                setActiveLink(link.name);
                if (isChatOpen) {
                  requestClose(link.id);
                } else {
                  const el = document.getElementById(link.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className={`
                inline-block px-[1.4rem] py-[0.65rem] rounded-full 
                font-[var(--font-montserrat)] text-[0.9rem] font-medium whitespace-nowrap
                transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]
                ${activeLink === link.name
                  ? 'bg-[var(--color-primary)] text-white font-semibold shadow-[0_4px_12px_rgba(125,68,255,0.4),0_0_20px_rgba(125,68,255,0.3)] -translate-y-px animate-[var(--animate-slide-in)]'
                  : 'text-white/75 hover:bg-[var(--color-primary)]/15 hover:text-white hover:-translate-y-px hover:shadow-[0_0_16px_rgba(125,68,255,0.5),0_0_8px_rgba(125,68,255,0.3)]'
                }
              `}
              aria-current={activeLink === link.name ? 'page' : undefined}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right side - Social icons with Language Switch - Desktop Only */}
        <div className="relative justify-self-end hidden lg:block">
          {/* Social icons */}
          <div className="flex gap-2.5 items-center bg-black/40 border border-[var(--color-primary)]/20 px-3 py-2.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)]">
            {[
              { icon: FaWhatsapp, label: 'WhatsApp', href: 'https://wa.me/5511946706513?text=Ol%C3%A1%20Ruy!%20Vim%20pelo%20seu%20portf%C3%B3lio%2C%20vamos%20conversar%3F' },
              { icon: FaLinkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/ruy-barbosa/' },
              { icon: FaGithub, label: 'GitHub', href: 'https://github.com/RuyBarbosa22' },
            ].map(({ icon: Icon, label, href }) => (
              <a 
                key={label}
                href={href} 
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex items-center justify-center p-1.5 rounded-full text-[var(--color-primary)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:text-[var(--color-primary-lighter)] hover:bg-[var(--color-primary)]/15 hover:shadow-[0_0_16px_rgba(125,68,255,0.5),0_0_8px_rgba(125,68,255,0.3)]"
              >
                <Icon size={19} />
              </a>
            ))}
            
            {/* Language Toggle Icon */}
            <button
              ref={languageToggleRef}
              onClick={(e) => {
                e.stopPropagation();
                setIsLanguageOpen(!isLanguageOpen);
              }}
              aria-label="Toggle language selector"
              className="inline-flex items-center justify-center p-1.5 rounded-full text-[var(--color-primary)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:text-[var(--color-primary-lighter)] hover:bg-[var(--color-primary)]/15 hover:shadow-[0_0_16px_rgba(125,68,255,0.5),0_0_8px_rgba(125,68,255,0.3)]"
            >
              <MdTranslate size={19} />
            </button>
          </div>

          {/* Language Switch Dropdown */}
          <LanguageSwitch 
            anchorRef={languageToggleRef}
            isOpen={isLanguageOpen}
            selectedLanguage={selectedLanguage}
            onLanguageChange={(lang) => {
              onLanguageChange(lang as 'pt'|'en'|'es');
              setIsLanguageOpen(false); // Fecha após selecionar
            }}
            onClose={() => {
              setIsLanguageOpen(false);
            }}
          />
        </div>

        {/* Mobile - Empty spacer for symmetry */}
        <div className="lg:hidden w-10"></div>
      </nav>
    </header>
    </>
  );
}