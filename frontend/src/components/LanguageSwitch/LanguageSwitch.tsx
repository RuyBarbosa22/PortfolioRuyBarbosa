import { useEffect, useRef } from 'react';

type Language = 'pt' | 'en' | 'es';

interface LanguageSwitchProps {
  isOpen: boolean;
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  onClose: () => void;
  /** optional ref to the toggle button so clicks on the toggle are considered inside */
  anchorRef?: React.RefObject<HTMLElement | null>;
  /** render in mobile mode (vertical, full-width) */
  mobileMode?: boolean;
}

const languages = [
  { code: 'pt' as Language, flag: '🇧🇷', name: 'Português' },
  { code: 'en' as Language, flag: '🇺🇸', name: 'English' },
  { code: 'es' as Language, flag: '🇪🇸', name: 'Español' },
];

export function LanguageSwitch({ isOpen, selectedLanguage, onLanguageChange, onClose, anchorRef, mobileMode }: LanguageSwitchProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target);
      const clickedOnAnchor = anchorRef && anchorRef.current && anchorRef.current.contains(target);

      if (!clickedInsideDropdown && !clickedOnAnchor) {
        onClose();
      }
    };

    // Use 'click' instead of 'mousedown' and add longer delay
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  // classes adjusted for mobileMode
  const baseClasses = mobileMode
    ? 'absolute left-3 right-3 top-full mt-3 bg-black/95 border border-[var(--color-primary)]/20 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-[6px] animate-[slideDown_300ms_ease-out] overflow-hidden'
    : 'absolute top-full mt-2 right-0 flex gap-2 bg-black/90 border border-[var(--color-primary)]/20 px-3 py-2.5 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.5),0_0_20px_rgba(125,68,255,0.2)] backdrop-blur-[10px] animate-[slideDown_300ms_ease-out]';

  return (
    <div 
      ref={dropdownRef}
      className={baseClasses}
    >
      {/* When in mobileMode we wrap the list in a scrollable container so
          very small screens can still access all language options. */}
      {mobileMode ? (
        <div className="w-full max-h-[30vh] overflow-y-auto overflow-x-hidden py-3 px-3 space-y-2" style={{ WebkitOverflowScrolling: 'touch' }}>
          {languages.map((lang, index) => (
            <button
              key={lang.code}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onLanguageChange(lang.code);
              }}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]
                ${selectedLanguage === lang.code
                  ? 'bg-[var(--color-primary)] text-white shadow-[0_4px_12px_rgba(125,68,255,0.4),0_0_20px_rgba(125,68,255,0.3)] -translate-y-px animate-[var(--animate-slide-in)]'
                  : 'text-white/75 hover:bg-[var(--color-primary)]/15 hover:text-white hover:-translate-y-px hover:shadow-[0_0_16px_rgba(125,68,255,0.5),0_0_8px_rgba(125,68,255,0.3)]'
                }
                ${mobileMode ? 'w-full justify-start' : ''}
              `}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <span className="text-xl leading-none">{lang.flag}</span>
              <span className="font-[var(--font-roboto-mono)] text-sm font-medium whitespace-nowrap">
                {lang.name}
              </span>
              {selectedLanguage === lang.code && (
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </button>
          ))}
        </div>
      ) : (
        languages.map((lang, index) => (
          <button
            key={lang.code}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onLanguageChange(lang.code);
            }}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]
              ${selectedLanguage === lang.code
                ? 'bg-[var(--color-primary)] text-white shadow-[0_4px_12px_rgba(125,68,255,0.4),0_0_20px_rgba(125,68,255,0.3)] -translate-y-px animate-[var(--animate-slide-in)]'
                : 'text-white/75 hover:bg-[var(--color-primary)]/15 hover:text-white hover:-translate-y-px hover:shadow-[0_0_16px_rgba(125,68,255,0.5),0_0_8px_rgba(125,68,255,0.3)]'
              }
              ${mobileMode ? 'w-full justify-start' : ''}
            `}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <span className="text-xl leading-none">{lang.flag}</span>
            <span className="font-[var(--font-roboto-mono)] text-sm font-medium whitespace-nowrap">
              {lang.name}
            </span>
            {selectedLanguage === lang.code && (
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </button>
        ))
      )}
    </div>
  );
}
