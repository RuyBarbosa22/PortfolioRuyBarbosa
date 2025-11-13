import { useState, useEffect, useRef } from 'react';
import menebotFrontImage from '/assets/images/menebotFront.png?url';
import menebotBlinkImage from '/assets/images/menebotBlink.png?url';
import wingLeftSvg from '/assets/icons/menebot-wing-left.svg?url';
import wingRightSvg from '/assets/icons/menebot-wing-right.svg?url';
import eyeSvg from '/assets/icons/menebot-eye.svg?url';
import closedEyeSvg from '/assets/icons/menebot-closed-eye.svg?url';

interface MenebotProps {
  className?: string;
  onSleepChange?: (isSleeping: boolean) => void;
  isExiting?: boolean;
}

export function Menebot({ className = '', onSleepChange, isExiting = false }: MenebotProps) {
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isFlapping, setIsFlapping] = useState(false);
  const [isSqueezing, setIsSqueezing] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const blinkIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const preloadImages = [menebotBlinkImage, closedEyeSvg];
    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const triggerSqueeze = () => {
    setIsSqueezing(true);
    setTimeout(() => setIsSqueezing(false), 300);
  };

  const triggerBlinkAndSqueeze = () => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 150);
    triggerSqueeze();
  };

  const sleepTimeoutRef = useRef<number | null>(null);

  const scheduleInactivity = () => {
    if (sleepTimeoutRef.current) {
      clearTimeout(sleepTimeoutRef.current);
    }
    
    setIsSleeping(false);
    
    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current);
    }
    blinkIntervalRef.current = window.setInterval(() => {
      triggerBlinkAndSqueeze();
    }, 6000);
    
    sleepTimeoutRef.current = window.setTimeout(() => {
      setIsSleeping(true);
      if (blinkIntervalRef.current) {
        clearInterval(blinkIntervalRef.current);
        blinkIntervalRef.current = null;
      }
    }, 35000);
  };

  const resetInactivity = () => {
    scheduleInactivity();
  };

  useEffect(() => {
    if (onSleepChange) {
      onSleepChange(isSleeping);
    }
  }, [isSleeping, onSleepChange]);

  useEffect(() => {
    scheduleInactivity();

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart'];
    for (const ev of events) window.addEventListener(ev, resetInactivity);

    return () => {
      if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
      if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);
      for (const ev of events) window.removeEventListener(ev, resetInactivity);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const maxDistance = 15;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const limitedDistance = Math.min(distance, maxDistance * 5);
      
      const angle = Math.atan2(deltaY, deltaX);
      const moveX = Math.cos(angle) * Math.min(limitedDistance / 5, maxDistance);
      const moveY = Math.sin(angle) * Math.min(limitedDistance / 5, maxDistance);

      setEyePosition({ x: moveX, y: moveY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleClick = () => {
    if (isSleeping) {
      setIsSleeping(false);
      triggerBlinkAndSqueeze();
      scheduleInactivity();
      return;
    }
    
    triggerBlinkAndSqueeze();

    setIsFlapping(true);
    setTimeout(() => setIsFlapping(false), 600);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        transition: 'transform 600ms cubic-bezier(.2,.9,.3,1), opacity 400ms ease',
        transform: isExiting ? 'translateY(-140px) scale(0.92)' : undefined,
        opacity: isExiting ? 0.0 : 1,
        pointerEvents: isExiting ? 'none' : undefined,
      }}
    >
      {isSleeping && (
        <div className="absolute -top-8 right-4 md:-top-12 md:right-6 lg:-top-16 lg:right-8 z-30 pointer-events-none">
          <div className="relative">
            <span 
              className="absolute text-white/80 font-bold text-3xl"
              style={{
                animation: 'floatZ 3s ease-in-out infinite',
                animationDelay: '0s',
                textShadow: '0 0 10px rgba(125, 68, 255, 0.5)'
              }}
            >
              Z
            </span>
            <span 
              className="absolute text-white/60 font-bold text-2xl left-8"
              style={{
                animation: 'floatZ 3s ease-in-out infinite',
                animationDelay: '0.5s',
                textShadow: '0 0 8px rgba(125, 68, 255, 0.4)'
              }}
            >
              z
            </span>
            <span 
              className="absolute text-white/40 font-bold text-xl left-12 top-2"
              style={{
                animation: 'floatZ 3s ease-in-out infinite',
                animationDelay: '1s',
                textShadow: '0 0 6px rgba(125, 68, 255, 0.3)'
              }}
            >
              z
            </span>
          </div>
        </div>
      )}
      
      <div 
        className="relative cursor-pointer"
        style={{ 
          animation: 'float 3s ease-in-out infinite',
        }}
        onClick={handleClick}
      >
        <div
          className="relative"
          style={{
            animation: isFlapping ? 'wingFlapActive 0.6s ease-in-out' : 'none',
            transform: isSqueezing ? 'scale(0.9, 1.1)' : 'scale(1, 1)',
            transition: 'transform 0.3s ease-out'
          }}
        >
          <img 
            src={wingLeftSvg}
            alt=""
            className="absolute pointer-events-none select-none"
            style={{
              width: '95px',
              height: '86px',
              left: '-8%',
              top: '42%',
              zIndex: 0,
              animation: 'wingBeatLeft 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
              transformOrigin: 'right center'
            }}
            draggable="false"
          />
          
          <img 
            src={wingRightSvg}
            alt=""
            className="absolute pointer-events-none select-none"
            style={{
              width: '95px',
              height: '86px',
              right: '-8%',
              top: '42%',
              zIndex: 0,
              animation: 'wingBeatRight 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
              transformOrigin: 'left center'
            }}
            draggable="false"
          />

          <img 
            src={isBlinking ? menebotBlinkImage : menebotFrontImage}
            alt="Menebot - Assistente virtual" 
            className="relative w-full h-full object-contain select-none pointer-events-none"
            style={{ zIndex: 1 }}
            draggable="false"
          />

        {!isBlinking && (
          <>
            <img 
              src={isSleeping ? closedEyeSvg : eyeSvg}
              alt=""
              className="sm:hidden absolute pointer-events-none select-none transition-transform duration-100 ease-out"
              style={{
                width: isSleeping ? '45px' : '34px',
                height: isSleeping ? '65px' : '50px',
                left: isSleeping ? '25%' : '30%',
                top: '38%',
                zIndex: 2,
                transform: isSleeping ? 'translate(0, 0)' : `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
              }}
              draggable="false"
            />
            
            <img 
              src={isSleeping ? closedEyeSvg : eyeSvg}
              alt=""
              className="sm:hidden absolute pointer-events-none select-none transition-transform duration-100 ease-out"
              style={{
                width: isSleeping ? '45px' : '34px',
                height: isSleeping ? '65px' : '50px',
                right: isSleeping ? '25%' : '30%',
                top: '38%',
                zIndex: 2,
                transform: isSleeping ? 'translate(0, 0)' : `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
              }}
              draggable="false"
            />
            
            <img 
              src={isSleeping ? closedEyeSvg : eyeSvg}
              alt=""
              className="hidden sm:block md:hidden absolute pointer-events-none select-none transition-transform duration-100 ease-out"
              style={{
                width: isSleeping ? '50px' : '38px',
                height: isSleeping ? '70px' : '54px',
                left: isSleeping ? '24%' : '29%',
                top: '38%',
                zIndex: 2,
                transform: isSleeping ? 'translate(0, 0)' : `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
              }}
              draggable="false"
            />
            
            <img 
              src={isSleeping ? closedEyeSvg : eyeSvg}
              alt=""
              className="hidden sm:block md:hidden absolute pointer-events-none select-none transition-transform duration-100 ease-out"
              style={{
                width: isSleeping ? '50px' : '38px',
                height: isSleeping ? '70px' : '54px',
                right: isSleeping ? '24%' : '29%',
                top: '38%',
                zIndex: 2,
                transform: isSleeping ? 'translate(0, 0)' : `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
              }}
              draggable="false"
            />
            
            <img 
              src={isSleeping ? closedEyeSvg : eyeSvg}
              alt=""
              className="hidden md:block lg:hidden absolute pointer-events-none select-none transition-transform duration-100 ease-out"
              style={{
                width: isSleeping ? '52px' : '40px',
                height: isSleeping ? '72px' : '58px',
                left: isSleeping ? '23%' : '27%',
                top: '38%',
                zIndex: 2,
                transform: isSleeping ? 'translate(0, 0)' : `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
              }}
              draggable="false"
            />
            
            <img 
              src={isSleeping ? closedEyeSvg : eyeSvg}
              alt=""
              className="hidden md:block lg:hidden absolute pointer-events-none select-none transition-transform duration-100 ease-out"
              style={{
                width: isSleeping ? '52px' : '40px',
                height: isSleeping ? '72px' : '58px',
                right: isSleeping ? '23%' : '27%',
                top: '38%',
                zIndex: 2,
                transform: isSleeping ? 'translate(0, 0)' : `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
              }}
              draggable="false"
            />
            
            <img 
              src={isSleeping ? closedEyeSvg : eyeSvg}
              alt=""
              className="hidden lg:block xl:hidden absolute pointer-events-none select-none transition-transform duration-100 ease-out"
              style={{
                width: isSleeping ? '50px' : '40px',
                height: isSleeping ? '70px' : '60px',
                left: isSleeping ? '22%' : '28%',
                top: '38%',
                zIndex: 2,
                transform: isSleeping ? 'translate(0, 0)' : `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
              }}
              draggable="false"
            />
            
            <img 
              src={isSleeping ? closedEyeSvg : eyeSvg}
              alt=""
              className="hidden lg:block xl:hidden absolute pointer-events-none select-none transition-transform duration-100 ease-out"
              style={{
                width: isSleeping ? '50px' : '40px',
                height: isSleeping ? '70px' : '60px',
                right: isSleeping ? '22%' : '28%',
                top: '38%',
                zIndex: 2,
                transform: isSleeping ? 'translate(0, 0)' : `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
              }}
              draggable="false"
            />
            
            <img 
              src={isSleeping ? closedEyeSvg : eyeSvg}
              alt=""
              className="hidden xl:block absolute pointer-events-none select-none transition-transform duration-100 ease-out"
              style={{
                width: isSleeping ? '55px' : '45px',
                height: isSleeping ? '75px' : '65px',
                left: isSleeping ? '23%' : '29%',
                top: '38%',
                zIndex: 2,
                transform: isSleeping ? 'translate(0, 0)' : `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
              }}
              draggable="false"
            />
            
            <img 
              src={isSleeping ? closedEyeSvg : eyeSvg}
              alt=""
              className="hidden xl:block absolute pointer-events-none select-none transition-transform duration-100 ease-out"
              style={{
                width: isSleeping ? '55px' : '45px',
                height: isSleeping ? '75px' : '65px',
                right: isSleeping ? '23%' : '29%',
                top: '38%',
                zIndex: 2,
                transform: isSleeping ? 'translate(0, 0)' : `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
              }}
              draggable="false"
            />
          </>  
        )}
        </div>
      </div>
    </div>
  );
}
