import React from "react";
import { translations } from "../../i18n";
import { FaWhatsapp, FaGithub, FaLinkedin } from 'react-icons/fa';

type Props = {
  language?: "pt" | "en" | "es";
};

export const Footer: React.FC<Props> = ({ language = "pt" }) => {
  const t = translations[language].footer || translations.pt.footer;

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-gradient-to-br from-[#07060a] via-[#0b0710] to-[#07060a] text-white mt-12">
      <div className="mx-auto w-full bg-black py-24 md:py-28 px-6 sm:px-8 md:px-8 lg:px-12 xl:px-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex-1">
            <h4 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
              <span className="block text-3xl md:text-4xl font-extrabold text-left sm:**:mb-6 text-[var(--color-primary)] font-['Montserrat',sans-serif]">{t.titleLine1}</span>
   
            </h4>
            <p className="text-gray-300 max-w-2xl md:text-lg font-roboto-mono leading-relaxed mt-2">
              {t.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#projects" className="text-sm text-white/80 hover:text-[var(--color-primary)] transition-colors inline-flex items-center gap-2">
                {t.linkPortfolio}
              </a>

              {/* Resume download - expects /resume.pdf to be placed in public/ */}
              <a href="/resume.pdf" download className="text-sm text-white/80 hover:text-[var(--color-primary)] transition-colors inline-flex items-center gap-2" aria-label="Download CV">
                {t.linkResume}
              </a>

              {/* WhatsApp contact link */}
              <a href="https://wa.me/5511946706513?text=Ol%C3%A1%20Ruy!%20Vim%20pelo%20seu%20portf%C3%B3lio%2C%20vamos%20conversar%3F" target="_blank" rel="noreferrer" className="text-sm text-white/80 hover:text-[var(--color-primary)] transition-colors inline-flex items-center gap-2" aria-label="WhatsApp">
                {t.linkContact}
              </a>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-6">
            <div className="flex items-center gap-3 bg-black/40 border border-[var(--color-primary)]/20 px-3 py-2.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)]">
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
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToTop}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[#B321FA] hover:brightness-105 font-semibold transition"
              >
                {t.backToTop}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/8 pt-6 text-center text-xs text-white/60">
          © {new Date().getFullYear()} Ruy Barbosa. {t.rights}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
