import Fuse from 'fuse.js';
import { Product, VoiceParseResult } from '../types';

// Map Indonesian and Javanese words to numbers
const NUMBER_WORD_MAP: Record<string, number> = {
  'se': 1,
  'satu': 1,
  '1': 1,
  'siji': 1,
  'sawiji': 1,
  'dua': 2,
  '2': 2,
  'loro': 2,
  'tiga': 3,
  '3': 3,
  'telu': 3,
  'empat': 4,
  '4': 4,
  'papat': 4,
  'pat': 4,
  'lima': 5,
  '5': 5,
  'limo': 5,
  'enam': 6,
  '6': 6,
  'nem': 6,
  'tujuh': 7,
  '7': 7,
  'pitu': 7,
  'delapan': 8,
  '8': 8,
  'wolu': 8,
  'sembilan': 9,
  '9': 9,
  'songo': 9,
  'sepuluh': 10,
  '10': 10,
  'sedasa': 10,
  'sebelas': 11,
  '11': 11,
  'dua belas': 12,
  '12': 12,
  'setengah': 0.5,
  'seperempat': 0.25,
};

/**
 * Extracts quantity and clean product search query from a spoken phrase.
 * e.g., "Dua minyak goreng" -> quantity: 2, query: "minyak goreng"
 * e.g., "Satu gula pasir" -> quantity: 1, query: "gula pasir"
 * e.g., "Setengah kg telur" -> quantity: 0.5, query: "telur"
 */
function parseSinglePhrase(phrase: string): { quantity: number; query: string } {
  let clean = phrase.trim().toLowerCase();
  
  // Remove filler conversational words
  clean = clean.replace(/^(tolong|minta|tambah|pinta|ambilkan|kasih)\s+/i, '');
  clean = clean.replace(/\s+(aja|saja|ya|yo|mas|mbak|bu)\b/gi, '');

  // Look for number patterns at the beginning
  const words = clean.split(/\s+/);
  if (words.length === 0) return { quantity: 1, query: '' };

  let quantity = 1;
  let queryWordsStartIndex = 0;

  // Check if first word is a number (digit or word)
  const firstWord = words[0];
  if (/^\d+(\.\d+)?$/.test(firstWord)) {
    quantity = parseFloat(firstWord);
    queryWordsStartIndex = 1;
  } else if (NUMBER_WORD_MAP[firstWord] !== undefined) {
    quantity = NUMBER_WORD_MAP[firstWord];
    queryWordsStartIndex = 1;
    // Check two word numbers e.g. "dua puluh" or "dua belas"
    if (words.length > 1) {
      const pair = `${firstWord} ${words[1]}`;
      if (NUMBER_WORD_MAP[pair] !== undefined) {
        quantity = NUMBER_WORD_MAP[pair];
        queryWordsStartIndex = 2;
      }
    }
  } else if (clean.startsWith('se-')) {
    quantity = 1;
    clean = clean.replace(/^se-/, '');
    words[0] = words[0].replace(/^se-/, '');
  }

  // Strip unit words from query if present (e.g., "kg", "bungkus", "botol", "galon")
  let queryWords = words.slice(queryWordsStartIndex);
  if (queryWords.length > 0 && ['kg', 'kilo', 'kilogram', 'bungkus', 'bks', 'botol', 'galon', 'pcs', 'biji', 'renteng', 'liter', 'pouch', 'kaleng', 'tabung'].includes(queryWords[0])) {
    queryWords = queryWords.slice(1);
  }

  const query = queryWords.join(' ').trim();
  return { quantity: quantity <= 0 ? 1 : quantity, query };
}

/**
 * Splits continuous voice speech into separate item phrases.
 * e.g., "Dua minyak goreng, satu gula pasir, tiga mie sedap, satu kopi kapal api"
 * e.g., "Dua minyak goreng dan satu gula pasir"
 */
function splitTranscriptIntoPhrases(transcript: string): string[] {
  // Normalize delimiters
  let text = transcript.toLowerCase();
  
  // Replace connective words with a uniform delimiter '|'
  text = text.replace(/\s+(dan|lalu|kemudian|sama|plus|serta|terus)\s+/g, ' | ');
  text = text.replace(/[,;\n]/g, ' | ');

  // Split by '|'
  const rawSegments = text.split('|').map(s => s.trim()).filter(Boolean);

  // If no delimiters were explicitly spoken, check if numbers appear in the middle of text
  // e.g. "dua minyak goreng satu gula pasir tiga mie sedap"
  const phrases: string[] = [];
  
  for (const seg of rawSegments) {
    // Regexp matching number words in text to split sub-phrases
    const numberRegex = /\b(satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|siji|loro|telu|papat|limo|nem|pitu|wolu|songo|sedasa|setengah|1|2|3|4|5|6|7|8|9|10)\b/gi;
    
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const splitIndices: number[] = [];

    while ((match = numberRegex.exec(seg)) !== null) {
      if (match.index > 0) {
        splitIndices.push(match.index);
      }
    }

    if (splitIndices.length > 0) {
      let currentPos = 0;
      for (const idx of splitIndices) {
        const sub = seg.substring(currentPos, idx).trim();
        if (sub) phrases.push(sub);
        currentPos = idx;
      }
      const lastSub = seg.substring(currentPos).trim();
      if (lastSub) phrases.push(lastSub);
    } else {
      phrases.push(seg);
    }
  }

  return phrases.filter(p => p.length > 0);
}

/**
 * Main local fuzzy parser matching spoken transcript against product database.
 */
export function parseVoiceLocally(transcript: string, products: Product[]): VoiceParseResult {
  if (!transcript || !products || products.length === 0) {
    return { rawTranscript: transcript, parsedItems: [] };
  }

  // Configure Fuse.js for ultra-fast local fuzzy search
  const fuseOptions = {
    includeScore: true,
    threshold: 0.45,
    keys: [
      { name: 'name', weight: 0.5 },
      { name: 'aliases', weight: 0.4 },
      { name: 'category', weight: 0.1 }
    ]
  };

  const fuse = new Fuse(products, fuseOptions);
  const rawPhrases = splitTranscriptIntoPhrases(transcript);

  const parsedItems: VoiceParseResult['parsedItems'] = [];

  for (const phrase of rawPhrases) {
    const { quantity, query } = parseSinglePhrase(phrase);
    if (!query) continue;

    // Execute fuzzy search
    const results = fuse.search(query);

    if (results.length > 0) {
      const topResult = results[0];
      const matchScore = topResult.score || 0; // Fuse score: 0 is perfect, 1 is worst

      // High confidence if score <= 0.35 or exact alias match
      const isExactAlias = topResult.item.aliases?.some(a => a.toLowerCase() === query) ||
                           topResult.item.name.toLowerCase().includes(query);

      const confidence = isExactAlias ? 0.95 : Math.max(0.1, 1 - matchScore);

      if (confidence >= 0.6) {
        parsedItems.push({
          spokenQuery: query,
          quantity,
          matchedProduct: topResult.item,
          confidence,
          suggestions: []
        });
      } else {
        // Ambiguous match -> provide top 3 suggestions for user tap
        const suggestions = results.slice(0, 3).map(r => r.item);
        parsedItems.push({
          spokenQuery: query,
          quantity,
          matchedProduct: undefined,
          confidence,
          suggestions
        });
      }
    } else {
      // No match found -> provide popular or category products as suggestions
      parsedItems.push({
        spokenQuery: query,
        quantity,
        matchedProduct: undefined,
        confidence: 0,
        suggestions: products.slice(0, 3)
      });
    }
  }

  return {
    rawTranscript: transcript,
    parsedItems
  };
}
