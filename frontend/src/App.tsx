// Arquivo: src/App.tsx

import { useState } from 'react';
import { Navbar } from './components/Navbar/Navbar';
import { translations, defaultLanguage } from './i18n';
import type { Lang } from './i18n';
import { AnimatedBackground } from './components/AnimatedBackground/AnimatedBackground';
import { Menebot } from './components/Menebot/Menebot';
import { TalkBox } from './components/TalkBox/TalkBox';
import { HeroLeft } from './components/HeroLeft/HeroLeft';
import scrollMouseIcon from './assets/icons/scroll-mouse.svg';
import { About } from './components/About/About';
import { MyStory } from './components/MyStory/MyStory';
import { ChatWithMenebot } from './components/ChatWithMenebot/ChatWithMenebot';

function App() {
  const [isTalkBoxVisible, setIsTalkBoxVisible] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState<Lang>(defaultLanguage as Lang);

  console.log('🌐 App - Idioma atual:', currentLanguage);

  // Array de mensagens do Menebot
    // Translations for Menebot messages
    const menebotMessagesByLang: Record<string, string[]> = {
      pt: [
        "Olá! Eu sou o Menebot — criado para te ajudar a conhecer meu criador. Posso responder suas perguntas e orientar como ele pode te ajudar.",
        "Ruy Barbosa é um desenvolvedor fullstack apaixonado por criar soluções inovadoras. Ele domina tecnologias modernas e está sempre em busca de novos desafios!",
        "Quer saber mais sobre os projetos dele? Ou talvez conversar diretamente? Estou aqui para te guiar — explore o portfólio ou entre em contato.",
        "Não hesite em clicar nos botões acima para conversar ou baixar o CV. Será um prazer ajudar! 😊"
      ],
      en: [
        "Hi! I'm Menebot — I was built to help you get to know my creator. I can answer questions and guide you on how he can help.",
        "Ruy Barbosa is a passionate fullstack developer who loves building innovative solutions. He masters modern technologies and is always seeking new challenges!",
        "Want to learn more about his projects? Or chat directly? I'm here to guide you — explore the portfolio or reach out.",
        "Don't hesitate to click the buttons above to talk or download the CV. I'd be happy to help! 😊"
      ],
      es: [
        "¡Hola! Soy Menebot — creado para ayudarte a conocer a mi creador. Puedo responder tus preguntas y orientarte sobre cómo puede ayudarte.",
        "Ruy Barbosa es un desarrollador fullstack apasionado por crear soluciones innovadoras. Domina tecnologías modernas y siempre busca nuevos desafíos!",
        "¿Quieres saber más sobre sus proyectos? ¿O conversar directamente? Estoy aquí para guiarte — explora el portafolio o contáctalo.",
        "No dudes en hacer clic en los botones de arriba para conversar o descargar el CV. ¡Será un placer ayudar! 😊"
      ]
    };
    const menebotMessages = menebotMessagesByLang[currentLanguage];

  const handleMenebotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Funciona em todas as resoluções
    if (!isTalkBoxVisible) {
      setIsTalkBoxVisible(true);
      setCurrentMessageIndex(0);
    } else {
      // Avançar para próxima mensagem
        if (currentMessageIndex < menebotMessages.length - 1) {
          setCurrentMessageIndex(currentMessageIndex + 1);
        } else {
          // Recomeçar do início
          setCurrentMessageIndex(0);
        }
    }
  };

  const handleTalkBoxClick = () => {
    // Avançar para próxima mensagem
    if (currentMessageIndex < menebotMessages.length - 1) {
      setCurrentMessageIndex(currentMessageIndex + 1);
    } else {
      // Recomeçar do início
      setCurrentMessageIndex(0);
    }
  };

  const handleClickOutside = () => {
    // Fechar TalkBox e resetar
    if (isTalkBoxVisible) {
      setIsTalkBoxVisible(false);
      setCurrentMessageIndex(0);
    }
  };

  // Fechar TalkBox quando Menebot dormir
  const handleMenebotSleep = (isSleeping: boolean) => {
    if (isSleeping && isTalkBoxVisible) {
      setIsTalkBoxVisible(false);
      setCurrentMessageIndex(0);
    }
  };

  return (
    // Fundo preto aplicado a toda a página
    <div className="min-h-screen w-full bg-black text-white relative overflow-x-hidden">
      {/* Background animado com glows */}
      <AnimatedBackground />
      
  <Navbar 
        selectedLanguage={currentLanguage} 
        onLanguageChange={(lang) => {
          console.log('🔄 App: Recebendo mudança de idioma:', lang);
          setCurrentLanguage(lang);
        }} 
      />

      {/* Hero Section */}
      <main className="min-h-screen pt-40 md:pt-32 lg:pt-64 pb-20 md:pb-32 relative z-10 flex flex-col" onClick={handleClickOutside}>
        <div className="md:px-8 lg:px-12 xl:px-12 max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
          {/* Container Left & Right - Desktop >=1280px */}
          <div className='xl:w-full xl:justify-start'>
 <div className="flex flex-col xl:flex-row md:items-center xl:justify-start gap-8 xl:gap-0 w-full">
            
            {/* LEFT - Conteúdo Textual e Botões (componentizado) */}
            <HeroLeft language={currentLanguage} onPrimaryClick={() => { setIsTalkBoxVisible(true); setCurrentMessageIndex(0); }} />

  {/* container scrollDown */}
  <div className="md:hidden w-full flex flex-col items-center gap-3 si-responsive-mt mb-20 z-0 pointer-events-auto bg-green-200">
              <div className="flex flex-col items-center justify-center">
                <img
                  src={scrollMouseIcon}
                  alt="Scroll para baixo"
                  className="w-[26px] h-[44px] sm:w-[30px] sm:h-[50px]"
                  style={{
                    animation: 'scrollBounce 2s ease-in-out infinite',
                    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.25))'
                  }}
                />
                <span
                  className="text-white/60 text-xs sm:text-sm font-[var(--font-montserrat)] uppercase tracking-wider mt-1"
                  style={{
                    animation: 'scrollBounce 2s ease-in-out infinite',
                    animationDelay: '0.1s'
                  }}
                >
                  {translations[currentLanguage].scroll}
                </span>
              </div>
            </div>

            {/* Indicador de scroll - largescreens between 1024px and 1280px (lg only)
                Em-fluxo (não absoluto), colocado antes do Menebot para garantir que o Menebot
                fique abaixo e que exista espaçamento considerável entre os botões e o indicador. */}
            <div className="hidden lg:flex xl:hidden w-full flex-col items-center gap-3 mt-12 mb-4 z-0 pointer-events-auto">
              <div className="flex flex-col items-center justify-center">
                <img
                  src={scrollMouseIcon}
                  alt="Scroll para baixo"
                  className="w-[28px] h-[48px] lg:w-[30px] lg:h-[50px]"
                  style={{
                    animation: 'scrollBounce 2s ease-in-out infinite',
                    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.25))'
                  }}
                />
                <span
                  className="text-white/60 text-xs sm:text-sm font-[var(--font-montserrat)] uppercase tracking-wider mt-1"
                  style={{
                    animation: 'scrollBounce 2s ease-in-out infinite',
                    animationDelay: '0.1s'
                  }}
                >
                  {translations[currentLanguage].scroll}
                </span>
              </div>
            </div>

            {/* Indicador de scroll - tablet/medium screens (>=768px and <1024px)
                Visível apenas neste intervalo para manter a ordem: buttons -> scroll -> menebot */}
            <div className="hidden md:flex lg:hidden w-full flex-col items-center gap-3 md:mt-[35px] mb-6 z-0 pointer-events-auto">
              <div className="flex flex-col items-center justify-center">
                <img
                  src={scrollMouseIcon}
                  alt="Scroll para baixo"
                  className="w-[28px] h-[48px] lg:w-[30px] lg:h-[50px]"
                  style={{
                    animation: 'scrollBounce 2s ease-in-out infinite',
                    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.25))'
                  }}
                />
                <span
                  className="text-white/60 text-xs sm:text-sm font-[var(--font-montserrat)] uppercase tracking-wider mt-1"
                  style={{
                    animation: 'scrollBounce 2s ease-in-out infinite',
                    animationDelay: '0.1s'
                  }}
                >
                  {translations[currentLanguage].scroll}
                </span>
              </div>
            </div>

            {/* Menebot - Centralizado em mobile (<1280px), Lateral direita em desktop (>=1280px) */}
            <div className="xl:hidden relative flex flex-col items-center justify-center mt-0 h-[500px] sm:h-[550px] md:h-[600px]" onClick={(e) => e.stopPropagation()}>
              {/* Container externo - Mobile/Tablet */}
              <div className="relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-[480px] h-full">
                {/* Container do Menebot - Centralizado */}
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 transition-transform duration-500 ease-out z-10"
                  style={{
                    transform: isTalkBoxVisible 
                      ? 'translateY(-30px)'
                      : 'translateY(0)',
                  }}
                >
                  <div onClick={handleMenebotClick}>
                    <Menebot 
                      className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] md:w-[250px] md:h-[250px]"
                      onSleepChange={handleMenebotSleep}
                    />
                  </div>
                </div>

                {/* Espaçamento para o Menebot (placeholder invisível) */}
                <div className="w-full flex justify-center px-4 mb-4">
                  <div className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] md:w-[250px] md:h-[250px] opacity-0 pointer-events-none"></div>
                </div>

                {/* Texto ou TalkBox - Posicionado abaixo do Menebot */}
                <div className="relative w-full px-4 z-0 mt-6 sm:mt-8 xl:bg-blue-400">
                  {!isTalkBoxVisible ? (
                    <div className="text-center">
                      <p 
                        className="text-white/90 font-[var(--font-montserrat)] font-semibold text-base sm:text-lg mb-2"
                        style={{
                          textShadow: '0 0 10px rgba(167, 139, 250, 0.6), 0 0 20px rgba(167, 139, 250, 0.4)'
                        }}
                      >
                        {translations[currentLanguage].touchTitle}
                      </p>
                      <p className="text-white/50 text-xs sm:text-sm font-[var(--font-montserrat)]">
                        {translations[currentLanguage].touchSubtitle}
                      </p>
                    </div>
                  ) : (
                    <TalkBox 
                      isVisible={isTalkBoxVisible} 
                      message={menebotMessages[currentMessageIndex]}
                      onClick={handleTalkBoxClick}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT - Menebot Container - Apenas Desktop >=1280px */}
            <div className="hidden xl:flex relative flex-col items-end justify-center h-full min-h-[500px] xl:w-[100%]" onClick={(e) => e.stopPropagation()}>
              {/* Container do Menebot - Lateral direita */}
              <div className="relative w-full max-w-[500px]">
                <div 
                  className="transition-transform duration-500 ease-out"
                  style={{
                    transform: isTalkBoxVisible 
                      ? 'translateY(-30px)'
                      : 'translateY(0)',
                  }}
                >
                  <div onClick={handleMenebotClick} className="flex justify-end">
                    <Menebot 
                      className="w-[260px] h-[260px]"
                      onSleepChange={handleMenebotSleep}
                    />
                  </div>
                </div>

                {/* Texto ou TalkBox - Abaixo do Menebot */}
                <div className="relative w-full z-0 mt-6 xl:pr-8">
                  {!isTalkBoxVisible ? (
                    <div className="text-right">
                      <p 
                        className="text-white/90 font-[var(--font-montserrat)] font-semibold text-xl mb-2"
                        style={{
                          textShadow: '0 0 10px rgba(167, 139, 250, 0.6), 0 0 20px rgba(167, 139, 250, 0.4)'
                        }}
                      >
                        {translations[currentLanguage].touchTitle}
                      </p>
                      <p className="text-white/50 text-base font-[var(--font-montserrat)]">
                        {translations[currentLanguage].touchSubtitle}
                      </p>
                    </div>
                  ) : (
                    <TalkBox 
                      isVisible={isTalkBoxVisible} 
                      message={menebotMessages[currentMessageIndex]}
                      onClick={handleTalkBoxClick}
                    />
                  )}
                </div>
              </div>
            </div>

          </div>
          </div>
         
        </div>

        {/* Indicador de scroll animado - apenas desktop >=1280px */}
        <div className="hidden xl:flex absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex-col items-center gap-3 z-20">
          <img 
            src={scrollMouseIcon}
            alt="Scroll para baixo"
            className="w-[26px] h-[44px] sm:w-[30px] sm:h-[50px]"
            style={{
              animation: 'scrollBounce 2s ease-in-out infinite',
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))'
            }}
          />
          <span 
            className="text-white/60 text-xs sm:text-sm font-[var(--font-montserrat)] uppercase tracking-wider"
            style={{
              animation: 'scrollBounce 2s ease-in-out infinite',
              animationDelay: '0.1s'
            }}
          >
            {translations[currentLanguage].scroll}
          </span>
        </div>
      </main>

      {/* About Section */}
      <About language={currentLanguage} />

      {/* My Story Section */}
      <MyStory language={currentLanguage} />

      {/* Chat with Menebot Section */}
      <ChatWithMenebot language={currentLanguage} />
    </div>
  );
}

export default App;
