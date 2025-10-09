export const defaultLanguage = 'pt';

export const translations: Record<string, any> = {
  pt: {
    nav: ['Início','Sobre','Habilidades','Projetos','Contato'],
    scroll: 'Scroll',
    touchTitle: '👋 Toque no Menebot!',
    touchSubtitle: 'Ele está esperando por você',
    talkboxHint: 'Clique para continuar →',
  },
  en: {
    nav: ['Home','About','Skills','Projects','Contact'],
    scroll: 'Scroll',
    touchTitle: '👋 Tap the Menebot!',
    touchSubtitle: "He's waiting for you",
    talkboxHint: 'Click to continue →',
  },
  es: {
    nav: ['Inicio','Sobre','Habilidades','Proyectos','Contacto'],
    scroll: 'Scroll',
    touchTitle: '👋 ¡Toca al Menebot!',
    touchSubtitle: 'Él te está esperando',
    talkboxHint: 'Haz clic para continuar →',
  }
};

export type Lang = 'pt'|'en'|'es';
