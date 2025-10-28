import React, { useState } from 'react';
import menebotFrente from '../../assets/content/menebot/menebot_frente.png';
import menebotEsquerda from '../../assets/content/menebot/menebot_esquerda.png';
import menebotDireita from '../../assets/content/menebot/menebot_direita.png';
import menebotOlhoFechado from '../../assets/content/menebot/menebot_olho_fechado.png';
import menebotPiscando from '../../assets/content/menebot/menebot_piscando.png';
import menebotCima from '../../assets/content/menebot/menebot_cima.png';
import menebotBaixo from '../../assets/content/menebot/menebot_baixo.png';
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

export const ChatWithMenebot: React.FC<ChatWithMenebotProps> = ({ language = 'pt' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [showCheckAnimation, setShowCheckAnimation] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [savedEmail, setSavedEmail] = useState(''); // Email salvo para o chat
  const [step, setStep] = useState<'enter-email'|'enter-code'>('enter-email');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
  const [sessionId, setSessionId] = useState<string | null>(null);

  const contentByLang: Record<string, { title: string; description: string; buttonText: string; modalTitle: string; modalDescription: string; modalButton: string; invalidEmail: string; successMessage: string; chatButton: string }> = {
    pt: {
      title: 'Fale com o menebot!',
      description: 'Criei um chatbot super bacana para o meu portfólio, usando os serviços da AWS e muita programação em Typescript. Ele acessa um PDF cheio de informações sobre mim e está pronto para responder suas perguntas sobre minhas habilidades e experiências. Quer saber mais sobre meu trabalho de um jeito divertido e interativo? Converse com o Menebot e descubra como minhas competências podem brilhar em diferentes contextos profissionais! Vai lá, experimente e se surpreenda!',
      buttonText: 'Falar com menebot',
      modalTitle: 'Me deixe saber quem é você',
      modalDescription: 'Digite seu email abaixo',
      modalButton: 'Prosseguir',
      invalidEmail: 'Email inválido. Por favor, verifique e tente novamente.',
      successMessage: 'Você já pode testar essa funcionalidade',
      chatButton: 'Conversar com menebot'
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
      chatButton: 'Start chatting with Menebot'
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
      chatButton: 'Empezar a chatear con Menebot'
    }
  };

  const content = contentByLang[language];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleProceed = () => {
    setEmailError('');
    setCodeError('');

    if (!validateEmail(email)) {
      setEmailError(content.invalidEmail);
      return;
    }

    // Request verification code from backend
    setIsLoading(true);
    fetch(`${API_BASE}/api/auth/request-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then(async (res) => {
        setIsLoading(false);
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setEmailError(j.message || 'Erro ao enviar código');
          return;
        }
        // move to code entry step
        setStep('enter-code');
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        setEmailError('Erro de rede. Tente novamente.');
      });
      ;

  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setEmail('');
    setEmailError('');
    setIsValidated(false);
    setShowCheckAnimation(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEmail('');
    setEmailError('');
    setIsValidated(false);
    setShowCheckAnimation(false);
  };

  const handleChatWithMenebot = async () => {
    // Start session with backend
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
        handleCloseModal();
      }, 300);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setEmailError('Erro de rede ao iniciar sessão');
    }
  };

  const handleCloseChat = () => {
    setTimeout(async () => {
      // End session if exists
      try {
        if (sessionId) {
          await fetch(`${API_BASE}/api/auth/session-end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: savedEmail, sessionId }),
          });
        }
      } catch (e) {
        console.error('Failed to end session', e);
      }
      setShowChat(false);
      setSessionId(null);
    }, 300);
  };

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
          <p className="text-sm sm:text-base md:text-lg text-gray-200 font-['Roboto_Mono',monospace] font-normal leading-relaxed mb-12 max-w-[800px] md:mx-auto text-justify lg:text-center">
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
                <p className="text-sm sm:text-base md:text-lg text-gray-200 font-['Roboto_Mono',monospace] font-normal leading-relaxed mb-6 max-w-[800px] md:mx-auto text-justify lg:text-center">
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
                  {isLoading ? 'Enviando...' : content.modalButton}
                </button>
              </>
            ) : step === 'enter-code' && !isValidated ? (
              <>
                {/* Animação de Check */}
                {showCheckAnimation && (
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce">
                      <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Enter verification code */}
                <h4 className="text-white font-semibold text-center mb-3">Verifique seu e-mail</h4>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Código de 6 dígitos"
                  className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors mb-2 text-center"
                />
                {codeError && <p className="text-red-400 text-sm mb-2 text-center">{codeError}</p>}

                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      setCodeError('');
                      if (!code || code.trim().length < 4) {
                        setCodeError('Código inválido');
                        return;
                      }
                      setIsLoading(true);
                      try {
                        const res = await fetch(`${API_BASE}/api/auth/verify-code`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email, code }),
                        });
                        setIsLoading(false);
                        if (!res.ok) {
                          const j = await res.json().catch(() => ({}));
                          setCodeError(j.message || 'Falha ao verificar código');
                          return;
                        }
                        setShowCheckAnimation(true);
                        setTimeout(() => setIsValidated(true), 400);
                      } catch (err) {
                        console.error(err);
                        setIsLoading(false);
                        setCodeError('Erro de rede. Tente novamente.');
                      }
                    }}
                    className="flex-1 bg-[var(--color-primary)] text-white font-semibold py-3 rounded-lg"
                  >
                    Verificar
                  </button>

                  <button
                    onClick={async () => {
                      // Resend code
                      setEmailError('');
                      setIsLoading(true);
                      try {
                        const res = await fetch(`${API_BASE}/api/auth/request-code`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email }),
                        });
                        setIsLoading(false);
                        if (!res.ok) {
                          const j = await res.json().catch(() => ({}));
                          setEmailError(j.message || 'Erro ao reenviar código');
                          return;
                        }
                      } catch (err) {
                        console.error(err);
                        setIsLoading(false);
                        setEmailError('Erro de rede. Tente novamente.');
                      }
                    }}
                    className="flex-1 bg-transparent border border-purple-600 text-white font-semibold py-3 rounded-lg"
                  >
                    Reenviar
                  </button>
                </div>
                <button
                  onClick={handleChatWithMenebot}
                  disabled={!isValidated}
                  className="w-full bg-[var(--color-primary)] hover:bg-[#6D3FE8] text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 mt-4 disabled:opacity-60"
                >
                  {content.chatButton}
                </button>
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
                  <p className="text-sm text-gray-300 text-center">{content.modalDescription}</p>
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
        <div className="absolute inset-0 z-20 animate-fadeIn">
          <MenebotChat
            email={savedEmail}
            onClose={handleCloseChat}
            language={language}
          />
        </div>
      )}
    </section>
  );
};
