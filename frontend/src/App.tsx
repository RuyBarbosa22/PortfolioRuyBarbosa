// Arquivo: src/App.tsx

import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar/Navbar";
import { translations, defaultLanguage } from "./i18n";
import type { Lang } from "./i18n";
import { AnimatedBackground } from "./components/AnimatedBackground/AnimatedBackground";
import { Menebot } from "./components/Menebot/Menebot";
import { TalkBox } from "./components/TalkBox/TalkBox";
import type { TalkBoxHandle } from "./components/TalkBox/TalkBox";
import { HeroLeft } from "./components/HeroLeft/HeroLeft";
import scrollMouseIcon from "/assets/icons/scroll-mouse.svg";
import { About } from "./components/About/About";
import angularIcon from "/assets/icons/icons8-angular.svg";
import springIcon from "/assets/icons/icons8-spring-logo.svg";
import tsIcon from "/assets/icons/icons8-typescript.svg";
import nodeIcon from "/assets/icons/node-js-svgrepo-com.svg";
import { MyStory } from "./components/MyStory/MyStory";
import Skills from "./components/Skills/Skills";
import { ChatWithMenebot } from "./components/ChatWithMenebot/ChatWithMenebot";
import { MenebotChatProvider } from "./context/MenebotChatContext";
import { useRef } from "react";
import type { CarouselHandle } from "./components/ProjectsCarousel/Carousel";
import htmlIcon from "/assets/icons/icons8-html.svg";
import cssIcon from "/assets/icons/icons8-css.svg";
import jsIcon from "/assets/icons/icons8-js.svg";
import astroIcon from "/assets/icons/icons8-tailwind-css.svg";
import reactIcon from "/assets/icons/react-svgrepo-com.svg";
import kotlinIcon from "/assets/icons/icons8-kotlin.svg";
import javaIcon from "/assets/icons/icons8-java.svg";
import awsIcon from "/assets/icons/icons8-aws.svg";
import mysqlIcon from "/assets/icons/mysql-svgrepo-com.svg";
import leafIcon from "/assets/icons/swagger-svgrepo-com.svg";
import pythonIcon from "/assets/icons/python-svgrepo-com.svg";
import Carousel from "./components/ProjectsCarousel/Carousel";
import dockerIcon from "/assets/icons/docker-svgrepo-com.svg";
import Footer from "./components/Footer/Footer";
import ContactForm from "./components/ContactForm/ContactForm";

function App() {
  const [isTalkBoxVisible, setIsTalkBoxVisible] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [menebotExiting, setMenebotExiting] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Lang>(
    defaultLanguage as Lang
  );

  // ref to control Carousel from this parent
  const carouselRef = useRef<CarouselHandle | null>(null);
  const talkBoxRef = useRef<TalkBoxHandle | null>(null);

  // send a single visit metric when the app first mounts
  useEffect(() => {
    // dynamic import to keep startup fast and avoid bundling if not needed
    import('./utils/metrics').then(({ postVisit }) => {
      postVisit().catch(() => {
        // Silent fail - metrics not critical
      });
    }).catch(() => {
      // Silent fail
    });
  }, []);

  // Array de mensagens do Menebot - traduções
  const menebotMessagesByLang: Record<string, string[]> = {
    pt: [
      "Olá! Eu sou o Menebot — criado para te ajudar a conhecer meu criador. Posso responder suas perguntas e orientar como ele pode te ajudar.",
      "Ruy Barbosa é um desenvolvedor fullstack apaixonado por criar soluções inovadoras. Ele domina tecnologias modernas e está sempre em busca de novos desafios!",
      "Ei! Que tal me conhecer de um jeito diferente? Podemos bater um papo agora e você vê como eu funciono na prática. Quer conversar comigo?",
      "Não hesite em clicar nos botões acima para conversar ou baixar o CV. Será um prazer ajudar! 😊",
      "E vamos as curiosidades! Vamos explorar um pouco mais sobre a pessoa por trás do desenvolvedor.",
      "Você sabia que o Ruy tem uma cicatriz por conta de um suposto 'ataque de marimbondo'?",
      "A parte engraçada é que ele na verdade ganhou a cicatriz fugindo do inseto, e não por causa da picada!",
      "Por incrivel que pareça, o Ruy já chegou a dormir 16 horas seguidas em um fim de semana, isso que é recorde!",
      "Quando criança, o Ruy chegou a ser internado por achar que tomar 4x mais dipirona do que o recomendado ia curar a dor de cabeça dele mais rápido, dá pra acreditar?",
      "Nas horas vagas, além de jogar, o Ruy gosta bastante de drinks, e já té chegou a trabalhar como bartender em várias festas!",
      "Quer continuar conhecendo o Ruy e ter acesso a informações exclusivas? Venha falar comigo!",
    ],
    en: [
      "Hey there! I'm Menebot — created to help you get to know my creator. I can answer your questions and show you how he can help you out.",
      "Ruy Barbosa is a fullstack developer who loves building innovative solutions. He masters modern technologies and is always up for a new challenge!",
      "Hey! How about getting to know me in a different way? We can have a quick chat right now so you can see how I work in action. Wanna talk?",
      "Don’t hesitate to click the buttons above to chat or download the CV. I’ll be happy to help! 😊",
      "Alright, time for some fun facts! Let’s dig a little deeper into the person behind the developer.",
      "Did you know Ruy has a scar from what he calls a ‘wasp attack’?",
      "The funny part? He actually got the scar while *running away* from the wasp — not from the sting itself!",
      "Believe it or not, Ruy once slept for 16 hours straight on a weekend. That’s what we call commitment to rest!",
      "When he was a kid, he once ended up in the hospital because he thought taking 4 times more painkillers would make his headache go away faster — can you believe that?",
      "In his free time, besides gaming, Ruy loves mixing drinks — and he’s even worked as a bartender at several parties!",
      "Wanna keep discovering more about Ruy and get exclusive insights? Come chat with me!",
    ],
    es: [
      "¡Hola! Soy Menebot — creado para ayudarte a conocer a mi creador. Puedo responder tus preguntas y contarte cómo puede ayudarte.",
      "Ruy Barbosa es un desarrollador fullstack apasionado por crear soluciones innovadoras. Domina tecnologías modernas y siempre está listo para nuevos desafíos.",
      "¡Oye! ¿Qué te parece si me conoces de una manera diferente? Podemos charlar ahora mismo para que veas cómo funciono en acción. ¿Quieres conversar conmigo?",
      "No dudes en hacer clic en los botones de arriba para charlar o descargar el CV. ¡Será un placer ayudarte! 😊",
      "¡Hora de las curiosidades! Vamos a conocer un poco más sobre la persona detrás del desarrollador.",
      "¿Sabías que Ruy tiene una cicatriz por culpa de un supuesto ‘ataque de avispas’?",
      "¡Lo divertido es que en realidad se hizo la cicatriz mientras huía del insecto, no por la picadura!",
      "Aunque parezca increíble, Ruy una vez durmió 16 horas seguidas en un fin de semana. ¡Eso sí es descansar de verdad!",
      "Cuando era niño, llegó a ser internado porque pensó que tomar 4 veces más dipirona le quitaría el dolor de cabeza más rápido. ¿Puedes creerlo?",
      "En su tiempo libre, además de jugar, a Ruy le encantan los tragos, ¡e incluso trabajó como bartender en varias fiestas!",
      "¿Quieres seguir conociendo más sobre Ruy y acceder a información exclusiva? ¡Ven a hablar conmigo!",
    ],
  };

  // Derived messages for current language
  const menebotMessages =
    menebotMessagesByLang[currentLanguage] || menebotMessagesByLang.pt;

  // Contact subheading split (prefix + highlighted suffix) - safe fallback without optional chaining
  const contactSubObj = translations[currentLanguage] && translations[currentLanguage].contact ? translations[currentLanguage].contact : null;
  const contactSubheading = (contactSubObj && contactSubObj.subheading) || translations.pt.contact.subheading;
  let contactPrefix = contactSubheading;
  let contactSuffix = "";
  const lastSpace = contactSubheading.trim().lastIndexOf(" ");
  if (lastSpace > 0) {
    contactPrefix = contactSubheading.slice(0, lastSpace);
    contactSuffix = contactSubheading.slice(lastSpace + 1);
  }

  // Handlers that were referenced but not defined - lightweight safe stubs
  const handleClickOutside = () => {
    // Close and reset Menebot dialog flow when clicking outside
    if (isTalkBoxVisible) {
      setIsTalkBoxVisible(false);
      setCurrentMessageIndex(0);
    }
    if (menebotExiting) setMenebotExiting(false);
  };

  const handleMenebotClick = () => {
    // if not visible, open and start from current index
    if (!isTalkBoxVisible) {
      // always start a fresh flow from the first message when opening
      setCurrentMessageIndex(0);
      setIsTalkBoxVisible(true);
      return;
    }

    // If confirm buttons are shown for the current message, ignore Menebot clicks
    if (isConfirmIndex) return;

    // If visible, ask TalkBox to finish typing; if it was already finished, advance to next
    if (talkBoxRef.current) {
      const didFinish = talkBoxRef.current.finishTyping();
      if (!didFinish) {
        setCurrentMessageIndex((i) => (i + 1) % (menebotMessages.length || 1));
      }
    } else {
      setCurrentMessageIndex((i) => (i + 1) % (menebotMessages.length || 1));
    }
  };

  const handleTalkBoxClick = () => {
    // If confirm buttons are shown, do not advance by clicking the TalkBox
    if (isConfirmIndex) return;
    setCurrentMessageIndex((i) => (i + 1) % (menebotMessages.length || 1));
  };

  // Fechar TalkBox quando Menebot dormir
  const handleMenebotSleep = (isSleeping: boolean) => {
    if (isSleeping && isTalkBoxVisible) {
      setIsTalkBoxVisible(false);
      setCurrentMessageIndex(0);
    }
  };

  // Determine if current message should show confirm buttons:
  // show on the 3rd message (index 2) or on the last message of the current language array
  const isConfirmIndex =
    currentMessageIndex === 2 ||
    currentMessageIndex === Math.max(0, menebotMessages.length - 1);

  // Shared handlers for confirm buttons (Yes / No)
  const handleConfirmYes = () => {
    setMenebotExiting(true);
    const section = document.getElementById('chat-with-menebot-section');
    section?.scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      setMenebotExiting(false);
      setIsTalkBoxVisible(false);
      setCurrentMessageIndex(0);
    }, 900);
  };

  const handleConfirmNo = () => {
    if (currentMessageIndex === menebotMessages.length - 1) {
      setIsTalkBoxVisible(false);
      setCurrentMessageIndex(0);
    } else {
      setCurrentMessageIndex(currentMessageIndex + 1);
    }
  };

  return (
    <MenebotChatProvider>
    {/* Fundo preto aplicado a toda a página */}
    <div className="min-h-screen w-full bg-black text-white relative overflow-x-hidden">
      {/* Background animado com glows */}
      <AnimatedBackground />

      <Navbar
        selectedLanguage={currentLanguage}
        onLanguageChange={(lang) => {
          setCurrentLanguage(lang);
        }}
      />

      {/* Hero Section */}
      <main
        id="home"
        className="min-h-screen pt-20 md:pt-32 lg:pt-64 pb-20 md:pb-32 relative z-10 px-6 sm:px-8 md:px-8 lg:px-12 xl:px-20 xl:w-full flex flex-col"
        onClick={handleClickOutside}
      >
        <div className="lg:px-0 w-full flex-1 flex flex-col">
          {/* Container Left & Right - Desktop >=1280px */}
          <div className="xl:w-full xl:justify-start">
            <div className="flex flex-col xl:flex-row md:items-center xl:justify-start gap-8 xl:gap-0 w-full">
              {/* LEFT - Conteúdo Textual e Botões (componentizado) */}
              <HeroLeft
                language={currentLanguage}
                onPrimaryClick={() => {
                  setIsTalkBoxVisible(true);
                  setCurrentMessageIndex(0);
                  // Scroll suave até a section 'Fale com o menebot'
                  const menebotSection = document.getElementById(
                    "chat-with-menebot-section"
                  );
                  if (menebotSection) {
                    menebotSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              />

              {/* container scrollDown */}
              <div className="md:hidden w-full flex flex-col items-center gap-3 mt-28 sm:mt-60 mb-20 z-0 pointer-events-auto ">
                <div className="flex flex-col items-center justify-center">
                  <img
                    src={scrollMouseIcon}
                    alt="Scroll para baixo"
                    className="w-[26px] h-[44px] sm:w-[30px] sm:h-[50px]"
                    style={{
                      animation: "scrollBounce 2s ease-in-out infinite",
                      filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.25))",
                    }}
                  />
                  <span
                    className="text-white/60 text-xs sm:text-sm uppercase tracking-wider mt-1"
                    style={{
                      animation: "scrollBounce 2s ease-in-out infinite",
                      animationDelay: "0.1s",
                    }}
                  >
                    {translations[currentLanguage].scroll}
                  </span>
                </div>
              </div>

              {/* Indicador de scroll - largescreens between 1024px and 1280px (lg only)
                Em-fluxo (não absoluto), colocado antes do Menebot para garantir que o Menebot
                fique abaixo e que exista espaçamento considerável entre os botões e o indicador. */}
              <div className="hidden lg:flex xl:hidden w-full flex-col items-center gap-3 lg:mt-24 lg:mb-80 z-0 pointer-events-auto">
                <div className="flex flex-col items-center justify-center">
                  <img
                    src={scrollMouseIcon}
                    alt="Scroll para baixo"
                    className="w-[28px] h-[48px] lg:w-[30px] lg:h-[50px]"
                    style={{
                      animation: "scrollBounce 2s ease-in-out infinite",
                      filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.25))",
                    }}
                  />
                  <span
                    className="text-white/60 text-xs sm:text-sm uppercase tracking-wider mt-1"
                    style={{
                      animation: "scrollBounce 2s ease-in-out infinite",
                      animationDelay: "0.1s",
                    }}
                  >
                    {translations[currentLanguage].scroll}
                  </span>
                </div>
              </div>

              {/* Indicador de scroll - tablet/medium screens (>=768px and <1024px)
                Visível apenas neste intervalo para manter a ordem: buttons -> scroll -> menebot */}
              <div className="hidden md:flex lg:hidden w-full flex-col items-center gap-3 md:mt-48 md:mb-28 z-0 pointer-events-auto">
                <div className="flex flex-col items-center justify-center">
                  <img
                    src={scrollMouseIcon}
                    alt="Scroll para baixo"
                    className="w-[28px] h-[48px] lg:w-[30px] lg:h-[50px]"
                    style={{
                      animation: "scrollBounce 2s ease-in-out infinite",
                      filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.25))",
                    }}
                  />
                  <span
                    className="text-white/60 text-xs sm:text-sm uppercase tracking-wider mt-1"
                    style={{
                      animation: "scrollBounce 2s ease-in-out infinite",
                      animationDelay: "0.1s",
                    }}
                  >
                    {translations[currentLanguage].scroll}
                  </span>
                </div>
              </div>

              {/* Menebot - Centralizado em mobile (<1280px), Lateral direita em desktop (>=1280px) */}
              <div
                className="xl:hidden relative flex flex-col items-center justify-center mt-60 sm:mt-0 h-[500px] sm:h-[550px] md:h-[600px]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Container externo - Mobile/Tablet */}
                <div className="relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-[480px] h-full">
                  {/* Container do Menebot - Centralizado */}
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 transition-transform duration-500 ease-out z-10"
                    style={{
                      transform: isTalkBoxVisible
                        ? "translateY(-30px)"
                        : "translateY(0)",
                    }}
                  >
                      <div onClick={handleMenebotClick}>
                      <Menebot
                        className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] md:w-[250px] md:h-[250px]"
                        isExiting={menebotExiting}
                        onSleepChange={handleMenebotSleep}
                      />
                    </div>
                  </div>

                  {/* Espaçamento para o Menebot (placeholder invisível) */}
                  <div className="w-full flex justify-center px-4 mb-4">
                    <div className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] md:w-[250px] md:h-[250px] opacity-0 pointer-events-none"></div>
                  </div>

                  {/* Texto ou TalkBox - Posicionado abaixo do Menebot */}
                  <div className="relative w-full px-4 z-0 mt-6 sm:mt-8">
                    {!isTalkBoxVisible ? (
                      <div className="text-center">
                        <p
                          className="text-white/90 font-semibold text-base sm:text-lg mb-2"
                          style={{
                            textShadow:
                              "0 0 10px rgba(167, 139, 250, 0.6), 0 0 20px rgba(167, 139, 250, 0.4)",
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
                        ref={talkBoxRef}
                        isVisible={isTalkBoxVisible}
                        message={menebotMessages[currentMessageIndex]}
                        onClick={handleTalkBoxClick}
                        confirm={isConfirmIndex}
                        yesLabel={translations[currentLanguage].talkboxYes}
                        noLabel={translations[currentLanguage].talkboxNo}
                        onYes={handleConfirmYes}
                        onNo={handleConfirmNo}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT - Menebot Container - Apenas Desktop >=1280px */}
              <div
                className="hidden xl:flex relative flex-col items-end justify-center h-full min-h-[500px] xl:w-[100%]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Container do Menebot - Lateral direita */}
                <div className="relative w-full max-w-[500px]">
                  <div
                    className="transition-transform duration-500 ease-out"
                    style={{
                      transform: isTalkBoxVisible
                        ? "translateY(-30px)"
                        : "translateY(0)",
                    }}
                  >
                      <div
                      onClick={handleMenebotClick}
                      className="flex justify-end"
                    >
                      <Menebot
                        className="w-[260px] h-[260px]"
                        isExiting={menebotExiting}
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
                            textShadow:
                              "0 0 10px rgba(167, 139, 250, 0.6), 0 0 20px rgba(167, 139, 250, 0.4)",
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
                        ref={talkBoxRef}
                        isVisible={isTalkBoxVisible}
                        message={menebotMessages[currentMessageIndex]}
                        onClick={handleTalkBoxClick}
                        confirm={isConfirmIndex}
                        yesLabel={translations[currentLanguage].talkboxYes}
                        noLabel={translations[currentLanguage].talkboxNo}
                        onYes={handleConfirmYes}
                        onNo={handleConfirmNo}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de scroll animado - apenas desktop >=1280px */}
        <div className="hidden xl:flex absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex-col items-center gap-3 z-20 xl:mt-8">
          <img
            src={scrollMouseIcon}
            alt="Scroll para baixo"
            className="w-[26px] h-[44px] sm:w-[30px] sm:h-[50px]"
            style={{
              animation: "scrollBounce 2s ease-in-out infinite",
              filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))",
            }}
          />
          <span
            className="text-white/60 text-xs sm:text-sm uppercase tracking-wider"
            style={{
              animation: "scrollBounce 2s ease-in-out infinite",
              animationDelay: "0.1s",
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

    {/* Skills Section (moved below My Story) */}
    <section id="habilidades">
      <Skills language={currentLanguage} />
    </section>

      {/* Chat with Menebot Section */}
      <section id="chat-with-menebot-section">
        <ChatWithMenebot language={currentLanguage} />
      </section>


  {/* Section: Projetos e Tecnologias - left/right layout with external controls */}
  <section id="projetos">
        <div className="w-full bg-black py-24 lg:py-36 pl-6 sm:pl-8 md:pl-8 lg:pl-12 xl:pl-20 lg:px-0">
          <div className="w-full flex flex-col md:flex-row gap-12 items-start">
            <div className="w-full flex flex-col md:flex-row gap-8">
              {/* LEFT: info */}
              <div className="flex-1 lg:w-[50%] flex flex-col">
                  <div className="mb-8 flex flex-col items-center md:items-start pr-6 md:pr-0">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 text-[var(--color-primary)] font-['Montserrat',sans-serif]">
                      {translations[currentLanguage].projects.title}
                    </h2>
                    <p
                      className="text-md md:text-xl text-justify text-gray-200 font-['Roboto_Mono',monospace] font-normal mb-2 w-[100%] md:w-[90%] tracking-wide"
                      style={{ letterSpacing: "0.02em" }}
                    >
                      {translations[currentLanguage].projects.subtitle}
                    </p>
                  </div>

                <div className="flex flex-col gap-4 w-full justify-center items-center md:justify-start md:items-start pr-6 md:pr-0">
                  <div className="w-full flex justify-center md:justify-start">
                    <h3 className="text-3xl md:text-4xl font-extrabold text-center md:text-left mb-4 text-[var(--color-primary)] font-['Montserrat',sans-serif]">
                      {translations[currentLanguage].projects.techsTitle}
                    </h3>
                  </div>

                    <div className="flex flex-wrap gap-4 w-[100%] md:w-[100%] lg:w-[80%] items-center justify-center md:justify-start">
                    <img
                      src={htmlIcon}
                      alt="HTML5"
                      title="HTML5"
                      className="w-10 h-10 bg-[#23232a] rounded-lg p-1.5"
                    />
                    <img
                      src={cssIcon}
                      alt="CSS3"
                      title="CSS3"
                      className="w-10 h-10 bg-[#23232a] rounded-lg p-1.5"
                    />
                    <img
                      src={jsIcon}
                      alt="JavaScript"
                      title="JavaScript"
                      className="w-10 h-10 bg-[#23232a] rounded-lg p-1.5"
                    />
                    <img
                      src={tsIcon}
                      alt="TypeScript"
                      title="TypeScript"
                      className="w-10 h-10 bg-[#23232a] rounded-lg p-1.5"
                    />
                    <img
                      src={reactIcon}
                      alt="React"
                      title="React"
                      className="w-10 h-10 bg-[#23232a] rounded-lg p-1.5"
                    />
                    <img
                      src={astroIcon}
                      alt="Tailwind"
                      title="Tailwind CSS"
                      className="w-10 h-10 bg-[#23232a] rounded-lg p-1.5"
                    />
                    <img
                      src={nodeIcon}
                      alt="Node.js"
                      title="Node.js"
                      className="w-10 h-10 bg-[#23232a] rounded-lg p-1.5"
                    />
                    <img
                      src={angularIcon}
                      alt="Angular"
                      title="Angular"
                      className="w-10 h-10 bg-[#23232a] rounded-lg p-1.5"
                    />
                    <img
                      src={javaIcon}
                      alt="Java"
                      title="Java"
                      className="w-10 h-10 bg-[#23232a] rounded-lg p-1.5"
                    />
                    <img
                      src={kotlinIcon}
                      alt="Kotlin"
                      title="Kotlin"
                      className="w-10 h-10 bg-[#23232a] rounded-lg p-1.5"
                    />
                    <img
                      src={springIcon}
                      alt="Spring boot"
                      title="Spring boot"
                      className="w-10 h-10 bg-[#23232a] rounded-lg p-1.5"
                    />
                    <img
                      src={pythonIcon}
                      alt="Python"
                      title="Python"
                      className="w-10 h-10 bg-[#23232a] rounded-lg p-1.5"
                    />
                    <img
                      src={awsIcon}
                      alt="AWS"
                      title="AWS"
                      className="w-10 h-10 bg-[#23232a] rounded-lg p-1.5"
                    />
                    <img
                      src={dockerIcon}
                      alt="Docker"
                      title="Docker"
                      className="w-10 h-10 bg-[#23232a] rounded-lg p-1.5"
                    />
                    <img
                      src={mysqlIcon}
                      alt="MySQL"
                      title="MySQL"
                      className="w-10 h-10 bg-[#23232a] rounded-lg p-1.5"
                    />
                    <img
                      src={leafIcon}
                      alt="Swagger"
                      title="Swagger"
                      className="w-10 h-10 bg-[#23232a] rounded-lg p-1.5"
                    />
                    </div>
                </div>
              </div>

              {/* RIGHT: carousel */}
              <div className="w-full md:h-full md:w-[50%] flex flex-col items-start justify-between">
                <div className="bg-blue-300 flex flex-row px-6 md:px-0 md:gap-6"></div>
                <div className="w-full h-auto flex items-end justify-end">
                    <div className="w-full">
                    <Carousel ref={carouselRef} language={currentLanguage} />
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pink bar with GitHub + carousel controls (all same size) */}
          <div className="w-full flex items-center justify-center md:justify-between pr-6 md:pr-0 md:pl-0 lg:pl-0 lg:pr-12 xl:pl-0 xl:pr-12 mt-12 gap-4">
            <div className="hidden md:flex">

            <a
              href="https://github.com/RuyBarbosa22"
              target="_blank"
              rel="noreferrer"
              className="min-w-[200px] flex px-6 md:px-8 py-3 sm:py-3.5 bg-[var(--color-primary)] text-white font-semibold text-sm sm:text-base rounded-full hover:bg-[var(--color-primary-light)] hover:drop-shadow-[0_0_12px_rgba(125,68,255,0.6)] transition-all duration-300 items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1-.02-1.96-3.2.7-3.88-1.54-3.88-1.54-.53-1.36-1.3-1.72-1.3-1.72-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.26 3.4.96.11-.75.41-1.26.74-1.55-2.55-.29-5.23-1.28-5.23-5.71 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18.92-.26 1.9-.39 2.88-.39.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.44-2.69 5.41-5.25 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .3.21.67.8.55C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z" />
              </svg>
              <span>{translations[currentLanguage].projects.ctaGithub}</span>
            </a>
            </div>

            <div className="flex flex-row gap-4 md:pr-8 lg:pr-0">
                <button
                onClick={() => { if (carouselRef.current && carouselRef.current.scrollLeft) { carouselRef.current.scrollLeft(); } }}
                className="min-w-[120px] sm:min-w-[180px] flex-1 px-6 md:px-8 py-3 sm:py-3.5 bg-transparent border-2 border-[var(--color-primary)]/60 text-white font-semibold text-sm sm:text-base rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center justify-center gap-2 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/15 hover:shadow-[0_0_16px_rgba(125,68,255,0.5),0_0_8px_rgba(125,68,255,0.3)] hover:-translate-y-px whitespace-nowrap"
              >
                {translations[currentLanguage].projects.prev}
              </button>

                <button
                onClick={() => { if (carouselRef.current && carouselRef.current.scrollRight) { carouselRef.current.scrollRight(); } }}
                className="min-w-[120px] sm:min-w-[180px] flex-1 px-6 md:px-8 py-3 sm:py-3.5 bg-[var(--color-primary)] text-white font-semibold text-sm sm:text-base rounded-full hover:bg-[var(--color-primary-light)] hover:drop-shadow-[0_0_12px_rgba(125,68,255,0.6)] transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {translations[currentLanguage].projects.next}
              </button>
            </div>
          </div>
        </div>
      </section>

  {/* Contact section: explicit left (form) and right (text) columns. Mobile stacks with text above form */}
  <section id="contato" className="w-full bg-black py-30 px-6 sm:px-8 md:px-8 lg:px-12 xl:px-20">
        <div className="mx-auto w-full">
          <div className="w-full flex flex-col md:flex-row items-stretch justify-between">
            {/* LEFT - Form (md: left) */}
            <div className="w-full md:w-1/2 order-2 md:order-1 flex">
              <div className="w-full">
                <form className="w-full bg-transparent" onSubmit={(e) => e.preventDefault()}>
                  <ContactForm currentLanguage={currentLanguage} />
              </form>
              </div>
            </div>

            {/* RIGHT - Text content (md: right) */}
            <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-end items-start">
              <div className="w-full text-right md:pl-8 lg:pl-16">
                <h3 className="text-[56px] text-center md:text-right md:text-[96px] leading-tight font-extrabold text-white mb-4">{translations[currentLanguage].contact.heading}</h3>
                <div className="mb-4 text-lg md:text-4xl text-gray-200 text-center md:text-right font-semibold">{contactPrefix} <span style={{background: 'radial-gradient(circle, #E204F5 0%, #CC12F7 22%, #B321FA 46%, #9733FC 74%, #7D44FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} className="text-transparent font-extrabold">{contactSuffix}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <Footer language={currentLanguage} />
    </div>
    </MenebotChatProvider>
  );
}

export default App;
