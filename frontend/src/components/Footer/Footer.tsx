import React from "react";
import { translations } from "../../i18n";
import linkedinIcon from "../../assets/icons/icons8-aws.svg"; // placeholder - reuse an icon available
import twitterIcon from "../../assets/icons/icons8-js.svg"; // placeholder

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
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex-1">
            <h4 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
              <span className="block text-white">{t.titleLine1}</span>
              <span className="block text-transparent bg-gradient-radial from-[#E204F5] via-[#CC12F7] to-[#7D44FF] bg-clip-text font-black text-4xl md:text-5xl">
                {t.titleLine2}
              </span>
            </h4>
            <p className="text-gray-300 max-w-xl leading-relaxed mt-2">
              {t.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/" className="text-sm text-white/80 hover:text-white inline-flex items-center gap-2">
                {t.linkPortfolio}
              </a>
              <a href="/" className="text-sm text-white/80 hover:text-white inline-flex items-center gap-2">
                {t.linkResume}
              </a>
              <a href="mailto:contato@exemplo.com" className="text-sm text-white/80 hover:text-white inline-flex items-center gap-2">
                {t.linkContact}
              </a>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-6">
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/RuyBarbosa22"
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-lg bg-[#131217] flex items-center justify-center hover:scale-105 transition-transform"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1-.02-1.96-3.2.7-3.88-1.54-3.88-1.54-.53-1.36-1.3-1.72-1.3-1.72-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.26 3.4.96.11-.75.41-1.26.74-1.55-2.55-.29-5.23-1.28-5.23-5.71 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18.92-.26 1.9-.39 2.88-.39.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.44-2.69 5.41-5.25 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .3.21.67.8.55C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/></svg>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-lg bg-[#131217] flex items-center justify-center hover:scale-105 transition-transform"
                aria-label="LinkedIn"
              >
                <img src={linkedinIcon} alt="LinkedIn" className="w-5 h-5" />
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-lg bg-[#131217] flex items-center justify-center hover:scale-105 transition-transform"
                aria-label="Twitter"
              >
                <img src={twitterIcon} alt="Twitter" className="w-5 h-5" />
              </a>
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
