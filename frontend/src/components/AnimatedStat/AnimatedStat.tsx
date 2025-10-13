import React, { useState, useEffect, useRef } from 'react';

interface AnimatedStatProps {
  value: string;
  label: string;
  className?: string;
}

export const AnimatedStat: React.FC<AnimatedStatProps> = ({ value, label, className = '' }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const statRef = useRef<HTMLDivElement>(null);

  // Extrair número e sufixo (ex: "4+" -> número: 4, sufixo: "+")
  const numericValue = parseInt(value.replace(/\D/g, '')) || 0;
  const suffix = value.replace(/\d/g, '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCount();
          }
        });
      },
      { threshold: 0.5 } // Anima quando 50% do elemento está visível
    );

    if (statRef.current) {
      observer.observe(statRef.current);
    }

    return () => {
      if (statRef.current) {
        observer.unobserve(statRef.current);
      }
    };
  }, [hasAnimated]);

  const animateCount = () => {
    const duration = 2000; // 2 segundos
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
  };

  return (
    <div 
      ref={statRef}
      className={`bg-gradient-to-br from-[#7D44FF]/20 to-[#9C5EFF]/10 border border-[var(--color-primary)]/30 rounded-lg p-4 text-center hover:border-[var(--color-primary)] transition-all duration-300 ${className}`}
    >
      <div className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)] mb-2">
        {count}{suffix}
      </div>
      <div className="text-xs sm:text-sm text-gray-300 font-['Roboto_Mono',monospace]">
        {label}
      </div>
    </div>
  );
};
