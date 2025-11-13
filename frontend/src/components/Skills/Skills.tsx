import { useState } from 'react';
import { translations } from '../../i18n';
import type { Lang } from '../../i18n';

import cardComunicacao from '/assets/images/card_comunicação.jpeg';
import cardCriatividade from '/assets/images/card_criatividade.jpeg';
import cardFlexibilidade from '/assets/images/card_flexibilidade.jpeg';
import cardSociemocional from '/assets/images/card_sociemocional.jpeg';

interface SkillsProps {
  language: Lang;
}

const skillItems = [
  {
    key: 'comunicacao',
    img: cardComunicacao,
  },
  {
    key: 'criatividade',
    img: cardCriatividade,
  },
  {
    key: 'flexibilidade',
    img: cardFlexibilidade,
  },
  {
    key: 'sociemocional',
    img: cardSociemocional,
  },
];

export default function Skills({ language }: SkillsProps) {
  const t = translations[language] || translations.pt;
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false, false]);

  const toggle = (idx: number) => {
    setFlipped((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  return (
    <section className="w-full bg-black py-24 lg:py-36 px-6 sm:px-8 md:px-8 lg:px-12 xl:px-20">
        <div className="mx-auto w-full">
        <div className="text-justify mb-10 lg">
          <h2
            className="text-3xl md:text-4xl font-extrabold text-center mb-4 text-[var(--color-primary)]"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            {t.skills?.heading ?? 'Soft Skills'}
          </h2>
          <p
            className="text-gray-200 text-base text-justify w-full md:text-xl mx-auto leading-relaxed"
            style={{ fontFamily: 'var(--font-roboto-mono)', color: 'rgba(229,229,234,0.9)' }}
          >
            {t.skills?.description ?? 'Essas são minhas principais soft skills e como eu as aplico na prática.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-16 xl:gap-4 items-stretch">
          {skillItems.map((s, idx) => {
            const meta = t.skills?.cards?.[s.key] || {};
            return (
              <div
                key={s.key}
                className="flip-card w-full aspect-square perspective"
                onClick={() => toggle(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggle(idx); }}
                aria-pressed={flipped[idx]}
              >
                <div className={`flip-card-inner relative w-full h-full ${flipped[idx] ? 'flipped' : ''}`}>
                  <div className="flip-card-front absolute inset-0 rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(125,68,255,0.12)]">
                    <img src={s.img} alt={meta.title ?? s.key} className="w-full h-full object-cover" />
                  </div>
                  <div className="flip-card-back absolute inset-0 rounded-2xl bg-[#08050b] p-6 flex flex-col items-center justify-center border border-[var(--color-primary)]/25">
                    <h3 className="text-[var(--color-primary)] font-extrabold text-2xl mb-4 text-center" style={{ fontFamily: 'var(--font-montserrat)' }}>{meta.title ?? ''}</h3>
                    <div className="w-full overflow-auto no-scrollbar-vertical" style={{ maxHeight: 'calc(100% - 5rem)' }}>
                      <p className="text-white text-base md:text-lg max-w-full" style={{ fontFamily: 'var(--font-roboto-mono)', color: '#fafafa', lineHeight: 1.7, textAlign: 'justify' }}>
                        {meta.text ?? ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
