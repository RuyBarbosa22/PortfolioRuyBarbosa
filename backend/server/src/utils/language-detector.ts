export type Language = 'pt-BR' | 'en-US' | 'es-AR';

interface LanguagePattern {
  // Palavras muito específicas (peso maior)
  strongIndicators: string[];
  // Palavras comuns (peso médio)
  commonWords: string[];
  // Caracteres especiais típicos
  specialChars?: RegExp;
}

const LANGUAGE_PATTERNS: Record<Language, LanguagePattern> = {
  'pt-BR': {
    strongIndicators: ['você', 'vc', 'está', 'vocês', 'são', 'também', 'então', 'não', 'sim', 'obrigado', 'por favor'],
    commonWords: ['o', 'a', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'com', 'como', 'seu', 'sua', 'tem', 'pode', 'qual', 'onde', 'quando', 'por', 'mais', 'ele', 'ela', 'quais', 'porque', 'fazer', 'ser', 'muito', 'trabalha', 'projeto', 'tecnologia'],
    specialChars: /[ãõáéíóúâêôàç]/,
  },
  'es-AR': {
    strongIndicators: ['usted', 'ustedes', 'cómo', 'qué', 'cuál', 'dónde', 'cuándo', 'también', 'sí', 'hola', 'gracias', 'por favor'],
    commonWords: ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'una', 'para', 'con', 'su', 'está', 'tiene', 'puede', 'por', 'más', 'él', 'ella', 'cuáles', 'porque', 'hacer', 'ser', 'muy', 'trabaja', 'proyecto', 'tecnología'],
    specialChars: /[áéíóúñü¿¡]/,
  },
  'en-US': {
    strongIndicators: ['you', 'your', 'yourself', 'they', 'are', 'were', 'have', 'has', 'do', 'does', 'did', 'hello', 'thank', 'please'],
    commonWords: ['the', 'a', 'an', 'of', 'and', 'in', 'to', 'for', 'with', 'is', 'was', 'can', 'what', 'how', 'which', 'where', 'when', 'why', 'more', 'he', 'she', 'who', 'make', 'work', 'project', 'technology'],
    specialChars: undefined,
  },
};

/**
 * Detecta o idioma da mensagem do usuário usando múltiplas estratégias
 * 
 * Estratégias aplicadas:
 * 1. Caracteres especiais (acentos específicos de cada idioma)
 * 2. Palavras fortes (indicadores muito específicos de cada idioma)
 * 3. Palavras comuns (vocabulário frequente)
 * 4. Sistema de pontuação ponderada
 * 
 * @param text - Texto a ser analisado
 * @returns 'pt-BR', 'en-US' ou 'es-AR'
 */
export function detectLanguage(text: string): Language {
  if (!text || text.trim().length === 0) {
    return 'pt-BR'; // Default para mensagens vazias
  }

  const normalizedText = text.toLowerCase().trim();
  
  // Normalize para remover acentos e comparar formas base
  const removedAccents = normalizedText
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const scores: Record<Language, number> = {
    'pt-BR': 0,
    'en-US': 0,
    'es-AR': 0,
  };

  // Estratégia 1: Detectar caracteres especiais (peso: 3 pontos por match)
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (pattern.specialChars && pattern.specialChars.test(normalizedText)) {
      scores[lang as Language] += 3;
    }
  }

  // Estratégia 2: Detectar indicadores fortes (peso: 5 pontos por match)
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    for (const indicator of pattern.strongIndicators) {
      // Word boundary check para evitar falsos positivos
      const regex = new RegExp(`\\b${indicator}\\b`, 'i');
      if (regex.test(normalizedText)) {
        scores[lang as Language] += 5;
      }
    }
  }

  // Estratégia 3: Detectar palavras comuns (peso: 1 ponto por match)
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    for (const word of pattern.commonWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(removedAccents)) {
        scores[lang as Language] += 1;
      }
    }
  }

  // Estratégia 4: Boost para padrões específicos
  // Português: terminações verbais comuns
  if (/\b\w+(ar|er|ir|ando|endo|indo|ado|ido)\b/.test(normalizedText)) {
    scores['pt-BR'] += 2;
  }
  
  // Espanhol: uso de "¿" ou "¡"
  if (/[¿¡]/.test(normalizedText)) {
    scores['es-AR'] += 5;
  }

  // Inglês: contrações comuns
  if (/\b(don't|doesn't|can't|won't|I'm|you're|it's|that's|what's)\b/.test(normalizedText)) {
    scores['en-US'] += 4;
  }

  // Log para debug (pode ser removido em produção)
  console.log(`🌍 Language detection scores: PT=${scores['pt-BR']}, EN=${scores['en-US']}, ES=${scores['es-AR']}`);

  // Retorna o idioma com maior pontuação
  const maxScore = Math.max(scores['pt-BR'], scores['en-US'], scores['es-AR']);
  
  // Se todos os scores são 0, assume português (padrão brasileiro)
  if (maxScore === 0) {
    return 'pt-BR';
  }

  // Retorna o idioma vencedor (em caso de empate, preferência: pt > es > en)
  if (scores['pt-BR'] === maxScore) return 'pt-BR';
  if (scores['es-AR'] === maxScore) return 'es-AR';
  return 'en-US';
}
