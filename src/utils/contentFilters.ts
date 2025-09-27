// Content filtering utilities for SportMap moderation system

export interface ContentFilter {
  id: string;
  name: string;
  type: 'text' | 'image' | 'url' | 'email' | 'phone' | 'behavior';
  pattern: string | RegExp;
  action: 'block' | 'flag' | 'replace' | 'allow';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  description: string;
}

export interface FilterResult {
  passed: boolean;
  blocked: boolean;
  flagged: boolean;
  score: number;
  reasons: string[];
  suggestions?: string[];
}

export interface ContentAnalysis {
  text: string;
  images?: string[];
  metadata?: any;
  user_id?: string;
  content_type: string;
}

// Predefined filter patterns
export const SPAM_PATTERNS = [
  /(?:buy|sell|purchase|order|discount|offer|deal|sale|promo|promotion)/i,
  /(?:click|link|url|website|visit|check|out)/i,
  /(?:free|money|cash|earn|income|profit|revenue)/i,
  /(?:win|winner|prize|reward|bonus|gift)/i,
  /(?:limited|time|urgent|act|now|today|immediately)/i,
  /(?:guaranteed|promise|satisfaction|refund|return)/i,
];

export const HARASSMENT_PATTERNS = [
  /(?:hate|stupid|idiot|moron|dumb|retard|fool)/i,
  /(?:kill|die|death|murder|suicide|harm)/i,
  /(?:threat|threaten|warning|consequence)/i,
  /(?:harass|bully|intimidate|scare)/i,
  /(?:discriminate|racist|sexist|homophobic)/i,
];

export const INAPPROPRIATE_PATTERNS = [
  /(?:nude|naked|sex|sexual|porn|pornography)/i,
  /(?:drug|alcohol|drunk|high|stoned)/i,
  /(?:violence|fight|attack|assault|abuse)/i,
  /(?:weapon|gun|knife|bomb|explosive)/i,
  /(?:illegal|crime|criminal|theft|fraud)/i,
];

export const FAKE_PATTERNS = [
  /(?:fake|scam|fraud|phishing|malware)/i,
  /(?:clickbait|misleading|false|lie|deceive)/i,
  /(?:bot|automated|spam|mass|bulk)/i,
  /(?:impersonate|pretend|fake|identity)/i,
];

export const URL_PATTERNS = [
  /https?:\/\/[^\s]+/g,
  /www\.[^\s]+/g,
  /[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/g,
];

export const EMAIL_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
];

export const PHONE_PATTERNS = [
  /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
  /(?:\+?[1-9]\d{1,14})/g,
];

// Content filter functions
export function createContentFilter(filter: Omit<ContentFilter, 'id'>): ContentFilter {
  return {
    id: `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...filter,
  };
}

export function analyzeTextContent(text: string, filters: ContentFilter[] = []): FilterResult {
  const result: FilterResult = {
    passed: true,
    blocked: false,
    flagged: false,
    score: 0,
    reasons: [],
    suggestions: [],
  };

  if (!text || text.trim().length === 0) {
    return result;
  }

  const lowerText = text.toLowerCase();
  let totalScore = 0;
  let maxScore = 0;

  // Check spam patterns
  const spamScore = checkSpamPatterns(text);
  totalScore += spamScore;
  maxScore += 1;

  if (spamScore > 0.5) {
    result.flagged = true;
    result.reasons.push('Potential spam content detected');
    result.suggestions?.push('Review content for promotional language');
  }

  // Check harassment patterns
  const harassmentScore = checkHarassmentPatterns(text);
  totalScore += harassmentScore;
  maxScore += 1;

  if (harassmentScore > 0.3) {
    result.flagged = true;
    result.reasons.push('Potential harassment content detected');
    result.suggestions?.push('Review content for inappropriate language');
  }

  // Check inappropriate patterns
  const inappropriateScore = checkInappropriatePatterns(text);
  totalScore += inappropriateScore;
  maxScore += 1;

  if (inappropriateScore > 0.3) {
    result.flagged = true;
    result.reasons.push('Inappropriate content detected');
    result.suggestions?.push('Review content for inappropriate material');
  }

  // Check fake patterns
  const fakeScore = checkFakePatterns(text);
  totalScore += fakeScore;
  maxScore += 1;

  if (fakeScore > 0.4) {
    result.flagged = true;
    result.reasons.push('Potential fake content detected');
    result.suggestions?.push('Verify content authenticity');
  }

  // Check for excessive URLs
  const urlCount = (text.match(URL_PATTERNS[0]) || []).length;
  if (urlCount > 3) {
    totalScore += 0.3;
    result.flagged = true;
    result.reasons.push('Excessive URLs detected');
    result.suggestions?.push('Limit number of URLs in content');
  }

  // Check for excessive caps
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.7 && text.length > 10) {
    totalScore += 0.2;
    result.flagged = true;
    result.reasons.push('Excessive capitalization detected');
    result.suggestions?.push('Avoid excessive use of capital letters');
  }

  // Check for repetitive content
  const repetitionScore = checkRepetition(text);
  totalScore += repetitionScore;
  maxScore += 1;

  if (repetitionScore > 0.5) {
    result.flagged = true;
    result.reasons.push('Repetitive content detected');
    result.suggestions?.push('Avoid repetitive content');
  }

  // Apply custom filters
  for (const filter of filters) {
    if (!filter.enabled) continue;

    const filterResult = applyFilter(text, filter);
    if (filterResult.matched) {
      totalScore += filterResult.score;
      maxScore += 1;
      
      if (filter.action === 'block') {
        result.blocked = true;
        result.passed = false;
      } else if (filter.action === 'flag') {
        result.flagged = true;
      }
      
      result.reasons.push(filter.description);
    }
  }

  // Calculate final score
  result.score = maxScore > 0 ? totalScore / maxScore : 0;

  // Determine if content should be blocked
  if (result.score > 0.7) {
    result.blocked = true;
    result.passed = false;
  } else if (result.score > 0.4) {
    result.flagged = true;
  }

  return result;
}

export function analyzeImageContent(imageUrls: string[]): FilterResult {
  const result: FilterResult = {
    passed: true,
    blocked: false,
    flagged: false,
    score: 0,
    reasons: [],
    suggestions: [],
  };

  if (!imageUrls || imageUrls.length === 0) {
    return result;
  }

  // Check for excessive images
  if (imageUrls.length > 10) {
    result.flagged = true;
    result.reasons.push('Excessive number of images');
    result.suggestions?.push('Limit number of images in content');
  }

  // Check for suspicious image URLs
  const suspiciousDomains = ['bit.ly', 'tinyurl.com', 'short.link', 'goo.gl'];
  const suspiciousUrls = imageUrls.filter(url => 
    suspiciousDomains.some(domain => url.includes(domain))
  );

  if (suspiciousUrls.length > 0) {
    result.flagged = true;
    result.reasons.push('Suspicious image URLs detected');
    result.suggestions?.push('Use direct image URLs instead of shortened links');
  }

  // Check for inappropriate file extensions
  const inappropriateExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif'];
  const inappropriateUrls = imageUrls.filter(url => 
    inappropriateExtensions.some(ext => url.toLowerCase().includes(ext))
  );

  if (inappropriateUrls.length > 0) {
    result.blocked = true;
    result.passed = false;
    result.reasons.push('Inappropriate file types detected');
    result.suggestions?.push('Only use image files (jpg, png, gif, etc.)');
  }

  return result;
}

export function analyzeUserBehavior(userId: string, behaviorData: any): FilterResult {
  const result: FilterResult = {
    passed: true,
    blocked: false,
    flagged: false,
    score: 0,
    reasons: [],
    suggestions: [],
  };

  // Check for rapid posting
  if (behaviorData.postsPerMinute > 5) {
    result.flagged = true;
    result.reasons.push('Rapid posting detected');
    result.suggestions?.push('Slow down posting frequency');
  }

  // Check for repetitive content
  if (behaviorData.repetitiveContent > 0.8) {
    result.flagged = true;
    result.reasons.push('Repetitive content pattern detected');
    result.suggestions?.push('Vary content to avoid repetition');
  }

  // Check for spam-like behavior
  if (behaviorData.spamScore > 0.7) {
    result.blocked = true;
    result.passed = false;
    result.reasons.push('Spam-like behavior detected');
    result.suggestions?.push('Review posting patterns');
  }

  return result;
}

// Helper functions
function checkSpamPatterns(text: string): number {
  let score = 0;
  let matches = 0;

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      matches++;
    }
  }

  score = matches / SPAM_PATTERNS.length;
  return score;
}

function checkHarassmentPatterns(text: string): number {
  let score = 0;
  let matches = 0;

  for (const pattern of HARASSMENT_PATTERNS) {
    if (pattern.test(text)) {
      matches++;
    }
  }

  score = matches / HARASSMENT_PATTERNS.length;
  return score;
}

function checkInappropriatePatterns(text: string): number {
  let score = 0;
  let matches = 0;

  for (const pattern of INAPPROPRIATE_PATTERNS) {
    if (pattern.test(text)) {
      matches++;
    }
  }

  score = matches / INAPPROPRIATE_PATTERNS.length;
  return score;
}

function checkFakePatterns(text: string): number {
  let score = 0;
  let matches = 0;

  for (const pattern of FAKE_PATTERNS) {
    if (pattern.test(text)) {
      matches++;
    }
  }

  score = matches / FAKE_PATTERNS.length;
  return score;
}

function checkRepetition(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  const wordCounts: { [key: string]: number } = {};
  
  words.forEach(word => {
    if (word.length > 3) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });

  const totalWords = words.length;
  const repeatedWords = Object.values(wordCounts).filter(count => count > 1).length;
  
  return totalWords > 0 ? repeatedWords / totalWords : 0;
}

function applyFilter(text: string, filter: ContentFilter): { matched: boolean; score: number } {
  let matched = false;
  let score = 0;

  if (filter.type === 'text') {
    if (typeof filter.pattern === 'string') {
      matched = text.toLowerCase().includes(filter.pattern.toLowerCase());
    } else {
      matched = filter.pattern.test(text);
    }
  }

  if (matched) {
    switch (filter.severity) {
      case 'critical':
        score = 1.0;
        break;
      case 'high':
        score = 0.8;
        break;
      case 'medium':
        score = 0.5;
        break;
      case 'low':
        score = 0.2;
        break;
    }
  }

  return { matched, score };
}

// Content sanitization functions
export function sanitizeText(text: string): string {
  if (!text) return '';

  // Remove excessive whitespace
  let sanitized = text.replace(/\s+/g, ' ').trim();

  // Remove excessive punctuation
  sanitized = sanitized.replace(/[!]{3,}/g, '!!!');
  sanitized = sanitized.replace(/[?]{3,}/g, '???');
  sanitized = sanitized.replace(/[.]{3,}/g, '...');

  // Remove excessive caps
  sanitized = sanitized.replace(/([A-Z])\1{2,}/g, '$1$1');

  return sanitized;
}

export function extractUrls(text: string): string[] {
  const urls: string[] = [];
  
  for (const pattern of URL_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      urls.push(...matches);
    }
  }
  
  return [...new Set(urls)]; // Remove duplicates
}

export function extractEmails(text: string): string[] {
  const emails: string[] = [];
  
  for (const pattern of EMAIL_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      emails.push(...matches);
    }
  }
  
  return [...new Set(emails)]; // Remove duplicates
}

export function extractPhones(text: string): string[] {
  const phones: string[] = [];
  
  for (const pattern of PHONE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      phones.push(...matches);
    }
  }
  
  return [...new Set(phones)]; // Remove duplicates
}

// Content replacement functions
export function replaceInappropriateContent(text: string, replacement: string = '[FILTERED]'): string {
  let filtered = text;
  
  // Replace inappropriate words
  const inappropriateWords = ['spam', 'scam', 'fake', 'hate', 'violence'];
  
  for (const word of inappropriateWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, replacement);
  }
  
  return filtered;
}

export function maskSensitiveContent(text: string): string {
  let masked = text;
  
  // Mask emails
  masked = masked.replace(EMAIL_PATTERNS[0], '[EMAIL]');
  
  // Mask phones
  masked = masked.replace(PHONE_PATTERNS[0], '[PHONE]');
  
  // Mask URLs
  masked = masked.replace(URL_PATTERNS[0], '[URL]');
  
  return masked;
}

// Content validation functions
export function validateContentLength(text: string, maxLength: number = 1000): boolean {
  return text.length <= maxLength;
}

export function validateImageCount(imageUrls: string[], maxCount: number = 10): boolean {
  return imageUrls.length <= maxCount;
}

export function validateContentType(contentType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(contentType);
}

// Content scoring functions
export function calculateContentScore(analysis: ContentAnalysis): number {
  let score = 0;
  
  // Text analysis
  if (analysis.text) {
    const textResult = analyzeTextContent(analysis.text);
    score += textResult.score * 0.6;
  }
  
  // Image analysis
  if (analysis.images && analysis.images.length > 0) {
    const imageResult = analyzeImageContent(analysis.images);
    score += imageResult.score * 0.3;
  }
  
  // Behavior analysis
  if (analysis.user_id) {
    const behaviorResult = analyzeUserBehavior(analysis.user_id, analysis.metadata || {});
    score += behaviorResult.score * 0.1;
  }
  
  return Math.min(1, Math.max(0, score));
}

export function getContentRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 0.8) return 'critical';
  if (score >= 0.6) return 'high';
  if (score >= 0.3) return 'medium';
  return 'low';
}

export function getContentRecommendations(score: number): string[] {
  const recommendations: string[] = [];
  
  if (score >= 0.8) {
    recommendations.push('Content should be blocked immediately');
    recommendations.push('Review for policy violations');
  } else if (score >= 0.6) {
    recommendations.push('Content requires manual review');
    recommendations.push('Consider flagging for moderation');
  } else if (score >= 0.3) {
    recommendations.push('Monitor content for further issues');
    recommendations.push('Consider automated monitoring');
  } else {
    recommendations.push('Content appears safe');
    recommendations.push('Continue normal monitoring');
  }
  
  return recommendations;
}
