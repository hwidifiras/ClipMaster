import Prism from 'prismjs';

interface DetectedCode {
  isCode: boolean;
  language: string | null;
  confidence: number;
}

const commonCodePatterns = {
  javascript: /^(const|let|var|function|class|import|export|=>)/m,
  python: /^(def|class|import|from|if __name__|async def)/m,
  html: /^<!DOCTYPE|^<html|^<[a-z]+>/im,
  css: /^(\.|#|@media|@import|body|html)\s*{/m,
  sql: /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+/im,
  json: /^[\s\n]*[{\[]/,
  typescript: /^(interface|type|enum|namespace|abstract|private|public|protected)/m,
};

const codeIndicators = [
  '{',
  '}',
  '(',
  ')',
  ';',
  '=>',
  '===',
  '!==',
  '+=',
  '-=',
  '*=',
  '/=',
  '++',
  '--',
  '&&',
  '||',
];

const minimumCodeConfidence = 0.6;

export function detectCode(text: string): DetectedCode {
  // Skip empty text
  if (!text.trim()) {
    return { isCode: false, language: null, confidence: 0 };
  }

  let confidence = 0;
  let detectedLanguage: string | null = null;

  // Check for language-specific patterns
  for (const [language, pattern] of Object.entries(commonCodePatterns)) {
    if (pattern.test(text)) {
      confidence += 0.4;
      detectedLanguage = language;
      break;
    }
  }

  // Count code indicators
  const indicatorCount = codeIndicators.reduce((count, indicator) => 
    count + (text.includes(indicator) ? 1 : 0), 0);
  
  confidence += Math.min(indicatorCount * 0.1, 0.3);

  // Check for indentation patterns
  const lines = text.split('\n');
  const hasConsistentIndentation = lines.length > 1 && lines.some(line => 
    /^\s{2,}/.test(line) || /^\t+/.test(line));
  if (hasConsistentIndentation) {
    confidence += 0.2;
  }

  // Check for brackets balance
  const bracketsBalance = 
    text.split('{').length === text.split('}').length &&
    text.split('(').length === text.split(')').length &&
    text.split('[').length === text.split(']').length;
  if (bracketsBalance) {
    confidence += 0.1;
  }

  // Try syntax highlighting with Prism if no language detected yet
  if (!detectedLanguage && confidence > 0.3) {
    for (const lang of Object.keys(Prism.languages)) {
      try {
        const highlighted = Prism.highlight(text, Prism.languages[lang], lang);
        if (highlighted !== text) {
          detectedLanguage = lang;
          confidence += 0.2;
          break;
        }
      } catch (e) {
        continue;
      }
    }
  }

  return {
    isCode: confidence >= minimumCodeConfidence,
    language: detectedLanguage,
    confidence
  };
}
