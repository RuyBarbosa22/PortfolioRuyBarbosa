export const defaultLanguage = 'pt';

export const translations: Record<string, any> = {
  pt: {
    nav: ['Início','Sobre','Habilidades','Projetos','Contato'],
    scroll: 'Scroll',
    touchTitle: '👋 Toque no Menebot!',
    touchSubtitle: 'Ele está esperando por você',
    talkboxHint: 'Clique para continuar →',
    projects: {
      title: 'Projetos',
      subtitle: 'Veja um pouco do melhor do meu trabalho! Explore meus projetos acadêmicos e de aprendizado, onde apliquei minhas habilidades e cresci como desenvolvedor.',
      techsTitle: 'Tecnologias que domino',
      ctaGithub: 'Veja no GitHub',
      prev: 'Anterior',
      next: 'Próximo',
      status: {
        done: 'Concluido',
        inprogress: 'Em desenvolvimento',
        notstarted: 'Não iniciado'
      }
    },
    footer: {
      titleLine1: 'Vamos construir coisas',
      titleLine2: 'incríveis',
      description: 'Sou um desenvolvedor fullstack focado em entregar produtos de qualidade. Quer transformar sua ideia em realidade? Vamos conversar — eu cuido da arquitetura, do código e da entrega.',
      linkPortfolio: 'Portfólio',
      linkResume: 'Currículo',
      linkContact: 'Contato',
      backToTop: 'Voltar ao topo',
      rights: 'Todos os direitos reservados.'
    },
  },
  en: {
    nav: ['Home','About','Skills','Projects','Contact'],
    scroll: 'Scroll',
    touchTitle: '👋 Tap the Menebot!',
    touchSubtitle: "He's waiting for you",
    talkboxHint: 'Click to continue →',
    projects: {
      title: 'Projects',
      subtitle: "See some of my best work! Explore my academic and learning projects where I applied my skills and grew as a developer.",
      techsTitle: 'Technologies I master',
      ctaGithub: 'See on GitHub',
      prev: 'Previous',
      next: 'Next',
      status: {
        done: 'Completed',
        inprogress: 'In progress',
        notstarted: 'Not started'
      }
    },
    footer: {
      titleLine1: "Let's build",
      titleLine2: 'amazing things',
      description: "I'm a fullstack developer focused on delivering quality products. Want to turn your idea into reality? Let's talk — I handle architecture, code and delivery.",
      linkPortfolio: 'Portfolio',
      linkResume: 'Resume',
      linkContact: 'Contact',
      backToTop: 'Back to top',
      rights: 'All rights reserved.'
    },
  },
  es: {
    nav: ['Inicio','Sobre','Habilidades','Proyectos','Contacto'],
    scroll: 'Scroll',
    touchTitle: '👋 ¡Toca al Menebot!',
    touchSubtitle: 'Él te está esperando',
    talkboxHint: 'Haz clic para continuar →',
    projects: {
      title: 'Proyectos',
      subtitle: 'Vea algo de lo mejor de mi trabajo! Explore mis proyectos académicos y de aprendizaje, donde apliqué mis habilidades y crecí como desarrollador.',
      techsTitle: 'Tecnologías que domino',
      ctaGithub: 'Ver en GitHub',
      prev: 'Anterior',
      next: 'Siguiente',
      status: {
        done: 'Concluido',
        inprogress: 'En desarrollo',
        notstarted: 'No iniciado'
      }
    },
    footer: {
      titleLine1: 'Construyamos',
      titleLine2: 'cosas increíbles',
      description: 'Soy un desarrollador fullstack enfocado en entregar productos de calidad. ¿Quieres convertir tu idea en realidad? Hablemos — me encargo de la arquitectura, el código y la entrega.',
      linkPortfolio: 'Portafolio',
      linkResume: 'Currículum',
      linkContact: 'Contacto',
      backToTop: 'Arriba',
      rights: 'Todos los derechos reservados.'
    },
  }
};

export type Lang = 'pt'|'en'|'es';
