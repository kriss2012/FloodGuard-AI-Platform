export interface TextRefinementResult {
  refinedText: string;
  corrections: Correction[];
  fluencyScore: number;
}

export interface Correction {
  original: string;
  corrected: string;
  type: 'grammar' | 'punctuation' | 'fluency' | 'spelling';
  position: number;
}

// Common grammar and punctuation corrections
const grammarPatterns: { pattern: RegExp; replacement: string; type: Correction['type'] }[] = [
  // Capitalize first letter of sentences
  { pattern: /(^|[.!?]\s+)([a-z])/g, replacement: '$1$2', type: 'grammar' },
  
  // Fix common misspellings
  { pattern: /\b(teh)\b/gi, replacement: 'the', type: 'spelling' },
  { pattern: /\b(recieve)\b/gi, replacement: 'receive', type: 'spelling' },
  { pattern: /\b(seperate)\b/gi, replacement: 'separate', type: 'spelling' },
  { pattern: /\b(occurance)\b/gi, replacement: 'occurrence', type: 'spelling' },
  { pattern: /\b(definately)\b/gi, replacement: 'definitely', type: 'spelling' },
  { pattern: /\b(occured)\b/gi, replacement: 'occurred', type: 'spelling' },
  
  // Fix common grammar issues
  { pattern: /\b(i)\b/g, replacement: 'I', type: 'grammar' },
  { pattern: /\b(dont)\b/gi, replacement: "don't", type: 'grammar' },
  { pattern: /\b(cant)\b/gi, replacement: "can't", type: 'grammar' },
  { pattern: /\b(wont)\b/gi, replacement: "won't", type: 'grammar' },
  { pattern: /\b(isnt)\b/gi, replacement: "isn't", type: 'grammar' },
  { pattern: /\b(arent)\b/gi, replacement: "aren't", type: 'grammar' },
  { pattern: /\b(didnt)\b/gi, replacement: "didn't", type: 'grammar' },
  { pattern: /\b(wasnt)\b/gi, replacement: "wasn't", type: 'grammar' },
  { pattern: /\b(werent)\b/gi, replacement: "weren't", type: 'grammar' },
  { pattern: /\b(havent)\b/gi, replacement: "haven't", type: 'grammar' },
  { pattern: /\b(hasnt)\b/gi, replacement: "hasn't", type: 'grammar' },
  { pattern: /\b(hadnt)\b/gi, replacement: "hadn't", type: 'grammar' },
  { pattern: /\b(wouldnt)\b/gi, replacement: "wouldn't", type: 'grammar' },
  { pattern: /\b(couldnt)\b/gi, replacement: "couldn't", type: 'grammar' },
  { pattern: /\b(shouldnt)\b/gi, replacement: "shouldn't", type: 'grammar' },
  { pattern: /\b(im)\b/gi, replacement: "I'm", type: 'grammar' },
  { pattern: /\b(ill)\b/gi, replacement: "I'll", type: 'grammar' },
  { pattern: /\b(ive)\b/gi, replacement: "I've", type: 'grammar' },
  { pattern: /\b(youre)\b/gi, replacement: "you're", type: 'grammar' },
  { pattern: /\b(youll)\b/gi, replacement: "you'll", type: 'grammar' },
  { pattern: /\b(youve)\b/gi, replacement: "you've", type: 'grammar' },
  { pattern: /\b(theyre)\b/gi, replacement: "they're", type: 'grammar' },
  { pattern: /\b(theyll)\b/gi, replacement: "they'll", type: 'grammar' },
  { pattern: /\b(theyve)\b/gi, replacement: "they've", type: 'grammar' },
  { pattern: /\b(its)\b/gi, replacement: "it's", type: 'grammar' },
  { pattern: /\b(thats)\b/gi, replacement: "that's", type: 'grammar' },
  { pattern: /\b(whats)\b/gi, replacement: "what's", type: 'grammar' },
  { pattern: /\b(wheres)\b/gi, replacement: "where's", type: 'grammar' },
  { pattern: /\b(whens)\b/gi, replacement: "when's", type: 'grammar' },
  { pattern: /\b(whys)\b/gi, replacement: "why's", type: 'grammar' },
  { pattern: /\b(hows)\b/gi, replacement: "how's", type: 'grammar' },
  
  // Punctuation fixes
  { pattern: /\s+,/g, replacement: ',', type: 'punctuation' },
  { pattern: /\s+\./g, replacement: '.', type: 'punctuation' },
  { pattern: /\s+!/g, replacement: '!', type: 'punctuation' },
  { pattern: /\s+\?/g, replacement: '?', type: 'punctuation' },
  { pattern: /,{2,}/g, replacement: ',', type: 'punctuation' },
  { pattern: /\.{3,}/g, replacement: '...', type: 'punctuation' },
  { pattern: /!{2,}/g, replacement: '!', type: 'punctuation' },
  { pattern: /\?{2,}/g, replacement: '?', type: 'punctuation' },
  
  // Fluency improvements
  { pattern: /\s+/g, replacement: ' ', type: 'fluency' },
  { pattern: /\s+$/g, replacement: '', type: 'fluency' },
  { pattern: /^\s+/g, replacement: '', type: 'fluency' },
];

// Smart punctuation insertion
const smartPunctuation = (text: string): string => {
  let result = text;
  
  // Add period at end if missing and text is long enough
  if (result.length > 20 && !/[.!?]$/.test(result.trim())) {
    result = result.trim() + '.';
  }
  
  // Capitalize after periods
  result = result.replace(/([.!?]\s+)([a-z])/g, (_match, p1, p2) => p1 + p2.toUpperCase());
  
  // Add comma before conjunctions in longer sentences
  result = result.replace(/(\w{5,})(\s+)(and|but|or|so|yet|for|nor)(\s+)/g, '$1,$2$3$4');
  
  return result;
};

// Calculate fluency score (0-100)
const calculateFluencyScore = (original: string, refined: string): number => {
  if (!original.trim()) return 0;
  
  let score = 85; // Base score
  
  // Bonus for proper capitalization
  if (/^[A-Z]/.test(refined)) score += 3;
  
  // Bonus for proper ending punctuation
  if (/[.!?]$/.test(refined.trim())) score += 3;
  
  // Penalty for very short text
  if (original.split(' ').length < 5) score -= 10;
  
  // Bonus for longer, well-structured text
  if (original.split(' ').length > 20) score += 4;
  
  // Check for proper spacing
  if (!/\s{2,}/.test(refined)) score += 5;
  
  return Math.min(100, Math.max(0, score));
};

export async function refineText(text: string): Promise<TextRefinementResult> {
  if (!text.trim()) {
    return {
      refinedText: '',
      corrections: [],
      fluencyScore: 0
    };
  }

  // Simulate API delay for realistic feel
  await new Promise(resolve => setTimeout(resolve, 300));

  let refinedText = text;
  const corrections: Correction[] = [];

  // Apply grammar patterns
  grammarPatterns.forEach(({ pattern, replacement, type }) => {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    
    while ((match = regex.exec(refinedText)) !== null) {
      const original = match[0];
      let corrected = original;
      
      if (type === 'grammar' && pattern.source.includes('(^|[.!?]\\s+)([a-z])')) {
        // Handle capitalization specially
        corrected = original.replace(/([a-z])/, (c) => c.toUpperCase());
      } else {
        corrected = original.replace(pattern, replacement);
      }
      
      if (original !== corrected) {
        corrections.push({
          original,
          corrected,
          type,
          position: match.index
        });
      }
    }
    
    refinedText = refinedText.replace(regex, replacement);
  });

  // Apply smart punctuation
  refinedText = smartPunctuation(refinedText);

  // Clean up multiple spaces
  refinedText = refinedText.replace(/\s+/g, ' ').trim();

  const fluencyScore = calculateFluencyScore(text, refinedText);

  return {
    refinedText,
    corrections,
    fluencyScore
  };
}

// Alternative text improvements
export function getAlternativePhrases(text: string): string[] {
  const alternatives: string[] = [];
  
  // Simple alternative suggestions
  if (text.toLowerCase().includes('very good')) {
    alternatives.push(text.replace(/very good/gi, 'excellent'));
    alternatives.push(text.replace(/very good/gi, 'outstanding'));
  }
  
  if (text.toLowerCase().includes('very bad')) {
    alternatives.push(text.replace(/very bad/gi, 'terrible'));
    alternatives.push(text.replace(/very bad/gi, 'poor'));
  }
  
  if (text.toLowerCase().includes('a lot of')) {
    alternatives.push(text.replace(/a lot of/gi, 'many'));
    alternatives.push(text.replace(/a lot of/gi, 'numerous'));
  }
  
  if (text.toLowerCase().includes('i think')) {
    alternatives.push(text.replace(/i think/gi, 'I believe'));
    alternatives.push(text.replace(/i think/gi, 'in my opinion'));
  }
  
  return alternatives.slice(0, 3);
}

// Export text as different formats
export function exportAsTxt(text: string): Blob {
  return new Blob([text], { type: 'text/plain;charset=utf-8' });
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
