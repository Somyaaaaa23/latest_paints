// Pricing Agent - Cost Estimation and Optimization
export class PricingAgent {
  constructor(memoryLayer) {
    this.name = "Pricing Agent";
    this.role = "Cost Estimation & Price Optimization";
    this.memoryLayer = memoryLayer;
    this.capabilities = [
      "Cost Calculation",
      "Vendor Price Comparison",
      "Volume Discount Analysis", 
      "Margin Optimization"
    ];
    
    // Pricing rules and parameters
    this.pricingRules = {
      markupPercentage: 0.20,
      overheadPerSqFt: 0.50,
      rushOrderMultiplier: 1.15,
      volumeDiscounts: {
        10000: 0.02,  // 2% discount for 10K+ sq ft
        25000: 0.05,  // 5% discount for 25K+ sq ft  
        50000: 0.08   // 8% discount for 50K+ sq ft
      },
      testingMarkup: 0.15
    };
  }

  // Main pricing calculation function
  async calculatePricing(technicalMatchResults) {
    console.log(`${this.name}: Starting pricing analysis for ${technicalMatchResults.matchResults.length} requirements`);
    
    await this.delay(2000);
    
    const vendorQuotes = {};
    const allVendors = this.extractUniqueVendors(technicalMatchResults.matchResults);
    
    // Calculate pricing for each vendor
    for (const vendorName of allVendors) {
      const quote = await this.calculateVendorQuote(vendorName, technicalMatchResults.matchResults);
      if (quote.isValid) {
        vendorQuotes[vendorName] = quote;
      }
    }
    
    // Select optimal vendor based on price-performance ratio
    const recommendedVendor = this.selectOptimalVendor(vendorQuotes);
    
    // Store pricing analysis in memory
    await this.memoryLayer.storeAnalysis('pricing_analysis', {
      vendorQuotes: vendorQuotes,
      recommendedVendor: recommendedVendor,
      totalVendorsAnalyzed: Object.keys(vendorQuotes).length,
      timestamp: new Date().toISOString()
    });

    console.log(`${this.name}: Completed pricing analysis. Recommended: ${recommendedVendor.vendorName}`);
    
    return {
      agent: this.name,
      action: "pricing_calculation",
      vendorQuotes: vendorQuotes,
      recommendedVendor: recommendedVendor,
      pricingStrategy: this.generatePricingStrategy(vendorQuotes),
      confidence: 0.96,
      timestamp: new Date().toISOString()
    };
  }

  // Calculate comprehensive quote for a specific vendor
  async calculateVendorQuote(vendorName, matchResults) {
    let totalMaterialCost = 0;
    let totalLaborCost = 0;
    let totalArea = 0;
    let totalTestingCost = 0;
    let avgReliability = 0;
    let maxLeadTime = 0;
    let validItems = 0;
    
    const quoteItems = [];
    
    // Process each requirement
    matchResults.forEach(result => {
      const vendorMatch = result.vendorMatches[vendorName];
      
      if (vendorMatch) {
        const requirement = result.requirement;
        const product = vendorMatch;
        
        // Calculate material cost
        const litersNeeded = requirement.area / product.coverage;
        const materialCost = litersNeeded * product.cost;
        
        // Calculate labor cost
        const laborCost = requirement.laborFee || 0;
        
        // Calculate testing cost
        const testingCost = this.calculateTestingCost(requirement);
        
        totalMaterialCost += materialCost;
        totalLaborCost += laborCost;
        totalArea += requirement.area;
        totalTestingCost += testingCost;
        avgReliability += product.reliability || 90;
        maxLeadTime = Math.max(maxLeadTime, product.leadTime || 7);
        validItems++;
        
        quoteItems.push({
          requirementId: requirement.id,
          productId: product.id,
          productName: product.name,
          area: requirement.area,
          litersNeeded: Math.ceil(litersNeeded),
          unitCost: product.cost,
          materialCost: materialCost,
          laborCost: laborCost,
          testingCost: testingCost,
          totalItemCost: materialCost + laborCost + testingCost
        });
      }
    });
    
    if (validItems === 0) {
      return { isValid: false, reason: "No matching products found" };
    }
    
    // Calculate final pricing
    avgReliability = avgReliability / validItems;
    
    // Apply volume discounts
    const volumeDiscount = this.calculateVolumeDiscount(totalArea);
    const discountAmount = totalMaterialCost * volumeDiscount;
    
    // Calculate overhead
    const overheadCost = totalArea * this.pricingRules.overheadPerSqFt;
    
    // Apply markup
    const subtotal = totalMaterialCost + totalLaborCost + totalTestingCost + overheadCost - discountAmount;
    const finalPrice = subtotal * (1 + this.pricingRules.markupPercentage);
    
    return {
      isValid: true,
      vendorName: vendorName,
      quoteItems: quoteItems,
      costBreakdown: {
        materialCost: totalMaterialCost,
        laborCost: totalLaborCost,
        testingCost: totalTestingCost,
        overheadCost: overheadCost,
        volumeDiscount: discountAmount,
        subtotal: subtotal,
        markup: subtotal * this.pricingRules.markupPercentage,
        finalPrice: Math.round(finalPrice * 100) / 100
      },
      projectMetrics: {
        totalArea: totalArea,
        avgReliability: Math.round(avgReliability * 10) / 10,
        maxLeadTime: maxLeadTime,
        itemCount: validItems
      },
      competitiveScore: this.calculateCompetitiveScore(finalPrice, avgReliability, maxLeadTime)
    };
  }

  // Calculate testing costs based on requirements
  calculateTestingCost(requirement) {
    const testingRequirements = {
      'Adhesion Test': { cost: 450, required: true },
      'Weather Resistance': { cost: 850, required: requirement.type === 'exterior_painting' },
      'VOC Emission': { cost: 320, required: true },
      'Durability Test': { cost: 1200, required: requirement.durability >= 10 },
      'Color Fastness': { cost: 280, required: false }
    };
    
    let totalTestingCost = 0;
    
    Object.entries(testingRequirements).forEach(([, testData]) => {
      if (testData.required) {
        totalTestingCost += testData.cost;
      }
    });
    
    return totalTestingCost * (1 + this.pricingRules.testingMarkup);
  }

  // Calculate volume discount based on total area
  calculateVolumeDiscount(totalArea) {
    let discount = 0;
    
    Object.entries(this.pricingRules.volumeDiscounts).forEach(([threshold, discountRate]) => {
      if (totalArea >= parseInt(threshold)) {
        discount = Math.max(discount, discountRate);
      }
    });
    
    return discount;
  }

  // Calculate competitive score for vendor selection
  calculateCompetitiveScore(price, reliability, leadTime) {
    // Normalize scores (0-100 scale)
    const priceScore = Math.max(0, 100 - (price / 1000)); // Lower price = higher score
    const reliabilityScore = reliability; // Direct reliability percentage
    const timeScore = Math.max(0, 100 - (leadTime * 3)); // Faster delivery = higher score
    
    // Weighted average (Price: 40%, Reliability: 40%, Time: 20%)
    const finalScore = (priceScore * 0.4) + (reliabilityScore * 0.4) + (timeScore * 0.2);
    
    return Math.round(finalScore * 10) / 10;
  }

  // Select optimal vendor based on multiple criteria
  selectOptimalVendor(vendorQuotes) {
    let bestVendor = null;
    let highestScore = 0;
    
    Object.values(vendorQuotes).forEach(quote => {
      if (quote.competitiveScore > highestScore) {
        highestScore = quote.competitiveScore;
        bestVendor = quote;
      }
    });
    
    return bestVendor;
  }

  // Generate pricing strategy recommendations
  generatePricingStrategy(vendorQuotes) {
    const quotes = Object.values(vendorQuotes);
    const avgPrice = quotes.reduce((sum, q) => sum + q.costBreakdown.finalPrice, 0) / quotes.length;
    const priceRange = {
      min: Math.min(...quotes.map(q => q.costBreakdown.finalPrice)),
      max: Math.max(...quotes.map(q => q.costBreakdown.finalPrice))
    };
    
    return {
      averageMarketPrice: Math.round(avgPrice),
      priceRange: priceRange,
      competitivePosition: this.assessCompetitivePosition(vendorQuotes),
      recommendations: this.generateRecommendations(vendorQuotes)
    };
  }

  // Assess competitive position
  assessCompetitivePosition(vendorQuotes) {
    const quotes = Object.values(vendorQuotes);
    const bestQuote = quotes.reduce((best, current) => 
      current.competitiveScore > best.competitiveScore ? current : best
    );
    
    return {
      strongestVendor: bestQuote.vendorName,
      competitiveAdvantage: bestQuote.competitiveScore,
      priceCompetitiveness: this.calculatePriceCompetitiveness(quotes),
      marketPosition: bestQuote.competitiveScore > 80 ? 'Strong' : 
                     bestQuote.competitiveScore > 60 ? 'Moderate' : 'Weak'
    };
  }

  // Calculate price competitiveness
  calculatePriceCompetitiveness(quotes) {
    const prices = quotes.map(q => q.costBreakdown.finalPrice);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    
    return {
      averagePrice: Math.round(avgPrice),
      bestPrice: Math.round(minPrice),
      priceAdvantage: Math.round(((avgPrice - minPrice) / avgPrice) * 100)
    };
  }

  // Generate strategic recommendations
  generateRecommendations(vendorQuotes) {
    const recommendations = [];
    const quotes = Object.values(vendorQuotes);
    
    // Price-based recommendations
    const cheapestQuote = quotes.reduce((min, q) => q.costBreakdown.finalPrice < min.costBreakdown.finalPrice ? q : min);
    const mostReliable = quotes.reduce((max, q) => q.projectMetrics.avgReliability > max.projectMetrics.avgReliability ? q : max);
    const fastest = quotes.reduce((min, q) => q.projectMetrics.maxLeadTime < min.projectMetrics.maxLeadTime ? q : min);
    
    recommendations.push({
      type: 'cost_optimization',
      message: `${cheapestQuote.vendorName} offers lowest cost at $${cheapestQuote.costBreakdown.finalPrice.toLocaleString()}`
    });
    
    recommendations.push({
      type: 'quality_assurance', 
      message: `${mostReliable.vendorName} provides highest reliability at ${mostReliable.projectMetrics.avgReliability}%`
    });
    
    recommendations.push({
      type: 'delivery_optimization',
      message: `${fastest.vendorName} offers fastest delivery in ${fastest.projectMetrics.maxLeadTime} days`
    });
    
    return recommendations;
  }

  // Extract unique vendors from match results
  extractUniqueVendors(matchResults) {
    const vendors = new Set();
    
    matchResults.forEach(result => {
      Object.keys(result.vendorMatches || {}).forEach(vendor => {
        vendors.add(vendor);
      });
    });
    
    return Array.from(vendors);
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