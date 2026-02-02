/**
 * Telugu to English: translation (words) and optional transliteration (script).
 * - translateTeluguToEnglish: Telugu words → English words (meaning) via API
 * - teluguToEnglish: Telugu script → Roman script (fallback, no API)
 */
import Sanscript from '@indic-transliteration/sanscript';

// Telugu Unicode block: U+0C00 to U+0C7F
const TELUGU_REGEX = /[\u0C00-\u0C7F]/;

export function containsTelugu(text: string): boolean {
  return TELUGU_REGEX.test(text);
}

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';
const MAX_CHUNK = 450; // stay under 500 chars per request

/**
 * Translates Telugu text to English words (meaning-based) using MyMemory API.
 * Use this when you want Telugu words converted to their English word equivalents.
 */
export async function translateTeluguToEnglish(text: string): Promise<string> {
  if (!text || typeof text !== 'string') return text ?? '';
  const trimmed = text.trim();
  if (!trimmed) return text;
  if (!containsTelugu(trimmed)) return text;

  try {
    const chunks: string[] = [];
    for (let i = 0; i < trimmed.length; i += MAX_CHUNK) {
      chunks.push(trimmed.slice(i, i + MAX_CHUNK));
    }
    const results = await Promise.all(
      chunks.map(async (chunk) => {
        try {
          const res = await fetch(
            `${MYMEMORY_URL}?q=${encodeURIComponent(chunk)}&langpair=te|en`
          );
          const data = await res.json();
          const translated = data?.responseData?.translatedText;
          return typeof translated === 'string' ? translated : chunk;
        } catch {
          return chunk;
        }
      })
    );
    return results.join('');
  } catch {
    return text;
  }
}

/**
 * Transliteration only: Telugu script → Roman script (Harvard-Kyoto).
 * Use when you need instant conversion without API. For English words use translateTeluguToEnglish.
 */
export function teluguToEnglish(text: string): string {
  if (!text || typeof text !== 'string') return text ?? '';
  if (!containsTelugu(text)) return text;
  try {
    const result = Sanscript.t(text, 'telugu', 'hk');
    return (result && typeof result === 'string') ? result : text;
  } catch {
    return text;
  }
}
