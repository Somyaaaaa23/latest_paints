// Sales Agent - RFP Discovery and Initial Processing
export class SalesAgent {
  constructor() {
    this.name = "Sales Agent";
    this.role = "RFP Discovery & Initial Analysis";
    this.capabilities = [
      "RFP Discovery & Processing",
      "Document Text Extraction", 
      "Requirement Identification",
      "Opportunity Qualification",
      "Initial RFP Analysis"
    ];
  }

  // Main RFP Discovery Function
  async discoverRFPs() {
    console.log(`${this.name}: Starting RFP discovery process...`);
    
    // Simulate scanning multiple sources (for future use)
    // const sources = [
    //   { name: "Government Portal", url: "etenders.gov.in", active: true },
    //   { name: "Construction Board", url: "construction-rfps.com", active: true },
    //   { name: "Municipal Portal", url: "municipal-tenders.org", active: true }
    // ];

    await this.delay(2000);
    
    const discoveredRFPs = [
      {
        id: `RFP_${Date.now()}`,
        title: "Commercial Complex Painting Project",
        source: "Government Portal",
        deadline: "2024-12-20",
        estimatedValue: "$125,000",
        status: "discovered",
        rawText: this.generateMockRFPText(),
        discoveredAt: new Date().toISOString()
      }
    ];

    console.log(`${this.name}: Discovered ${discoveredRFPs.length} new RFPs`);
    return {
      agent: this.name,
      action: "rfp_discovery",
      results: discoveredRFPs,
      timestamp: new Date().toISOString()
    };
  }

  // Process individual RFP document
  async processRFPDocument(rfpData) {
    console.log(`${this.name}: Processing RFP document - ${rfpData.title}`);
    
    await this.delay(1500);
    
    // Extract structured requirements from RFP text
    const extractedRequirements = this.extractRequirements(rfpData.rawText || rfpData.content);
    
    const processedRFP = {
      ...rfpData,
      requirements: extractedRequirements,
      processingStatus: "requirements_extracted",
      processedBy: this.name,
      processedAt: new Date().toISOString()
    };

    console.log(`${this.name}: Extracted ${extractedRequirements.length} requirements`);
    
    return {
      agent: this.name,
      action: "document_processing",
      rfpData: processedRFP,
      extractedRequirements,
      confidence: 0.92,
      timestamp: new Date().toISOString()
    };
  }

  // Extract requirements from RFP text
  extractRequirements(text) {
    const requirements = [];
    
    // Extract area requirements
    const areaMatches = text.match(/(\d+(?:,\d{3})*)\s*(?:sq\s*ft|sqft|square\s*feet)/gi) || [];
    const areas = areaMatches.map(match => parseInt(match.replace(/,/g, '').match(/\d+/)[0]));
    
    // Extract finish types
    const finishMatches = text.match(/(matt|silk|smooth|satin|gloss)/gi) || [];
    
    // Extract coverage requirements
    const coverageMatches = text.match(/(\d+)\s*(?:sq\s*ft\s*per\s*liter)/gi) || [];
    const coverages = coverageMatches.map(match => parseInt(match.match(/\d+/)[0]));
    
    // Extract costs
    const costMatches = text.match(/\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/g) || [];
    const costs = costMatches.map(match => parseFloat(match.replace(/[\$,]/g, '')));

    // Create structured requirements
    if (areas.length > 0) {
      requirements.push({
        id: 'REQ_001',
        type: 'exterior_painting',
        area: areas[0] || 25000,
        finish: finishMatches[0] || 'Matt',
        coverage: coverages[0] || 130,
        durability: 10,
        priority: 'high'
      });
    }

    if (areas.length > 1) {
      requirements.push({
        id: 'REQ_002', 
        type: 'interior_painting',
        area: areas[1] || 20000,
        finish: finishMatches[1] || 'Silk',
        coverage: coverages[1] || 110,
        durability: 8,
        laborFee: costs[0] || 3000,
        priority: 'medium'
      });
    }

    // Default requirements if none extracted
    if (requirements.length === 0) {
      requirements.push(
        {
          id: 'REQ_001',
          type: 'exterior_painting', 
          area: 25000,
          finish: 'Matt',
          coverage: 130,
          durability: 10,
          priority: 'high'
        },
        {
          id: 'REQ_002',
          type: 'interior_painting',
          area: 20000, 
          finish: 'Silk',
          coverage: 110,
          durability: 8,
          laborFee: 3000,
          priority: 'medium'
        }
      );
    }

    return requirements;
  }

  // Generate mock RFP text for demo
  generateMockRFPText() {
    return `REQUEST FOR PROPOSAL - Commercial Complex Painting
Deadline: 2024-12-20

PROJECT REQUIREMENTS:
We require comprehensive painting services for a 45,000 sq ft commercial complex.

Requirement 1: Exterior Walls (25,000 sq ft)
- Finish Type: Weather-resistant Matt finish
- Coverage: Minimum 120 sq ft per liter
- Durability: Must last minimum 10 years

Requirement 2: Interior Spaces (20,000 sq ft)  
- Finish Type: Silk finish preferred
- Coverage: Minimum 100 sq ft per liter
- Durability: Minimum 8 years expected life
- Note: Include labor charges of $4,500`;
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