// Arquivo: src/components/Navbar/Navbar.tsx

import { useState, useRef, useEffect } from 'react';
import { FaWhatsapp, FaGithub, FaLinkedin } from 'react-icons/fa';
import { MdTranslate } from 'react-icons/md';
import { LanguageSwitch } from '../LanguageSwitch/LanguageSwitch';
import { translations } from '../../i18n';



interface NavbarProps {
  selectedLanguage: 'pt' | 'en' | 'es';
  onLanguageChange: (lang: 'pt'|'en'|'es') => void;
}

export function Navbar({ selectedLanguage, onLanguageChange }: NavbarProps) {
  const [activeLink, setActiveLink] = useState(translations[selectedLanguage].nav[0]);
  const navLinks: { name: string; href: string }[] = translations[selectedLanguage].nav.map((name: string) => ({ name, href: '#' }));
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const languageToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/60 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.5)]' : ''
    }`}>
      <nav className="flex lg:grid lg:grid-cols-[1fr_auto_1fr] items-center justify-between lg:gap-8 px-4 sm:px-6 lg:px-12 py-3.5 max-w-[1600px] mx-auto text-white">
        {/* Hamburger Menu Button - Mobile Only */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden flex flex-col gap-1.5 p-2 z-50"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-[var(--color-primary)] transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-[var(--color-primary)] transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-[var(--color-primary)] transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>

        {/* Brand - Centered on mobile, left on desktop */}
        <a 
          href="#" 
          className="font-[var(--font-montserrat)] font-bold text-[1.1rem] md:text-[1.3rem] text-[var(--color-primary)] tracking-[-0.02em] lg:justify-self-start transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-[var(--color-primary-lighter)] hover:drop-shadow-[0_0_12px_rgba(125,68,255,0.8)] hover:drop-shadow-[0_0_6px_rgba(125,68,255,0.6)] absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
        >
          Ruy Barbosa
        </a>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu */}
        <div className={`
          lg:hidden fixed top-0 left-0 h-screen w-[280px] bg-black/95 backdrop-blur-md border-r border-[var(--color-primary)]/20 
          transition-transform duration-300 ease-out z-40
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

        {/* Center links - Desktop Only */}
        <div className="hidden lg:flex gap-1.5 items-center bg-black/40 border border-[var(--color-primary)]/20 px-2.5 py-[0.45rem] rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] justify-self-center">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                setActiveLink(link.name);
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
  );
}