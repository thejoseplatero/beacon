import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as pdfjsLib from 'pdfjs-dist';
import './App.css';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || 'your-api-key-here');

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Data Models
interface UploadedFile {
  id: string;
  name: string;
  type: 'csv' | 'pdf';
  size: number;
  content?: string;
  uploadedAt: Date;
}

interface Insight {
  id: string;
  title: string;
  description: string;
  kpis: KPIMetric[];
  customerVerbatims: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  timestamp: Date;
  sourceFiles?: string[];
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
    
    // System commands
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
    
    // Natural language processing
    if (lowerInput.includes('insight') || lowerInput.includes('data') || lowerInput.includes('analytics')) {
      const insights = await this.beaconService.getInsights(input);
      return { type: 'insight', response: insights };
    }
    
    if (lowerInput.includes('prioritize') || lowerInput.includes('opportunity') || lowerInput.includes('rank') || lowerInput.includes('what should we do')) {
      const opportunities = await this.beaconService.prioritizeOpportunities(input);
      return { type: 'opportunity', response: opportunities };
    }
    
    if (lowerInput.includes('decision') || lowerInput.includes('choose') || lowerInput.includes('option')) {
      const decision = await this.beaconService.createDecisionCard('opp-1');
      return { type: 'decision', response: decision };
    }
    
    // General conversation
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return {
        type: 'text',
        response: "Hello! I'm Beacon, your marketing co-pilot. I can help you with insights, prioritization, and decision-making. What would you like to explore?"
      };
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
      return {
        type: 'text',
        response: "I can help you with:\n\n• **Data Insights** - Ask about performance, trends, or specific metrics\n• **Opportunity Prioritization** - Get recommendations on what to focus on\n• **Decision Making** - Create decision cards with options and tradeoffs\n\nTry asking naturally or use commands like /insights, /prioritize, or /decision"
      };
    }
    
    // Default response for unrecognized input
    return {
      type: 'text',
      response: "I understand you're asking about something, but I'm not sure how to help with that specific request. I can help with:\n\n• Data insights and analytics\n• Opportunity prioritization\n• Decision-making frameworks\n\nTry rephrasing or ask for help to see what I can do!"
    };
  }
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm Beacon, your marketing co-pilot. I help you connect performance data and customer feedback into clear priorities.\n\nYou can ask me naturally or use commands:\n• \"Show me insights about checkout\"\n• \"What should we prioritize?\"\n• \"/insights checkout 30d\"\n\n📁 You can also upload CSV or PDF files to analyze!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    await processFiles(Array.from(files));
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const content = await file.text();
        const newFile: UploadedFile = {
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: 'csv',
          size: file.size,
          content,
          uploadedAt: new Date()
        };
        setUploadedFiles(prev => [...prev, newFile]);
        
        // Add upload confirmation message
        const uploadMessage: Message = {
          id: messages.length + 1,
          text: `📁 Uploaded: ${file.name} (${(file.size / 1024).toFixed(1)}KB)\n\nI can now analyze this CSV data. Try asking:\n• "What are the key insights from this data?"\n• "Show me trends in the feedback"\n• "What are the main pain points?"`,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, uploadMessage]);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        try {
          // Extract text from PDF using PDF.js
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(' ');
            fullText += pageText + '\n';
          }
          
          const newFile: UploadedFile = {
            id: `file-${Date.now()}-${i}`,
            name: file.name,
            type: 'pdf',
            size: file.size,
            content: fullText,
            uploadedAt: new Date()
          };
          setUploadedFiles(prev => [...prev, newFile]);
          
          const uploadMessage: Message = {
            id: messages.length + 1,
            text: `📄 Uploaded: ${file.name} (${(file.size / 1024).toFixed(1)}KB)\n\nI can now analyze this PDF report. Try asking:\n• "What are the main findings?"\n• "Summarize the key metrics"\n• "What recommendations are mentioned?"`,
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, uploadMessage]);
        } catch (error) {
          console.error('PDF processing error:', error);
          const errorMessage: Message = {
            id: messages.length + 1,
            text: `❌ Error processing PDF: ${file.name}. Please try again or upload a different file.`,
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      }
    }
    
    setIsProcessing(false);
    setShowFileUpload(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processWithGemini = async (input: string, context?: string): Promise<string> => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      let prompt = `You are Beacon, a marketing co-pilot AI assistant. You help analyze marketing data and provide insights.`;
      
      if (context) {
        prompt += `\n\nContext from uploaded files:\n${context}`;
      }
      
      prompt += `\n\nUser question: ${input}\n\nPlease provide a helpful, analytical response.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return "I'm having trouble processing your request right now. Please try again.";
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
        // Check if we have uploaded files and user is asking about them
        const hasUploadedFiles = uploadedFiles.length > 0;
        const isAskingAboutFiles = inputText.toLowerCase().includes('data') || 
                                  inputText.toLowerCase().includes('file') ||
                                  inputText.toLowerCase().includes('upload') ||
                                  inputText.toLowerCase().includes('csv') ||
                                  inputText.toLowerCase().includes('pdf') ||
                                  inputText.toLowerCase().includes('analyze');

        if (hasUploadedFiles && isAskingAboutFiles) {
          // Use Gemini to analyze uploaded files
          const context = uploadedFiles.map(file => 
            `${file.name} (${file.type.toUpperCase()}):\n${file.content?.substring(0, 1000)}...`
          ).join('\n\n');
          
          const geminiResponse = await processWithGemini(inputText, context);
          
          const botMessage: Message = {
            id: messages.length + 2,
            text: geminiResponse,
            sender: 'bot',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, botMessage]);
        } else {
          // Use existing command parser for system commands and general queries
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
        }
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
      
                  <div className={`chat-container ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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
          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            className="upload-button"
            disabled={isProcessing}
            title="Upload files"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          
          {showFileUpload && (
            <div className="file-upload-overlay">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".csv,.pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="file-upload-button"
              >
                📁 Choose CSV or PDF files
              </button>
              <button
                onClick={() => setShowFileUpload(false)}
                className="cancel-upload-button"
              >
                ✕ Cancel
              </button>
            </div>
          )}
          
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
