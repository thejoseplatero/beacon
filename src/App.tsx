import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Data Models
interface Insight {
  id: string;
  title: string;
  description: string;
  kpis: KPIMetric[];
  customerVerbatims: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  timestamp: Date;
}

interface KPIMetric {
  name: string;
  value: number;
  change: number;
  unit: string;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  impact: number;
  confidence: number;
  effort: number;
  risk: number;
  score: number;
  evidence: string[];
  category: 'campaign' | 'journey' | 'feature' | 'content';
}

interface DecisionCard {
  id: string;
  problemStatement: string;
  options: DecisionOption[];
  recommendedOption: string;
  tradeoffs: Tradeoff[];
  nextSteps: string[];
}

interface DecisionOption {
  name: string;
  impact: number;
  effort: number;
  risk: number;
  description: string;
}

interface Tradeoff {
  aspect: string;
  option1: string;
  option2: string;
  recommendation: string;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'insight' | 'opportunity' | 'decision';
  data?: Insight | Opportunity | DecisionCard;
}

// Mock Services
class MockBeaconService {
  async getInsights(query: string): Promise<Insight[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        id: 'insight-1',
        title: 'Checkout Conversion Drop',
        description: '30-day checkout conversion dropped 15% while cart abandonment increased',
        kpis: [
          { name: 'Conversion Rate', value: 2.8, change: -15, unit: '%' },
          { name: 'Cart Abandonment', value: 68, change: 12, unit: '%' },
          { name: 'Revenue Impact', value: -125000, change: -18, unit: '$' }
        ],
        customerVerbatims: [
          "The checkout process is too complicated",
          "I can't find the shipping options I need",
          "The page keeps refreshing and losing my info"
        ],
        sentiment: 'negative',
        confidence: 0.85,
        timestamp: new Date()
      }
    ];
  }

  async prioritizeOpportunities(criteria: string): Promise<Opportunity[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'opp-1',
        title: 'Simplify Checkout Flow',
        description: 'Reduce checkout steps and improve form validation',
        impact: 8.5,
        confidence: 0.85,
        effort: 6.0,
        risk: 2.0,
        score: 3.54,
        evidence: [
          '15% conversion drop in 30 days',
          '68% cart abandonment rate',
          'Customer feedback: "too complicated"'
        ],
        category: 'journey'
      },
      {
        id: 'opp-2',
        title: 'Mobile Checkout Optimization',
        description: 'Improve mobile checkout experience and payment options',
        impact: 7.0,
        confidence: 0.75,
        effort: 8.0,
        risk: 3.0,
        score: 2.33,
        evidence: [
          '45% of traffic is mobile',
          'Mobile conversion 40% lower than desktop',
          'Payment method limitations on mobile'
        ],
        category: 'journey'
      }
    ];
  }

  async createDecisionCard(opportunityId: string): Promise<DecisionCard> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      id: 'decision-1',
      problemStatement: 'Checkout conversion has dropped 15% in 30 days, impacting $125K in revenue',
      options: [
        {
          name: 'Quick Fix: Form Validation',
          impact: 4.0,
          effort: 3.0,
          risk: 1.0,
          description: 'Fix form validation issues causing page refreshes'
        },
        {
          name: 'Redesign: Simplified Flow',
          impact: 8.5,
          effort: 8.0,
          risk: 4.0,
          description: 'Complete checkout flow redesign'
        },
        {
          name: 'Do Nothing',
          impact: 0.0,
          effort: 0.0,
          risk: 0.0,
          description: 'Continue with current flow'
        }
      ],
      recommendedOption: 'Quick Fix: Form Validation',
      tradeoffs: [
        {
          aspect: 'Speed vs Impact',
          option1: 'Quick fix (3 weeks, 4% impact)',
          option2: 'Redesign (8 weeks, 8.5% impact)',
          recommendation: 'Quick fix for immediate relief, plan redesign for Q2'
        }
      ],
      nextSteps: [
        'Implement form validation fixes',
        'Monitor conversion for 2 weeks',
        'Begin redesign planning if issues persist'
      ]
    };
  }
}

// Command Parser
class CommandParser {
  private beaconService = new MockBeaconService();

  async parseCommand(input: string): Promise<{ type: string; response: any }> {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.startsWith('/insights')) {
      const query = input.substring(9).trim();
      const insights = await this.beaconService.getInsights(query);
      return { type: 'insight', response: insights };
    }
    
    if (lowerInput.startsWith('/prioritize')) {
      const criteria = input.substring(12).trim();
      const opportunities = await this.beaconService.prioritizeOpportunities(criteria);
      return { type: 'opportunity', response: opportunities };
    }
    
    if (lowerInput.startsWith('/decision')) {
      const opportunityId = input.substring(10).trim();
      const decision = await this.beaconService.createDecisionCard(opportunityId);
      return { type: 'decision', response: decision };
    }
    
    // Default response for general questions
    return {
      type: 'text',
      response: "I'm Beacon, your marketing co-pilot. Try commands like:\n• /insights [query] - Get data insights\n• /prioritize [criteria] - Rank opportunities\n• /decision [id] - Create decision card"
    };
  }
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm Beacon, your marketing co-pilot. I help you connect performance data and customer feedback into clear priorities. Try:\n\n• /insights checkout 30d\n• /prioritize conversion\n• /decision opp-1",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const commandParser = new CommandParser();

  const checkScrollPosition = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setShowScrollIndicator(!isAtBottom);
    }
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition();
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() && !isProcessing) {
      const userMessage: Message = {
        id: messages.length + 1,
        text: inputText,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      setIsProcessing(true);

      try {
        const result = await commandParser.parseCommand(inputText);
        
        const botMessage: Message = {
          id: messages.length + 2,
          text: result.type === 'text' ? result.response : '',
          sender: 'bot',
          timestamp: new Date(),
          type: result.type as any,
          data: result.response
        };
        
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        const errorMessage: Message = {
          id: messages.length + 2,
          text: "Sorry, I encountered an error processing your request. Please try again.",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const renderMessage = (message: Message) => {
    if (message.type === 'insight' && message.data) {
      const insights = message.data as unknown as Insight[];
      const insight = insights[0]; // Take the first insight for now
      return (
        <div className="insight-card">
          <h3>{insight.title}</h3>
          <p>{insight.description}</p>
          <div className="kpi-grid">
            {insight.kpis.map((kpi, index) => (
              <div key={index} className="kpi-item">
                <span className="kpi-name">{kpi.name}</span>
                <span className={`kpi-value ${kpi.change < 0 ? 'negative' : 'positive'}`}>
                  {kpi.value}{kpi.unit} ({kpi.change > 0 ? '+' : ''}{kpi.change}%)
                </span>
              </div>
            ))}
          </div>
          <div className="verbatims">
            <h4>Customer Feedback:</h4>
            {insight.customerVerbatims.map((verbatim, index) => (
              <p key={index} className="verbatim">"{verbatim}"</p>
            ))}
          </div>
        </div>
      );
    }

    if (message.type === 'opportunity' && message.data) {
      const opportunities = message.data as unknown as Opportunity[];
      return (
        <div className="opportunities-list">
          <h3>Prioritized Opportunities</h3>
          {opportunities.map((opp, index) => (
            <div key={opp.id} className="opportunity-card">
              <div className="opp-header">
                <h4>{opp.title}</h4>
                <span className="score">Score: {opp.score.toFixed(2)}</span>
              </div>
              <p>{opp.description}</p>
              <div className="opp-metrics">
                <span className="metric">Impact: {opp.impact}/10</span>
                <span className="metric">Effort: {opp.effort}/10</span>
                <span className="metric">Risk: {opp.risk}/10</span>
                <span className="metric">Confidence: {Math.round(opp.confidence * 100)}%</span>
              </div>
              <div className="evidence">
                <strong>Evidence:</strong>
                <ul>
                  {opp.evidence.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (message.type === 'decision' && message.data) {
      const decision = message.data as DecisionCard;
      return (
        <div className="decision-card">
          <h3>Decision Card</h3>
          <div className="problem-statement">
            <h4>Problem:</h4>
            <p>{decision.problemStatement}</p>
          </div>
          <div className="options">
            <h4>Options:</h4>
            {decision.options.map((option, index) => (
              <div key={index} className={`option ${option.name === decision.recommendedOption ? 'recommended' : ''}`}>
                <h5>{option.name}</h5>
                <p>{option.description}</p>
                <div className="option-metrics">
                  <span>Impact: {option.impact}/10</span>
                  <span>Effort: {option.effort}/10</span>
                  <span>Risk: {option.risk}/10</span>
                </div>
              </div>
            ))}
          </div>
          <div className="next-steps">
            <h4>Next Steps:</h4>
            <ul>
              {decision.nextSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    return <p>{message.text}</p>;
  };

  return (
    <div className="App">
      <div className="app-header">
        <div className="logo-container">
          <h1 className="beacon-logo">neojack:beacon</h1>
        </div>
      </div>
      
                  <div className="chat-container">
              <div className="messages-container" ref={messagesContainerRef}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                  >
                    <div className="message-content">
                      {renderMessage(message)}
                      <span className="timestamp">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="message bot-message">
                    <div className="message-content">
                      <div className="loading">Processing...</div>
                    </div>
                  </div>
                )}
              </div>
              
              {showScrollIndicator && (
                <div className="scroll-indicator" onClick={scrollToBottom}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
                  </svg>
                </div>
              )}
        
        <div className="input-container">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Try: /insights checkout 30d"
            className="message-input"
            disabled={isProcessing}
          />
          <button 
            onClick={handleSendMessage}
            className="send-button"
            disabled={!inputText.trim() || isProcessing}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
