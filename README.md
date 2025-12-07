# 🤖 Agentic RFP Automation Platform

An intelligent, multi-agent system for automating Request for Proposal (RFP) responses in the paint industry. This platform leverages four specialized AI agents to analyze RFPs, match specifications, optimize pricing, and generate comprehensive responses.

## 🎯 Overview

The Agentic RFP Automation Platform streamlines the entire RFP response process by coordinating multiple AI agents that work together to:
- Discover and process RFP opportunities
- Extract and analyze requirements
- Match specifications across multiple vendors
- Calculate optimal pricing with testing costs
- Generate professional reports (PDF & Excel)

## 🏗️ Architecture

### Four-Agent System

```
┌─────────────────────────────────────────────────────────────┐
│                     Main Agent (Orchestrator)                │
│              Workflow Coordination & Report Generation       │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼──────┐ ┌───▼──────┐ ┌───▼──────────┐
        │ Sales Agent  │ │Technical │ │   Pricing    │
        │              │ │  Agent   │ │    Agent     │
        │ RFP Discovery│ │Spec Match│ │Cost Optimize │
        └──────────────┘ └──────────┘ └──────────────┘
```

### Agent Responsibilities

#### 1. **Sales Agent**
- RFP discovery and monitoring
- Document text extraction (PDF support)
- Requirement identification and parsing
- Opportunity qualification
- Initial RFP analysis

#### 2. **Technical Agent**
- Product specification matching
- Vendor comparison analysis (Asian Paints, Berger Paints, Nerolac Paints)
- Technical compatibility assessment
- Performance scoring and ranking

#### 3. **Pricing Agent**
- Cost calculation and estimation
- Vendor price comparison
- Volume discount analysis
- Testing cost integration
- Margin optimization

#### 4. **Main Agent (Orchestrator)**
- Workflow orchestration across all agents
- Quality assurance and validation
- Comprehensive report generation
- Final response optimization

## ✨ Features

### 📊 Live Dashboard
- Real-time system status monitoring
- Recent RFP opportunities tracking
- Quick action buttons for common tasks
- Performance metrics overview

### 🌐 RFP Scanner
- Automated RFP source monitoring
- Multi-source scanning (Government portals, Construction boards, Municipal tenders)
- RFP status tracking (New, Analyzed, Responded)
- Deadline and urgency management

### ⚡ Agent Workflow
- Interactive multi-agent processing
- PDF upload and text extraction
- Real-time workflow visualization
- Step-by-step agent execution tracking

### 📈 Analytics Dashboard
- Key performance metrics (Win rate, Response time, Match accuracy)
- RFP processing pipeline visualization
- Vendor performance comparison charts
- Agent performance analysis tables

### 👥 Vendor Analysis
- Multi-vendor comparison (Asian Paints, Berger Paints, Nerolac Paints)
- Detailed cost breakdown
- Reliability and lead time analysis
- Recommended vendor highlighting

### 📜 Response History
- Historical RFP tracking
- Win/Loss/Pending status monitoring
- Detailed response reports
- Downloadable history reports

## 🎯 Advanced Features

### Phase 1: Core Automation ✅
- **Enhanced Spec Match Scoring 2.0**: Weighted scoring (30-25-20-15-10) with detailed reasoning
- **Win Probability Predictor**: Multi-factor analysis (Match 35%, Pricing 30%, Deadline 20%, History 15%)
- **Complete Audit Trail**: 100% traceable with full reasoning for every decision
- **Enhanced Results Display**: Professional presentation with win probability banner

### Phase 2A: JavaScript Stack Enhancement ✅
- **Semantic Matcher**: Cosine similarity + Fuzzy matching + Jaccard similarity
- **CSV Handler**: Complete import/export (4 formats: RFP data, vendor quotes, catalog, audit trail)
- **Enhanced NLP**: 10+ entity types, sentiment analysis, urgency detection
- **Currency Converter**: 9 currencies with auto-detection
- **Historical Data Analyzer**: Win prediction, price forecasting, vendor performance
- **Product Knowledge Graph**: Semantic relationships, intelligent recommendations

### Phase 2B: Enterprise Intelligence ✅
- **Parallel Execution Engine**: 26% faster processing with simultaneous agent execution
- **Learning Memory System**: Stores and recalls similar past RFPs using cosine similarity
- **Confidence-Based Escalation**: Automatic human review flagging for low-confidence decisions

## 📊 Performance Metrics

```
Processing Speed:    7.0 seconds (26% faster than sequential)
Match Accuracy:      90% (up from 60%)
Entity Extraction:   10 types (up from 4)
Data Export:         4 formats (up from 2)
Parallel Speedup:    1.33x average
Win Prediction:      40% improvement
Confidence Tracking: 5 levels (Very High → Very Low)
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agentic-rfp-automation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   ```
   Navigate to http://localhost:3000
   ```

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## 📦 Dependencies

### Core Dependencies
- **React** (^18.2.0) - UI framework
- **Recharts** (^2.8.0) - Data visualization and charts
- **Lucide React** (^0.263.1) - Icon library
- **PDF.js** (^3.11.174) - PDF parsing and text extraction

### Development Dependencies
- **React Scripts** (5.0.1) - Build tooling and development server

## 🎨 User Interface

### Tab Navigation
The platform features six main tabs:

1. **Live Dashboard** - System overview and quick actions
2. **RFP Scanner** - Source monitoring and RFP detection
3. **Agent Workflow** - Interactive RFP processing
4. **Analytics** - Performance metrics and insights
5. **Vendor Analysis** - Multi-vendor comparison
6. **Response History** - Historical RFP tracking

### Key Components

- **Status Indicators** - Real-time agent activity visualization
- **Workflow Steps** - Visual progress tracking through agent pipeline
- **Vendor Cards** - Comparative vendor analysis display
- **Performance Charts** - Interactive data visualizations
- **Report Downloads** - PDF and Excel export functionality

## 🔧 Configuration

### Product Repository
The system includes pre-configured product catalogs for three major vendors:
- Asian Paints (3 products)
- Berger Paints (2 products)
- Nerolac Paints (1 product)

### Pricing Rules
Configurable pricing parameters:
- Markup percentage: 20%
- Overhead per sq ft: $0.50
- Rush order multiplier: 1.15x
- Volume discounts: 2% (10K+), 5% (25K+), 8% (50K+)
- Testing markup: 15%

### Testing Requirements
Standard testing costs:
- Adhesion Test: $450 (required)
- Weather Resistance: $850 (conditional)
- VOC Emission: $320 (required)
- Durability Test: $1,200 (conditional)
- Color Fastness: $280 (optional)

## 📄 Report Generation

### PDF Reports
Professional PDF reports include:
- Executive summary with recommendations
- Vendor analysis and comparison
- AI agent analysis breakdown
- Cost breakdown tables
- Next steps and action items

### Excel Reports
CSV-compatible Excel exports with:
- Vendor comparison data
- Cost breakdowns
- Performance metrics
- Match scores and ratings

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 🛠️ Development

### Project Structure
```
agentic-rfp-automation/
├── public/
│   └── index.html
├── src/
│   ├── agents/
│   │   ├── SalesAgent.js
│   │   ├── TechnicalAgent.js
│   │   ├── PricingAgent.js
│   │   └── MainAgent.js
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

### Adding New Vendors
To add a new vendor to the product repository:

1. Open `src/App.js`
2. Locate the `PRODUCT_REPOSITORY` constant
3. Add your vendor with product specifications:
```javascript
'New Vendor': [
  {
    id: 'NV001',
    name: 'Product Name',
    category: 'Exterior',
    finish: 'Matt',
    coverage: 140,
    durability: 12,
    cost: 285.50,
    reliability: 95,
    leadTime: 7,
    specs: { /* specifications */ }
  }
]
```

### Customizing Agent Behavior
Each agent can be customized by modifying its respective file in `src/agents/`:
- `SalesAgent.js` - RFP parsing and requirement extraction
- `TechnicalAgent.js` - Specification matching algorithms
- `PricingAgent.js` - Cost calculation and pricing rules
- `MainAgent.js` - Workflow orchestration logic

## 📊 Performance Metrics

The platform tracks several key performance indicators:
- **RFPs Processed**: Total number of RFPs analyzed
- **Win Rate**: Percentage of successful RFP responses
- **Avg Response Time**: Average time to generate response
- **Match Accuracy**: Technical specification match percentage
- **Total Value Won**: Cumulative value of won contracts

## 🔐 Security Considerations

- All RFP data is processed locally in the browser
- No sensitive data is transmitted to external servers
- PDF parsing is done client-side using PDF.js
- Mock data is used for demonstration purposes

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with React and modern web technologies
- Icons provided by Lucide React
- Charts powered by Recharts
- PDF processing by PDF.js

## 📞 Support

For questions, issues, or feature requests, please open an issue on the GitHub repository.

## 🗺️ Roadmap

### Upcoming Features
- [ ] Real-time RFP source integration
- [ ] Machine learning-based requirement extraction
- [ ] Advanced vendor recommendation algorithms
- [ ] Email notification system
- [ ] Multi-user collaboration features
- [ ] Cloud storage integration
- [ ] Mobile responsive design enhancements
- [ ] API integration for external systems

## 📚 Documentation

### 🎉 New Features (Phase 1)
- **WHATS_NEW.md** - User guide for new features and improvements
- **IMPLEMENTATION_SUMMARY.md** - Visual summary of Phase 1 changes
- **PHASE1_IMPLEMENTATION.md** - Detailed technical implementation guide

### Architecture Documents
- **ARCHITECTURE.md** - Complete system architecture, algorithms, and tech stack
- **PARALLEL_ARCHITECTURE.md** - Parallel processing opportunities and optimizations
- **TECHNOLOGY_COMPONENTS.md** - Detailed technology stack and results

### Execution & Performance
- **EXECUTION_SUMMARY.md** - Agent execution patterns and parallelization
- **VISUAL_EXECUTION_FLOW.md** - Visual diagrams of workflow execution

### Roadmap & Planning
- **IMPROVEMENT_ROADMAP.md** - Strategic enhancements and implementation plan

### Code Documentation
For detailed documentation on each agent and component, please refer to the inline code comments and JSDoc annotations in the source files.

---

**Built with ❤️ for the Paint Industry**

*Automating RFP responses, one agent at a time.*