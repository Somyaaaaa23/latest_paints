// Semantic Matcher - Advanced similarity calculations
export class SemanticMatcher {
  constructor() {
    this.name = "Semantic Matcher";
  }

  // Cosine Similarity - Core algorithm for semantic matching
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    if (magA === 0 || magB === 0) return 0;
    
    return dotProduct / (magA * magB);
  }

  // Convert text to simple feature vector (TF-IDF-like approach)
  textToVector(text, vocabulary) {
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const vector = new Array(vocabulary.length).fill(0);
    
    words.forEach(word => {
      const index = vocabulary.indexOf(word);
      if (index !== -1) {
        vector[index]++;
      }
    });
    
    // Normalize vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
  }

  // Build vocabulary from corpus
  buildVocabulary(texts) {
    const allWords = new Set();
    
    texts.forEach(text => {
      const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
      words.forEach(word => allWords.add(word));
    });
    
    return Array.from(allWords).sort();
  }

  // Semantic similarity between two texts
  calculateTextSimilarity(text1, text2) {
    const vocabulary = this.buildVocabulary([text1, text2]);
    const vec1 = this.textToVector(text1, vocabulary);
    const vec2 = this.textToVector(text2, vocabulary);
    
    return this.cosineSimilarity(vec1, vec2);
  }

  // Enhanced spec matching with semantic similarity
  semanticSpecMatch(requirement, product) {
    const scores = {
      finishSimilarity: 0,
      categorySimilarity: 0,
      overallSimilarity: 0
    };

    // Finish type semantic matching
    if (requirement.finish && product.finish) {
      scores.finishSimilarity = this.calculateTextSimilarity(
        requirement.finish,
        product.finish
      );
    }

    // Category semantic matching
    if (requirement.type && product.category) {
      scores.categorySimilarity = this.calculateTextSimilarity(
        requirement.type,
        product.category
      );
    }

    // Overall semantic similarity
    const reqText = `${requirement.finish || ''} ${requirement.type || ''} ${requirement.coverage || ''} ${requirement.durability || ''}`;
    const prodText = `${product.finish || ''} ${product.category || ''} ${product.coverage || ''} ${product.durability || ''}`;
    
    scores.overallSimilarity = this.calculateTextSimilarity(reqText, prodText);

    return scores;
  }

  // Fuzzy string matching (Levenshtein distance)
  levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[len1][len2];
  }

  // Fuzzy match score (0-1 scale)
  fuzzyMatchScore(str1, str2) {
    const distance = this.levenshteinDistance(
      str1.toLowerCase(),
      str2.toLowerCase()
    );
    const maxLen = Math.max(str1.length, str2.length);
    return maxLen > 0 ? 1 - (distance / maxLen) : 0;
  }

  // Synonym detection for paint industry terms
  getSynonyms(term) {
    const synonymMap = {
      'matt': ['matte', 'flat', 'non-glossy'],
      'silk': ['satin', 'semi-gloss', 'eggshell'],
      'gloss': ['glossy', 'shiny', 'high-gloss'],
      'exterior': ['external', 'outdoor', 'outside'],
      'interior': ['internal', 'indoor', 'inside'],
      'weather-resistant': ['weatherproof', 'weather-proof', 'all-weather'],
      'durable': ['long-lasting', 'hard-wearing', 'robust'],
      'coverage': ['spread', 'covering', 'application-rate'],
      'emulsion': ['paint', 'coating', 'finish']
    };

    const lowerTerm = term.toLowerCase();
    
    // Check if term is a key
    if (synonymMap[lowerTerm]) {
      return [lowerTerm, ...synonymMap[lowerTerm]];
    }

    // Check if term is in any synonym list
    for (const [key, synonyms] of Object.entries(synonymMap)) {
      if (synonyms.includes(lowerTerm)) {
        return [key, ...synonyms];
      }
    }

    return [lowerTerm];
  }

  // Enhanced matching with synonym support
  matchWithSynonyms(term1, term2) {
    const synonyms1 = this.getSynonyms(term1);
    const synonyms2 = this.getSynonyms(term2);

    // Check for exact match in synonym lists
    for (const syn1 of synonyms1) {
      for (const syn2 of synonyms2) {
        if (syn1 === syn2) {
          return { match: true, score: 1.0, type: 'exact' };
        }
      }
    }

    // Check for fuzzy match
    let bestScore = 0;
    for (const syn1 of synonyms1) {
      for (const syn2 of synonyms2) {
        const score = this.fuzzyMatchScore(syn1, syn2);
        if (score > bestScore) {
          bestScore = score;
        }
      }
    }

    if (bestScore > 0.8) {
      return { match: true, score: bestScore, type: 'fuzzy' };
    }

    return { match: false, score: bestScore, type: 'none' };
  }

  // Jaccard similarity for set-based comparison
  jaccardSimilarity(set1, set2) {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  // Extract keywords from text
  extractKeywords(text) {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !stopWords.has(w));
    return new Set(words);
  }

  // Keyword-based similarity
  keywordSimilarity(text1, text2) {
    const keywords1 = this.extractKeywords(text1);
    const keywords2 = this.extractKeywords(text2);
    return this.jaccardSimilarity(keywords1, keywords2);
  }

  // Comprehensive similarity score combining multiple methods
  comprehensiveSimilarity(text1, text2) {
    const cosine = this.calculateTextSimilarity(text1, text2);
    const keyword = this.keywordSimilarity(text1, text2);
    const fuzzy = this.fuzzyMatchScore(text1, text2);

    // Weighted combination
    return {
      cosine: cosine,
      keyword: keyword,
      fuzzy: fuzzy,
      combined: (cosine * 0.5 + keyword * 0.3 + fuzzy * 0.2),
      breakdown: {
        'Cosine Similarity': `${(cosine * 100).toFixed(1)}%`,
        'Keyword Match': `${(keyword * 100).toFixed(1)}%`,
        'Fuzzy Match': `${(fuzzy * 100).toFixed(1)}%`
      }
    };
  }
}

// Create singleton instance
export const semanticMatcher = new SemanticMatcher();
