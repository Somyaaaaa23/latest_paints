// NLP Processor - Enhanced text understanding with fuzzy matching and synonym detection
export class NLPProcessor {
  constructor() {
    this.synonyms = {
      // Material synonyms
      'fire-retardant': ['FR', 'flame-resistant', 'fire-resistant', 'flame-retardant'],
      'PVC': ['polyvinyl chloride', 'vinyl', 'plastic'],
      'copper': ['Cu', 'copper wire', 'copper conductor'],
      'aluminum': ['Al', 'aluminium', 'aluminum conductor'],
      
      // Finish synonyms
      'matt': ['matte', 'flat', 'non-glossy'],
      'silk': ['satin', 'semi-gloss', 'eggshell'],
      'gloss': ['glossy', 'shiny', 'high-gloss'],
      
      // Application synonyms
      'exterior': ['outdoor', 'external', 'outside'],
      'interior': ['indoor', 'internal', 'inside'],
      
      // Quality synonyms
      'premium': ['high-quality', 'top-grade', 'superior'],
      'economy': ['budget', 'basic', 'standard'],
      
      // Measurement synonyms
      'sq ft': ['square feet', 'sqft', 'sq.ft', 'square foot'],
      'liter': ['litre', 'l', 'lt'],
      'meter': ['metre', 'm', 'mt']
    };
    
    this.entities = {
      quantity: /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:sq\s*ft|sqft|square\s*feet|sq\.ft)/gi,
      voltage: /(\d+)\s*(?:V|volt|volts|kV|kilovolt)/gi,
      material: /(PVC|copper|aluminum|aluminium|steel|iron|FR|fire-retardant)/gi,
      certification: /(IS\s*\d+|ISO\s*\d+|IEC\s*\d+|ASTM\s*\d+)/gi,
      deadline: /(?:deadline|due|completion|submit\s*by).*?(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4})/gi,
      cost: /\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)|₹\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/g,
      coverage: /(\d+)\s*(?:sq\s*ft\s*per\s*liter|sqft\/liter|sq\.ft\/l)/gi,
      durability: /(\d+)\s*(?:years?|yrs?)/gi
    };
  }
  
  // Extract structured entities from RFP text
  extractEntities(text) {
    const entities = {
      quantities: [],
      voltages: [],
      materials: [],
      certifications: [],
      deadlines: [],
      costs: [],
      coverages: [],
      durabilities: []
    };
    
    // Extract quantities
    let match;
    while ((match = this.entities.quantity.exec(text)) !== null) {
      entities.quantities.push(parseInt(match[1].replace(/,/g, '')));
    }
    
    // Extract voltages
    this.entities.voltage.lastIndex = 0;
    while ((match = this.entities.voltage.exec(text)) !== null) {
      entities.voltages.push(parseInt(match[1]));
    }
    
    // Extract materials
    this.entities.material.lastIndex = 0;
    while ((match = this.entities.material.exec(text)) !== null) {
      entities.materials.push(this.normalizeMaterial(match[1]));
    }
    
    // Extract certifications
    this.entities.certification.lastIndex = 0;
    while ((match = this.entities.certification.exec(text)) !== null) {
      entities.certifications.push(match[1]);
    }
    
    // Extract deadlines
    this.entities.deadline.lastIndex = 0;
    while ((match = this.entities.deadline.exec(text)) !== null) {
      entities.deadlines.push(this.normalizeDate(match[1]));
    }
    
    // Extract costs
    this.entities.cost.lastIndex = 0;
    while ((match = this.entities.cost.exec(text)) !== null) {
      const amount = match[1] || match[2];
      entities.costs.push(parseFloat(amount.replace(/,/g, '')));
    }
    
    // Extract coverages
    this.entities.coverage.lastIndex = 0;
    while ((match = this.entities.coverage.exec(text)) !== null) {
      entities.coverages.push(parseInt(match[1]));
    }
    
    // Extract durabilities
    this.entities.durability.lastIndex = 0;
    while ((match = this.entities.durability.exec(text)) !== null) {
      entities.durabilities.push(parseInt(match[1]));
    }
    
    return entities;
  }
  
  // Normalize material names using synonyms
  normalizeMaterial(material) {
    const lowerMaterial = material.toLowerCase();
    
    for (const [standard, synonymList] of Object.entries(this.synonyms)) {
      if (synonymList.some(syn => lowerMaterial.includes(syn.toLowerCase()))) {
        return standard;
      }
      if (lowerMaterial.includes(standard.toLowerCase())) {
        return standard;
      }
    }
    
    return material;
  }
  
  // Normalize date formats
  normalizeDate(dateStr) {
    if (dateStr.includes('/')) {
      const [month, day, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else if (dateStr.includes('-') && dateStr.length === 10) {
      return dateStr;
    }
    return dateStr;
  }
  
  // Fuzzy string matching using Levenshtein distance
  fuzzyMatch(str1, str2, threshold = 0.8) {
    const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    const maxLength = Math.max(str1.length, str2.length);
    const similarity = 1 - (distance / maxLength);
    
    return {
      match: similarity >= threshold,
      similarity: similarity,
      distance: distance
    };
  }
  
  // Calculate Levenshtein distance between two strings
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  // Check if term matches any synonym
  matchesSynonym(term, targetTerm) {
    const lowerTerm = term.toLowerCase();
    const lowerTarget = targetTerm.toLowerCase();
    
    // Direct match
    if (lowerTerm === lowerTarget) {
      return { match: true, confidence: 1.0, method: 'exact' };
    }
    
    // Check synonyms
    for (const [standard, synonymList] of Object.entries(this.synonyms)) {
      if (standard.toLowerCase() === lowerTarget || synonymList.some(syn => syn.toLowerCase() === lowerTarget)) {
        if (lowerTerm === standard.toLowerCase() || synonymList.some(syn => syn.toLowerCase() === lowerTerm)) {
          return { match: true, confidence: 0.95, method: 'synonym' };
        }
      }
    }
    
    // Fuzzy match
    const fuzzyResult = this.fuzzyMatch(term, targetTerm, 0.8);
    if (fuzzyResult.match) {
      return { match: true, confidence: fuzzyResult.similarity, method: 'fuzzy' };
    }
    
    return { match: false, confidence: 0, method: 'none' };
  }
  
  // Extract key phrases from text
  extractKeyPhrases(text) {
    const phrases = [];
    
    // Common RFP key phrases
    const patterns = [
      /(?:requirement|specification|spec).*?:/gi,
      /(?:must|should|shall)\s+(?:have|be|include|provide)/gi,
      /(?:minimum|maximum|at least|no more than)\s+\d+/gi,
      /(?:certified|approved|compliant)\s+(?:to|with|by)/gi
    ];
    
    patterns.forEach(pattern => {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(text)) !== null) {
        phrases.push(match[0]);
      }
    });
    
    return phrases;
  }
  
  // Sentiment analysis for urgency detection
  detectUrgency(text) {
    const urgentKeywords = [
      'urgent', 'asap', 'immediately', 'rush', 'emergency',
      'critical', 'priority', 'expedite', 'fast-track'
    ];
    
    const lowerText = text.toLowerCase();
    const urgentCount = urgentKeywords.filter(keyword => lowerText.includes(keyword)).length;
    
    if (urgentCount >= 3) return { level: 'Critical', score: 0.9 };
    if (urgentCount >= 2) return { level: 'High', score: 0.7 };
    if (urgentCount >= 1) return { level: 'Medium', score: 0.5 };
    return { level: 'Normal', score: 0.3 };
  }
  
  // Complexity analysis
  analyzeComplexity(text, entities) {
    let complexityScore = 0;
    
    // Multiple requirements increase complexity
    complexityScore += entities.quantities.length * 10;
    
    // Multiple materials increase complexity
    complexityScore += entities.materials.length * 15;
    
    // Certifications increase complexity
    complexityScore += entities.certifications.length * 20;
    
    // Text length indicates complexity
    complexityScore += Math.min(text.length / 100, 30);
    
    if (complexityScore >= 80) return { level: 'Very Complex', score: complexityScore };
    if (complexityScore >= 60) return { level: 'Complex', score: complexityScore };
    if (complexityScore >= 40) return { level: 'Moderate', score: complexityScore };
    return { level: 'Simple', score: complexityScore };
  }
}

// Create singleton instance
export const nlpProcessor = new NLPProcessor();
