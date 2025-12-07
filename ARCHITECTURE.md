# 🏗️ System Architecture & Technical Documentation

## 📊 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE LAYER                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐│
│  │Dashboard │ │   RFP    │ │  Agent   │ │Analytics │ │  Vendor  │ │History││
│  │   Tab    │ │ Scanner  │ │ Workflow │ │   Tab    │ │ Analysis │ │  Tab  ││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ORCHESTRATION LAYER                                   │
│                                                                              │
│                    ┌────────────────────────────┐                           │
│                    │    MAIN AGENT              │                           │
│                    │   (Orchestrator)           │                           │
│                    │                            │                           │
│                    │  • Workflow Coordination   │                           │
│                    │  • Agent Communication     │                           │
│                    │  • Quality Assurance       │                           │
│                    │  • Report Generation       │                           │
│                    └────────────────────────────┘                           │
│                              │                                               │
│                    ┌─────────┼─────────┐                                    │
│                    │         │         │                                     │
└────────────────────┼─────────┼─────────┼─────────────────────────────────────┘
                     │         │         │
                     ▼         ▼         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AGENT PROCESSING LAYER                              │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │  SALES AGENT     │  │ TECHNICAL AGENT  │  │  PRICING AGENT   │         │
│  │                  │  │                  │  │                  │         │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │         │
│  │ │RFP Discovery │ │  │ │Spec Matching │ │  │ │Cost Calc     │ │         │
│  │ └──────────────┘ │  │ └──────────────┘ │  │ └──────────────┘ │         │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │         │
│  │ │Text Extract  │ │  │ │Vendor Compare│ │  │ │Price Compare │ │         │
│  │ └──────────────┘ │  │ └──────────────┘ │  │ └──────────────┘ │         │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │         │
│  │ │Requirement   │ │  │ │Compatibility │ │  │ │Volume Disc   │ │         │
│  │ │Parsing       │ │  │ │Assessment    │ │  │ │Analysis      │ │         │
│  │ └──────────────┘ │  │ └──────────────┘ │  │ └──────────────┘ │         │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │         │
│  │ │Qualification │ │  │ │Performance   │ │  │ │Margin Optim  │ │         │
│  │ └──────────────┘ │  │ │Scoring       │ │  │ └──────────────┘ │         │
│  │                  │  │ └──────────────┘ │  │                  │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│           │                     │                      │                     │
└───────────┼─────────────────────┼──────────────────────┼─────────────────────┘
            │                     │                      │
            ▼                     ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA PROCESSING LAYER                               │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   RFP Data   │  │   Product    │  │   Pricing    │  │   Testing    │   │
│  │  Repository  │  │  Repository  │  │    Rules     │  │ Requirements │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Vendor     │  │   History    │  │   Scanner    │  │   Memory     │   │
│  │   Catalog    │  │   Database   │  │   Sources    │  │    Layer     │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          OUTPUT GENERATION LAYER                             │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  PDF Report  │  │ Excel Export │  │  Executive   │  │   Detailed   │   │
│  │  Generation  │  │  (CSV)       │  │   Summary    │  │   Analysis   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Detailed Agent Workflow (SEQUENTIAL)

**Note:** Current implementation runs agents SEQUENTIALLY (one after another).
See PARALLEL_ARCHITECTURE.md for parallel optimization opportunities.

```
START
  │
  ▼
┌─────────────────────────────────────┐
│  1. RFP INPUT                       │
│  • Manual Upload (PDF)              │
│  • Auto-Discovery (Web Scanning)    │
│  • Text Input                       │
└─────────────────────────────────────┘
  │
  ▼ (WAIT - Sequential)
┌─────────────────────────────────────┐
│  2. SALES AGENT PROCESSING          │
│  ┌───────────────────────────────┐  │
│  │ Text Extraction               │  │
│  │   ↓                           │  │
│  │ Requirement Parsing           │  │
│  │   ↓                           │  │
│  │ Area Calculation              │  │
│  │   ↓                           │  │
│  │ Deadline Extraction           │  │
│  │   ↓                           │  │
│  │ Urgency Analysis              │  │
│  └───────────────────────────────┘  │
│  Output: Structured Requirements    │
└─────────────────────────────────────┘
  │
  ▼ (WAIT - Sequential)
┌─────────────────────────────────────┐
│  3. TECHNICAL AGENT PROCESSING      │
│  ┌───────────────────────────────┐  │
│  │ Load Product Catalogs         │  │
│  │   ↓                           │  │
│  │ For Each Requirement:         │  │
│  │   ├─ Match Finish Type        │  │
│  │   ├─ Match Coverage           │  │
│  │   ├─ Match Durability         │  │
│  │   ├─ Match Application        │  │
│  │   └─ Calculate Match Score    │  │
│  │   ↓                           │  │
│  │ Compare Across Vendors        │  │
│  │   ↓                           │  │
│  │ Rank by Match Score           │  │
│  └───────────────────────────────┘  │
│  Output: Vendor Matches + Scores    │
└─────────────────────────────────────┘
  │
  ▼ (WAIT - Sequential)
┌─────────────────────────────────────┐
│  4. PRICING AGENT PROCESSING        │
│  ┌───────────────────────────────┐  │
│  │ For Each Vendor:              │  │
│  │   ├─ Calculate Material Cost  │  │
│  │   ├─ Calculate Labor Cost     │  │
│  │   ├─ Calculate Testing Cost   │  │
│  │   ├─ Apply Volume Discounts   │  │
│  │   ├─ Add Overhead             │  │
│  │   └─ Apply Markup             │  │
│  │   ↓                           │  │
│  │ Calculate Competitive Score   │  │
│  │   ↓                           │  │
│  │ Select Optimal Vendor         │  │
│  └───────────────────────────────┘  │
│  Output: Vendor Quotes + Best Pick  │
└─────────────────────────────────────┘
  │
  ▼ (WAIT - Sequential)
┌─────────────────────────────────────┐
│  5. MAIN AGENT ORCHESTRATION        │
│  ┌───────────────────────────────┐  │
│  │ Validate All Results          │  │
│  │   ↓                           │  │
│  │ Generate Executive Summary    │  │
│  │   ↓                           │  │
│  │ Compile Technical Details     │  │
│  │   ↓                           │  │
│  │ Create Cost Breakdown         │  │
│  │   ↓                           │  │
│  │ Generate Reports (PDF/Excel)  │  │
│  │   ↓                           │  │
│  │ Quality Assurance Check       │  │
│  └───────────────────────────────┘  │
│  Output: Complete RFP Response      │
└─────────────────────────────────────┘
  │
  ▼
END (Response Ready for Submission)
```

## 🧮 Algorithm Models

### 1. Requirement Extraction Algorithm

```javascript
ALGORITHM: ExtractRequirements(rfpText)
INPUT: Raw RFP text string
OUTPUT: Structured requirements array

STEPS:
1. Initialize empty requirements array
2. Extract numerical data:
   - Area values using regex: /(\d+(?:,\d{3})*)\s*(?:sq\s*ft|sqft)/gi
   - Coverage values: /(\d+)\s*(?:sq\s*ft\s*per\s*liter)/gi
   - Cost values: /\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/g
   - Deadline dates: /(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/i

3. Extract categorical data:
   - Finish types: /(matt|silk|smooth|satin|gloss)/gi
   - Application types: /(exterior|interior|mixed)/gi

4. Structure requirements:
   FOR each extracted area:
     CREATE requirement object {
       id: unique identifier
       type: application type
       area: square footage
       finish: finish type
       coverage: coverage requirement
       durability: years expected
       priority: high/medium/low
     }
     ADD to requirements array

5. Apply defaults if extraction incomplete
6. RETURN structured requirements

TIME COMPLEXITY: O(n) where n = length of RFP text
SPACE COMPLEXITY: O(m) where m = number of requirements
```

### 2. Specification Matching Algorithm

```javascript
ALGORITHM: MatchSpecifications(requirement, productCatalog)
INPUT: Single requirement, vendor product catalog
OUTPUT: Matched products with scores

STEPS:
1. Initialize bestMatch = null, highestScore = 0

2. FOR each vendor in productCatalog:
     FOR each product in vendor.products:
       score = 0
       
       // Finish Matching (30 points)
       IF product.finish == requirement.finish:
         score += 30
       ELSE IF isCompatibleFinish(product.finish, requirement.finish):
         score += 20
       
       // Coverage Matching (25 points)
       IF product.coverage >= requirement.coverage:
         coverageRatio = min(product.coverage / requirement.coverage, 1.5)
         score += min(25 * coverageRatio, 25)
       ELSE:
         penalty = (requirement.coverage - product.coverage) / requirement.coverage
         score += max(25 * (1 - penalty), 0)
       
       // Durability Matching (20 points)
       IF product.durability >= requirement.durability:
         score += 20
       ELSE:
         score += (product.durability / requirement.durability) * 20
       
       // Application Type Matching (15 points)
       IF isCompatibleApplication(requirement.type, product.category):
         score += 15
       
       // Reliability Bonus (10 points)
       score += (product.reliability / 100) * 10
       
       IF score > highestScore:
         highestScore = score
         bestMatch = {product, score, vendor}

3. RETURN bestMatch

TIME COMPLEXITY: O(v * p) where v = vendors, p = products per vendor
SPACE COMPLEXITY: O(1)
```

### 3. Pricing Optimization Algorithm

```javascript
ALGORITHM: OptimizePricing(technicalMatches, pricingRules)
INPUT: Technical matches, pricing configuration
OUTPUT: Optimal vendor quote

STEPS:
1. Initialize vendorQuotes = {}

2. FOR each vendor in technicalMatches:
     totalMaterialCost = 0
     totalLaborCost = 0
     totalTestingCost = 0
     totalArea = 0
     
     FOR each requirement match:
       // Material Cost
       litersNeeded = requirement.area / product.coverage
       materialCost = litersNeeded * product.cost
       totalMaterialCost += materialCost
       
       // Labor Cost
       totalLaborCost += requirement.laborFee || 0
       
       // Testing Cost
       testingCost = calculateTestingCost(requirement)
       totalTestingCost += testingCost
       
       totalArea += requirement.area
     
     // Apply Volume Discount
     volumeDiscount = getVolumeDiscount(totalArea, pricingRules.volumeDiscounts)
     discountAmount = totalMaterialCost * volumeDiscount
     
     // Calculate Overhead
     overheadCost = totalArea * pricingRules.overheadPerSqFt
     
     // Calculate Final Price
     subtotal = totalMaterialCost + totalLaborCost + totalTestingCost 
                + overheadCost - discountAmount
     finalPrice = subtotal * (1 + pricingRules.markupPercentage)
     
     // Calculate Competitive Score
     priceScore = max(0, 100 - (finalPrice / 1000))
     reliabilityScore = vendor.avgReliability
     timeScore = max(0, 100 - (vendor.maxLeadTime * 3))
     competitiveScore = (priceScore * 0.4) + (reliabilityScore * 0.4) 
                       + (timeScore * 0.2)
     
     vendorQuotes[vendor] = {
       finalPrice,
       competitiveScore,
       breakdown: {...}
     }

3. bestVendor = vendor with highest competitiveScore
4. RETURN {vendorQuotes, bestVendor}

TIME COMPLEXITY: O(v * r) where v = vendors, r = requirements
SPACE COMPLEXITY: O(v)
```

### 4. Competitive Scoring Model

```
COMPETITIVE SCORE FORMULA:
═══════════════════════════

Score = (Price_Score × 0.4) + (Reliability_Score × 0.4) + (Time_Score × 0.2)

Where:
  Price_Score = max(0, 100 - (finalPrice / 1000))
  Reliability_Score = vendor.reliability (0-100)
  Time_Score = max(0, 100 - (leadTime × 3))

Weights:
  • Price: 40% - Cost competitiveness
  • Reliability: 40% - Quality and track record
  • Time: 20% - Delivery speed

Example:
  Vendor A: Price=$45,000, Reliability=95%, LeadTime=7 days
  Price_Score = 100 - (45000/1000) = 55
  Reliability_Score = 95
  Time_Score = 100 - (7×3) = 79
  
  Final Score = (55×0.4) + (95×0.4) + (79×0.2)
              = 22 + 38 + 15.8
              = 75.8
```

## 🛠️ Technology Stack

### Frontend Technologies

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  React 18.2.0                                               │
│  • Component-based architecture                             │
│  • Hooks (useState, useEffect, useCallback, useRef)         │
│  • Virtual DOM for performance                              │
│  • JSX for declarative UI                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    UI COMPONENTS                             │
├─────────────────────────────────────────────────────────────┤
│  Lucide React 0.263.1                                       │
│  • 1000+ customizable icons                                 │
│  • Tree-shakeable for optimal bundle size                   │
│  • Consistent design language                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    DATA VISUALIZATION                        │
├─────────────────────────────────────────────────────────────┤
│  Recharts 2.8.0                                             │
│  • Bar Charts - Vendor performance comparison               │
│  • Line Charts - RFP processing pipeline                    │
│  • Pie Charts - Cost distribution                           │
│  • Responsive containers                                    │
│  • Interactive tooltips                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    DOCUMENT PROCESSING                       │
├─────────────────────────────────────────────────────────────┤
│  PDF.js 3.11.174                                            │
│  • Client-side PDF parsing                                  │
│  • Text extraction from PDF documents                       │
│  • No server-side processing required                       │
│  • Secure local processing                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    STYLING                                   │
├─────────────────────────────────────────────────────────────┤
│  Tailwind CSS (via inline classes)                          │
│  • Utility-first CSS framework                              │
│  • Responsive design utilities                              │
│  • Custom color schemes                                     │
│  • Flexbox and Grid layouts                                 │
└─────────────────────────────────────────────────────────────┘
```

### Development Tools

```
┌─────────────────────────────────────────────────────────────┐
│                    BUILD TOOLS                               │
├─────────────────────────────────────────────────────────────┤
│  React Scripts 5.0.1                                        │
│  • Webpack bundling                                         │
│  • Babel transpilation                                      │
│  • Hot module replacement                                   │
│  • Development server                                       │
│  • Production optimization                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    PACKAGE MANAGEMENT                        │
├─────────────────────────────────────────────────────────────┤
│  npm / yarn                                                 │
│  • Dependency management                                    │
│  • Script execution                                         │
│  • Version control                                          │
└─────────────────────────────────────────────────────────────┘
```

### Runtime Environment

```
┌─────────────────────────────────────────────────────────────┐
│                    JAVASCRIPT RUNTIME                        │
├─────────────────────────────────────────────────────────────┤
│  Node.js (v14+)                                             │
│  • Server-side JavaScript execution                         │
│  • npm package ecosystem                                    │
│  • Build process execution                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    BROWSER COMPATIBILITY                     │
├─────────────────────────────────────────────────────────────┤
│  Modern Browsers                                            │
│  • Chrome (latest)                                          │
│  • Firefox (latest)                                         │
│  • Safari (latest)                                          │
│  • Edge (latest)                                            │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Key Technology Components

### 1. Agent Architecture Pattern

```
PATTERN: Multi-Agent System (MAS)
IMPLEMENTATION: Object-Oriented JavaScript Classes

Benefits:
✓ Modularity - Each agent is independent
✓ Scalability - Easy to add new agents
✓ Maintainability - Isolated concerns
✓ Testability - Individual agent testing
✓ Reusability - Agents can be reused

Structure:
class Agent {
  constructor(memoryLayer)
  async processTask(input)
  getStatus()
  delay(ms)
}
```

### 2. State Management

```
PATTERN: React Hooks (useState, useEffect)
IMPLEMENTATION: Component-level state

State Variables:
• status - Current workflow status
• orchestratorOutput - Final results
• rfpText - Input RFP text
• activeTab - Current UI tab
• uploadedFile - PDF file reference
• detectedRfps - RFP database
• selectedRfp - Currently selected RFP
• scannerResults - Scan results

Benefits:
✓ Simple and intuitive
✓ No external dependencies
✓ Built-in React feature
✓ Efficient re-rendering
```

### 3. Asynchronous Processing

```
PATTERN: Async/Await with Promises
IMPLEMENTATION: Sequential agent execution

Flow:
async function runOrchestrator() {
  const salesResult = await salesAgent(input)
  const techResult = await technicalAgent(salesResult)
  const priceResult = await pricingAgent(techResult)
  const finalResult = await mainAgent(priceResult)
  return finalResult
}

Benefits:
✓ Clean, readable code
✓ Error handling with try/catch
✓ Sequential execution guarantee
✓ Non-blocking UI
```

### 4. Data Processing Pipeline

```
PATTERN: Pipeline Architecture
IMPLEMENTATION: Functional composition

Pipeline Stages:
Input → Parse → Match → Price → Orchestrate → Output

Each stage:
• Receives structured data
• Processes independently
• Returns enhanced data
• Passes to next stage

Benefits:
✓ Clear data flow
✓ Easy debugging
✓ Stage isolation
✓ Testable units
```

### 5. Report Generation

```
PATTERN: Template Method
IMPLEMENTATION: HTML string generation

Process:
1. Create HTML template
2. Inject dynamic data
3. Open in new window
4. Trigger print dialog (PDF)
5. Or download as CSV (Excel)

Technologies:
• Window.open() for new window
• Document.write() for HTML injection
• Blob API for file downloads
• URL.createObjectURL() for download links
```

## 📊 Data Flow Architecture

```
┌─────────────┐
│  User Input │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Input Validation & Preprocessing   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Sales Agent                        │
│  • Text parsing                     │
│  • Requirement extraction           │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Technical Agent                    │
│  • Specification matching           │
│  • Vendor comparison                │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Pricing Agent                      │
│  • Cost calculation                 │
│  • Price optimization               │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Main Agent                         │
│  • Result compilation               │
│  • Report generation                │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────┐
│  Output     │
│  • PDF      │
│  • Excel    │
│  • Summary  │
└─────────────┘
```

## 🎯 Performance Characteristics

### Time Complexity Analysis

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| RFP Parsing | O(n) | n = text length |
| Spec Matching | O(v × p × r) | v=vendors, p=products, r=requirements |
| Price Calculation | O(v × r) | v=vendors, r=requirements |
| Report Generation | O(1) | Fixed template |
| Overall Workflow | O(v × p × r) | Dominated by spec matching |

### Space Complexity Analysis

| Component | Complexity | Notes |
|-----------|-----------|-------|
| Product Repository | O(v × p) | v=vendors, p=products |
| RFP Database | O(n) | n=number of RFPs |
| Match Results | O(v × r) | v=vendors, r=requirements |
| Agent Memory | O(1) | Fixed size per agent |

### Scalability Considerations

```
Current Capacity:
• Vendors: 3 (Asian Paints, Berger Paints, Nerolac Paints)
• Products per Vendor: 1-3
• Requirements per RFP: 2-5
• Processing Time: ~4-6 seconds

Scalability Limits:
• Can handle 10+ vendors efficiently
• Up to 50 products per vendor
• Up to 20 requirements per RFP
• Linear scaling with data size
```

## 🔐 Security Architecture

```
Security Layers:
┌─────────────────────────────────────┐
│  Client-Side Processing             │
│  • No data sent to external servers │
│  • Local PDF parsing                │
│  • Browser-based computation        │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Data Validation                    │
│  • Input sanitization               │
│  • Type checking                    │
│  • Range validation                 │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Error Handling                     │
│  • Try-catch blocks                 │
│  • Graceful degradation             │
│  • User feedback                    │
└─────────────────────────────────────┘
```

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Maintained By:** Development Team
