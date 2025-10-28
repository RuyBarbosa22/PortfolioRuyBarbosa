import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

export interface TalkBoxHandle {
  finishTyping: () => boolean; // returns true if it finished typing now
  next: () => void;
}

interface TalkBoxProps {
  isVisible: boolean;
  message: string;
  onComplete?: () => void;
  onClick?: () => void;
  hint?: string;
  botName?: string;
  confirm?: boolean; // if true, show Yes/No buttons when typing finishes
  onYes?: () => void;
  onNo?: () => void;
  yesLabel?: string;
  noLabel?: string;
}
export const TalkBox = forwardRef<TalkBoxHandle, TalkBoxProps>(function TalkBox(
  { isVisible, message, onComplete, onClick, hint, botName, confirm, onYes, onNo, yesLabel, noLabel }: TalkBoxProps,
  ref
) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isActionLocked, setIsActionLocked] = useState(false);
  const typingIntervalRef = useRef<number | null>(null);
  
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
    setShowConfirm(false);

    let currentIndex = 0;
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    typingIntervalRef.current = window.setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayedText(message.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        setShowHint(true);
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        if (onComplete) {
          onComplete();
        }
        if (confirm) {
          // show confirm buttons instead of hint
          setShowConfirm(true);
        }
      }
    }, 40);

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, [isVisible, message, onComplete]);

  useImperativeHandle(ref, () => ({
    finishTyping: () => {
      if (!isTyping) return false;
      // finish instantly
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      setDisplayedText(message);
      setIsTyping(false);
      setShowHint(true);
      if (onComplete) onComplete();
      if (confirm) setShowConfirm(true);
      return true;
    },
    next: () => {
      if (onClick) onClick();
    }
  }), [isTyping, message, onComplete, onClick, confirm]);

  if (!isVisible) return null;

  return (
    <div 
      className="relative w-full animate-[slideDown_0.4s_ease-out]"
      onClick={(e) => {
        e.stopPropagation();
        // If typing, finish instantly; otherwise treat as next
        if (isTyping) {
          // finish typing instantly
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          setDisplayedText(message);
          setIsTyping(false);
          setShowHint(true);
          if (onComplete) onComplete();
          if (confirm) setShowConfirm(true);
          return;
        }
        if (onClick) onClick();
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
            <span className="text-[var(--color-primary)] text-xs font-semibold">
              {botName ?? 'Menebot'}
            </span>
          </div>
          
            {showHint && !showConfirm && (
            <span className="text-white/60 text-xs italic animate-pulse">
              {hint ?? 'Clique para continuar →'}
            </span>
          )}

          {/* Confirm buttons area */}
          {showConfirm && (
            <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
              <button
                onClick={() => {
                  if (isActionLocked) return;
                  setIsActionLocked(true);
                  setShowConfirm(false);
                  if (typeof onYes === 'function') onYes();
                  // keep locked briefly to avoid double clicks
                  setTimeout(() => setIsActionLocked(false), 1200);
                }}
                disabled={isActionLocked}
                className="w-full sm:min-w-[88px] px-4 py-2 rounded-full bg-[var(--color-primary)] text-white text-sm font-semibold hover:brightness-105 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {yesLabel ?? 'Sim'}
              </button>

              <button
                onClick={() => {
                  if (isActionLocked) return;
                  setIsActionLocked(true);
                  setShowConfirm(false);
                  if (typeof onNo === 'function') onNo();
                  setTimeout(() => setIsActionLocked(false), 800);
                }}
                disabled={isActionLocked}
                className="w-full sm:min-w-[88px] px-4 py-2 rounded-full bg-transparent border border-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary)]/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {noLabel ?? 'Não'}
              </button>

              {/* small spinner/indicator when locked */}
              {isActionLocked && (
                <div className="ml-2 w-5 h-5 border-2 border-white/20 border-t-[var(--color-primary)] rounded-full animate-spin" aria-hidden="true"></div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
