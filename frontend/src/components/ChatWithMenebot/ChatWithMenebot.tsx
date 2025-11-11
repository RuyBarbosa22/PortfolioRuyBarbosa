import React, { useState, useEffect, useCallback } from 'react';
import { useMenebotChat } from '../../context/MenebotChatContext';
import { postVisit } from '../../utils/metrics';
import menebotFrente from '/assets/content/menebot/menebot_frente.png';
import menebotEsquerda from '/assets/content/menebot/menebot_esquerda.png';
import menebotDireita from '/assets/content/menebot/menebot_direita.png';
import menebotOlhoFechado from '/assets/content/menebot/menebot_olho_fechado.png';
import menebotPiscando from '/assets/content/menebot/menebot_piscando.png';
import menebotCima from '/assets/content/menebot/menebot_cima.png';
import menebotBaixo from '/assets/content/menebot/menebot_baixo.png';
import { MenebotChat } from '../MenebotChat/MenebotChat';

interface ChatWithMenebotProps {
  language?: 'pt' | 'en' | 'es';
}

// Posições dos Menebots - simétricos e bem espaçados
  const menebotPositions = [
  { image: menebotFrente, top: '15%', left: '8%', xlLeft: '4%' },
  { image: menebotDireita, top: '15%', right: '8%', xlRight: '4%' },
    
  { image: menebotEsquerda, top: '42%', left: '10%', xlLeft: '6%' },
  { image: menebotOlhoFechado, top: '42%', right: '10%', xlRight: '6%' },
    
  { image: menebotFrente, top: '68%', left: '8%', xlLeft: '4%' },
  { image: menebotPiscando, top: '68%', right: '8%', xlRight: '4%' },
    
  { image: menebotCima, bottom: '16%', left: '32%', xlLeft: '24%' },
  { image: menebotBaixo, bottom: '16%', right: '32%', xlRight: '24%' },
  ];

// Counter banner component (6 digits) - fetches real metrics and animates to value
const CounterBanner: React.FC<{ counterTitle: string }> = ({ counterTitle }) => {
  const [value, setValue] = useState(0);
  const counterRef = React.useRef<HTMLDivElement>(null);
  const hasAnimatedRef = React.useRef(false);

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
    const CACHE_KEY = 'menebot_metrics_cache';
    const CACHE_TTL = Number(import.meta.env.VITE_METRICS_CACHE_TTL_MS || 30000);
    let rafId = 0;
    let start: number | null = null;
    const duration = 2000; // animation duration

    const animateTo = (target: number) => {
      start = null;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start!) / duration, 1);
        const v = Math.floor(progress * target);
        setValue(v);
        if (progress < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          setValue(target);
        }
      };
      rafId = requestAnimationFrame(step);
    };

    let mounted = true;

    const fetchAndAnimate = async () => {
      // If we have a recent value in sessionStorage, use it and avoid network calls
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.ts && Date.now() - parsed.ts < CACHE_TTL) {
            const base = Number(parsed.value ?? 0) || 0;
            animateTo(base + 40);
            return;
          }
        }
      } catch (e) {
        // ignore storage errors
      }

      // Retry logic: try multiple times before falling back
      const attempts = 4;
      const delays = [500, 1000, 2000, 3000];
      for (let i = 0; i < attempts; i++) {
        try {
          const res = await fetch(`${API_BASE}/api/metrics`, { credentials: 'include' });
          if (!res.ok) throw new Error('Metrics fetch failed');
          const j = await res.json();
          if (!mounted) return;
          // Prefer verifiedUsers (users who went through verification), fallback to visits
          // Add +40 to the real value as requested
          const base = Number(j.verifiedUsers ?? j.visits ?? 0) || 0;
          const target = base + 40;
          // Store in sessionStorage for quick subsequent loads
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ value: base, ts: Date.now() }));
          } catch (e) {
            /* ignore */
          }
          animateTo(target);
          return;
        } catch (err) {
          // wait before next attempt (if any)
          if (i < delays.length) await new Promise((r) => setTimeout(r, delays[i]));
        }
      }
      if (!mounted) return;
      animateTo(140);
    };

    // Intersection Observer: only trigger animation when element is visible
    if (!counterRef.current) {
      return;
    }

    if (hasAnimatedRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            fetchAndAnimate();
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of the element is visible
        rootMargin: '0px'
      }
    );

    observer.observe(counterRef.current);

    return () => {
      mounted = false;
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  const display = String(value).padStart(6, '0');

  return (
    <div ref={counterRef} className="w-full flex justify-center mt-12">
      <div className="text-center w-full">
        <h3 className="text-lg md:text-xl font-semibold text-[var(--color-primary)] mb-2 text-center">{counterTitle}</h3>
        <div className="font-['Roboto_Mono',monospace] text-4xl md:text-6xl font-extrabold tracking-[0.06em] text-white">
          {display}
        </div>
      </div>
    </div>
  );
};

export const ChatWithMenebot: React.FC<ChatWithMenebotProps> = ({ language = 'pt' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [showCheckAnimation, setShowCheckAnimation] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null); // para navegação futura
  const [savedEmail, setSavedEmail] = useState(''); // Email salvo para o chat
  const [step, setStep] = useState<'enter-email'|'enter-code'|'validated'|'welcome-back'>('enter-email');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visitSentAfterVerify, setVisitSentAfterVerify] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
  const [sessionId, setSessionId] = useState<string | null>(null);

  const contentByLang: Record<string, { 
    title: string; 
    description: string; 
    buttonText: string; 
    modalTitle: string; 
    modalDescription: string; 
    modalButton: string; 
    invalidEmail: string; 
    successMessage: string; 
    chatButton: string;
    counterTitle: string;
    verifyEmailTitle: string;
    verifyButton: string;
    invalidCode: string;
    codeExpired: string;
    networkError: string;
    sendingCode: string;
    finalizing: string;
    tooManyRequests: string;
    welcomeBack: string;
    welcomeBackMessage: string;
  }> = {
    pt: {
      title: 'Fale com o menebot!',
      description: 'Criei um chatbot super bacana para o meu portfólio, usando os serviços da AWS e muita programação em Typescript. Ele acessa um PDF cheio de informações sobre mim e está pronto para responder suas perguntas sobre minhas habilidades e experiências. Quer saber mais sobre meu trabalho de um jeito divertido e interativo? Converse com o Menebot e descubra como minhas competências podem brilhar em diferentes contextos profissionais! Vai lá, experimente e se surpreenda!',
      buttonText: 'Falar com menebot',
      modalTitle: 'Me deixe saber quem é você',
      modalDescription: 'Digite seu email abaixo',
      modalButton: 'Prosseguir',
      invalidEmail: 'Email inválido. Por favor, verifique e tente novamente.',
      successMessage: 'Você já pode testar essa funcionalidade',
      chatButton: 'Conversar com menebot',
      counterTitle: 'Usuários que já testaram o Menebot!',
      verifyEmailTitle: 'Verifique seu e-mail',
      verifyButton: 'Verificar',
      invalidCode: 'Código inválido',
      codeExpired: 'Código expirado ou não encontrado',
      networkError: 'Erro de rede. Tente novamente.',
      sendingCode: 'Enviando...',
      finalizing: 'Finalizando...',
      tooManyRequests: 'Muitas tentativas. Tente novamente em 5 minutos.',
      welcomeBack: 'Bem-vindo de volta!',
      welcomeBackMessage: 'Você já está autenticado. Vamos conversar?'
    },
    en: {
      title: 'Chat with Menebot!',
      description: 'I built a fun and smart chatbot for my portfolio using AWS services and plenty of TypeScript. It connects to a PDF packed with details about me and can answer your questions about my skills, experience, and projects. Want to explore my work in a fun, interactive way? Talk to Menebot and see how my abilities can make an impact in different professional settings! Give it a try — you might be surprised!',
      buttonText: 'Chat with Menebot',
      modalTitle: 'Tell me who you are',
      modalDescription: 'Type your email below',
      modalButton: 'Continue',
      invalidEmail: 'Invalid email. Please check and try again.',
      successMessage: 'You can now test this feature',
      chatButton: 'Start chatting with Menebot',
      counterTitle: 'Users who have tested Menebot!',
      verifyEmailTitle: 'Verify your email',
      verifyButton: 'Verify',
      invalidCode: 'Invalid code',
      codeExpired: 'Code expired or not found',
      networkError: 'Network error. Please try again.',
      sendingCode: 'Sending...',
      finalizing: 'Finalizing...',
      tooManyRequests: 'Too many attempts. Please try again in 5 minutes.',
      welcomeBack: 'Welcome back!',
      welcomeBackMessage: 'You are already authenticated. Let\'s chat?'
    },
    es: {
      title: '¡Chatea con Menebot!',
      description: 'Desarrollé un chatbot divertido e inteligente para mi portafolio usando los servicios de AWS y mucha programación en TypeScript. Se conecta a un PDF lleno de información sobre mí y está listo para responder tus preguntas sobre mis habilidades, experiencias y proyectos. ¿Quieres conocer mi trabajo de una forma entretenida e interactiva? ¡Habla con Menebot y descubre cómo mis capacidades pueden destacar en distintos entornos profesionales! ¡Anímate a probarlo y déjate sorprender!',
      buttonText: 'Chatear con Menebot',
      modalTitle: 'Cuéntame quién eres',
      modalDescription: 'Escribe tu correo electrónico abajo',
      modalButton: 'Continuar',
      invalidEmail: 'Correo electrónico no válido. Por favor, verifica e inténtalo de nuevo.',
      successMessage: 'Ya puedes probar esta función',
      chatButton: 'Empezar a chatear con Menebot',
      counterTitle: '¡Usuarios que han probado Menebot!',
      verifyEmailTitle: 'Verifica tu correo electrónico',
      verifyButton: 'Verificar',
      invalidCode: 'Código inválido',
      codeExpired: 'Código expirado o no encontrado',
      networkError: 'Error de red. Inténtalo de nuevo.',
      sendingCode: 'Enviando...',
      finalizing: 'Finalizando...',
      tooManyRequests: 'Demasiados intentos. Inténtalo de nuevo en 5 minutos.',
      welcomeBack: '¡Bienvenido de vuelta!',
      welcomeBackMessage: 'Ya estás autenticado. ¿Hablamos?'
    }
  };

  const content = contentByLang[language];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleProceed = async () => {
    setEmailError('');
    setCodeError('');

    if (!validateEmail(email)) {
      setEmailError(content.invalidEmail);
      return;
    }

    // Check if user was recently authenticated (within 30 minutes)
    setIsLoading(true);
    try {
      const checkRes = await fetch(`${API_BASE}/api/auth/check-recent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (checkRes.ok) {
        const data = await checkRes.json();
        if (data.recentlyAuthenticated) {
          // User was authenticated recently, show welcome back screen
          setIsLoading(false);
          setStep('welcome-back');
          return;
        }
      }
    } catch (err) {
      // Continue with normal flow if check fails
    }

    // Request verification code from backend
    fetch(`${API_BASE}/api/auth/request-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, language: language || 'pt' }),
    })
      .then(async (res) => {
        setIsLoading(false);
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          // Handle too many requests (429)
          if (res.status === 429) {
            setEmailError(content.tooManyRequests);
          } else {
            setEmailError(j.message || content.networkError);
          }
          return;
        }
        // move to code entry step
        setStep('enter-code');
      })
      .catch(() => {
        setIsLoading(false);
        setEmailError(content.networkError);
      });
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setEmail('');
    setEmailError('');
    setIsValidated(false);
    setShowCheckAnimation(false);
    setStep('enter-email');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEmail('');
    setEmailError('');
    setIsValidated(false);
    setShowCheckAnimation(false);
    setStep('enter-email');
  };

  // Bloqueia/desbloqueia scroll do body ao abrir/fechar chat
  useEffect(() => {
    if (showChat) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showChat]);

  // Função para realmente fechar o chat (usada após confirmação)
  const { clearPendingSection, pendingSection: globalPendingSection, setChatOpen: setGlobalChatOpen } = useMenebotChat();
  const doCloseChat = useCallback(() => {
    setShowChat(false);
    setSessionId(null);
    setShowConfirmClose(false);
    setPendingSection(null);
    clearPendingSection(); // limpa pendingSection global para restaurar menu
    // atualiza estado global
    setGlobalChatOpen(false);
  }, [clearPendingSection, setGlobalChatOpen]);

  // Handler para X/menu: pede confirmação
  const handleRequestCloseChat = useCallback((sectionId?: string) => {
    setShowConfirmClose(true);
    setPendingSection(sectionId || null);
  }, []);

  // Handler para confirmação de saída
  const handleConfirmClose = useCallback(() => {
    setTimeout(async () => {
      try {
        if (sessionId) {
          await fetch(`${API_BASE}/api/auth/session-end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: savedEmail, sessionId }),
          });
        }
      } catch (e) {
        // Silent fail - session end is not critical
      }
      doCloseChat();
      // Se veio do menu, rolar para a seção após fechar
      if (pendingSection) {
        setTimeout(() => {
          const el = document.getElementById(pendingSection);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
      }
    }, 300);
  }, [sessionId, savedEmail, doCloseChat, pendingSection]);

  // Handler para cancelar saída
  const handleCancelClose = useCallback(() => {
    setShowConfirmClose(false);
    setPendingSection(null);
  }, []);

  // Handler para abrir o chat (iniciar sessão)
  const handleChatWithMenebot = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/session-start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setIsLoading(false);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setEmailError(j.message || 'Erro ao iniciar sessão');
        return;
      }
      const json = await res.json();
      const sid = json.sessionId as string | undefined;
      setSessionId(sid || null);
      setSavedEmail(email);
      setTimeout(() => {
        setShowChat(true);
        setGlobalChatOpen(true);
        handleCloseModal();
      }, 300);
    } catch {
      setIsLoading(false);
      setEmailError('Erro de rede ao iniciar sessão');
    }
  };

  // Não fecha mais ao clicar fora! Só X ou menu.
  // handleCloseChat só chamado internamente após confirmação

  // Se o Navbar pediu navegação (pendingSection global) enquanto o chat está aberto,
  // exibimos a modal de confirmação aqui e guardamos a seção pendente localmente.
  useEffect(() => {
    if (globalPendingSection && showChat) {
      setPendingSection(globalPendingSection);
      setShowConfirmClose(true);
    }
  }, [globalPendingSection, showChat]);

  return (
    <section className="relative w-full bg-black py-24 md:py-48 lg:py-60 overflow-hidden min-h-screen">
      {/* Conteúdo da section com fade out durante transição */}
      <div 
        className={`transition-opacity duration-500 ${showChat ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        {/* Menebots decorativos - visíveis em lg (menores) e xl (grandes) */}
        {/* LG: 1024px-1280px */}
        {menebotPositions.map((menebot, index) => (
          <div
            key={"lg-"+index}
            className="absolute hidden lg:block xl:hidden transition-transform duration-300 hover:-translate-y-2"
            style={{
              top: menebot.top,
              bottom: menebot.bottom,
              left: menebot.left,
              right: menebot.right,
              zIndex: 1,
            }}
          >
            <img
              src={menebot.image}
              alt="Menebot"
              className="w-28 h-28 object-contain"
            />
          </div>
        ))}
        {/* XL: >1280px */}
        {menebotPositions.map((menebot, index) => (
          <div
            key={"xl-"+index}
            className="absolute hidden xl:block transition-transform duration-300 hover:-translate-y-2"
            style={{
              top: menebot.top,
              bottom: menebot.bottom,
              left: menebot.xlLeft ? menebot.xlLeft : menebot.left,
              right: menebot.xlRight ? menebot.xlRight : menebot.right,
              zIndex: 1,
            }}
          >
            <img
              src={menebot.image}
              alt="Menebot"
              className="w-56 h-56 object-contain"
            />
          </div>
        ))}

        {/* Conteúdo central */}
        <div className="relative z-10 max-w-[900px] mx-auto px-6 sm:px-8 md:px-8 lg:px-12">
          {/* Título com Menebots nas laterais */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 text-[var(--color-primary)] font-['Montserrat',sans-serif]">
              {content.title}
            </h2>
          </div>

          {/* Descrição - padrão Hero/MyStory */}
          <p className="text-sm sm:text-base md:text-xl text-gray-200 font-['Roboto_Mono',monospace] font-normal leading-relaxed mb-12 max-w-[800px] md:mx-auto text-justify lg:text-center">
            {content.description}
          </p>

          {/* Botão CTA */}
          <div className="flex justify-center items-center gap-12 md:gap-16">
            {/* Menebot direita (invertido) - visível entre sm (640px) e lg (1024px) */}
            <img 
              src={menebotDireita} 
              alt="Menebot" 
              className="hidden sm:block lg:hidden w-20 h-20 md:w-28 md:h-28 object-contain transition-transform duration-300 hover:-translate-y-2 hover:scale-110"
            />
            
            <button 
              onClick={handleOpenModal}
              className="group relative inline-flex items-center gap-3 bg-[var(--color-primary)] hover:bg-[#6D3FE8] text-white font-semibold px-6 md:px-8 py-3 sm:py-3.5 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
            >
            <span className="text-sm sm:text-base md:text-lg">{content.buttonText}</span>
            <svg 
              className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            </button>

            {/* Menebot esquerda (invertido) - visível entre sm (640px) e lg (1024px) */}
            <img 
              src={menebotEsquerda} 
              alt="Menebot" 
              className="hidden sm:block lg:hidden w-20 h-20 md:w-28 md:h-28 object-contain transition-transform duration-300 hover:-translate-y-2 hover:scale-110"
            />
          </div>

          {/* Contador centralizado (6 dígitos) - mostra abaixo do CTA e centralizado em todas as resoluções */}
          <CounterBanner counterTitle={content.counterTitle} />
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div 
            className="relative bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-purple-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {step === 'enter-email' && !isValidated ? (
              <>
                {/* Título */}
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center">
                  {content.modalTitle}
                </h3>
                
                {/* Descrição */}
                <p className="text-sm sm:text-base md:text-lg text-gray-200 font-['Roboto_Mono',monospace] font-normal leading-relaxed mb-6 text-center">
                  {content.modalDescription}
                </p>

                {/* Input de Email */}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleProceed()}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors mb-2"
                />

                {/* Mensagem de erro */}
                {emailError && (
                  <p className="text-red-400 text-sm mb-4 text-center font-['Roboto_Mono',monospace]">
                    {emailError}
                  </p>
                )}

                {/* Botão Prosseguir */}
                <button
                  onClick={handleProceed}
                  disabled={isLoading}
                  className="w-full bg-[var(--color-primary)] hover:bg-[#6D3FE8] text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 mt-4 disabled:opacity-60"
                >
                  {isLoading ? content.sendingCode : content.modalButton}
                </button>
              </>
            ) : step === 'welcome-back' ? (
              // Welcome back screen - user was recently authenticated
              <>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-12 h-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white text-center">{content.welcomeBack}</h3>
                  <p className="text-gray-300 text-center">{content.welcomeBackMessage}</p>
                  <button
                    onClick={handleChatWithMenebot}
                    className="w-full bg-[var(--color-primary)] hover:bg-[#6D3FE8] text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 mt-2"
                  >
                    {content.chatButton}
                  </button>
                </div>
              </>
            ) : step === 'enter-code' && !isValidated ? (
              <>
                {/* Animação de Check */}
                {showCheckAnimation && (
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Loading final state: shows while waiting extraDelay (1s + validation time) */}
                {isFinalizing && (
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="w-8 h-8 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    <p className="text-sm text-gray-300">{content.finalizing}</p>
                  </div>
                )}

                {/* Enter verification code */}
                <h4 className="text-white font-semibold text-center mb-3">{content.verifyEmailTitle}</h4>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Código de 6 dígitos"
                  className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors mb-2 text-center disabled:opacity-60"
                  disabled={isFinalizing || isLoading}
                />
                {codeError && <p className="text-red-400 text-sm mb-2 text-center">{codeError}</p>}

                <div>
                    <button
                      onClick={async () => {
                        setCodeError('');
                        if (!code || code.trim().length < 4) {
                          setCodeError(content.invalidCode);
                          return;
                        }

                        // measure validation time (from request start to response)
                        const verifyStart = Date.now();
                        setIsLoading(true);
                        try {
                          const res = await fetch(`${API_BASE}/api/auth/verify-code`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, code }),
                          });
                          const validationDuration = Date.now() - verifyStart;
                          setIsLoading(false);
                          if (!res.ok) {
                            const j = await res.json().catch(() => ({}));
                            setCodeError(j.message || content.codeExpired);
                            return;
                          }

                          // Show check icon, then a loading state for 1s + validationDuration
                          setShowCheckAnimation(true);
                          setIsFinalizing(true);
                          const extraDelay = 1000 + validationDuration; // 1s + time taken by validation

                          setTimeout(() => {
                            setShowCheckAnimation(false);
                            setIsFinalizing(false);
                            setIsValidated(true);
                            setStep('validated');
                            // report visit after successful verification (only once per modal/session)
                            if (!visitSentAfterVerify) {
                              postVisit().catch(() => {
                                // Silent fail - metrics not critical
                              });
                              setVisitSentAfterVerify(true);
                            }
                          }, extraDelay);
                        } catch (err) {
                          setIsLoading(false);
                          setCodeError(content.networkError);
                        }
                      }}
                      disabled={isFinalizing || isLoading}
                      className="w-full bg-[var(--color-primary)] text-white font-semibold py-3 rounded-lg disabled:opacity-60"
                    >
                      {content.verifyButton}
                    </button>
                </div>
                {/* O botão de abrir o chat não deve ser exibido enquanto o usuário não estiver validado.
                    Ele aparece na tela final (quando isValidated === true). */}
              </>
            ) : (
              // Caso final: usuário já validado - mostra mensagem de sucesso e botão para abrir o chat
              <>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white text-center">{content.successMessage}</h3>
                  <button
                    onClick={handleChatWithMenebot}
                    className="w-full bg-[var(--color-primary)] hover:bg-[#6D3FE8] text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 mt-2"
                  >
                    {content.chatButton}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Chat Component - Ocupa toda a section com fade in */}
      {showChat && (
        // Colocamos z menor que o header (header z-50) para que a navbar permaneça visível
        <div className="fixed inset-0 z-40 animate-fadeIn">
          <MenebotChat
            email={savedEmail}
            onClose={() => handleRequestCloseChat()}
            onForceClose={doCloseChat}
            language={language}
          />
          {/* Modal de confirmação de saída */}
          {showConfirmClose && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn p-4">
              <div className="relative bg-gradient-to-br from-[#181825] to-black border border-[var(--color-primary)]/40 rounded-2xl px-6 sm:px-8 py-8 sm:py-10 max-w-md w-full shadow-2xl shadow-[var(--color-primary)]/20 flex flex-col items-center animate-fadeInUp">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-3 text-center font-['Montserrat',sans-serif] tracking-tight drop-shadow-[0_2px_12px_rgba(125,68,255,0.25)]">
                  {language === 'en' ? 'Do you really want to leave?' : language === 'es' ? '¿Realmente deseas salir?' : 'Deseja realmente sair?'}
                </h3>
                <p className="text-sm sm:text-base text-gray-300 text-center mb-6 sm:mb-7 font-['Roboto_Mono',monospace]">
                  {language === 'en' ? 'You will lose this conversation.' : language === 'es' ? 'Perderás esta conversación.' : 'Você perderá essa conversa.'}
                </p>
                <div className="flex flex-row gap-3 sm:gap-4 w-full justify-center">
                  {/* Botão NÃO: solid, igual HeroSection */}
                  <button
                    onClick={handleCancelClose}
                    className="w-24 sm:w-auto sm:min-w-[120px] px-4 sm:px-6 md:px-8 py-3 bg-[var(--color-primary)] text-white font-semibold text-sm sm:text-base rounded-full hover:bg-[var(--color-primary-light)] hover:drop-shadow-[0_0_12px_rgba(125,68,255,0.6)] transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {language === 'en' ? 'No' : language === 'es' ? 'No' : 'Não'}
                  </button>
                  {/* Botão SIM: outline, igual HeroSection */}
                  <button
                    onClick={handleConfirmClose}
                    className="w-24 sm:w-auto sm:min-w-[120px] px-4 sm:px-6 md:px-8 py-3 bg-transparent border-2 border-[var(--color-primary)]/60 text-white font-semibold text-sm sm:text-base rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center justify-center gap-2 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/15 hover:shadow-[0_0_16px_rgba(125,68,255,0.5),0_0_8px_rgba(125,68,255,0.3)] hover:-translate-y-px whitespace-nowrap"
                  >
                    {language === 'en' ? 'Yes' : language === 'es' ? 'Sí' : 'Sim'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
