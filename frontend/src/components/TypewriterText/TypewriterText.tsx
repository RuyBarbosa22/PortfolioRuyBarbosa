import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  fullstackPauseDuration?: number;
}

export function TypewriterText({
  words,
  typingSpeed = 150,
  deletingSpeed = 100,
  pauseDuration = 2000,
  fullstackPauseDuration = 6000,
}: TypewriterTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Reset animation when words array changes (language change)
  useEffect(() => {
    console.log('🔄 Idioma mudou, resetando animação');
    setCurrentWordIndex(0);
    setCurrentText('');
    setIsDeleting(false);
    setIsPaused(false);
  }, [words]);

  const currentWord = words[currentWordIndex];
  const isFullstackWord = currentWord.startsWith('Fullstack');
  const isFullstackComplete = isFullstackWord && currentText === currentWord && !isDeleting;

  useEffect(() => {
    if (isPaused) {
      const currentPause = isFullstackWord ? fullstackPauseDuration : pauseDuration;
      const t = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, currentPause);
      return () => clearTimeout(t);
    }

    if (!isDeleting && currentText === currentWord) {
      setIsPaused(true);
      return;
    }

    if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentWordIndex((p) => (p + 1) % words.length);
      return;
    }

    const t = setTimeout(() => {
      setCurrentText((prev) => {
        if (isDeleting) return currentWord.substring(0, Math.max(0, prev.length - 1));
        return currentWord.substring(0, prev.length + 1);
      });
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(t);
  }, [
    currentText,
    isDeleting,
    isPaused,
    currentWordIndex,
    words,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    fullstackPauseDuration,
    currentWord,
    isFullstackWord,
  ]);

  // classe a aplicar no span do texto:
  // se for Fullstack completo -> class "typewriter-word fullstack"
  // caso contrário -> "typewriter-word purple"
  const wordClass = isFullstackComplete ? 'typewriter-word fullstack' : 'typewriter-word purple';

  return (
    <span className="inline-block min-w-[160px] sm:min-w-[200px] md:min-w-[280px] lg:min-w-[400px] align-middle" style={{ background: 'transparent', verticalAlign: 'middle' }}>
      {/* Texto (usa classes CSS definidas acima) */}
      <span className={wordClass}>
        {/* quando currentText for vazio, deixamos string vazia (o min-w do wrapper já mantém espaço) */}
        {currentText}
      </span>

      {/* ponto branco (aparece ANTES do cursor) */}
      {isFullstackComplete && <span style={{ color: 'white' }}>.</span>}

      {/* cursor */}
      <span className="animate-pulse text-white">|</span>
    </span>
  );
}
