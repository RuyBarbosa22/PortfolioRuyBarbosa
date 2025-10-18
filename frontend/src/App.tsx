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
import htmlIcon from './assets/icons/icons8-html.svg';
import cssIcon from './assets/icons/icons8-css.svg';
import jsIcon from './assets/icons/icons8-js.svg';
import nodeIcon from './assets/icons/node-js-svgrepo-com.svg';
import astroIcon from './assets/icons/icons8-tailwind-css.svg';
import reactIcon from './assets/icons/react-svgrepo-com.svg';
import kotlinIcon from './assets/icons/icons8-kotlin.svg';
import javaIcon from './assets/icons/icons8-java.svg';
import angularIcon from './assets/icons/icons8-angular.svg';
import tsIcon from './assets/icons/icons8-typescript.svg';
import awsIcon from './assets/icons/icons8-aws.svg';
import mysqlIcon from './assets/icons/mysql-svgrepo-com.svg';
import leafIcon from './assets/icons/swagger-svgrepo-com.svg';
import pythonIcon from './assets/icons/python-svgrepo-com.svg';

function App() {
  const [isTalkBoxVisible, setIsTalkBoxVisible] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState<Lang>(defaultLanguage as Lang);

  console.log('🌐 App - Idioma atual:', currentLanguage);

  // Array de mensagens do Menebot - traduções
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
        "¿Quieres saber más sobre sus proyectos? ¿O conversar directamente? Estoy aquí para guiarte — explora el portafolio o ponte en contacto.",
    "No dudes en hacer clic en los botones de arriba para conversar o descargar el CV. ¡Será un placer ayudarte! 😊"
  ]
  };

  // Derived messages for current language
  const menebotMessages = menebotMessagesByLang[currentLanguage] || menebotMessagesByLang.pt;

  // Handlers that were referenced but not defined - lightweight safe stubs
  const handleClickOutside = () => {
    // No-op for now; used to close overlays on outside click
  };

  const handleMenebotClick = () => {
    setIsTalkBoxVisible((v) => !v);
  };

  const handleTalkBoxClick = () => {
    setCurrentMessageIndex((i) => (i + 1) % (menebotMessages.length || 1));
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
            <HeroLeft 
              language={currentLanguage} 
              onPrimaryClick={() => {
                setIsTalkBoxVisible(true); 
                setCurrentMessageIndex(0);
                // Scroll suave até a section 'Fale com o menebot'
                const menebotSection = document.getElementById('chat-with-menebot-section');
                if (menebotSection) {
                  menebotSection.scrollIntoView({ behavior: 'smooth' });
                }
              }} 
            />

  {/* container scrollDown */}
  <div className="md:hidden w-full flex flex-col items-center gap-3 si-responsive-mt mb-20 z-0 pointer-events-auto ">
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
                  className="text-white/60 text-xs sm:text-sm uppercase tracking-wider mt-1"
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
                  className="text-white/60 text-xs sm:text-sm uppercase tracking-wider mt-1"
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
                  className="text-white/60 text-xs sm:text-sm uppercase tracking-wider mt-1"
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
                        className="text-white/90 font-semibold text-base sm:text-lg mb-2"
                        style={{
                          textShadow: '0 0 10px rgba(167, 139, 250, 0.6), 0 0 20px rgba(167, 139, 250, 0.4)'
                        }}
                      >
                        {translations[currentLanguage].touchTitle}
                      </p>
                      <p className="text-white/50 text-xs sm:text-sm">
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
                        className="text-white/90 font-semibold text-xl mb-2"
                        style={{
                          textShadow: '0 0 10px rgba(167, 139, 250, 0.6), 0 0 20px rgba(167, 139, 250, 0.4)'
                        }}
                      >
                        {translations[currentLanguage].touchTitle}
                      </p>
                      <p className="text-white/50 text-base">
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
            className="text-white/60 text-xs sm:text-sm uppercase tracking-wider"
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
      <section id="chat-with-menebot-section">
        <ChatWithMenebot language={currentLanguage} />
      </section>

      {/* Section: Projetos e Tecnologias - reorganized into left/right container */}
  <section className="">
    <div className="w-full bg-black py-28 max-w-[1600px] mx-auto">
      <div className="w-full flex flex-col md:flex-row gap-12 items-start">
        {/* Container com left e right */}
        <div className="w-full flex flex-col md:flex-row gap-8">
          {/* LEFT: ocupa ~60% em desktop */}
          <div className="flex-1 lg:w-[50%] flex flex-col px-6 sm:pl-6 sm:px-0 md:pl-8 lg:pl-12">
            {/* UP: title projetos + texto */}
            <div className="mb-8 flex flex-col items-center md:items-start">
              <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-4">Projetos</h2>
              <p className="text-lg md:text-xl text-justify text-gray-200 font-['Roboto_Mono',monospace] font-semibold mb-2 tracking-wide" style={{ letterSpacing: '0.02em' }}>
                Veja um pouco do melhor do meu trabalho! Explore meus projetos acadêmicos e de aprendizado, onde apliquei minhas habilidades e cresci como desenvolvedor.
              </p>
            </div>

            {/* DOWN: tecnologias que domino + icones */}
            <div className="flex flex-col gap-4 w-full">
              <div className="">
                <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Tecnologias que domino</h3>
              </div>

              <div className="flex flex-wrap gap-4  w-3/3 items-center">
                <img src={htmlIcon} alt="HTML5" title="HTML5" className="w-10 h-10 bg-[#18181b] rounded-lg p-1" />
                <img src={cssIcon} alt="CSS3" title="CSS3" className="w-10 h-10 bg-[#18181b] rounded-lg p-1" />
                <img src={jsIcon} alt="JavaScript" title="JavaScript" className="w-10 h-10 bg-[#18181b] rounded-lg p-1" />
                <img src={nodeIcon} alt="Node.js" title="Node.js" className="w-10 h-10 bg-[#18181b] rounded-lg p-1" />
                <img src={astroIcon} alt="Tailwind" title="Tailwind CSS" className="w-10 h-10 bg-[#18181b] rounded-lg p-1" />
                <img src={reactIcon} alt="React" title="React" className="w-10 h-10 bg-[#18181b] rounded-lg p-1" />
                <img src={kotlinIcon} alt="Kotlin" title="Kotlin" className="w-10 h-10 bg-[#18181b] rounded-lg p-1" />
                <img src={javaIcon} alt="Java" title="Java" className="w-10 h-10 bg-[#18181b] rounded-lg p-1" />
                <img src={angularIcon} alt="Angular" title="Angular" className="w-10 h-10 bg-[#18181b] rounded-lg p-1" />
                <img src={tsIcon} alt="TypeScript" title="TypeScript" className="w-10 h-10 bg-[#18181b] rounded-lg p-1" />
                <img src={awsIcon} alt="AWS" title="AWS" className="w-10 h-10 bg-[#18181b] rounded-lg p-1" />
                <img src={mysqlIcon} alt="MySQL" title="MySQL" className="w-10 h-10 bg-[#18181b] rounded-lg p-1" />
                <img src={pythonIcon} alt="Python" title="Python" className="w-10 h-10 bg-[#18181b] rounded-lg p-1" />
                <img src={leafIcon} alt="Swagger" title="Swagger" className="w-10 h-10 bg-[#18181b] rounded-lg p-1" />
              </div>
            </div>
          </div>

          {/* RIGHT: área verde com um card */}
          <div className="w-full md:w-[50%] flex items-center justify-center bg-pink-300">
            <div className="w-full bg-[#0f9d58] rounded-lg p-6 flex items-center justify-center shadow-lg max-w-md">
              <div className="w-full bg-black/20 rounded-md p-4">
                <h4 className="text-xl font-bold text-white mb-2">Destaque do Projeto</h4>
                <p className="text-sm text-white/90">Este é um card simples dentro da área verde. Coloque aqui um destaque, link ou resumo do projeto.</p>
                <div className="mt-4 flex gap-2">
                  <a href="#" className="px-3 py-2 bg-white/10 text-white rounded-md text-sm">Ver mais</a>
                  <a href="#" className="px-3 py-2 bg-white/20 text-white rounded-md text-sm">Código</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Centered CTA button */}
      <div className="w-full flex justify-center mt-8 lg:pr-12">
        <a href="https://github.com/RuyBarbosa22" target="_blank" rel="noreferrer" className="w-auto min-w-[200px] px-6 md:px-8 py-3 sm:py-3.5 bg-[var(--color-primary)] text-white font-semibold text-sm sm:text-base rounded-full hover:bg-[var(--color-primary-light)] hover:drop-shadow-[0_0_12px_rgba(125,68,255,0.6)] transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1-.02-1.96-3.2.7-3.88-1.54-3.88-1.54-.53-1.36-1.3-1.72-1.3-1.72-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.26 3.4.96.11-.75.41-1.26.74-1.55-2.55-.29-5.23-1.28-5.23-5.71 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18.92-.26 1.9-.39 2.88-.39.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.44-2.69 5.41-5.25 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .3.21.67.8.55C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/></svg>
          <span>Veja no GitHub</span>
        </a>
      </div>
    </div>
  </section>
      
      {/* Placeholder: Seção adicional abaixo de Projetos - crie conteúdo aqui */}
      <section className="w-full bg-[#050508] py-20 px-4 lg:pl-12 lg:pr-0 max-w-[1600px] mx-auto">
        <div className="w-full flex flex-col items-center gap-6">
          <h3 className="text-4xl font-extrabold text-white">Mais sobre os projetos</h3>
          <p className="max-w-3xl text-center text-gray-300">Aqui você pode adicionar uma descrição mais detalhada, links diretos para cada projeto, ou depoimentos de usuários. Se quiser, eu crio cards de destaque ou uma grade com filtros.</p>
          <div className="w-full flex justify-center mt-4">
            <a href="#" className="px-5 py-3 bg-[var(--color-primary)] rounded-full text-white font-semibold">Ver detalhes</a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
