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
  // Top Menebots - symmetric
  { image: menebotFrente, top: '15%', left: '8%', xlLeft: '4%' },
  { image: menebotDireita, top: '15%', right: '8%', xlRight: '4%' },
    
  // Middle Menebots - symmetric
  { image: menebotEsquerda, top: '42%', left: '10%', xlLeft: '6%' },
  { image: menebotOlhoFechado, top: '42%', right: '10%', xlRight: '6%' },
    
  // Lower lateral Menebots - symmetric
  { image: menebotFrente, top: '68%', left: '8%', xlLeft: '4%' },
  { image: menebotPiscando, top: '68%', right: '8%', xlRight: '4%' },
    
  // Menebots entre botão e laterais, alinhados verticalmente
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [savedEmail, setSavedEmail] = useState(''); // Email salvo para o chat

  const contentByLang: Record<string, { title: string; description: string; buttonText: string; modalTitle: string; modalDescription: string; modalButton: string; invalidEmail: string; successMessage: string; chatButton: string }> = {
    pt: {
      title: 'Fale com o menebot!',
      description: 'Criei um chatbot super bacana para o meu portfólio, usando a API da OpenAI e muita programação em Python. Ele acessa um PDF cheio de informações sobre mim e está pronto para responder suas perguntas sobre minhas habilidades e experiências. Quer saber mais sobre meu trabalho de um jeito divertido e interativo? Converse com o bot e descubra como minhas competências podem brilhar em diferentes contextos profissionais! Vai lá, experimente e se surpreenda!',
      buttonText: 'Falar com menebot',
      modalTitle: 'Me deixe saber quem é você',
      modalDescription: 'Digite seu email abaixo',
      modalButton: 'Prosseguir',
      invalidEmail: 'Email inválido. Por favor, verifique e tente novamente.',
      successMessage: 'Você já pode testar essa funcionalidade',
      chatButton: 'Conversar com menebot'
    },
    en: {
      title: 'Chat with menebot!',
      description: "I created a super cool chatbot for my portfolio, using OpenAI's API and lots of Python programming. It accesses a PDF full of information about me and is ready to answer your questions about my skills and experiences. Want to learn more about my work in a fun and interactive way? Chat with the bot and discover how my skills can shine in different professional contexts! Go ahead, try it and be amazed!",
      buttonText: 'Chat with menebot',
      modalTitle: 'Let me know who you are',
      modalDescription: 'Enter your email below',
      modalButton: 'Continue',
      invalidEmail: 'Invalid email. Please check and try again.',
      successMessage: 'You can now test this feature',
      chatButton: 'Chat with menebot'
    },
    es: {
      title: '¡Habla con menebot!',
      description: '¡Creé un chatbot súper genial para mi portafolio, usando la API de OpenAI y mucha programación en Python! Accede a un PDF lleno de información sobre mí y está listo para responder tus preguntas sobre mis habilidades y experiencias. ¿Quieres saber más sobre mi trabajo de una manera divertida e interactiva? ¡Conversa con el bot y descubre cómo mis competencias pueden brillar en diferentes contextos profesionales! ¡Vamos, pruébalo y sorpréndete!',
      buttonText: 'Hablar con menebot',
      modalTitle: 'Déjame saber quién eres',
      modalDescription: 'Ingresa tu email abajo',
      modalButton: 'Continuar',
      invalidEmail: 'Email inválido. Por favor, verifica e intenta nuevamente.',
      successMessage: 'Ya puedes probar esta funcionalidad',
      chatButton: 'Conversar con menebot'
    }
  };

  const content = contentByLang[language];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleProceed = () => {
    setEmailError('');
    
    if (!validateEmail(email)) {
      setEmailError(content.invalidEmail);
      return;
    }

    // Email válido - mostrar animação de check
    setShowCheckAnimation(true);
    setTimeout(() => {
      setIsValidated(true);
    }, 500);
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

  const handleChatWithMenebot = () => {
    setSavedEmail(email); // Salva o email antes de fechar o modal
    setIsTransitioning(true);
    setTimeout(() => {
      setShowChat(true);
      handleCloseModal();
      setIsTransitioning(false);
    }, 300);
  };

  const handleCloseChat = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowChat(false);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <section className="relative w-full bg-black py-32 md:py-48 lg:py-60 overflow-hidden min-h-screen">
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
        <div className="relative z-10 max-w-[900px] mx-auto px-6 sm:px-6 md:px-8 lg:px-12">
          {/* Título com Menebots nas laterais */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white font-[var(--font-montserrat)] text-center">
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
            {!isValidated ? (
              <>
                {/* Título */}
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-[var(--font-montserrat)] mb-2 text-center">
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
                  className="w-full bg-[var(--color-primary)] hover:bg-[#6D3FE8] text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 mt-4"
                >
                  {content.modalButton}
                </button>
              </>
            ) : (
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

                {/* Mensagem de Sucesso */}
                <p className="text-lg text-white font-['Roboto_Mono',monospace] mb-6 text-center">
                  {content.successMessage}
                </p>

                {/* Botão Conversar */}
                <button
                  onClick={handleChatWithMenebot}
                  className="w-full bg-[var(--color-primary)] hover:bg-[#6D3FE8] text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  {content.chatButton}
                </button>
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
