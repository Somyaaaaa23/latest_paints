// Historical Data Analyzer - Learn from past RFPs
export class HistoricalDataAnalyzer {
  constructor() {
    this.historicalData = [];
    this.vendorPerformance = new Map();
    this.priceHistory = [];
    this.winPatterns = [];
  }
  
  // Add historical RFP data
  addHistoricalRFP(rfpData) {
    const record = {
      id: rfpData.id || `HIST_${Date.now()}`,
      timestamp: rfpData.timestamp || new Date().toISOString(),
      rfpTitle: rfpData.rfpTitle,
      vendor: rfpData.vendor,
      finalPrice: rfpData.finalPrice,
      matchScore: rfpData.matchScore,
      status: rfpData.status, // 'Won', 'Lost', 'Pending'
      area: rfpData.area,
      requirements: rfpData.requirements,
      deadline: rfpData.deadline,
      responseTime: rfpData.responseTime
    };
    
    this.historicalData.push(record);
    this.updateVendorPerformance(record);
    this.updatePriceHistory(record);
    
    if (record.status === 'Won' || record.status === 'Lost') {
      this.updateWinPatterns(record);
    }
  }
  
  // Update vendor performance metrics
  updateVendorPerformance(record) {
    if (!this.vendorPerformance.has(record.vendor)) {
      this.vendorPerformance.set(record.vendor, {
        vendor: record.vendor,
        totalBids: 0,
        wins: 0,
        losses: 0,
        pending: 0,
        totalValue: 0,
        avgMatchScore: 0,
        avgPrice: 0,
        avgResponseTime: 0,
        matchScores: [],
        prices: [],
        responseTimes: []
      });
    }
    
    const performance = this.vendorPerformance.get(record.vendor);
    performance.totalBids++;
    
    if (record.status === 'Won') performance.wins++;
    if (record.status === 'Lost') performance.losses++;
    if (record.status === 'Pending') performance.pending++;
    
    performance.totalValue += record.finalPrice || 0;
    performance.matchScores.push(record.matchScore);
    performance.prices.push(record.finalPrice);
    if (record.responseTime) performance.responseTimes.push(record.responseTime);
    
    // Calculate averages
    performance.avgMatchScore = performance.matchScores.reduce((a, b) => a + b, 0) / performance.matchScores.length;
    performance.avgPrice = performance.prices.reduce((a, b) => a + b, 0) / performance.prices.length;
    performance.avgResponseTime = performance.responseTimes.length > 0
      ? performance.responseTimes.reduce((a, b) => a + b, 0) / performance.responseTimes.length
      : 0;
    performance.winRate = performance.totalBids > 0 ? (performance.wins / performance.totalBids) * 100 : 0;
  }
  
  // Update price history for forecasting
  updatePriceHistory(record) {
    this.priceHistory.push({
      timestamp: record.timestamp,
      vendor: record.vendor,
      price: record.finalPrice,
      area: record.area,
      pricePerSqFt: record.area > 0 ? record.finalPrice / record.area : 0
    });
    
    // Keep only last 100 records for performance
    if (this.priceHistory.length > 100) {
      this.priceHistory.shift();
    }
  }
  
  // Update win patterns
  updateWinPatterns(record) {
    this.winPatterns.push({
      matchScore: record.matchScore,
      price: record.finalPrice,
      area: record.area,
      vendor: record.vendor,
      won: record.status === 'Won'
    });
  }
  
  // Get vendor performance report
  getVendorPerformance(vendorName) {
    return this.vendorPerformance.get(vendorName) || null;
  }
  
  // Get all vendor performances ranked
  getRankedVendors() {
    const vendors = Array.from(this.vendorPerformance.values());
    return vendors.sort((a, b) => b.winRate - a.winRate);
  }
  
  // Predict win probability based on historical data
  predictWinProbability(matchScore, price, vendor) {
    if (this.winPatterns.length < 5) {
      // Not enough data, use baseline
      return this.calculateBaselineWinProbability(matchScore, price);
    }
    
    // Find similar historical cases
    const similarCases = this.winPatterns.filter(pattern => {
      const matchScoreDiff = Math.abs(pattern.matchScore - matchScore);
      const priceDiff = Math.abs(pattern.price - price) / price;
      
      return matchScoreDiff < 15 && priceDiff < 0.3;
    });
    
    if (similarCases.length === 0) {
      return this.calculateBaselineWinProbability(matchScore, price);
    }
    
    // Calculate win rate from similar cases
    const wins = similarCases.filter(c => c.won).length;
    const historicalWinRate = (wins / similarCases.length) * 100;
    
    // Adjust based on vendor performance
    const vendorPerf = this.getVendorPerformance(vendor);
    const vendorAdjustment = vendorPerf ? (vendorPerf.winRate - 50) * 0.2 : 0;
    
    return Math.min(Math.max(historicalWinRate + vendorAdjustment, 0), 100);
  }
  
  // Calculate baseline win probability
  calculateBaselineWinProbability(matchScore, price) {
    // Simple heuristic when no historical data
    let probability = 50; // Start at 50%
    
    // Match score contribution
    if (matchScore >= 90) probability += 30;
    else if (matchScore >= 80) probability += 20;
    else if (matchScore >= 70) probability += 10;
    else if (matchScore < 60) probability -= 20;
    
    // Price contribution (assuming lower is better)
    if (price < 50000) probability += 10;
    else if (price > 100000) probability -= 10;
    
    return Math.min(Math.max(probability, 0), 100);
  }
  
  // Forecast price trends
  forecastPrice(area, vendor = null) {
    if (this.priceHistory.length < 3) {
      return { forecast: null, confidence: 'Low', message: 'Insufficient historical data' };
    }
    
    // Filter by vendor if specified
    let relevantHistory = vendor
      ? this.priceHistory.filter(h => h.vendor === vendor)
      : this.priceHistory;
    
    if (relevantHistory.length < 3) {
      relevantHistory = this.priceHistory; // Fall back to all data
    }
    
    // Calculate average price per sq ft
    const avgPricePerSqFt = relevantHistory.reduce((sum, h) => sum + h.pricePerSqFt, 0) / relevantHistory.length;
    
    // Calculate trend (simple linear regression)
    const trend = this.calculatePriceTrend(relevantHistory);
    
    // Forecast
    const basePrice = avgPricePerSqFt * area;
    const trendAdjustment = trend * area;
    const forecast = basePrice + trendAdjustment;
    
    // Calculate confidence based on data consistency
    const variance = this.calculateVariance(relevantHistory.map(h => h.pricePerSqFt));
    const confidence = variance < 10 ? 'High' : variance < 50 ? 'Medium' : 'Low';
    
    return {
      forecast: Math.round(forecast),
      basePrice: Math.round(basePrice),
      trendAdjustment: Math.round(trendAdjustment),
      avgPricePerSqFt: avgPricePerSqFt.toFixed(2),
      confidence: confidence,
      dataPoints: relevantHistory.length,
      trend: trend > 0 ? 'Increasing' : trend < 0 ? 'Decreasing' : 'Stable'
    };
  }
  
  // Calculate price trend
  calculatePriceTrend(priceHistory) {
    if (priceHistory.length < 2) return 0;
    
    const recentPrices = priceHistory.slice(-10); // Last 10 data points
    const n = recentPrices.length;
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    recentPrices.forEach((point, i) => {
      sumX += i;
      sumY += point.pricePerSqFt;
      sumXY += i * point.pricePerSqFt;
      sumX2 += i * i;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }
  
  // Calculate variance
  calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }
  
  // Get insights from historical data
  getInsights() {
    const insights = [];
    
    // Vendor insights
    const topVendor = this.getRankedVendors()[0];
    if (topVendor) {
      insights.push({
        type: 'vendor_performance',
        message: `${topVendor.vendor} has the highest win rate at ${topVendor.winRate.toFixed(1)}%`,
        data: topVendor
      });
    }
    
    // Price insights
    if (this.priceHistory.length >= 5) {
      const recentPrices = this.priceHistory.slice(-5);
      const avgRecent = recentPrices.reduce((sum, h) => sum + h.pricePerSqFt, 0) / recentPrices.length;
      const olderPrices = this.priceHistory.slice(0, -5);
      const avgOlder = olderPrices.reduce((sum, h) => sum + h.pricePerSqFt, 0) / olderPrices.length;
      
      const change = ((avgRecent - avgOlder) / avgOlder) * 100;
      
      if (Math.abs(change) > 5) {
        insights.push({
          type: 'price_trend',
          message: `Prices have ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}% recently`,
          data: { change, avgRecent, avgOlder }
        });
      }
    }
    
    // Win pattern insights
    if (this.winPatterns.length >= 10) {
      const wonCases = this.winPatterns.filter(p => p.won);
      const avgWinningMatchScore = wonCases.reduce((sum, p) => sum + p.matchScore, 0) / wonCases.length;
      
      insights.push({
        type: 'win_pattern',
        message: `RFPs with match scores above ${avgWinningMatchScore.toFixed(0)}% have higher win rates`,
        data: { avgWinningMatchScore, totalWins: wonCases.length }
      });
    }
    
    return insights;
  }
  
  // Export historical data
  exportData() {
    return {
      historicalRFPs: this.historicalData,
      vendorPerformance: Array.from(this.vendorPerformance.values()),
      priceHistory: this.priceHistory,
      insights: this.getInsights(),
      statistics: {
        totalRFPs: this.historicalData.length,
        totalVendors: this.vendorPerformance.size,
        overallWinRate: this.calculateOverallWinRate()
      }
    };
  }
  
  // Calculate overall win rate
  calculateOverallWinRate() {
    const total = this.historicalData.length;
    if (total === 0) return 0;
    
    const wins = this.historicalData.filter(rfp => rfp.status === 'Won').length;
    return (wins / total) * 100;
  }
}

// Create singleton instance
export const historicalDataAnalyzer = new HistoricalDataAnalyzer();

// Initialize with mock historical data
export function initializeHistoricalData() {
  const mockData = [
    { id: 'H001', rfpTitle: 'Office Complex', vendor: 'Asian Paints', finalPrice: 95000, matchScore: 92, status: 'Won', area: 50000, deadline: '2024-10-15', responseTime: 2.5 },
    { id: 'H002', rfpTitle: 'Residential Tower', vendor: 'Berger Paints', finalPrice: 67500, matchScore: 78, status: 'Lost', area: 35000, deadline: '2024-10-08', responseTime: 3.2 },
    { id: 'H003', rfpTitle: 'Industrial Facility', vendor: 'Nerolac Paints', finalPrice: 134000, matchScore: 89, status: 'Pending', area: 75000, deadline: '2024-09-28', responseTime: 2.8 },
    { id: 'H004', rfpTitle: 'School Building', vendor: 'Asian Paints', finalPrice: 52000, matchScore: 88, status: 'Won', area: 28000, deadline: '2024-09-15', responseTime: 2.1 },
    { id: 'H005', rfpTitle: 'Hospital Wing', vendor: 'Berger Paints', finalPrice: 112000, matchScore: 94, status: 'Won', area: 62000, deadline: '2024-08-30', responseTime: 2.4 },
    { id: 'H006', rfpTitle: 'Shopping Mall', vendor: 'Asian Paints', finalPrice: 185000, matchScore: 85, status: 'Lost', area: 95000, deadline: '2024-08-20', responseTime: 3.5 },
    { id: 'H007', rfpTitle: 'Apartment Complex', vendor: 'Nerolac Paints', finalPrice: 78000, matchScore: 91, status: 'Won', area: 42000, deadline: '2024-07-25', responseTime: 2.2 },
    { id: 'H008', rfpTitle: 'Government Office', vendor: 'Berger Paints', finalPrice: 145000, matchScore: 87, status: 'Won', area: 80000, deadline: '2024-07-10', responseTime: 2.9 }
  ];
  
  mockData.forEach(data => historicalDataAnalyzer.addHistoricalRFP(data));
  
  return historicalDataAnalyzer;
}
