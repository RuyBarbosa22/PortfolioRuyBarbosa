import { useState, useEffect, useRef } from 'react';
import menebotFrontImage from '/assets/images/menebotFront.png';
import menebotBlinkImage from '/assets/images/menebotBlink.png';
import wingLeftSvg from '/assets/icons/menebot-wing-left.svg';
import wingRightSvg from '/assets/icons/menebot-wing-right.svg';
import eyeSvg from '/assets/icons/menebot-eye.svg';
import closedEyeSvg from '/assets/icons/menebot-closed-eye.svg';

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

  // Função para executar o squeeze
  const triggerSqueeze = () => {
    setIsSqueezing(true);
    setTimeout(() => setIsSqueezing(false), 300);
  };

  // Função para piscar + squeeze
  const triggerBlinkAndSqueeze = () => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 150);
    triggerSqueeze();
  };

  // Inactivity timer: sono após 35s sem interação do usuário
  const sleepTimeoutRef = useRef<number | null>(null);

  const scheduleInactivity = () => {
    if (sleepTimeoutRef.current) {
      clearTimeout(sleepTimeoutRef.current);
    }
    
    // Resetar sono
    setIsSleeping(false);
    
    // Iniciar/reiniciar intervalo de piscar a cada 10s
    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current);
    }
    blinkIntervalRef.current = window.setInterval(() => {
      triggerBlinkAndSqueeze();
    }, 6000);
    
    // Timer de sono após 35s
    sleepTimeoutRef.current = window.setTimeout(() => {
      setIsSleeping(true);
      // Parar animações automáticas quando dormir
      if (blinkIntervalRef.current) {
        clearInterval(blinkIntervalRef.current);
        blinkIntervalRef.current = null;
      }
    }, 35000); // 35 segundos
  };

  const resetInactivity = () => {
    scheduleInactivity();
  };

  // Notificar o componente pai quando o estado de sono mudar
  useEffect(() => {
    if (onSleepChange) {
      onSleepChange(isSleeping);
    }
  }, [isSleeping, onSleepChange]);

  useEffect(() => {
    // Start the inactivity timer
    scheduleInactivity();

    // Any user interaction resets the inactivity timer
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart'];
    for (const ev of events) window.addEventListener(ev, resetInactivity);

    return () => {
      if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
      if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);
      for (const ev of events) window.removeEventListener(ev, resetInactivity);
    };
  }, []);

  // Nota: wing-flap e squeeze agora são acionados apenas ao clicar.
  // Removemos os intervals automáticos para que o usuário controle
  // quando as animações ocorrem.

  // Rastrear movimento do mouse para os olhos seguirem
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calcular distância do mouse ao centro do Menebot
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Limitar movimento dos olhos (máximo 15px em cada direção)
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

  // Handler para piscar ao clicar (acorda se estiver dormindo)
  const handleClick = () => {
    // Se estiver dormindo, acorda e reinicia timers
    if (isSleeping) {
      setIsSleeping(false);
      triggerBlinkAndSqueeze();
      scheduleInactivity();
      return;
    }
    
    // Estado normal: blink + squeeze
    triggerBlinkAndSqueeze();

    // Wing flap
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
      {/* Animação de Zs quando dormindo */}
      {isSleeping && (
        <div className="absolute -top-8 right-4 md:-top-12 md:right-6 lg:-top-16 lg:right-8 z-30 pointer-events-none">
          <div className="relative">
            {/* Z grande */}
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
            {/* Z médio */}
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
            {/* Z pequeno */}
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
      
      {/* Container com animação de flutuação */}
      <div 
        className="relative cursor-pointer"
        style={{ 
          animation: 'float 3s ease-in-out infinite',
        }}
        onClick={handleClick}
      >
        {/* Container interno para wingFlap e squeeze */}
        <div
          className="relative"
          style={{
            animation: isFlapping ? 'wingFlapActive 0.6s ease-in-out' : 'none',
            transform: isSqueezing ? 'scale(0.9, 1.1)' : 'scale(1, 1)',
            transition: 'transform 0.3s ease-out'
          }}
        >
          {/* Asinhas (renderizadas atrás do corpo) */}
          {/* Asa Esquerda */}
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
          
          {/* Asa Direita */}
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

          {/* Corpo do Menebot (z-index maior para ficar na frente) */}
          <img 
            src={isBlinking ? menebotBlinkImage : menebotFrontImage}
            alt="Menebot - Assistente virtual" 
            className="relative w-full h-full object-contain select-none pointer-events-none"
            style={{ zIndex: 1 }}
            draggable="false"
          />

        {/* Olhos que seguem o mouse (apenas quando não está piscando) */}
        {!isBlinking && (
          <>
            {/* Olho Esquerdo - Mobile Extra Pequeno (<425px) */}
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
            
            {/* Olho Direito - Mobile Extra Pequeno (<425px) */}
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
            
            {/* Olho Esquerdo - Mobile (425px-768px) */}
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
            
            {/* Olho Direito - Mobile (425px-768px) */}
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
            
            {/* Olho Esquerdo - Tablet (md) - Tamanho ajustado */}
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
            
            {/* Olho Direito - Tablet (md) - Tamanho ajustado */}
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
            
            {/* Olho Esquerdo - Desktop (1024px-1280px) */}
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
            
            {/* Olho Direito - Desktop (1024px-1280px) */}
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
            
            {/* Olho Esquerdo - Desktop XL (>=1280px) */}
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
            
            {/* Olho Direito - Desktop XL (>=1280px) */}
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
