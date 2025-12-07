// Learning Memory - Store and recall past RFP matches using similarity
export class LearningMemory {
  constructor() {
    this.memoryKey = 'rfp_learning_memory';
    this.memory = this.loadMemory();
    this.similarityThreshold = 0.75; // 75% similarity to recall
  }

  // Load memory from localStorage
  loadMemory() {
    try {
      const stored = localStorage.getItem(this.memoryKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load memory:', error);
      return [];
    }
  }

  // Save memory to localStorage
  saveMemory() {
    try {
      localStorage.setItem(this.memoryKey, JSON.stringify(this.memory));
      console.log(`💾 Learning Memory: Saved ${this.memory.length} past RFPs`);
    } catch (error) {
      console.error('Failed to save memory:', error);
    }
  }

  // Store a new RFP match
  storeMatch(rfpData) {
    const memoryEntry = {
      id: `MEM_${Date.now()}`,
      timestamp: new Date().toISOString(),
      rfpTitle: rfpData.rfpTitle || 'Untitled RFP',
      requirements: rfpData.requirements || [],
      totalArea: rfpData.totalSqFt || 0,
      deadline: rfpData.deadline,
      matchScore: rfpData.overallMatchScore || 0,
      recommendedVendor: rfpData.recommendedVendor,
      finalPrice: rfpData.pricingDetails?.finalPrice || 0,
      winProbability: rfpData.winProbability?.probability || 0,
      status: rfpData.status || 'completed',
      // Store feature vector for similarity matching
      features: this.extractFeatures(rfpData)
    };

    this.memory.push(memoryEntry);
    
    // Keep only last 100 entries for performance
    if (this.memory.length > 100) {
      this.memory = this.memory.slice(-100);
    }

    this.saveMemory();
    console.log(`🧠 Learning Memory: Stored RFP "${memoryEntry.rfpTitle}"`);
    
    return memoryEntry;
  }

  // Extract features from RFP for similarity comparison
  extractFeatures(rfpData) {
    const features = {
      totalArea: rfpData.totalSqFt || 0,
      requirementCount: rfpData.requirements?.length || 0,
      avgMatchScore: rfpData.overallMatchScore || 0,
      priceRange: this.getPriceRange(rfpData.pricingDetails?.finalPrice || 0),
      urgency: rfpData.analysis?.urgency || 'standard',
      complexity: rfpData.analysis?.complexity || 'medium',
      // Text features
      keywords: this.extractKeywords(rfpData.rfpTitle || ''),
      categories: this.extractCategories(rfpData.requirements || [])
    };

    return features;
  }

  // Extract keywords from text
  extractKeywords(text) {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));
    
    return [...new Set(words)]; // Unique keywords
  }

  // Extract categories from requirements
  extractCategories(requirements) {
    const categories = new Set();
    requirements.forEach(req => {
      if (req.specs?.category) categories.add(req.specs.category.toLowerCase());
      if (req.specs?.finish) categories.add(req.specs.finish.toLowerCase());
    });
    return Array.from(categories);
  }

  // Get price range bucket
  getPriceRange(price) {
    if (price < 30000) return 'low';
    if (price < 70000) return 'medium';
    if (price < 120000) return 'high';
    return 'very_high';
  }

  // Calculate cosine similarity between two feature vectors
  calculateSimilarity(features1, features2) {
    let totalSimilarity = 0;
    let weights = 0;

    // Area similarity (weight: 0.25)
    const areaDiff = Math.abs(features1.totalArea - features2.totalArea);
    const maxArea = Math.max(features1.totalArea, features2.totalArea);
    const areaSimilarity = maxArea > 0 ? 1 - (areaDiff / maxArea) : 1;
    totalSimilarity += areaSimilarity * 0.25;
    weights += 0.25;

    // Price range similarity (weight: 0.20)
    const priceSimilarity = features1.priceRange === features2.priceRange ? 1 : 0.5;
    totalSimilarity += priceSimilarity * 0.20;
    weights += 0.20;

    // Urgency similarity (weight: 0.15)
    const urgencySimilarity = features1.urgency === features2.urgency ? 1 : 0.5;
    totalSimilarity += urgencySimilarity * 0.15;
    weights += 0.15;

    // Complexity similarity (weight: 0.15)
    const complexitySimilarity = features1.complexity === features2.complexity ? 1 : 0.5;
    totalSimilarity += complexitySimilarity * 0.15;
    weights += 0.15;

    // Keyword similarity (weight: 0.15)
    const keywordSimilarity = this.jaccardSimilarity(features1.keywords, features2.keywords);
    totalSimilarity += keywordSimilarity * 0.15;
    weights += 0.15;

    // Category similarity (weight: 0.10)
    const categorySimilarity = this.jaccardSimilarity(features1.categories, features2.categories);
    totalSimilarity += categorySimilarity * 0.10;
    weights += 0.10;

    return totalSimilarity / weights;
  }

  // Jaccard similarity for sets
  jaccardSimilarity(set1, set2) {
    if (set1.length === 0 && set2.length === 0) return 1;
    if (set1.length === 0 || set2.length === 0) return 0;

    const intersection = set1.filter(item => set2.includes(item)).length;
    const union = new Set([...set1, ...set2]).size;

    return union > 0 ? intersection / union : 0;
  }

  // Recall similar past RFPs
  recallSimilar(currentRfpData, limit = 5) {
    if (this.memory.length === 0) {
      console.log('🧠 Learning Memory: No past RFPs to recall');
      return [];
    }

    const currentFeatures = this.extractFeatures(currentRfpData);
    const similarities = [];

    this.memory.forEach(pastRfp => {
      const similarity = this.calculateSimilarity(currentFeatures, pastRfp.features);
      
      if (similarity >= this.similarityThreshold) {
        similarities.push({
          ...pastRfp,
          similarity: similarity,
          similarityPercent: Math.round(similarity * 100)
        });
      }
    });

    // Sort by similarity (highest first)
    similarities.sort((a, b) => b.similarity - a.similarity);

    const recalled = similarities.slice(0, limit);
    
    if (recalled.length > 0) {
      console.log(`🧠 Learning Memory: Recalled ${recalled.length} similar past RFPs`);
      recalled.forEach(rfp => {
        console.log(`  - "${rfp.rfpTitle}" (${rfp.similarityPercent}% similar)`);
      });
    } else {
      console.log('🧠 Learning Memory: No similar past RFPs found');
    }

    return recalled;
  }

  // Get insights from similar past RFPs
  getInsights(similarRfps) {
    if (similarRfps.length === 0) {
      return {
        hasInsights: false,
        message: 'No similar past RFPs found for comparison'
      };
    }

    const avgMatchScore = similarRfps.reduce((sum, rfp) => sum + rfp.matchScore, 0) / similarRfps.length;
    const avgWinProbability = similarRfps.reduce((sum, rfp) => sum + rfp.winProbability, 0) / similarRfps.length;
    const avgPrice = similarRfps.reduce((sum, rfp) => sum + rfp.finalPrice, 0) / similarRfps.length;
    
    const vendorCounts = {};
    similarRfps.forEach(rfp => {
      vendorCounts[rfp.recommendedVendor] = (vendorCounts[rfp.recommendedVendor] || 0) + 1;
    });
    
    const mostCommonVendor = Object.entries(vendorCounts)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      hasInsights: true,
      similarCount: similarRfps.length,
      avgMatchScore: Math.round(avgMatchScore),
      avgWinProbability: Math.round(avgWinProbability),
      avgPrice: Math.round(avgPrice),
      mostCommonVendor: mostCommonVendor ? mostCommonVendor[0] : null,
      vendorFrequency: mostCommonVendor ? mostCommonVendor[1] : 0,
      recommendations: this.generateRecommendations(similarRfps, avgMatchScore, avgWinProbability)
    };
  }

  // Generate recommendations based on past RFPs
  generateRecommendations(similarRfps, avgMatchScore, avgWinProbability) {
    const recommendations = [];

    if (avgMatchScore > 85) {
      recommendations.push('Similar past RFPs had high match scores - good alignment expected');
    } else if (avgMatchScore < 70) {
      recommendations.push('Similar past RFPs had lower match scores - consider spec adjustments');
    }

    if (avgWinProbability > 75) {
      recommendations.push('Historical data suggests high win probability for similar RFPs');
    } else if (avgWinProbability < 50) {
      recommendations.push('Similar RFPs had lower win rates - review pricing strategy');
    }

    const wonCount = similarRfps.filter(rfp => rfp.status === 'won').length;
    if (wonCount > similarRfps.length * 0.7) {
      recommendations.push('Strong historical success rate with similar RFPs');
    }

    return recommendations;
  }

  // Get memory statistics
  getStatistics() {
    if (this.memory.length === 0) {
      return {
        totalRfps: 0,
        avgMatchScore: 0,
        avgWinProbability: 0,
        topVendor: null
      };
    }

    const avgMatchScore = this.memory.reduce((sum, rfp) => sum + rfp.matchScore, 0) / this.memory.length;
    const avgWinProbability = this.memory.reduce((sum, rfp) => sum + rfp.winProbability, 0) / this.memory.length;
    
    const vendorCounts = {};
    this.memory.forEach(rfp => {
      vendorCounts[rfp.recommendedVendor] = (vendorCounts[rfp.recommendedVendor] || 0) + 1;
    });
    
    const topVendor = Object.entries(vendorCounts)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      totalRfps: this.memory.length,
      avgMatchScore: Math.round(avgMatchScore),
      avgWinProbability: Math.round(avgWinProbability),
      topVendor: topVendor ? topVendor[0] : null,
      topVendorCount: topVendor ? topVendor[1] : 0
    };
  }

  // Clear all memory
  clearMemory() {
    this.memory = [];
    localStorage.removeItem(this.memoryKey);
    console.log('🧠 Learning Memory: Cleared all stored RFPs');
  }

  // Export memory for backup
  exportMemory() {
    return JSON.stringify(this.memory, null, 2);
  }

  // Import memory from backup
  importMemory(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      if (Array.isArray(imported)) {
        this.memory = imported;
        this.saveMemory();
        console.log(`🧠 Learning Memory: Imported ${imported.length} RFPs`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import memory:', error);
      return false;
    }
  }
}

// Create singleton instance
export const learningMemory = new LearningMemory();
