import faqs from '../data/faqs.json';

export interface FAQ {
  id: string;
  intent: string;
  keywords: string[];
  answer_pt: string;
  answer_en: string;
  answer_es: string;
}

export type Language = 'pt' | 'en' | 'es';

/**
 * Detecta o idioma da mensagem do usuário
 * Retorna 'pt', 'en' ou 'es'
 */
export function detectLanguage(message: string): Language {
  const lowerMsg = message.toLowerCase();
  
  // Palavras características de cada idioma
  const ptIndicators = ['você', 'está', 'pode', 'quais', 'qual', 'onde', 'como', 'seu', 'sua'];
  const enIndicators = ['you', 'your', 'what', 'where', 'how', 'can', 'are', 'is', 'do'];
  const esIndicators = ['usted', 'está', 'puede', 'cuáles', 'cuál', 'dónde', 'cómo', 'tu', 'su'];
  
  let ptScore = 0;
  let enScore = 0;
  let esScore = 0;
  
  ptIndicators.forEach(word => {
    if (lowerMsg.includes(word)) ptScore++;
  });
  
  enIndicators.forEach(word => {
    if (lowerMsg.includes(word)) enScore++;
  });
  
  esIndicators.forEach(word => {
    if (lowerMsg.includes(word)) esScore++;
  });
  
  // Retorna idioma com maior pontuação
  if (ptScore >= enScore && ptScore >= esScore) return 'pt';
  if (enScore > ptScore && enScore >= esScore) return 'en';
  return 'es';
}

/**
 * Tenta fazer match de uma mensagem com um FAQ baseado em keywords
 * Retorna o FAQ se encontrar match, ou null
 */
export function matchIntent(message: string): FAQ | null {
  const lowerMsg = message.toLowerCase();
  const typedFaqs = faqs as FAQ[];
  
  // Normalizar texto removendo acentos para melhor matching
  const normalizedMsg = lowerMsg
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  for (const faq of typedFaqs) {
    // Contar quantas keywords aparecem na mensagem
    const matchedKeywords = faq.keywords.filter(keyword => {
      const normalizedKeyword = keyword
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      
      return normalizedMsg.includes(normalizedKeyword);
    });
    
    // Se pelo menos 1 keyword foi encontrada, considera match
    if (matchedKeywords.length > 0) {
      console.log(`✅ Intent matched: ${faq.intent} (keywords: ${matchedKeywords.join(', ')})`);
      return faq;
    }
  }
  
  console.log('❌ No intent matched, using RAG');
  return null;
}

/**
 * Retorna a resposta do FAQ no idioma apropriado
 */
export function getAnswerForLanguage(faq: FAQ, language: Language): string {
  const answerKey = `answer_${language}` as keyof FAQ;
  return faq[answerKey] as string;
}

/**
 * Função principal: tenta match de intent e retorna resposta ou null
 * Se retornar null, o sistema deve usar RAG normal
 */
export function tryIntentMatch(message: string): string | null {
  const faq = matchIntent(message);
  
  if (!faq) {
    return null; // Usar RAG
  }
  
  const language = detectLanguage(message);
  const answer = getAnswerForLanguage(faq, language);
  
  console.log(`💬 Returning cached FAQ answer in ${language}`);
  return answer;
}
