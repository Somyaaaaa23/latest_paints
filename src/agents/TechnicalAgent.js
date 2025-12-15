// Technical Agent - Specification Matching and Product Analysis
import { semanticMatcher } from '../utils/SemanticMatcher';

export class TechnicalAgent {
  constructor(memoryLayer) {
    this.name = "Technical Agent";
    this.role = "Specification Matching & Product Analysis";
    this.memoryLayer = memoryLayer;
    this.capabilities = [
      "Product Specification Matching",
      "Vendor Comparison Analysis", 
      "Technical Compatibility Assessment",
      "Performance Scoring",
      "Semantic Similarity Analysis"
    ];
    this.semanticMatcher = semanticMatcher;
  }

  // Main specification matching function
  async matchSpecifications(requirements, availableProducts) {
    console.log(`${this.name}: Starting specification matching for ${requirements.length} requirements`);
    
    await this.delay(2500);
    
    const matchResults = [];
    
    for (const requirement of requirements) {
      console.log(`${this.name}: Analyzing requirement ${requirement.id} - ${requirement.type}`);
      
      const vendorMatches = await this.findVendorMatches(requirement, availableProducts);
      const bestMatch = this.selectBestMatch(vendorMatches);
      
      matchResults.push({
        requirementId: requirement.id,
        requirement: requirement,
        vendorMatches: vendorMatches,
        recommendedMatch: bestMatch,
        matchConfidence: this.calculateConfidence(bestMatch),
        analysisTimestamp: new Date().toISOString()
      });
    }

    // Store results in memory for future reference
    await this.memoryLayer.storeAnalysis('technical_matching', {
      results: matchResults,
      totalRequirements: requirements.length,
      averageMatchScore: this.calculateAverageScore(matchResults),
      timestamp: new Date().toISOString()
    });

    console.log(`${this.name}: Completed matching analysis with average score: ${this.calculateAverageScore(matchResults)}%`);
    
    return {
      agent: this.name,
      action: "specification_matching",
      matchResults: matchResults,
      summary: {
        totalRequirements: requirements.length,
        averageMatchScore: this.calculateAverageScore(matchResults),
        recommendedVendors: this.getTopVendors(matchResults)
      },
      timestamp: new Date().toISOString()
    };
  }

  // Find matching products from all vendors (Enhanced with semantic matching)
  async findVendorMatches(requirement, availableProducts) {
    const vendorMatches = {};
    
    // Check each vendor's products
    Object.entries(availableProducts).forEach(([vendorName, products]) => {
      let bestProduct = null;
      let highestScore = 0;
      
      products.forEach(product => {
        const matchScore = this.calculateMatchScore(requirement, product);
        
        // Add semantic similarity bonus
        const semanticScores = this.semanticMatcher.semanticSpecMatch(requirement, product);
        const semanticBonus = (semanticScores.overallSimilarity * 5); // Up to 5 bonus points
        
        const totalScore = matchScore.totalScore + semanticBonus;
        
        if (totalScore > highestScore) {
          highestScore = totalScore;
          bestProduct = {
            ...product,
            matchScore: Math.min(Math.round(totalScore), 100),
            matchDetails: matchScore.details,
            matchReasons: matchScore.reasons,
            semanticScores: semanticScores,
            semanticBonus: semanticBonus.toFixed(1)
          };
        }
      });
      
      if (bestProduct) {
        vendorMatches[vendorName] = bestProduct;
      }
    });
    
    return vendorMatches;
  }

  // Enhanced match score with weighted scoring (Spec Match Scoring 2.0)
  calculateMatchScore(requirement, product) {
    // Weighted scoring - critical specs have higher weights
    const weights = {
      finish: 0.30,      // Finish type (30%)
      coverage: 0.25,    // Coverage efficiency (25%)
      durability: 0.20,  // Durability requirement (20%)
      application: 0.15, // Application type (15%)
      reliability: 0.10  // Reliability bonus (10%)
    };
    
    let totalScore = 0;
    const details = {};
    const reasons = [];
    const maxScore = 100;
    
    // Finish type matching (30 points)
    if (requirement.finish && product.finish) {
      if (product.finish.toLowerCase() === requirement.finish.toLowerCase()) {
        totalScore += 30;
        details.finishMatch = 30;
        reasons.push(`✓ Perfect finish match: ${product.finish} (30 pts)`);
      } else if (this.isCompatibleFinish(requirement.finish, product.finish)) {
        totalScore += 20;
        details.finishMatch = 20;
        reasons.push(`~ Compatible finish: ${product.finish} (20 pts)`);
      } else {
        details.finishMatch = 0;
        reasons.push(`✗ Finish mismatch: ${product.finish} vs ${requirement.finish} (0 pts)`);
      }
    }
    
    // Coverage matching (25 points) - Enhanced with efficiency bonus
    if (requirement.coverage && product.coverage) {
      if (product.coverage >= requirement.coverage) {
        const coverageRatio = Math.min(product.coverage / requirement.coverage, 1.5);
        const coverageScore = Math.min(25 * coverageRatio, 25);
        totalScore += coverageScore;
        details.coverageMatch = coverageScore;
        const efficiency = ((product.coverage / requirement.coverage - 1) * 100).toFixed(1);
        reasons.push(`✓ Coverage exceeds by ${efficiency}%: ${product.coverage} vs ${requirement.coverage} (${coverageScore.toFixed(1)} pts)`);
      } else {
        const penalty = (requirement.coverage - product.coverage) / requirement.coverage;
        const coverageScore = Math.max(25 * (1 - penalty), 0);
        totalScore += coverageScore;
        details.coverageMatch = coverageScore;
        const deficit = ((1 - product.coverage / requirement.coverage) * 100).toFixed(1);
        reasons.push(`⚠ Coverage below by ${deficit}%: ${product.coverage} vs ${requirement.coverage} (${coverageScore.toFixed(1)} pts)`);
      }
    }
    
    // Durability matching (20 points) - Critical for long-term value
    if (requirement.durability && product.durability) {
      if (product.durability >= requirement.durability) {
        totalScore += 20;
        details.durabilityMatch = 20;
        const extraYears = product.durability - requirement.durability;
        reasons.push(`✓ Durability exceeds by ${extraYears} years: ${product.durability} years (20 pts)`);
      } else {
        const durabilityScore = (product.durability / requirement.durability) * 20;
        totalScore += durabilityScore;
        details.durabilityMatch = durabilityScore;
        const shortfall = requirement.durability - product.durability;
        reasons.push(`⚠ Durability short by ${shortfall} years: ${product.durability} vs ${requirement.durability} (${durabilityScore.toFixed(1)} pts)`);
      }
    }
    
    // Application type matching (15 points) - Functional compatibility
    if (requirement.type && product.category) {
      if (this.isCompatibleApplication(requirement.type, product.category)) {
        totalScore += 15;
        details.applicationMatch = 15;
        reasons.push(`✓ Application compatible: ${product.category} (15 pts)`);
      } else {
        details.applicationMatch = 0;
        reasons.push(`✗ Application mismatch: ${product.category} not suitable for ${requirement.type} (0 pts)`);
      }
    }
    
    // Reliability bonus (10 points) - Quality assurance
    if (product.reliability) {
      const reliabilityScore = (product.reliability / 100) * 10;
      totalScore += reliabilityScore;
      details.reliabilityBonus = reliabilityScore;
      const reliabilityGrade = product.reliability >= 95 ? 'Excellent' : 
                               product.reliability >= 90 ? 'Very Good' : 
                               product.reliability >= 85 ? 'Good' : 'Fair';
      reasons.push(`✓ Reliability: ${product.reliability}% (${reliabilityGrade}) (${reliabilityScore.toFixed(1)} pts)`);
    }
    
    // Calculate confidence level based on score
    const confidence = this.calculateScoreConfidence(totalScore);
    
    return {
      totalScore: Math.min(Math.round(totalScore), maxScore),
      details: details,
      reasons: reasons,
      maxPossibleScore: maxScore,
      confidence: confidence,
      grade: this.getScoreGrade(totalScore),
      recommendation: this.getRecommendation(totalScore)
    };
  }
  
  // Calculate confidence based on score
  calculateScoreConfidence(score) {
    if (score >= 90) return 0.95;
    if (score >= 80) return 0.90;
    if (score >= 70) return 0.85;
    if (score >= 60) return 0.75;
    return 0.60;
  }
  
  // Get letter grade for score
  getScoreGrade(score) {
    if (score >= 90) return 'A+ (Excellent Match)';
    if (score >= 80) return 'A (Very Good Match)';
    if (score >= 70) return 'B (Good Match)';
    if (score >= 60) return 'C (Fair Match)';
    return 'D (Poor Match)';
  }
  
  // Get recommendation based on score
  getRecommendation(score) {
    if (score >= 85) return '🟢 Highly Recommended - Excellent specification match';
    if (score >= 70) return '🟡 Recommended - Good match with minor gaps';
    if (score >= 55) return '🟠 Consider - Acceptable but review gaps carefully';
    return '🔴 Not Recommended - Significant specification gaps';
  }

  // Check if finishes are compatible
  isCompatibleFinish(requiredFinish, productFinish) {
    const compatibilityMap = {
      'matt': ['smooth', 'satin'],
      'silk': ['satin', 'semi-gloss'],
      'smooth': ['matt', 'satin'],
      'satin': ['silk', 'smooth']
    };
    
    const required = requiredFinish.toLowerCase();
    const product = productFinish.toLowerCase();
    
    return compatibilityMap[required]?.includes(product) || false;
  }

  // Check if application types are compatible
  isCompatibleApplication(requirementType, productCategory) {
    const typeMap = {
      'exterior_painting': ['exterior', 'all-purpose'],
      'interior_painting': ['interior', 'all-purpose'],
      'mixed_application': ['all-purpose', 'exterior', 'interior']
    };
    
    const reqType = requirementType.toLowerCase();
    const prodCategory = productCategory.toLowerCase();
    
    return typeMap[reqType]?.includes(prodCategory) || prodCategory.includes('all') || false;
  }

  // Select best match from vendor options
  selectBestMatch(vendorMatches) {
    let bestVendor = null;
    let highestScore = 0;
    
    Object.entries(vendorMatches).forEach(([vendorName, product]) => {
      if (product.matchScore > highestScore) {
        highestScore = product.matchScore;
        bestVendor = {
          vendorName: vendorName,
          product: product,
          score: product.matchScore
        };
      }
    });
    
    return bestVendor;
  }

  // Calculate confidence in the match
  calculateConfidence(bestMatch) {
    if (!bestMatch) return 0;
    
    const score = bestMatch.score;
    if (score >= 90) return 0.95;
    if (score >= 80) return 0.90;
    if (score >= 70) return 0.85;
    if (score >= 60) return 0.75;
    return 0.60;
  }

  // Calculate average match score across all results
  calculateAverageScore(matchResults) {
    if (matchResults.length === 0) return 0;
    
    const totalScore = matchResults.reduce((sum, result) => {
      return sum + (result.recommendedMatch?.score || 0);
    }, 0);
    
    return Math.round(totalScore / matchResults.length);
  }

  // Get top performing vendors
  getTopVendors(matchResults) {
    const vendorScores = {};
    
    matchResults.forEach(result => {
      if (result.recommendedMatch) {
        const vendor = result.recommendedMatch.vendorName;
        if (!vendorScores[vendor]) {
          vendorScores[vendor] = [];
        }
        vendorScores[vendor].push(result.recommendedMatch.score);
      }
    });
    
    // Calculate average scores per vendor
    const vendorAverages = Object.entries(vendorScores).map(([vendor, scores]) => ({
      vendor: vendor,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      matchCount: scores.length
    }));
    
    // Sort by average score
    return vendorAverages.sort((a, b) => b.averageScore - a.averageScore);
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get agent status
  getStatus() {
    return {
      name: this.name,
      role: this.role,
      capabilities: this.capabilities,
      status: "active",
      lastActivity: new Date().toISOString()
    };
  }
}