import { useState, useEffect } from 'react';

interface TalkBoxProps {
  isVisible: boolean;
  message: string;
  onComplete?: () => void;
  onClick?: () => void;
  hint?: string;
  botName?: string;
}

export function TalkBox({ isVisible, message, onComplete, onClick, hint, botName }: TalkBoxProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  useEffect(() => {
    if (!isVisible) {
      setDisplayedText('');
      setIsTyping(false);
      setShowHint(false);
      return;
    }

    setIsTyping(true);
    setDisplayedText('');
    setShowHint(false);
    
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayedText(message.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        setShowHint(true);
        clearInterval(typingInterval);
        if (onComplete) {
          onComplete();
        }
      }
    }, 40);

    return () => clearInterval(typingInterval);
  }, [isVisible, message, onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className="relative w-full animate-[slideDown_0.4s_ease-out]"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick && !isTyping) {
          onClick();
        }
      }}
    >
      <div className="relative bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/10 backdrop-blur-md border-2 border-[var(--color-primary)]/40 rounded-2xl p-4 sm:p-5 lg:p-4 shadow-[0_8px_32px_rgba(125,68,255,0.3)] cursor-pointer hover:border-[var(--color-primary)]/60 transition-all duration-300 w-full">
  <div className="absolute -top-3 left-1/2 -translate-x-1/2 xl:left-auto xl:right-[15%] xl:translate-x-0 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-[var(--color-primary)]/40"></div>
  <div className="absolute -top-2 left-1/2 -translate-x-1/2 xl:left-auto xl:right-[15%] xl:translate-x-0 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-[var(--color-primary)]/20"></div>
        
        <p className="text-white/90 font-['Roboto_Mono',monospace] text-xs sm:text-sm lg:text-sm leading-relaxed text-left pr-2">
          {displayedText}
          {isTyping && (
            <span className="inline-block w-[2px] h-4 bg-[var(--color-primary)] ml-1 animate-pulse"></span>
          )}
        </p>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-primary)]/20">
            <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></div>
            <span className="text-[var(--color-primary)] font-[var(--font-montserrat)] text-xs font-semibold">
              {botName ?? 'Menebot'}
            </span>
          </div>
          
          {showHint && (
            <span className="text-white/60 font-[var(--font-montserrat)] text-xs italic animate-pulse">
              {hint ?? 'Clique para continuar →'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
