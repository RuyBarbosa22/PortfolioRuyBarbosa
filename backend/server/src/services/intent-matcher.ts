import faqs from '../data/faqs.json' with { type: 'json' };
import { detectLanguage, type Language } from '../utils/language-detector.js';

export interface FAQ {
  id: string;
  intent: string;
  keywords: string[];
  answer_pt: string;
  answer_en: string;
  answer_es: string;
}

/**
 * Tenta fazer match de uma mensagem com um FAQ baseado em keywords
 * Retorna o FAQ se encontrar match, ou null
 */
export function matchIntent(message: string): FAQ | null {
  const lowerMsg = message.toLowerCase();
  const typedFaqs = faqs as FAQ[];
  
  const normalizedMsg = lowerMsg
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  for (const faq of typedFaqs) {
    const matchedKeywords = faq.keywords.filter(keyword => {
      const normalizedKeyword = keyword
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      
      return normalizedMsg.includes(normalizedKeyword);
    });
    
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
  // Mapeia 'pt-BR' -> 'pt', 'en-US' -> 'en', 'es-AR' -> 'es'
  const langCode = language.split('-')[0] as 'pt' | 'en' | 'es';
  const answerKey = `answer_${langCode}` as keyof FAQ;
  return faq[answerKey] as string;
}


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
