// Confidence-based Escalation - Flag low-confidence decisions for human review
export class ConfidenceEscalation {
  constructor() {
    this.thresholds = {
      matchScore: 0.85, // 85% match score threshold
      winProbability: 0.70, // 70% win probability threshold
      priceVariance: 0.20, // 20% price variance threshold
      reliability: 0.90 // 90% reliability threshold
    };
    
    this.escalations = [];
  }

  // Evaluate if RFP response needs human review
  evaluateConfidence(rfpAnalysis) {
    const issues = [];
    let overallConfidence = 1.0;
    let needsReview = false;

    // Check match score
    const matchScore = rfpAnalysis.overallMatchScore / 100;
    if (matchScore < this.thresholds.matchScore) {
      issues.push({
        type: 'LOW_MATCH_SCORE',
        severity: 'HIGH',
        message: `Match score ${(matchScore * 100).toFixed(0)}% is below threshold of ${(this.thresholds.matchScore * 100).toFixed(0)}%`,
        value: matchScore,
        threshold: this.thresholds.matchScore,
        recommendation: 'Review technical specifications and vendor selection'
      });
      overallConfidence *= 0.7;
      needsReview = true;
    }

    // Check win probability
    const winProb = (rfpAnalysis.winProbability?.probability || 0) / 100;
    if (winProb < this.thresholds.winProbability) {
      issues.push({
        type: 'LOW_WIN_PROBABILITY',
        severity: winProb < 0.5 ? 'HIGH' : 'MEDIUM',
        message: `Win probability ${(winProb * 100).toFixed(0)}% is below threshold of ${(this.thresholds.winProbability * 100).toFixed(0)}%`,
        value: winProb,
        threshold: this.thresholds.winProbability,
        recommendation: 'Review pricing strategy and competitive positioning'
      });
      overallConfidence *= 0.8;
      needsReview = true;
    }

    // Check vendor reliability
    const reliability = (rfpAnalysis.pricingDetails?.avgReliability || 0) / 100;
    if (reliability < this.thresholds.reliability) {
      issues.push({
        type: 'LOW_RELIABILITY',
        severity: 'MEDIUM',
        message: `Vendor reliability ${(reliability * 100).toFixed(0)}% is below threshold of ${(this.thresholds.reliability * 100).toFixed(0)}%`,
        value: reliability,
        threshold: this.thresholds.reliability,
        recommendation: 'Consider alternative vendors or request quality guarantees'
      });
      overallConfidence *= 0.85;
      needsReview = true;
    }

    // Check price variance across vendors
    if (rfpAnalysis.vendorQuotes) {
      const prices = Object.values(rfpAnalysis.vendorQuotes).map(q => q.finalPrice);
      if (prices.length > 1) {
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const maxVariance = Math.max(...prices.map(p => Math.abs(p - avgPrice) / avgPrice));
        
        if (maxVariance > this.thresholds.priceVariance) {
          issues.push({
            type: 'HIGH_PRICE_VARIANCE',
            severity: 'MEDIUM',
            message: `Price variance ${(maxVariance * 100).toFixed(0)}% exceeds threshold of ${(this.thresholds.priceVariance * 100).toFixed(0)}%`,
            value: maxVariance,
            threshold: this.thresholds.priceVariance,
            recommendation: 'Verify pricing calculations and vendor quotes'
          });
          overallConfidence *= 0.9;
          needsReview = true;
        }
      }
    }

    // Check deadline risk
    if (rfpAnalysis.analysis?.riskLevel === 'High') {
      issues.push({
        type: 'HIGH_DEADLINE_RISK',
        severity: 'HIGH',
        message: 'Tight deadline poses high delivery risk',
        recommendation: 'Confirm vendor can meet deadline or negotiate extension'
      });
      overallConfidence *= 0.85;
      needsReview = true;
    }

    // Check complexity
    if (rfpAnalysis.analysis?.complexity === 'High' || rfpAnalysis.analysis?.complexity === 'Very High') {
      issues.push({
        type: 'HIGH_COMPLEXITY',
        severity: 'MEDIUM',
        message: `RFP complexity is ${rfpAnalysis.analysis.complexity}`,
        recommendation: 'Review technical requirements with subject matter experts'
      });
      overallConfidence *= 0.9;
    }

    const escalation = {
      id: `ESC_${Date.now()}`,
      timestamp: new Date().toISOString(),
      rfpId: rfpAnalysis.rfpId,
      rfpTitle: rfpAnalysis.rfpTitle || 'Untitled RFP',
      needsReview: needsReview,
      overallConfidence: overallConfidence,
      confidenceLevel: this.getConfidenceLevel(overallConfidence),
      issues: issues,
      summary: this.generateSummary(needsReview, overallConfidence, issues),
      reviewPriority: this.calculatePriority(issues)
    };

    if (needsReview) {
      this.escalations.push(escalation);
      console.log(`⚠️ ESCALATION: Human review needed for RFP "${escalation.rfpTitle}"`);
      console.log(`   Confidence: ${(overallConfidence * 100).toFixed(0)}% | Issues: ${issues.length}`);
      issues.forEach(issue => {
        console.log(`   - [${issue.severity}] ${issue.message}`);
      });
    } else {
      console.log(`✅ CONFIDENCE: RFP "${escalation.rfpTitle}" passed all thresholds`);
      console.log(`   Confidence: ${(overallConfidence * 100).toFixed(0)}% | No issues detected`);
    }

    return escalation;
  }

  // Get confidence level label
  getConfidenceLevel(confidence) {
    if (confidence >= 0.95) return 'VERY_HIGH';
    if (confidence >= 0.85) return 'HIGH';
    if (confidence >= 0.70) return 'MEDIUM';
    if (confidence >= 0.50) return 'LOW';
    return 'VERY_LOW';
  }

  // Calculate review priority
  calculatePriority(issues) {
    const highSeverity = issues.filter(i => i.severity === 'HIGH').length;
    const mediumSeverity = issues.filter(i => i.severity === 'MEDIUM').length;

    if (highSeverity >= 2) return 'URGENT';
    if (highSeverity >= 1) return 'HIGH';
    if (mediumSeverity >= 2) return 'MEDIUM';
    return 'LOW';
  }

  // Generate summary message
  generateSummary(needsReview, confidence, issues) {
    if (!needsReview) {
      return `All confidence thresholds met. Automated response approved with ${(confidence * 100).toFixed(0)}% confidence.`;
    }

    const highIssues = issues.filter(i => i.severity === 'HIGH').length;
    const mediumIssues = issues.filter(i => i.severity === 'MEDIUM').length;

    let summary = `Human review required. Overall confidence: ${(confidence * 100).toFixed(0)}%. `;
    
    if (highIssues > 0) {
      summary += `${highIssues} high-severity issue${highIssues > 1 ? 's' : ''} detected. `;
    }
    if (mediumIssues > 0) {
      summary += `${mediumIssues} medium-severity issue${mediumIssues > 1 ? 's' : ''} detected. `;
    }

    return summary;
  }

  // Get all pending escalations
  getPendingEscalations() {
    return this.escalations.filter(e => e.needsReview);
  }

  // Get escalation statistics
  getStatistics() {
    const total = this.escalations.length;
    const needsReview = this.escalations.filter(e => e.needsReview).length;
    const approved = total - needsReview;

    const avgConfidence = total > 0
      ? this.escalations.reduce((sum, e) => sum + e.overallConfidence, 0) / total
      : 0;

    const priorityCounts = {
      URGENT: this.escalations.filter(e => e.reviewPriority === 'URGENT').length,
      HIGH: this.escalations.filter(e => e.reviewPriority === 'HIGH').length,
      MEDIUM: this.escalations.filter(e => e.reviewPriority === 'MEDIUM').length,
      LOW: this.escalations.filter(e => e.reviewPriority === 'LOW').length
    };

    return {
      totalEvaluated: total,
      needsReview: needsReview,
      autoApproved: approved,
      approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : 0,
      avgConfidence: (avgConfidence * 100).toFixed(1),
      priorityCounts: priorityCounts
    };
  }

  // Update thresholds
  updateThresholds(newThresholds) {
    Object.assign(this.thresholds, newThresholds);
    console.log('🎯 Confidence thresholds updated:', this.thresholds);
  }

  // Clear escalation history
  clearHistory() {
    this.escalations = [];
    console.log('🗑️ Escalation history cleared');
  }

  // Export escalations
  exportEscalations() {
    return this.escalations;
  }

  // Generate human review report
  generateReviewReport(escalation) {
    const report = {
      title: 'HUMAN REVIEW REQUIRED',
      rfpId: escalation.rfpId,
      rfpTitle: escalation.rfpTitle,
      timestamp: escalation.timestamp,
      priority: escalation.reviewPriority,
      confidence: `${(escalation.overallConfidence * 100).toFixed(0)}%`,
      confidenceLevel: escalation.confidenceLevel,
      summary: escalation.summary,
      issues: escalation.issues.map(issue => ({
        type: issue.type,
        severity: issue.severity,
        message: issue.message,
        recommendation: issue.recommendation
      })),
      actionRequired: this.getActionRequired(escalation)
    };

    return report;
  }

  // Get required actions
  getActionRequired(escalation) {
    const actions = [];

    escalation.issues.forEach(issue => {
      switch (issue.type) {
        case 'LOW_MATCH_SCORE':
          actions.push('Review and adjust technical specifications');
          actions.push('Consider alternative vendors or products');
          break;
        case 'LOW_WIN_PROBABILITY':
          actions.push('Optimize pricing strategy');
          actions.push('Review competitive positioning');
          break;
        case 'LOW_RELIABILITY':
          actions.push('Verify vendor credentials and past performance');
          actions.push('Request quality guarantees or certifications');
          break;
        case 'HIGH_PRICE_VARIANCE':
          actions.push('Verify all pricing calculations');
          actions.push('Investigate reasons for price differences');
          break;
        case 'HIGH_DEADLINE_RISK':
          actions.push('Confirm delivery timeline with vendor');
          actions.push('Consider requesting deadline extension');
          break;
        case 'HIGH_COMPLEXITY':
          actions.push('Consult with technical experts');
          actions.push('Break down complex requirements');
          break;
      }
    });

    return [...new Set(actions)]; // Remove duplicates
  }
}

// Create singleton instance
export const confidenceEscalation = new ConfidenceEscalation();
