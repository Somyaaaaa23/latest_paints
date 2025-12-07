import React, { useState, useCallback, useRef, useEffect } from 'react';
import { RefreshCw, Zap, Sliders, DollarSign, CheckCircle, Search, Upload, BarChart3, Users, FileText, TrendingUp, Award, Globe, Download, History, AlertCircle, Clock, Target, Shield, Activity, Brain, Network, TrendingDown, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadialBarChart, RadialBar } from 'recharts';
import { auditLogger } from './utils/AuditLogger';
import { nlpProcessor } from './utils/NLPProcessor';
import { buildKnowledgeGraph } from './utils/ProductKnowledgeGraph';
import { historicalDataAnalyzer, initializeHistoricalData } from './utils/HistoricalDataAnalyzer';
import { currencyConverter } from './utils/CurrencyConverter';
import { csvHandler } from './utils/CSVHandler';
import { enhancedNLP } from './utils/EnhancedNLP';
import { semanticMatcher } from './utils/SemanticMatcher';
import { learningMemory } from './utils/LearningMemory';
import { confidenceEscalation } from './utils/ConfidenceEscalation';

// --- COMPREHENSIVE MOCK DATA FOR FULL AGENTIC WORKFLOW ---

// 1. RFP Scanner Data - Simulated web sources
const RFP_SOURCES = [
  { 
    id: 'src1', 
    name: 'Government Tenders Portal', 
    url: 'https://etenders.gov.in', 
    status: 'active',
    lastScan: '2024-11-05 09:30',
    rfpsFound: 12
  },
  { 
    id: 'src2', 
    name: 'Construction Industry Board', 
    url: 'https://construction-rfps.com', 
    status: 'active',
    lastScan: '2024-11-05 08:45',
    rfpsFound: 8
  },
  { 
    id: 'src3', 
    name: 'Municipal Corporation Portal', 
    url: 'https://municipal-tenders.org', 
    status: 'scanning',
    lastScan: '2024-11-05 10:15',
    rfpsFound: 5
  }
];

// 2. Detected RFPs Database
const DETECTED_RFPS = [
  {
    id: 'rfp001',
    title: 'Commercial Complex Painting - Phase 2',
    source: 'Government Tenders Portal',
    deadline: '2024-12-20',
    value: '$125,000',
    status: 'new',
    daysLeft: 45,
    requirements: {
      area: 75000,
      type: 'Mixed (Interior + Exterior)',
      urgency: 'Standard'
    },
    matchScore: null
  },
  {
    id: 'rfp002', 
    title: 'School Building Renovation Paint Work',
    source: 'Municipal Corporation Portal',
    deadline: '2024-12-15',
    value: '$89,500',
    status: 'analyzed',
    daysLeft: 40,
    requirements: {
      area: 45000,
      type: 'Interior Focus',
      urgency: 'High'
    },
    matchScore: 87
  },
  {
    id: 'rfp003',
    title: 'Hospital Exterior Wall Painting',
    source: 'Construction Industry Board', 
    deadline: '2025-01-10',
    value: '$156,000',
    status: 'responded',
    daysLeft: 66,
    requirements: {
      area: 92000,
      type: 'Exterior Only',
      urgency: 'Standard'
    },
    matchScore: 94
  }
];

// 3. Enhanced Product Repository with Spec Matching
const PRODUCT_REPOSITORY = {
  'Asian Paints': [
    { 
      id: 'AP001-A', 
      name: 'Apex Ultima Exterior Emulsion', 
      category: 'Exterior',
      finish: 'Matt', 
      coverage: 140, 
      durability: 12, 
      cost: 285.50, 
      reliability: 95, 
      leadTime: 7,
      specs: {
        weatherResistance: 'Excellent',
        fadeResistance: 'High',
        washability: 'Good',
        voc: 'Low',
        application: ['Brush', 'Roller', 'Spray']
      }
    },
    { 
      id: 'AP002-B', 
      name: 'Royale Luxury Emulsion', 
      category: 'Interior',
      finish: 'Silk', 
      coverage: 120, 
      durability: 10, 
      cost: 320.75, 
      reliability: 92, 
      leadTime: 5,
      specs: {
        weatherResistance: 'Good',
        fadeResistance: 'High',
        washability: 'Excellent',
        voc: 'Ultra Low',
        application: ['Brush', 'Roller']
      }
    },
    { 
      id: 'AP003-C', 
      name: 'Tractor Emulsion Economy', 
      category: 'Interior',
      finish: 'Matt', 
      coverage: 110, 
      durability: 8, 
      cost: 180.25, 
      reliability: 88, 
      leadTime: 3,
      specs: {
        weatherResistance: 'Fair',
        fadeResistance: 'Medium',
        washability: 'Good',
        voc: 'Medium',
        application: ['Brush', 'Roller']
      }
    }
  ],
  'Berger Paints': [
    { 
      id: 'BP001-X', 
      name: 'WeatherCoat Long Life', 
      category: 'Exterior',
      finish: 'Smooth', 
      coverage: 135, 
      durability: 15, 
      cost: 295.80, 
      reliability: 97, 
      leadTime: 10,
      specs: {
        weatherResistance: 'Excellent',
        fadeResistance: 'Excellent',
        washability: 'Good',
        voc: 'Low',
        application: ['Brush', 'Roller', 'Spray']
      }
    },
    { 
      id: 'BP002-Y', 
      name: 'Silk Glamour Interior', 
      category: 'Interior',
      finish: 'Silk', 
      coverage: 125, 
      durability: 8, 
      cost: 245.60, 
      reliability: 90, 
      leadTime: 4,
      specs: {
        weatherResistance: 'Good',
        fadeResistance: 'High',
        washability: 'Excellent',
        voc: 'Ultra Low',
        application: ['Brush', 'Roller']
      }
    }
  ],
  'Nerolac Paints': [
    { 
      id: 'NP001-M', 
      name: 'Excel Total Exterior', 
      category: 'Exterior',
      finish: 'Sheen', 
      coverage: 130, 
      durability: 12, 
      cost: 275.90, 
      reliability: 94, 
      leadTime: 8,
      specs: {
        weatherResistance: 'Excellent',
        fadeResistance: 'High',
        washability: 'Good',
        voc: 'Low',
        application: ['Brush', 'Roller', 'Spray']
      }
    }
  ]
};

// 4. Testing Requirements & Costs
const TESTING_REQUIREMENTS = {
  'Adhesion Test': { cost: 450, duration: '2 days', required: true },
  'Weather Resistance Test': { cost: 850, duration: '5 days', required: false },
  'VOC Emission Test': { cost: 320, duration: '1 day', required: true },
  'Durability Test': { cost: 1200, duration: '7 days', required: false },
  'Color Fastness Test': { cost: 280, duration: '1 day', required: false }
};

// 5. RFP Response History
const RFP_HISTORY = [
  {
    id: 'hist001',
    rfpTitle: 'Office Complex Painting',
    submittedDate: '2024-10-15',
    status: 'Won',
    value: '$95,000',
    vendor: 'Asian Paints',
    matchScore: 92
  },
  {
    id: 'hist002', 
    rfpTitle: 'Residential Tower Paint Work',
    submittedDate: '2024-10-08',
    status: 'Lost',
    value: '$67,500',
    vendor: 'Berger Paints',
    matchScore: 78
  },
  {
    id: 'hist003',
    rfpTitle: 'Industrial Facility Coating',
    submittedDate: '2024-09-28',
    status: 'Pending',
    value: '$134,000',
    vendor: 'Nerolac Paints',
    matchScore: 89
  }
];

// 6. Enhanced Pricing Rules
const PRICING_RULES = {
  markup_percentage: 0.20,
  overhead_per_sqft: 0.50,
  rush_order_multiplier: 1.15,
  volume_discounts: {
    10000: 0.02,
    25000: 0.05,
    50000: 0.08
  },
  testing_markup: 0.15
};

// --- ENHANCED AGENT SIMULATION LOGIC ---
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 1. Sales Agent - Enhanced with NLP Processing
const salesAgent = async (rfpData, isFromPDF = false) => {
  await delay(isFromPDF ? 2500 : 1500);
  console.log(`Sales Agent: ${isFromPDF ? 'Processing uploaded RFP' : 'Analyzing RFP requirements'}...`);
  
  // NLP-powered entity extraction
  console.log('🧠 NLP: Extracting entities from RFP text...');
  const entities = nlpProcessor.extractEntities(rfpData);
  console.log('✅ NLP: Entities extracted:', entities);
  
  // Detect urgency using NLP
  const urgencyAnalysis = nlpProcessor.detectUrgency(rfpData);
  console.log(`⚡ NLP: Urgency detected - ${urgencyAnalysis.level} (${(urgencyAnalysis.score * 100).toFixed(0)}%)`);
  
  // Analyze complexity
  const complexityAnalysis = nlpProcessor.analyzeComplexity(rfpData, entities);
  console.log(`🔍 NLP: Complexity - ${complexityAnalysis.level} (score: ${complexityAnalysis.score.toFixed(0)})`);
  
  // Enhanced requirement extraction with NLP entities
  const requirements = parseRFPRequirements(rfpData, entities);
  
  // Add NLP-enhanced analysis
  const analysis = {
    urgency: urgencyAnalysis.level,
    urgencyScore: urgencyAnalysis.score,
    complexity: complexityAnalysis.level,
    complexityScore: complexityAnalysis.score,
    estimatedDuration: Math.ceil(requirements.totalSqFt / 5000) + ' weeks',
    riskLevel: requirements.deadline ? calculateRiskLevel(requirements.deadline) : 'Medium',
    entitiesFound: {
      quantities: entities.quantities.length,
      materials: entities.materials.length,
      certifications: entities.certifications.length,
      costs: entities.costs.length
    }
  };
  
  return { ...requirements, analysis, nlpEntities: entities };
};



// 2. Technical Agent - Advanced Spec Matching
const technicalAgent = async (salesOutput) => {
  await delay(3000);
  console.log("Technical Agent: Performing advanced spec matching...");
  
  const matchedRequirements = salesOutput.requirements.map(req => {
    const vendorMatches = {};
    
    // Enhanced matching algorithm
    Object.entries(PRODUCT_REPOSITORY).forEach(([vendorName, catalog]) => {
      let bestMatch = null;
      let maxScore = -1;
      
      catalog.forEach(product => {
        let score = 0;
        let reasons = [];
        
        // Category matching (40 points)
        if (req.specs.finish === 'Matt' && product.category === 'Exterior') {
          score += 40;
          reasons.push("Category Match - Exterior (40%)");
        } else if (req.specs.finish === 'Silk' && product.category === 'Interior') {
          score += 40;
          reasons.push("Category Match - Interior (40%)");
        }
        
        // Finish matching (30 points)
        if (product.finish.toLowerCase() === req.specs.finish.toLowerCase()) {
          score += 30;
          reasons.push("Finish Match (30%)");
        }
        
        // Coverage efficiency (20 points)
        if (req.specs.coverage && product.coverage >= req.specs.coverage) {
          score += 20;
          reasons.push("Coverage Requirement Met (20%)");
        }
        
        // Durability matching (10 points)
        if (req.specs.minDurability && product.durability >= req.specs.minDurability) {
          score += 10;
          reasons.push("Durability Requirement Met (10%)");
        }
        
        if (score > maxScore) {
          maxScore = score;
          bestMatch = {
            skuId: product.id,
            skuName: product.name,
            category: product.category,
            skuCost: product.cost,
            coverage: product.coverage,
            reliability: product.reliability,
            leadTime: product.leadTime,
            matchScore: maxScore,
            matchReason: reasons.join(', '),
            specs: product.specs
          };
        }
      });
      
      if (bestMatch) {
        vendorMatches[vendorName] = bestMatch;
      }
    });
    
    return { ...req, vendorMatches };
  });
  
  return { 
    deadline: salesOutput.deadline, 
    analysis: salesOutput.analysis,
    matchedRequirements,
    overallMatchScore: calculateOverallMatchScore(matchedRequirements)
  };
};

// 3. Pricing Agent - Enhanced Cost Calculation with Testing
const pricingAgent = async (technicalOutput) => {
  await delay(2500);
  console.log("Pricing Agent: Calculating comprehensive costs with testing...");
  
  const vendorQuotes = {};
  
  Object.keys(PRODUCT_REPOSITORY).forEach(vendorName => {
    let subtotalCost = 0;
    let totalLaborFees = 0;
    let totalTestingCosts = 0;
    let totalArea = 0;
    let avgReliability = 0;
    let maxLeadTime = 0;
    let validQuote = true;
    
    const vendorItems = [];
    
    technicalOutput.matchedRequirements.forEach(item => {
      const vendorMatch = item.vendorMatches[vendorName];
      if (vendorMatch) {
        const area = item.area;
        const litersNeeded = area / vendorMatch.coverage;
        const itemCost = litersNeeded * vendorMatch.skuCost;
        
        subtotalCost += itemCost;
        totalArea += area;
        avgReliability += vendorMatch.reliability;
        maxLeadTime = Math.max(maxLeadTime, vendorMatch.leadTime);
        
        if (item.specs.laborFee) {
          totalLaborFees += item.specs.laborFee;
        }
        
        vendorItems.push({
          requirement: item.id,
          sku: vendorMatch.skuId,
          cost: itemCost,
          liters: litersNeeded,
          reliability: vendorMatch.reliability,
          leadTime: vendorMatch.leadTime
        });
      } else {
        validQuote = false;
      }
    });
    
    // Add testing costs
    Object.entries(TESTING_REQUIREMENTS).forEach(([testName, testData]) => {
      if (testData.required || Math.random() > 0.6) { // Some optional tests randomly included
        totalTestingCosts += testData.cost;
      }
    });
    
    if (validQuote && vendorItems.length > 0) {
      avgReliability = avgReliability / vendorItems.length;
      
      // Apply volume discounts
      let volumeDiscount = 0;
      Object.entries(PRICING_RULES.volume_discounts).forEach(([threshold, discount]) => {
        if (totalArea >= parseInt(threshold)) {
          volumeDiscount = Math.max(volumeDiscount, discount);
        }
      });
      
      const overheadCost = totalArea * PRICING_RULES.overhead_per_sqft;
      const testingCostWithMarkup = totalTestingCosts * (1 + PRICING_RULES.testing_markup);
      const discountAmount = subtotalCost * volumeDiscount;
      const grossCost = subtotalCost + overheadCost + totalLaborFees + testingCostWithMarkup - discountAmount;
      const finalPrice = grossCost * (1 + PRICING_RULES.markup_percentage);
      
      vendorQuotes[vendorName] = {
        vendor: vendorName,
        subtotalCost,
        overheadCost,
        totalLaborFees,
        totalTestingCosts: testingCostWithMarkup,
        volumeDiscount: discountAmount,
        finalPrice: parseFloat(finalPrice.toFixed(2)),
        avgReliability: parseFloat(avgReliability.toFixed(1)),
        maxLeadTime,
        totalArea,
        items: vendorItems,
        score: calculateVendorScore(finalPrice, avgReliability, maxLeadTime)
      };
    }
  });
  
  // Select best vendor
  const bestVendor = Object.values(vendorQuotes).reduce((best, current) => 
    current.score > best.score ? current : best
  );
  
  return {
    ...technicalOutput,
    vendorQuotes,
    recommendedVendor: bestVendor.vendor,
    pricingDetails: bestVendor
  };
};

// 4. Main Agent (Orchestrator) - Coordinates all other agents
const mainAgent = async (finalData) => {
  await delay(1500);
  console.log("Main Agent: Orchestrating final RFP response...");
  
  const report = {
    id: `RPT-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    rfpTitle: "Automated RFP Response",
    executiveSummary: {
      recommendedVendor: finalData.recommendedVendor,
      totalCost: finalData.pricingDetails.finalPrice,
      matchScore: finalData.overallMatchScore,
      deliveryTime: finalData.pricingDetails.maxLeadTime
    },
    technicalDetails: finalData.matchedRequirements,
    costBreakdown: finalData.pricingDetails,
    riskAssessment: finalData.analysis,
    downloadLinks: {
      pdf: `/reports/${Date.now()}.pdf`,
      excel: `/reports/${Date.now()}.xlsx`
    }
  };
  
  return report;
};

// --- UTILITY FUNCTIONS ---

// Report Download Functions
const downloadReport = (type, reportData) => {
  console.log(`Downloading ${type} report...`);
  
  if (type === 'pdf') {
    // Generate HTML content and open print dialog for PDF
    generatePDFReport(reportData);
  } else if (type === 'excel') {
    // Generate CSV content (Excel-compatible)
    const csvContent = generateCSVContent(reportData);
    downloadFile(csvContent, `RFP_Analysis_${Date.now()}.csv`, 'text/csv');
  }
};

const viewExecutiveSummary = (reportData) => {
  console.log('Opening executive summary...');
  
  // Create a modal or new window with executive summary
  const summaryWindow = window.open('', '_blank', 'width=800,height=600');
  summaryWindow.document.write(`
    <html>
      <head>
        <title>Executive Summary - RFP Response</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
          .header { color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
          .section { margin: 20px 0; }
          .highlight { background-color: #f0f9ff; padding: 10px; border-left: 4px solid #0ea5e9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Executive Summary</h1>
          <p>RFP Response Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="section">
          <h2>Recommendation</h2>
          <div class="highlight">
            <strong>Recommended Vendor:</strong> ${reportData.executiveSummary.recommendedVendor}<br>
            <strong>Total Cost:</strong> $${reportData.executiveSummary.totalCost.toLocaleString()}<br>
            <strong>Match Score:</strong> ${reportData.executiveSummary.matchScore}%<br>
            <strong>Delivery Time:</strong> ${reportData.executiveSummary.deliveryTime} days
          </div>
        </div>
        
        <div class="section">
          <h2>Key Benefits</h2>
          <ul>
            <li>Optimal cost-performance ratio</li>
            <li>High reliability and quality standards</li>
            <li>Competitive delivery timeline</li>
            <li>Comprehensive testing included</li>
          </ul>
        </div>
        
        <div class="section">
          <h2>Next Steps</h2>
          <ol>
            <li>Review detailed technical specifications</li>
            <li>Confirm delivery schedule</li>
            <li>Finalize contract terms</li>
            <li>Submit formal response</li>
          </ol>
        </div>
      </body>
    </html>
  `);
};

const generatePDFReport = (reportData) => {
  // Create a new window with printable HTML content
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>RFP Response Report</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            line-height: 1.6; 
            color: #333;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #4f46e5; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          .section { 
            margin: 25px 0; 
            padding: 15px; 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
          }
          .highlight { 
            background-color: #f0f9ff; 
            padding: 15px; 
            border-left: 4px solid #0ea5e9; 
            margin: 10px 0;
          }
          .vendor-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          .vendor-card {
            border: 1px solid #d1d5db;
            padding: 15px;
            border-radius: 8px;
            background-color: #f9fafb;
          }
          .recommended {
            border-color: #10b981;
            background-color: #ecfdf5;
          }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .print-btn {
            background-color: #4f46e5;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button class="print-btn" onclick="window.print()">🖨️ Print as PDF</button>
          <button class="print-btn" onclick="window.close()" style="background-color: #6b7280;">❌ Close</button>
        </div>
        
        <div class="header">
          <h1>RFP Response Report</h1>
          <h2>${reportData.rfpTitle || 'Paint Project RFP'}</h2>
          <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <div class="section">
          <h2>🎯 Executive Summary</h2>
          <div class="highlight">
            <h3>Recommended Solution</h3>
            <p><strong>Vendor:</strong> ${reportData.executiveSummary.recommendedVendor}</p>
            <p><strong>Total Investment:</strong> $${reportData.executiveSummary.totalCost.toLocaleString()}</p>
            <p><strong>Technical Match:</strong> ${reportData.executiveSummary.matchScore}% compatibility</p>
            <p><strong>Delivery Timeline:</strong> ${reportData.executiveSummary.deliveryTime} days</p>
          </div>
        </div>
        
        <div class="section">
          <h2>🏢 Vendor Analysis</h2>
          <p>Our multi-agent system analyzed three leading paint manufacturers:</p>
          <div class="vendor-grid">
            <div class="vendor-card recommended">
              <h4>✅ ${reportData.executiveSummary.recommendedVendor}</h4>
              <p><strong>RECOMMENDED</strong></p>
              <p>Cost: $${reportData.executiveSummary.totalCost.toLocaleString()}</p>
              <p>Score: ${reportData.executiveSummary.matchScore}%</p>
            </div>
            <div class="vendor-card">
              <h4>Asian Paints</h4>
              <p>Premium Quality</p>
              <p>Reliability: 95%</p>
            </div>
            <div class="vendor-card">
              <h4>Berger Paints</h4>
              <p>Balanced Solution</p>
              <p>Reliability: 91%</p>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>🤖 AI Agent Analysis</h2>
          <table>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Function</th>
                <th>Result</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sales Agent</td>
                <td>Requirement Extraction</td>
                <td>Successfully parsed RFP</td>
                <td>96%</td>
              </tr>
              <tr>
                <td>Technical Agent</td>
                <td>Specification Matching</td>
                <td>${reportData.executiveSummary.matchScore}% match achieved</td>
                <td>94%</td>
              </tr>
              <tr>
                <td>Pricing Agent</td>
                <td>Cost Optimization</td>
                <td>Optimal pricing strategy</td>
                <td>98%</td>
              </tr>
              <tr>
                <td>Main Agent</td>
                <td>Orchestration & Documentation</td>
                <td>Comprehensive response orchestrated</td>
                <td>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h2>📋 Next Steps</h2>
          <ol>
            <li><strong>Review & Approve:</strong> Technical specifications and pricing</li>
            <li><strong>Contract Preparation:</strong> Finalize terms with ${reportData.executiveSummary.recommendedVendor}</li>
            <li><strong>Timeline Confirmation:</strong> Confirm ${reportData.executiveSummary.deliveryTime}-day delivery schedule</li>
            <li><strong>Submit Response:</strong> Submit formal RFP response</li>
          </ol>
        </div>
        
        <div class="section">
          <h2>📊 Cost Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>Amount</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Materials</td>
                <td>$${(reportData.executiveSummary.totalCost * 0.7).toLocaleString()}</td>
                <td>70%</td>
              </tr>
              <tr>
                <td>Testing & Quality</td>
                <td>$${(reportData.executiveSummary.totalCost * 0.15).toLocaleString()}</td>
                <td>15%</td>
              </tr>
              <tr>
                <td>Overhead & Margin</td>
                <td>$${(reportData.executiveSummary.totalCost * 0.15).toLocaleString()}</td>
                <td>15%</td>
              </tr>
              <tr style="font-weight: bold; background-color: #f3f4f6;">
                <td>Total Investment</td>
                <td>$${reportData.executiveSummary.totalCost.toLocaleString()}</td>
                <td>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
          <p>Generated by Agentic RFP Automation Platform</p>
          <p>Report ID: RPT-${Date.now()}</p>
        </footer>
      </body>
    </html>
  `);
  
  // Auto-focus the print window
  printWindow.focus();
  
  // Show instruction
  showNotification('Report opened in new window. Click "Print as PDF" to save as PDF file.', 'success');
};

const generateCSVContent = (reportData) => {
  // Generate proper CSV content for Excel
  const csvHeader = 'Vendor,Final Cost,Reliability,Lead Time,Match Score,Status\n';
  const csvData = `${reportData.executiveSummary.recommendedVendor},$${reportData.executiveSummary.totalCost},95%,${reportData.executiveSummary.deliveryTime} days,${reportData.executiveSummary.matchScore}%,Recommended\n`;
  const csvData2 = 'Asian Paints,$49263,95%,7 days,89%,Alternative\n';
  const csvData3 = 'Berger Paints,$44636,91%,10 days,87%,Alternative\n';
  const csvData4 = 'Nerolac Paints,$51037,91%,8 days,85%,Alternative\n';
  
  return csvHeader + csvData + csvData2 + csvData3 + csvData4;
};

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  // Show success message with better styling
  showNotification(`${filename} has been downloaded successfully!`, 'success');
};

// History Tab Functions
const viewRfpDetails = (rfpItem) => {
  console.log('Viewing RFP details:', rfpItem);
  
  // Create a modal with RFP details
  const detailsWindow = window.open('', '_blank', 'width=900,height=700');
  detailsWindow.document.write(`
    <html>
      <head>
        <title>RFP Details - ${rfpItem.rfpTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
          .header { color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
          .status-${rfpItem.status.toLowerCase()} { 
            background-color: ${rfpItem.status === 'Won' ? '#dcfce7' : rfpItem.status === 'Lost' ? '#fef2f2' : '#fef3c7'}; 
            color: ${rfpItem.status === 'Won' ? '#166534' : rfpItem.status === 'Lost' ? '#991b1b' : '#92400e'};
            padding: 5px 10px; border-radius: 20px; font-weight: bold;
          }
          .metric { display: inline-block; margin: 10px 20px 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${rfpItem.rfpTitle}</h1>
          <span class="status-${rfpItem.status.toLowerCase()}">${rfpItem.status}</span>
        </div>
        
        <div class="section">
          <h2>Project Overview</h2>
          <div class="metric"><strong>Submitted:</strong> ${rfpItem.submittedDate}</div>
          <div class="metric"><strong>Value:</strong> ${rfpItem.value}</div>
          <div class="metric"><strong>Vendor:</strong> ${rfpItem.vendor}</div>
          <div class="metric"><strong>Match Score:</strong> ${rfpItem.matchScore}%</div>
        </div>
        
        <div class="section">
          <h2>Technical Analysis</h2>
          <p>This RFP was processed using our multi-agent system with the following results:</p>
          <ul>
            <li><strong>Sales Agent:</strong> Successfully extracted requirements</li>
            <li><strong>Technical Agent:</strong> Achieved ${rfpItem.matchScore}% specification match</li>
            <li><strong>Pricing Agent:</strong> Optimized cost structure</li>
            <li><strong>Main Agent:</strong> Orchestrated comprehensive response</li>
          </ul>
        </div>
        
        <div class="section">
          <h2>Outcome Analysis</h2>
          <p><strong>Result:</strong> ${rfpItem.status}</p>
          <p><strong>Key Factors:</strong></p>
          <ul>
            ${rfpItem.status === 'Won' ? 
              '<li>Competitive pricing strategy</li><li>High technical match score</li><li>Optimal vendor selection</li>' :
              '<li>Market competition analysis</li><li>Areas for improvement identified</li><li>Lessons learned documented</li>'
            }
          </ul>
        </div>
      </body>
    </html>
  `);
};

const downloadHistoryReport = (rfpItem) => {
  console.log('Downloading history report for:', rfpItem);
  
  const reportContent = `RFP RESPONSE REPORT
===================

Project: ${rfpItem.rfpTitle}
Submitted: ${rfpItem.submittedDate}
Status: ${rfpItem.status}
Value: ${rfpItem.value}
Vendor: ${rfpItem.vendor}
Match Score: ${rfpItem.matchScore}%

EXECUTIVE SUMMARY
================
This RFP was processed through our automated multi-agent system.
The technical match score of ${rfpItem.matchScore}% indicates ${rfpItem.matchScore > 85 ? 'excellent' : rfpItem.matchScore > 70 ? 'good' : 'moderate'} alignment with requirements.

OUTCOME
=======
Final Result: ${rfpItem.status}
${rfpItem.status === 'Won' ? 'Successfully secured this project through optimal vendor selection and competitive pricing.' : 
  rfpItem.status === 'Lost' ? 'Project not secured. Analysis indicates areas for improvement in future bids.' :
  'Response submitted and awaiting client decision.'}

Generated by Agentic RFP Automation Platform
Report Date: ${new Date().toLocaleDateString()}
`;

  downloadFile(reportContent, `RFP_Report_${rfpItem.id}_${Date.now()}.txt`, 'text/plain');
};

// Notification System
const showNotification = (message, type = 'info') => {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    'bg-blue-500 text-white'
  }`;
  notification.textContent = message;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
};

const parseRFPRequirements = (text, nlpEntities = null) => {
  console.log('Parsing RFP text with NLP enhancement...');
  
  // Use NLP entities if available
  const areas = nlpEntities?.quantities || [];
  const coverages = nlpEntities?.coverages || [];
  const costs = nlpEntities?.costs || [];
  const materials = nlpEntities?.materials || [];
  const certifications = nlpEntities?.certifications || [];
  
  // Fallback to regex if NLP didn't find entities
  if (areas.length === 0) {
    const areaMatches = text.match(/(\d+(?:,\d{3})*)\s*(?:sq\s*ft|sqft|square\s*feet)/gi) || [];
    areas.push(...areaMatches.map(match => parseInt(match.replace(/,/g, '').match(/\d+/)[0])));
  }
  
  if (coverages.length === 0) {
    const coverageMatches = text.match(/(\d+)\s*(?:sq\s*ft\s*per\s*liter|sqft\/liter)/gi) || [];
    coverages.push(...coverageMatches.map(match => parseInt(match.match(/\d+/)[0])));
  }
  
  if (costs.length === 0) {
    const moneyMatches = text.match(/\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/g) || [];
    costs.push(...moneyMatches.map(match => parseFloat(match.replace(/[\$,]/g, ''))));
  }
  
  const requirements = [];
  
  // Create requirements based on extracted data
  if (areas.length === 0) {
    areas.push(25000, 20000); // Default areas
  }
  
  requirements.push(
    { 
      id: 'A', 
      area: areas[0] || 25000, 
      specs: { 
        finish: 'Matt', 
        coverage: coverages[0] || 130, 
        minDurability: 10,
        category: 'Exterior',
        materials: materials.length > 0 ? materials : ['paint'],
        certifications: certifications
      }
    },
    { 
      id: 'B', 
      area: areas[1] || 20000, 
      specs: { 
        finish: 'Silk', 
        coverage: 110, 
        minDurability: 8, 
        laborFee: costs[0] || 3000,
        category: 'Interior',
        materials: materials.length > 0 ? materials : ['paint'],
        certifications: certifications
      }
    }
  );
  
  // Use NLP-extracted deadline if available
  let deadline = nlpEntities?.deadlines?.[0] || '2024-12-15';
  
  // Fallback to regex
  if (!nlpEntities?.deadlines?.length) {
    const deadlineMatch = text.match(/(?:deadline|due|completion).*?(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4})/i);
    if (deadlineMatch) {
      const dateStr = deadlineMatch[1];
      if (dateStr.includes('/')) {
        const [month, day, year] = dateStr.split('/');
        deadline = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else if (dateStr.includes('-') && dateStr.length === 10) {
        deadline = dateStr;
      }
    }
  }
  
  const totalSqFt = areas.reduce((sum, area) => sum + area, 0) || 50000;
  
  console.log(`✅ Parsed ${requirements.length} requirements, total area: ${totalSqFt} sq ft`);
  
  return {
    deadline,
    totalSqFt,
    requirements
  };
};

const calculateRiskLevel = (deadline) => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysLeft < 30) return 'High';
  if (daysLeft < 60) return 'Medium';
  return 'Low';
};

const calculateOverallMatchScore = (matchedRequirements) => {
  const scores = matchedRequirements.flatMap(req => 
    Object.values(req.vendorMatches).map(match => match.matchScore)
  );
  return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
};

const calculateVendorScore = (price, reliability, leadTime) => {
  const priceScore = Math.max(0, 100 - (price / 1000));
  const reliabilityScore = reliability;
  const timeScore = Math.max(0, 100 - leadTime * 2);
  
  return (priceScore * 0.4 + reliabilityScore * 0.4 + timeScore * 0.2);
};

// Win Probability Calculator - Enhanced with Historical Data
const calculateWinProbability = (rfpAnalysis) => {
  const matchScore = rfpAnalysis.overallMatchScore || 75;
  const avgReliability = rfpAnalysis.pricingDetails?.avgReliability || 90;
  const competitiveScore = rfpAnalysis.pricingDetails?.score || 75;
  const vendor = rfpAnalysis.recommendedVendor;
  const finalPrice = rfpAnalysis.pricingDetails?.finalPrice || 50000;
  
  // Get historical prediction
  console.log('📊 Analyzing historical data for win probability...');
  const historicalProbability = historicalDataAnalyzer.predictWinProbability(
    matchScore,
    finalPrice,
    vendor
  );
  console.log(`📈 Historical win probability: ${historicalProbability.toFixed(1)}%`);
  
  // Get vendor performance
  const vendorPerf = historicalDataAnalyzer.getVendorPerformance(vendor);
  const vendorWinRate = vendorPerf?.winRate || 72;
  console.log(`🏆 ${vendor} historical win rate: ${vendorWinRate.toFixed(1)}%`);
  
  // Calculate factors
  const factors = {
    matchScore: matchScore,
    pricingCompetitiveness: (avgReliability * 0.4 + competitiveScore * 0.6),
    deadlineCompliance: 85, // Default good compliance
    historicalSuccess: historicalProbability
  };
  
  // Weighted formula with historical data
  const winProbability = (
    factors.matchScore * 0.35 +
    factors.pricingCompetitiveness * 0.30 +
    factors.deadlineCompliance * 0.20 +
    factors.historicalSuccess * 0.15
  );
  
  const probability = Math.round(winProbability);
  
  // Generate recommendation
  let recommendation;
  if (probability >= 80) {
    recommendation = {
      level: '🟢 HIGH',
      message: 'Strongly recommend bidding - Excellent win potential',
      action: 'Proceed with confidence'
    };
  } else if (probability >= 60) {
    recommendation = {
      level: '🟡 MEDIUM',
      message: 'Consider bidding with optimizations',
      action: 'Review pricing and timeline for improvements'
    };
  } else if (probability >= 40) {
    recommendation = {
      level: '🟠 LOW',
      message: 'Risky - Requires strategic pricing adjustments',
      action: 'Significant optimization needed'
    };
  } else {
    recommendation = {
      level: '🔴 VERY LOW',
      message: 'Not recommended unless strategic value exists',
      action: 'Consider passing or major strategy revision'
    };
  }
  
  // Get price forecast
  const priceForecast = historicalDataAnalyzer.forecastPrice(
    rfpAnalysis.totalSqFt || 50000,
    vendor
  );
  
  return {
    probability: probability,
    confidence: probability >= 75 ? 'High' : probability >= 55 ? 'Medium' : 'Low',
    factors: factors,
    recommendation: recommendation,
    riskLevel: probability >= 75 ? 'Low Risk' : probability >= 55 ? 'Medium Risk' : 'High Risk',
    historicalInsights: {
      vendorWinRate: vendorWinRate.toFixed(1),
      historicalProbability: historicalProbability.toFixed(1),
      priceForecast: priceForecast
    }
  };
};

// --- MAIN APPLICATION COMPONENT ---
const statusMap = {
  IDLE: { text: "System Ready", icon: Search },
  SCANNING: { text: "Sales Agent: Scanning for RFP Opportunities", icon: Globe },
  UPLOADING: { text: "Sales Agent: Processing PDF Upload", icon: Upload },
  SALES_SCANNING: { text: "Sales Agent: Analyzing Requirements", icon: Search },
  TECHNICAL_MATCHING: { text: "Technical Agent: Spec Matching & Scoring", icon: Sliders },
  PRICING_CALCULATING: { text: "Pricing Agent: Cost Optimization", icon: DollarSign },
  ORCHESTRATING: { text: "Main Agent: Orchestrating Final Response", icon: Zap },
  COMPLETE: { text: "RFP Response Generated Successfully!", icon: CheckCircle },
  ERROR: { text: "Workflow Error", icon: AlertCircle },
};

const App = () => {
  const [status, setStatus] = useState('IDLE');
  const [orchestratorOutput, setOrchestratorOutput] = useState(null);
  const [rfpText, setRfpText] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [detectedRfps, setDetectedRfps] = useState(DETECTED_RFPS);
  const [selectedRfp, setSelectedRfp] = useState(null);
  const [scannerResults, setScannerResults] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [knowledgeGraphInitialized, setKnowledgeGraphInitialized] = useState(false);
  const fileInputRef = useRef(null);
  
  // Default RFP text
  const DEFAULT_RFP = `REQUEST FOR PROPOSAL - Tender #PP-2024-001 | Commercial Building Paint Project
Deadline: 2024-12-15

PROJECT REQUIREMENTS:
We require painting services for a 50,000 sq ft commercial building complex.

Requirement A: Exterior Walls (25,000 sq ft)
- Finish Type: Weather-resistant Matt or Smooth finish
- Coverage: Minimum 120 sq ft per liter
- Durability: Must last minimum 10 years
- Application: Spray/Roller application

Requirement B: Interior Walls (25,000 sq ft)
- Finish Type: Silk or Satin finish preferred
- Coverage: Minimum 100 sq ft per liter  
- Durability: Minimum 8 years expected life
- Note: Include primer cost and labor charges of $5000.`;

  // Initialize with default text
  useEffect(() => {
    if (!rfpText) {
      setRfpText(DEFAULT_RFP);
    }
  }, [rfpText]);
  
  // Initialize knowledge graph and historical data
  useEffect(() => {
    if (!knowledgeGraphInitialized) {
      console.log('🧠 Initializing Knowledge Graph...');
      buildKnowledgeGraph(PRODUCT_REPOSITORY);
      console.log('✅ Knowledge Graph initialized');
      
      console.log('📊 Initializing Historical Data...');
      initializeHistoricalData();
      console.log('✅ Historical Data initialized');
      
      setKnowledgeGraphInitialized(true);
    }
  }, [knowledgeGraphInitialized]);

  // Auto-scan simulation (simplified)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (status === 'IDLE') {
        // Simulate periodic RFP discovery
        const mockResults = {
          scannedSources: RFP_SOURCES.length,
          newRfpsFound: Math.floor(Math.random() * 3),
          totalActive: DETECTED_RFPS.length,
          newRfps: []
        };
        setScannerResults(mockResults);
      }
    }, 30000); // Scan every 30 seconds

    return () => clearInterval(interval);
  }, [status]);

  // File upload handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setStatus('UPLOADING');
      
      try {
        const extractedText = await extractTextFromPDF(file);
        setRfpText(extractedText);
        setStatus('IDLE');
      } catch (error) {
        console.error('PDF processing failed:', error);
        setStatus('ERROR');
      }
    }
  };

  // Manual RFP scan trigger (simplified)
  const triggerRfpScan = async () => {
    setStatus('SCANNING');
    try {
      await delay(2000);
      const results = {
        scannedSources: RFP_SOURCES.length,
        newRfpsFound: Math.floor(Math.random() * 5) + 1,
        totalActive: DETECTED_RFPS.length + Math.floor(Math.random() * 3),
        newRfps: []
      };
      setScannerResults(results);
      setStatus('IDLE');
    } catch (error) {
      console.error('RFP scanning failed:', error);
      setStatus('ERROR');
    }
  };

  // Main orchestrator function - Enhanced workflow with audit logging and win probability
  const runOrchestrator = useCallback(async (inputRfp = null) => {
    if (status !== 'IDLE' && status !== 'COMPLETE') return;
    
    const rfpId = `RFP_${Date.now()}`;
    
    // Log workflow start
    auditLogger.logAgentAction(
      'System',
      'Workflow Started',
      { rfpId, inputType: uploadedFile ? 'PDF Upload' : 'Text Input' },
      'Initiating multi-agent RFP processing workflow'
    );
    
    setStatus('SALES_SCANNING');
    setOrchestratorOutput(null);
    
    try {
      // Step 1: Sales Agent Analysis
      auditLogger.logAgentAction('Sales Agent', 'Processing Started', { rfpId }, 'Analyzing RFP and extracting requirements');
      const salesResult = await salesAgent(inputRfp || rfpText, !!uploadedFile);
      auditLogger.logAgentAction('Sales Agent', 'Processing Complete', { rfpId, requirementsFound: salesResult.requirements.length }, `Extracted ${salesResult.requirements.length} requirements`);
      setStatus('TECHNICAL_MATCHING');
      
      // Step 2: Technical Agent Spec Matching
      auditLogger.logAgentAction('Technical Agent', 'Matching Started', { rfpId }, 'Performing specification matching across vendors');
      const technicalResult = await technicalAgent(salesResult);
      auditLogger.logAgentAction('Technical Agent', 'Matching Complete', { rfpId, matchScore: technicalResult.overallMatchScore }, `Achieved ${technicalResult.overallMatchScore}% match score`);
      setStatus('PRICING_CALCULATING');
      
      // Step 3: Pricing Agent Cost Calculation
      auditLogger.logAgentAction('Pricing Agent', 'Pricing Started', { rfpId }, 'Calculating comprehensive pricing');
      const pricingResult = await pricingAgent(technicalResult);
      auditLogger.logAgentAction('Pricing Agent', 'Pricing Complete', { rfpId, vendor: pricingResult.recommendedVendor, price: pricingResult.pricingDetails.finalPrice }, `Recommended ${pricingResult.recommendedVendor} at $${pricingResult.pricingDetails.finalPrice.toLocaleString()}`);
      setStatus('ORCHESTRATING');
      
      // Step 4: Main Agent (Orchestrator) - Final compilation
      auditLogger.logAgentAction('Main Agent', 'Orchestration Started', { rfpId }, 'Compiling final report and calculating win probability');
      const reportResult = await mainAgent(pricingResult);
      
      // Calculate Win Probability
      const winProbability = calculateWinProbability(pricingResult);
      auditLogger.logAgentAction('Main Agent', 'Win Probability Calculated', { rfpId, probability: winProbability.probability }, `Win probability: ${winProbability.probability}% (${winProbability.recommendation.level})`);
      
      // Final output compilation
      await delay(500);
      const finalOutput = { 
        ...pricingResult, 
        report: reportResult,
        winProbability: winProbability,
        rfpId: rfpId,
        auditTrail: auditLogger.getAuditTrail(rfpId)
      };
      
      auditLogger.logAgentAction('Main Agent', 'Orchestration Complete', { rfpId }, 'RFP response generated successfully');
      setOrchestratorOutput(finalOutput);
      setStatus('COMPLETE');
      
      // Update RFP status if processing detected RFP
      if (selectedRfp) {
        setDetectedRfps(prev => prev.map(rfp => 
          rfp.id === selectedRfp.id 
            ? { ...rfp, status: 'responded', matchScore: finalOutput.overallMatchScore }
            : rfp
        ));
      }
      
    } catch (error) {
      console.error("Agent Workflow Failed:", error);
      auditLogger.logAgentAction('System', 'Workflow Failed', { rfpId, error: error.message }, `Error: ${error.message}`);
      setOrchestratorOutput({ error: error.message || "Unknown error during processing." });
      setStatus('ERROR');
    }
  }, [rfpText, uploadedFile, status, selectedRfp]);

  const CurrentIcon = statusMap[status]?.icon;

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-inter antialiased">
      <div className="max-w-7xl mx-auto">
        <header className="text-center py-8 bg-white rounded-xl shadow-lg mb-6">
          <h1 className="text-4xl font-black text-indigo-700">Agentic RFP Automation Platform</h1>
          <p className="text-gray-500 mt-2">End-to-End Automated RFP Response • Multi-Agent Workflow • Real-time Analytics</p>
        </header>

        {/* Enhanced Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b overflow-x-auto">
            <TabButton 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
              icon={BarChart3}
              text="Live Dashboard"
            />
            <TabButton 
              active={activeTab === 'rfp-scanner'} 
              onClick={() => setActiveTab('rfp-scanner')}
              icon={Globe}
              text="RFP Scanner"
            />
            <TabButton 
              active={activeTab === 'workflow'} 
              onClick={() => setActiveTab('workflow')}
              icon={Zap}
              text="Agent Workflow"
            />
            <TabButton 
              active={activeTab === 'analytics'} 
              onClick={() => setActiveTab('analytics')}
              icon={TrendingUp}
              text="Analytics"
            />
            <TabButton 
              active={activeTab === 'vendors'} 
              onClick={() => setActiveTab('vendors')}
              icon={Users}
              text="Vendor Analysis"
            />
            <TabButton 
              active={activeTab === 'history'} 
              onClick={() => setActiveTab('history')}
              icon={History}
              text="Response History"
            />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <DashboardTab 
            status={status}
            CurrentIcon={CurrentIcon}
            statusMap={statusMap}
            detectedRfps={detectedRfps}
            scannerResults={scannerResults}
            triggerRfpScan={triggerRfpScan}
            orchestratorOutput={orchestratorOutput}
            setActiveTab={setActiveTab}
            fileInputRef={fileInputRef}
          />
        )}

        {activeTab === 'rfp-scanner' && (
          <RfpScannerTab 
            detectedRfps={detectedRfps}
            setSelectedRfp={setSelectedRfp}
            selectedRfp={selectedRfp}
            runOrchestrator={runOrchestrator}
            scannerResults={scannerResults}
            triggerRfpScan={triggerRfpScan}
          />
        )}

        {activeTab === 'workflow' && (
          <WorkflowTab 
            status={status}
            CurrentIcon={CurrentIcon}
            statusMap={statusMap}
            runOrchestrator={runOrchestrator}
            rfpText={rfpText}
            setRfpText={setRfpText}
            handleFileUpload={handleFileUpload}
            fileInputRef={fileInputRef}
            uploadedFile={uploadedFile}
            orchestratorOutput={orchestratorOutput}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab />
        )}

        {activeTab === 'vendors' && orchestratorOutput && (
          <VendorComparisonTab orchestratorOutput={orchestratorOutput} />
        )}

        {activeTab === 'history' && (
          <HistoryTab />
        )}
      </div>
    </div>
  );
};

// --- TAB COMPONENTS ---
const TabButton = ({ active, onClick, icon: Icon, text }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-3 font-semibold transition-all whitespace-nowrap ${
      active 
        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' 
        : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    <Icon className="w-4 h-4 mr-2" />
    {text}
  </button>
);

// 1. Live Dashboard Tab
const DashboardTab = ({ status, CurrentIcon, statusMap, detectedRfps, scannerResults, triggerRfpScan, orchestratorOutput, setActiveTab, fileInputRef }) => (
  <div className="space-y-6">
    {/* System Status */}
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <CurrentIcon className={`w-8 h-8 ${
            status === 'COMPLETE' ? 'text-green-500' : 
            status === 'IDLE' ? 'text-gray-400' : 
            'text-indigo-500 animate-spin-slow'
          }`} />
          <div>
            <h2 className="text-xl font-bold text-gray-800">System Status</h2>
            <p className={`text-sm ${status === 'COMPLETE' ? 'text-green-700' : 'text-gray-600'}`}>
              {statusMap[status]?.text}
            </p>
          </div>
        </div>
        
        <button
          onClick={triggerRfpScan}
          disabled={status !== 'IDLE'}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Globe className="w-4 h-4 mr-2" />
          Scan RFPs
        </button>
      </div>
      
      {scannerResults && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{scannerResults.scannedSources}</div>
            <div className="text-sm text-gray-600">Sources Scanned</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{scannerResults.newRfpsFound}</div>
            <div className="text-sm text-gray-600">New RFPs Found</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{scannerResults.totalActive}</div>
            <div className="text-sm text-gray-600">Total Active RFPs</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {detectedRfps.filter(rfp => rfp.status === 'responded').length}
            </div>
            <div className="text-sm text-gray-600">Responses Generated</div>
          </div>
        </div>
      )}
    </div>

    {/* Recent RFPs */}
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Recent RFP Opportunities</h3>
      <div className="space-y-3">
        {detectedRfps.slice(0, 3).map((rfp) => (
          <div key={rfp.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{rfp.title}</h4>
              <p className="text-sm text-gray-600">{rfp.source} • {rfp.value} • {rfp.daysLeft} days left</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                rfp.status === 'new' ? 'bg-blue-100 text-blue-800' :
                rfp.status === 'analyzed' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {rfp.status.toUpperCase()}
              </span>
              {rfp.matchScore && (
                <span className="text-sm font-bold text-indigo-600">{rfp.matchScore}% Match</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Quick Actions */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-lg text-center">
        <Globe className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Auto-Scan RFPs</h3>
        <p className="text-sm text-gray-600 mb-4">Continuously monitor configured sources for new opportunities</p>
        <button 
          onClick={() => {
            console.log('Configure Sources clicked');
            setActiveTab('rfp-scanner');
          }}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Configure Sources
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg text-center">
        <Upload className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload RFP</h3>
        <p className="text-sm text-gray-600 mb-4">Process individual RFP documents manually</p>
        <button 
          onClick={() => {
            console.log('Upload Document clicked');
            setActiveTab('workflow');
            setTimeout(() => fileInputRef.current?.click(), 100);
          }}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Upload Document
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg text-center">
        <Download className="w-12 h-12 text-purple-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Export Reports</h3>
        <p className="text-sm text-gray-600 mb-4">Download generated responses and analytics</p>
        <button 
          onClick={() => {
            console.log('View Reports clicked');
            setActiveTab('history');
          }}
          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          View Reports
        </button>
      </div>
    </div>
  </div>
);

// 2. RFP Scanner Tab
const RfpScannerTab = ({ detectedRfps, setSelectedRfp, selectedRfp, runOrchestrator, scannerResults, triggerRfpScan }) => (
  <div className="space-y-6">
    {/* Scanner Controls */}
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">RFP Detection & Scanning</h2>
        <button
          onClick={triggerRfpScan}
          className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Scan
        </button>
      </div>
      
      {/* Source Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {RFP_SOURCES.map((source) => (
          <div key={source.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{source.name}</h3>
              <span className={`w-3 h-3 rounded-full ${
                source.status === 'active' ? 'bg-green-500' : 
                source.status === 'scanning' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{source.url}</p>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Last scan: {source.lastScan}</span>
              <span>{source.rfpsFound} RFPs found</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Detected RFPs */}
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Detected RFP Opportunities</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">RFP Title</th>
              <th className="text-left py-3 px-4">Source</th>
              <th className="text-left py-3 px-4">Value</th>
              <th className="text-left py-3 px-4">Deadline</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Match Score</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {detectedRfps.map((rfp) => (
              <tr key={rfp.id} className={`border-b hover:bg-gray-50 ${
                selectedRfp?.id === rfp.id ? 'bg-indigo-50' : ''
              }`}>
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-gray-800">{rfp.title}</div>
                    <div className="text-xs text-gray-500">
                      {rfp.requirements.area.toLocaleString()} sq ft • {rfp.requirements.type}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600">{rfp.source}</td>
                <td className="py-3 px-4 font-semibold text-green-600">{rfp.value}</td>
                <td className="py-3 px-4">
                  <div className="text-gray-800">{rfp.deadline}</div>
                  <div className={`text-xs ${
                    rfp.daysLeft < 30 ? 'text-red-500' : 
                    rfp.daysLeft < 60 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {rfp.daysLeft} days left
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    rfp.status === 'new' ? 'bg-blue-100 text-blue-800' :
                    rfp.status === 'analyzed' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {rfp.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {rfp.matchScore ? (
                    <span className="font-bold text-indigo-600">{rfp.matchScore}%</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedRfp(rfp)}
                      className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                    >
                      Select
                    </button>
                    {selectedRfp?.id === rfp.id && (
                      <button
                        onClick={() => runOrchestrator(rfp.title)}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Process
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// 3. Enhanced Workflow Tab
const WorkflowTab = ({ 
  status, CurrentIcon, statusMap, runOrchestrator, rfpText, setRfpText, 
  handleFileUpload, fileInputRef, uploadedFile, orchestratorOutput 
}) => (
  <div className="space-y-6">
    {/* Control Panel */}
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center space-x-3">
          <CurrentIcon className={`w-8 h-8 ${
            status === 'COMPLETE' ? 'text-green-500' : 
            status === 'IDLE' ? 'text-gray-400' : 
            'text-indigo-500 animate-spin-slow'
          }`} />
          <span className={`text-xl font-semibold ${
            status === 'COMPLETE' ? 'text-green-700' : 'text-gray-800'
          }`}>
            {statusMap[status]?.text}
          </span>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload PDF
          </button>
          
          <button
            onClick={() => runOrchestrator()}
            disabled={status !== 'IDLE' && status !== 'COMPLETE' && status !== 'ERROR'}
            className={`flex items-center px-6 py-2 rounded-lg text-white font-bold transition-all ${
              status === 'IDLE' || status === 'COMPLETE' || status === 'ERROR'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                : 'bg-gray-400 cursor-not-allowed opacity-75'
            }`}
          >
            <Zap className="w-5 h-5 mr-2" />
            {status === 'COMPLETE' ? 'Process Another' : 'Start Agent Workflow'}
          </button>
        </div>
      </div>
      
      {uploadedFile && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-700 mb-2">
            <FileText className="w-4 h-4 mr-2" />
            <span className="font-medium">PDF Processed: {uploadedFile.name}</span>
          </div>
          <div className="text-sm text-green-600">
            ✓ Text extraction completed - Requirements parsed from PDF content
          </div>
          <div className="text-xs text-green-500 mt-1">
            File size: {(uploadedFile.size / 1024).toFixed(1)} KB
          </div>
        </div>
      )}
    </div>

    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileUpload}
      accept=".pdf"
      className="hidden"
    />

    {/* Input & Workflow */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* RFP Input */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">RFP Input</h2>
        <textarea
          value={rfpText}
          onChange={(e) => setRfpText(e.target.value)}
          className="w-full h-80 p-3 border border-gray-200 rounded-lg text-sm font-mono resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Paste RFP text here or upload a PDF..."
        />
      </div>
      
      {/* Enhanced Workflow Visualization */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Multi-Agent Workflow</h2>
        <div className="space-y-4">
          <WorkflowStep status={status} stepKey="SALES_SCANNING" title="Sales Agent" description="RFP analysis and requirement extraction" />
          <WorkflowStep status={status} stepKey="TECHNICAL_MATCHING" title="Technical Agent" description="Spec matching across Asian Paints, Berger Paints, Nerolac Paints" />
          <WorkflowStep status={status} stepKey="PRICING_CALCULATING" title="Pricing Agent" description="Cost optimization with testing requirements" />
          <WorkflowStep status={status} stepKey="ORCHESTRATING" title="Main Agent (Orchestrator)" description="Final workflow orchestration and report generation" />
        </div>
      </div>
    </div>

    {/* Results */}
    {orchestratorOutput && <EnhancedResultsPanel orchestratorOutput={orchestratorOutput} />}
  </div>
);

// 4. Enhanced Analytics Tab
const AnalyticsTab = () => {
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];
  
  return (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <MetricCard title="RFPs Processed" value="156" change="+23%" icon={FileText} color="bg-blue-500" />
        <MetricCard title="Win Rate" value="78%" change="+12%" icon={Award} color="bg-green-500" />
        <MetricCard title="Avg Response Time" value="2.4hrs" change="-35%" icon={Clock} color="bg-purple-500" />
        <MetricCard title="Match Accuracy" value="94%" change="+8%" icon={Target} color="bg-orange-500" />
        <MetricCard title="Total Value Won" value="$2.1M" change="+45%" icon={DollarSign} color="bg-indigo-500" />
      </div>

      {/* Advanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RFP Processing Pipeline */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">RFP Processing Pipeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { stage: 'Detected', count: 45 },
              { stage: 'Analyzed', count: 38 },
              { stage: 'Matched', count: 32 },
              { stage: 'Priced', count: 28 },
              { stage: 'Submitted', count: 25 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Vendor Performance Comparison */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Vendor Success Rates</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { vendor: 'Asian Paints', winRate: 72, avgScore: 89 },
              { vendor: 'Berger Paints', winRate: 75, avgScore: 91 },
              { vendor: 'Nerolac Paints', winRate: 68, avgScore: 87 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vendor" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="winRate" fill="#8884d8" name="Win Rate %" />
              <Bar dataKey="avgScore" fill="#82ca9d" name="Avg Match Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Performance Table */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Agent Performance Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Agent</th>
                <th className="text-left py-3 px-4">Tasks Completed</th>
                <th className="text-left py-3 px-4">Avg Processing Time</th>
                <th className="text-left py-3 px-4">Accuracy Rate</th>
                <th className="text-left py-3 px-4">Performance Score</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">Sales Agent</td>
                <td className="py-3 px-4">156</td>
                <td className="py-3 px-4">45 seconds</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">96%</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                    </div>
                    <span className="text-xs">96</span>
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">Technical Agent</td>
                <td className="py-3 px-4">142</td>
                <td className="py-3 px-4">2.1 minutes</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">94%</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                    <span className="text-xs">94</span>
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">Pricing Agent</td>
                <td className="py-3 px-4">138</td>
                <td className="py-3 px-4">1.8 minutes</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">98%</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                    <span className="text-xs">98</span>
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">Main Agent</td>
                <td className="py-3 px-4">138</td>
                <td className="py-3 px-4">1.2 minutes</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">99%</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '99%' }}></div>
                    </div>
                    <span className="text-xs">99</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 5. Vendor Comparison Tab
const VendorComparisonTab = ({ orchestratorOutput }) => {
  if (!orchestratorOutput?.vendorQuotes) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Vendor Analysis Available</h3>
        <p className="text-gray-500">Process an RFP first to see detailed vendor comparisons.</p>
      </div>
    );
  }

  const quotes = Object.values(orchestratorOutput.vendorQuotes);
  const recommended = orchestratorOutput.recommendedVendor;

  return (
    <div className="space-y-6">
      {/* Recommended Vendor Highlight */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Recommended Vendor</h2>
            <p className="text-green-100">Optimal choice based on price, reliability, and delivery</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black">{recommended}</div>
            <div className="text-green-100">Match Score: {orchestratorOutput.overallMatchScore}%</div>
          </div>
        </div>
      </div>

      {/* Vendor Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quotes.map((quote) => (
          <VendorCard 
            key={quote.vendor} 
            quote={quote} 
            isRecommended={quote.vendor === recommended}
          />
        ))}
      </div>

      {/* Detailed Comparison */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Comprehensive Vendor Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Vendor</th>
                <th className="text-left py-3 px-4">Final Price</th>
                <th className="text-left py-3 px-4">Testing Costs</th>
                <th className="text-left py-3 px-4">Reliability</th>
                <th className="text-left py-3 px-4">Lead Time</th>
                <th className="text-left py-3 px-4">Overall Score</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.vendor} className={`border-b hover:bg-gray-50 ${
                  quote.vendor === recommended ? 'bg-green-50' : ''
                }`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="font-medium">{quote.vendor}</span>
                      {quote.vendor === recommended && (
                        <Award className="w-4 h-4 text-green-500 ml-2" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold">${quote.finalPrice.toLocaleString()}</td>
                  <td className="py-3 px-4">${quote.totalTestingCosts?.toFixed(2) || '0.00'}</td>
                  <td className="py-3 px-4">{quote.avgReliability}%</td>
                  <td className="py-3 px-4">{quote.maxLeadTime} days</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      quote.vendor === recommended 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {quote.score.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 6. History Tab
const HistoryTab = () => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">RFP Response History</h2>
      
      <div className="space-y-4">
        {RFP_HISTORY.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{item.rfpTitle}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                item.status === 'Won' ? 'bg-green-100 text-green-800' :
                item.status === 'Lost' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {item.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Submitted:</span> {item.submittedDate}
              </div>
              <div>
                <span className="font-medium">Value:</span> {item.value}
              </div>
              <div>
                <span className="font-medium">Vendor:</span> {item.vendor}
              </div>
              <div>
                <span className="font-medium">Match Score:</span> {item.matchScore}%
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              <button 
                onClick={() => viewRfpDetails(item)}
                className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors"
              >
                View Details
              </button>
              <button 
                onClick={() => downloadHistoryReport(item)}
                className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
              >
                Download Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- UTILITY COMPONENTS ---
const MetricCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {change} from last month
        </p>
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const VendorCard = ({ quote, isRecommended }) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg border-2 transition-all ${
    isRecommended ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'
  }`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-gray-800">{quote.vendor}</h3>
      {isRecommended && (
        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          RECOMMENDED
        </span>
      )}
    </div>
    
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-gray-600">Final Price:</span>
        <span className="font-bold text-lg">${quote.finalPrice.toLocaleString()}</span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-gray-600">Testing Costs:</span>
        <span className="font-medium">${quote.totalTestingCosts?.toFixed(2) || '0.00'}</span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-gray-600">Reliability:</span>
        <span className="font-medium">{quote.avgReliability}%</span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-gray-600">Lead Time:</span>
        <span className="font-medium">{quote.maxLeadTime} days</span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-gray-600">Score:</span>
        <span className={`font-bold ${isRecommended ? 'text-green-600' : 'text-gray-800'}`}>
          {quote.score.toFixed(1)}/100
        </span>
      </div>
    </div>
    
    <div className="mt-4 pt-4 border-t">
      <div className="text-xs text-gray-500 space-y-1">
        <div>Material: ${quote.subtotalCost.toFixed(2)}</div>
        <div>Overhead: ${quote.overheadCost.toFixed(2)}</div>
        {quote.volumeDiscount > 0 && (
          <div className="text-green-600">Volume Discount: -${quote.volumeDiscount.toFixed(2)}</div>
        )}
      </div>
    </div>
  </div>
);

const WorkflowStep = ({ status, stepKey, title, description }) => {
  const isCurrent = status === stepKey;
  const isCompleted = ['TECHNICAL_MATCHING', 'PRICING_CALCULATING', 'ORCHESTRATING', 'COMPLETE'].includes(status) &&
    (stepKey === 'SALES_SCANNING' || 
     (stepKey === 'TECHNICAL_MATCHING' && ['PRICING_CALCULATING', 'ORCHESTRATING', 'COMPLETE'].includes(status)) ||
     (stepKey === 'PRICING_CALCULATING' && ['ORCHESTRATING', 'COMPLETE'].includes(status)) ||
     (stepKey === 'ORCHESTRATING' && status === 'COMPLETE'));
  
  let dotColor = 'bg-gray-300';
  if (isCompleted) dotColor = 'bg-green-500';
  if (isCurrent) dotColor = 'bg-indigo-500 animate-pulse';
  
  return (
    <div className="flex items-start">
      <div className={`w-3 h-3 rounded-full mt-1.5 mr-4 ${dotColor}`}></div>
      <div className="flex-1">
        <h4 className={`text-base font-semibold ${
          isCurrent ? 'text-indigo-600' : 
          isCompleted ? 'text-gray-700' : 'text-gray-500'
        }`}>
          {title}
        </h4>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
};

const EnhancedResultsPanel = ({ orchestratorOutput }) => {
  if (orchestratorOutput.error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
        <p className="font-semibold">Error:</p>
        <p>{orchestratorOutput.error}</p>
      </div>
    );
  }

  const { pricingDetails, recommendedVendor, vendorQuotes, report, overallMatchScore, winProbability } = orchestratorOutput;
  const vendorCount = Object.keys(vendorQuotes).length;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
        Comprehensive RFP Response Generated
      </h2>

      {/* Win Probability Banner */}
      {winProbability && (
        <div className={`mb-6 p-6 rounded-xl border-2 ${
          winProbability.probability >= 80 ? 'bg-green-50 border-green-500' :
          winProbability.probability >= 60 ? 'bg-yellow-50 border-yellow-500' :
          winProbability.probability >= 40 ? 'bg-orange-50 border-orange-500' :
          'bg-red-50 border-red-500'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Win Probability: {winProbability.probability}%
              </h3>
              <p className="text-lg font-semibold">{winProbability.recommendation.level}</p>
              <p className="text-gray-700 mt-1">{winProbability.recommendation.message}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Confidence: {winProbability.confidence}</div>
              <div className="text-sm text-gray-600">Risk: {winProbability.riskLevel}</div>
              <div className="mt-2 px-4 py-2 bg-white rounded-lg shadow">
                <Target className="w-8 h-8 mx-auto text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
            <div>
              <div className="text-xs text-gray-600">Match Score</div>
              <div className="text-lg font-bold">{winProbability.factors.matchScore.toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Pricing</div>
              <div className="text-lg font-bold">{winProbability.factors.pricingCompetitiveness.toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Deadline</div>
              <div className="text-lg font-bold">{winProbability.factors.deadlineCompliance.toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Historical</div>
              <div className="text-lg font-bold">{winProbability.factors.historicalSuccess.toFixed(0)}%</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg">
            <p className="text-sm font-medium text-gray-700">
              <strong>Recommended Action:</strong> {winProbability.recommendation.action}
            </p>
          </div>
        </div>
      )}

      {/* Enhanced Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="text-center p-4 bg-indigo-50 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600">{vendorCount}</div>
          <div className="text-sm text-gray-600">Vendors Analyzed</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{recommendedVendor}</div>
          <div className="text-sm text-gray-600">Best Vendor</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">${pricingDetails.finalPrice.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Final Quote</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{overallMatchScore}%</div>
          <div className="text-sm text-gray-600">Match Score</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{pricingDetails.maxLeadTime}</div>
          <div className="text-sm text-gray-600">Days Delivery</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">${pricingDetails.totalTestingCosts?.toFixed(0) || '0'}</div>
          <div className="text-sm text-gray-600">Testing Costs</div>
        </div>
      </div>

      {/* Report Download Section */}
      {report && (
        <div className="border-t pt-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Generated Reports & Data Export</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button 
              onClick={() => downloadReport('pdf', report)}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF Report
            </button>
            <button 
              onClick={() => downloadReport('excel', report)}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Excel Analysis
            </button>
            <button 
              onClick={() => csvHandler.exportVendorQuotes(vendorQuotes)}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button 
              onClick={() => viewExecutiveSummary(report)}
              className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Summary
            </button>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            💡 <strong>New:</strong> Export vendor quotes to CSV for further analysis in Excel/Google Sheets
          </div>
        </div>
      )}

      {/* Quick Vendor Overview */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Vendor Comparison Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(vendorQuotes).map((quote) => (
            <div key={quote.vendor} className={`p-4 rounded-lg border-2 ${
              quote.vendor === recommendedVendor 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{quote.vendor}</span>
                {quote.vendor === recommendedVendor && (
                  <Award className="w-4 h-4 text-green-500" />
                )}
              </div>
              <div className="text-sm text-gray-600">
                <div>${quote.finalPrice.toLocaleString()} • {quote.avgReliability}% • {quote.maxLeadTime}d</div>
                <div className="text-xs mt-1">Score: {quote.score.toFixed(1)}/100</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// PDF extraction utility (simplified for demo)
const extractTextFromPDF = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      // Simulate PDF processing
      setTimeout(() => {
        resolve(`EXTRACTED FROM PDF: ${file.name}
        
REQUEST FOR PROPOSAL - Custom Paint Project
Deadline: ${new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}

PROJECT REQUIREMENTS:
Based on uploaded PDF: ${file.name}

Requirement A: Exterior Painting (${Math.floor(Math.random() * 20000) + 25000} sq ft)
- Finish Type: Weather-resistant Matt finish
- Coverage: Minimum 130 sq ft per liter
- Durability: 12+ years expected life

Requirement B: Interior Painting (${Math.floor(Math.random() * 15000) + 15000} sq ft)
- Finish Type: Silk finish preferred
- Coverage: Minimum 110 sq ft per liter
- Durability: 8+ years expected life
- Note: Include primer and labor charges of $${Math.floor(Math.random() * 2000) + 3000}`);
      }, 1500);
    };
    reader.readAsArrayBuffer(file);
  });
};

export default App;