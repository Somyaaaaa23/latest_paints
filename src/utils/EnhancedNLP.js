// Enhanced NLP Processor - Advanced text processing and entity extraction
export class EnhancedNLP {
  constructor() {
    this.name = "Enhanced NLP Processor";
    
    // Industry-specific patterns
    this.patterns = {
      area: /(\d+(?:,\d{3})*)\s*(?:sq\s*ft|sqft|square\s*feet|sq\.?\s*ft\.?)/gi,
      coverage: /(\d+)\s*(?:sq\s*ft\s*per\s*liter|sqft\/liter|sq\.?\s*ft\.?\/l)/gi,
      durability: /(\d+)\s*(?:years?|yrs?)/gi,
      cost: /\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/g,
      deadline: /(?:deadline|due|completion|submit\s*by).*?(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4})/i,
      finish: /(matt|matte|silk|satin|gloss|glossy|semi-gloss|eggshell|flat)/gi,
      material: /(pvc|acrylic|emulsion|enamel|latex|oil-based|water-based)/gi,
      standard: /(is\s*\d+|iso\s*\d+|astm\s*\w+|bs\s*\d+)/gi,
      voltage: /(\d+)\s*(?:v|volt|volts|kv)/gi,
      certification: /(ce|ul|rohs|reach|iso\s*certified)/gi
    };

    // Synonym dictionary for paint industry
    this.synonyms = {
      'matt': ['matte', 'flat', 'non-glossy'],
      'silk': ['satin', 'semi-gloss', 'eggshell'],
      'gloss': ['glossy', 'shiny', 'high-gloss'],
      'exterior': ['external', 'outdoor', 'outside', 'facade'],
      'interior': ['internal', 'indoor', 'inside'],
      'weather-resistant': ['weatherproof', 'weather-proof', 'all-weather', 'outdoor-grade'],
      'durable': ['long-lasting', 'hard-wearing', 'robust', 'resilient'],
      'coverage': ['spread', 'covering', 'application-rate', 'spreading-rate'],
      'emulsion': ['paint', 'coating', 'finish', 'latex'],
      'primer': ['undercoat', 'base-coat', 'sealer'],
      'topcoat': ['finish-coat', 'final-coat', 'top-layer']
    };
  }

  // Extract all entities from RFP text
  extractEntities(text) {
    const entities = {
      areas: this.extractAreas(text),
      coverages: this.extractCoverages(text),
      durabilities: this.extractDurabilities(text),
      costs: this.extractCosts(text),
      deadline: this.extractDeadline(text),
      finishes: this.extractFinishes(text),
      materials: this.extractMaterials(text),
      standards: this.extractStandards(text),
      voltages: this.extractVoltages(text),
      certifications: this.extractCertifications(text)
    };

    return entities;
  }

  // Extract area values
  extractAreas(text) {
    const matches = [...text.matchAll(this.patterns.area)];
    return matches.map(match => ({
      value: parseInt(match[1].replace(/,/g, '')),
      raw: match[0],
      position: match.index
    }));
  }

  // Extract coverage values
  extractCoverages(text) {
    const matches = [...text.matchAll(this.patterns.coverage)];
    return matches.map(match => ({
      value: parseInt(match[1]),
      raw: match[0],
      position: match.index
    }));
  }

  // Extract durability values
  extractDurabilities(text) {
    const matches = [...text.matchAll(this.patterns.durability)];
    return matches.map(match => ({
      value: parseInt(match[1]),
      raw: match[0],
      position: match.index
    }));
  }

  // Extract cost values
  extractCosts(text) {
    const matches = [...text.matchAll(this.patterns.cost)];
    return matches.map(match => ({
      value: parseFloat(match[1].replace(/,/g, '')),
      raw: match[0],
      position: match.index
    }));
  }

  // Extract deadline
  extractDeadline(text) {
    const match = text.match(this.patterns.deadline);
    if (!match) return null;

    const dateStr = match[1];
    let deadline = null;

    if (dateStr.includes('/')) {
      const [month, day, year] = dateStr.split('/');
      deadline = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else if (dateStr.includes('-') && dateStr.length === 10) {
      deadline = dateStr;
    }

    return {
      value: deadline,
      raw: match[0],
      position: match.index
    };
  }

  // Extract finish types
  extractFinishes(text) {
    const matches = [...text.matchAll(this.patterns.finish)];
    return matches.map(match => ({
      value: match[1].toLowerCase(),
      raw: match[0],
      position: match.index,
      synonyms: this.synonyms[match[1].toLowerCase()] || []
    }));
  }

  // Extract materials
  extractMaterials(text) {
    const matches = [...text.matchAll(this.patterns.material)];
    return matches.map(match => ({
      value: match[1].toLowerCase(),
      raw: match[0],
      position: match.index
    }));
  }

  // Extract standards
  extractStandards(text) {
    const matches = [...text.matchAll(this.patterns.standard)];
    return matches.map(match => ({
      value: match[1].toUpperCase(),
      raw: match[0],
      position: match.index
    }));
  }

  // Extract voltages
  extractVoltages(text) {
    const matches = [...text.matchAll(this.patterns.voltage)];
    return matches.map(match => ({
      value: parseInt(match[1]),
      raw: match[0],
      position: match.index
    }));
  }

  // Extract certifications
  extractCertifications(text) {
    const matches = [...text.matchAll(this.patterns.certification)];
    return matches.map(match => ({
      value: match[1].toUpperCase(),
      raw: match[0],
      position: match.index
    }));
  }

  // Normalize text (remove extra spaces, lowercase, etc.)
  normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Tokenize text into words
  tokenize(text) {
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 0);
  }

  // Remove stop words
  removeStopWords(tokens) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
    ]);

    return tokens.filter(token => !stopWords.has(token));
  }

  // Extract key phrases (n-grams)
  extractKeyPhrases(text, n = 2) {
    const tokens = this.tokenize(text);
    const phrases = [];

    for (let i = 0; i <= tokens.length - n; i++) {
      const phrase = tokens.slice(i, i + n).join(' ');
      phrases.push(phrase);
    }

    return phrases;
  }

  // Calculate term frequency
  termFrequency(text) {
    const tokens = this.tokenize(text);
    const frequency = {};

    tokens.forEach(token => {
      frequency[token] = (frequency[token] || 0) + 1;
    });

    return frequency;
  }

  // Find most important terms (TF-IDF-like)
  extractImportantTerms(text, topN = 10) {
    const tokens = this.removeStopWords(this.tokenize(text));
    const frequency = {};

    tokens.forEach(token => {
      if (token.length > 2) {
        frequency[token] = (frequency[token] || 0) + 1;
      }
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([term, freq]) => ({ term, frequency: freq }));
  }

  // Sentiment analysis (simple positive/negative)
  analyzeSentiment(text) {
    const positiveWords = new Set([
      'excellent', 'good', 'great', 'best', 'quality', 'premium', 'superior',
      'reliable', 'durable', 'efficient', 'effective', 'high-grade'
    ]);

    const negativeWords = new Set([
      'poor', 'bad', 'worst', 'inferior', 'low-quality', 'unreliable',
      'defective', 'faulty', 'inadequate', 'substandard'
    ]);

    const tokens = this.tokenize(text);
    let positiveCount = 0;
    let negativeCount = 0;

    tokens.forEach(token => {
      if (positiveWords.has(token)) positiveCount++;
      if (negativeWords.has(token)) negativeCount++;
    });

    const total = positiveCount + negativeCount;
    if (total === 0) return { sentiment: 'neutral', score: 0 };

    const score = (positiveCount - negativeCount) / total;
    const sentiment = score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral';

    return { sentiment, score, positiveCount, negativeCount };
  }

  // Classify requirement type
  classifyRequirementType(text) {
    const exteriorKeywords = ['exterior', 'external', 'outdoor', 'outside', 'facade', 'wall'];
    const interiorKeywords = ['interior', 'internal', 'indoor', 'inside', 'room', 'ceiling'];
    
    const lowerText = text.toLowerCase();
    const hasExterior = exteriorKeywords.some(kw => lowerText.includes(kw));
    const hasInterior = interiorKeywords.some(kw => lowerText.includes(kw));

    if (hasExterior && hasInterior) return 'mixed';
    if (hasExterior) return 'exterior';
    if (hasInterior) return 'interior';
    return 'unknown';
  }

  // Extract urgency level
  extractUrgency(text) {
    const urgentKeywords = ['urgent', 'asap', 'immediate', 'rush', 'emergency', 'critical'];
    const highKeywords = ['high priority', 'important', 'soon', 'quickly'];
    
    const lowerText = text.toLowerCase();
    
    if (urgentKeywords.some(kw => lowerText.includes(kw))) {
      return { level: 'urgent', confidence: 0.9 };
    }
    if (highKeywords.some(kw => lowerText.includes(kw))) {
      return { level: 'high', confidence: 0.8 };
    }
    
    return { level: 'standard', confidence: 0.7 };
  }

  // Comprehensive RFP analysis
  analyzeRFP(text) {
    const entities = this.extractEntities(text);
    const importantTerms = this.extractImportantTerms(text);
    const sentiment = this.analyzeSentiment(text);
    const requirementType = this.classifyRequirementType(text);
    const urgency = this.extractUrgency(text);

    return {
      entities,
      importantTerms,
      sentiment,
      requirementType,
      urgency,
      summary: {
        totalAreas: entities.areas.length,
        totalCosts: entities.costs.length,
        hasDeadline: entities.deadline !== null,
        finishTypes: entities.finishes.map(f => f.value),
        materials: entities.materials.map(m => m.value),
        standards: entities.standards.map(s => s.value)
      }
    };
  }
}

// Create singleton instance
export const enhancedNLP = new EnhancedNLP();
