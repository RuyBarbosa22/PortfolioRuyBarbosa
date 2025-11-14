export type Language = 'pt-BR' | 'en-US' | 'es-AR';

/**
 * Detecta o idioma da mensagem do usuário com análise de palavras-chave
 * Retorna 'pt-BR', 'en-US' ou 'es-AR'
 */
export function detectLanguage(text: string): Language {
  const lowerText = text.toLowerCase();

  // Palavras-chave para detecção (mais abrangentes)
  const ptKeywords = ['você', 'vc', 'seu', 'sua', 'como', 'que', 'está', 'tem', 'pode', 'qual', 'onde', 'por', 'para', 'com', 'mais', 'ele', 'ela', 'quais', 'quando', 'porque'];
  const esKeywords = ['usted', 'tu', 'su', 'cómo', 'qué', 'está', 'tiene', 'puede', 'cuál', 'dónde', 'hola', 'por', 'para', 'con', 'más', 'él', 'ella', 'cuáles', 'cuando', 'porque'];
  const enKeywords = ['you', 'your', 'how', 'what', 'is', 'are', 'have', 'can', 'which', 'where', 'hello', 'for', 'with', 'more', 'he', 'she', 'when', 'why', 'do', 'does'];

  let ptCount = 0;
  let esCount = 0;
  let enCount = 0;

  ptKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) ptCount++;
  });

  esKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) esCount++;
  });

  enKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) enCount++;
  });

  // Retorna idioma com mais matches
  if (ptCount >= esCount && ptCount >= enCount) return 'pt-BR';
  if (esCount >= enCount) return 'es-AR';
  return 'en-US';
}
