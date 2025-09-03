# Beacon - Marketing Co-Pilot

A conversational AI co-pilot that shines a light on what matters most by unifying customer signals, campaign performance, delivery effort, and decision history into a single priority narrative.

## Vision & Purpose

Marketing teams are awash in dashboards, feedback tools, and campaign systems. They're under pressure to show ROI, yet spend hours reconciling data and debating priorities.

Beacon is the marketing module of the Neojack OS — a conversational co-pilot that delivers clear, explainable answers backed by data and customer voice.

**North Star**: Marketers can ask one question — "Where should we focus?" — and Beacon delivers a clear, explainable answer backed by data and customer voice.

## Core Features

### 🎯 **Insights Engine (Chat-First)**
Query analytics + feedback with natural language commands:
- `/insights checkout 30d` → Returns KPIs (conversion, revenue delta) + top customer verbatims
- Real-time anomaly detection
- Voice-of-Customer integration (sentiment, NPS, themes)

### 📊 **Prioritization Engine**
Common scoring model: `(Impact × Confidence) ÷ (Effort × Risk)`
- Inputs: analytics (impact), feedback (confidence), work items (effort & risk)
- Output: ranked "opportunity stack" with evidence
- Command: `/prioritize [criteria]`

### 📋 **Decision Desk Export**
Turn any insight/opportunity into a decision card:
- Problem statement
- Options with tradeoffs (impact, effort, risk)
- Recommended next step
- Command: `/decision [opportunity-id]`

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/thejoseplatero/beacon.git
cd beacon
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage Examples

### Get Insights
```
/insights checkout 30d
```
Returns KPIs, customer feedback, and sentiment analysis for checkout performance.

### Prioritize Opportunities
```
/prioritize conversion
```
Ranks opportunities by impact, effort, risk, and confidence scores.

### Create Decision Card
```
/decision opp-1
```
Generates a decision card with options, tradeoffs, and recommended next steps.

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: CSS3 with modern features
- **Architecture**: Mock services (ready for real API integration)
- **Data Models**: Insights, Opportunities, Decision Cards

## Project Structure

```
beacon/
├── public/          # Static files
├── src/             # Source code
│   ├── App.tsx      # Main Beacon component with chat interface
│   ├── App.css      # Comprehensive styling for all components
│   └── index.tsx    # App entry point
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

## Architecture (v1)

### Current Implementation
- **Mock Services**: Simulated API responses for demo purposes
- **Command Parser**: Natural language command processing
- **Rich Message Rendering**: Cards for insights, opportunities, decisions
- **Real-time Processing**: Loading states and async operations

### Future Integration
- **MCP Server**: Model Context Protocol for real API connections
- **Tools**: analytics.query, feedback.list, work.items, knowledge.search
- **Real Data Sources**: Adobe Analytics, Usabilla, Jira, Confluence

## Success Metrics

- **Clarity speed**: Time from question → prioritized answer
- **Decision adoption**: % of surfaced opportunities converted into decision memos
- **Feedback coverage**: % of insights with both data + customer verbatims
- **Leadership trust**: Exec survey on ROI estimate trust

## Roadmap

### Phase 0 (Current - Demo)
- ✅ Mock connectors for AEP, Usabilla, Jira, Confluence
- ✅ Show /insights and /prioritize flows in chat interface
- ✅ Rich message rendering with data cards

### Phase 1 (Pilot)
- Replace mocks with real Adobe Analytics 2.0 + Usabilla API
- Keep Jira/Confluence partial integration

### Phase 2 (Extend)
- Add multi-tool support (GA4, Braze, Salesforce, Notion)
- Advanced scoring calibration

### Phase 3 (Scale)
- Auto-generated executive narratives
- Multi-channel opportunity comparison

## Contributing

This is a marketing co-pilot that helps teams make data-driven decisions. The current implementation uses mock data to demonstrate the core functionality and user experience.

## License

MIT
