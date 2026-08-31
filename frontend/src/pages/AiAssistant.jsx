import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Send, Bot, User, Sparkles, Loader2, MessageSquare, Trash2 } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  "What courses should I take for frontend development?",
  "Analyze my recent assessment performance.",
  "Create a learning path for Machine Learning.",
  "How do I improve my Python skills?"
];

const AiAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const DEFAULT_GREETING = { id: '1', text: "Hello! I'm your Gemini-powered Skill Intel Assistant. How can I help you analyze your competencies or find a learning path today?", sender: 'bot' };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/chat');
        if (response.data.messages && response.data.messages.length > 0) {
          setMessages(response.data.messages);
        } else {
          setMessages([DEFAULT_GREETING]);
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
        setMessages([DEFAULT_GREETING]);
      } finally {
        setIsFetching(false);
      }
    };
    fetchHistory();
  }, []);

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear your conversation history?")) return;
    try {
      setIsFetching(true);
      await api.delete('/chat');
      setMessages([DEFAULT_GREETING]);
    } catch (err) {
      console.error('Failed to clear chat', err);
      alert('Failed to clear chat history.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSend = async (textOverride = null) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : input;
    if (!textToSend.trim()) return;
    
    const newMessages = [...messages, { id: Date.now(), text: textToSend, sender: 'user' }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await api.post('/chat', { messages: newMessages });
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: response.data.reply,
        sender: 'bot'
      }]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (error.response.status === 500) {
          errorMessage = error.response.data?.message || "The AI service is currently experiencing technical difficulties.";
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection to the server.";
      }
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: errorMessage,
        sender: 'bot',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-card-bg rounded-3xl shadow-sm border border-border-main overflow-hidden relative animate-in fade-in duration-500">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="bg-primary-900 p-6 text-white flex items-center justify-between relative z-10 border-b border-primary-800">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-800 rounded-xl flex items-center justify-center border border-primary-700 shadow-inner">
            <Bot className="w-7 h-7 text-accent-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Gemini Assistant</h2>
            <p className="text-primary-300 text-sm flex items-center">
              <span className="w-2 h-2 bg-accent-400 rounded-full mr-2 shadow-[0_0_8px_rgba(20,154,156,0.8)] animate-pulse" />
              Online | Powered by Google AI
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleClear}
            disabled={isFetching || isLoading}
            className="p-2 bg-primary-800 rounded-full hover:bg-primary-700 transition-colors tooltip tooltip-left"
            title="Clear Chat History"
          >
            <Trash2 className="w-5 h-5 text-primary-300 hover:text-white transition-colors" />
          </button>
          <Sparkles className="w-6 h-6 text-primary-500" />
        </div>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto space-y-6 relative z-10 custom-scrollbar">
        {isFetching ? (
          <div className="flex h-full items-center justify-center">
             <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={msg.id || idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[75%] flex space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-secondary-600 text-white' 
                  : 'bg-card-alt border border-border-main text-secondary-600'
              }`}>
                {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-primary-700" />}
              </div>
              <div className={`p-4 text-[15px] leading-relaxed shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-secondary-600 text-white rounded-2xl rounded-tr-none' 
                  : msg.isError 
                    ? 'bg-error-50 border border-error-100 text-error-700 rounded-2xl rounded-tl-none font-medium'
                    : 'bg-card-alt border border-border-main text-text-main rounded-2xl rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {messages.length === 1 && !isLoading && (
          <div className="mt-8">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 pl-14">Suggested Prompts</p>
            <div className="flex flex-col gap-2 pl-14 max-w-[80%]">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="text-left px-4 py-3 rounded-xl border border-border-main bg-card-bg hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 text-sm font-medium text-text-secondary transition-colors flex items-center gap-3 shadow-sm group"
                >
                  <MessageSquare className="w-4 h-4 text-secondary-400 group-hover:text-primary-500" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex space-x-3">
              <div className="w-10 h-10 rounded-xl bg-card-alt border border-border-main flex items-center justify-center text-secondary-600 shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin text-primary-700" />
              </div>
              <div className="bg-card-alt border border-border-main p-4 rounded-2xl rounded-tl-none shadow-sm flex space-x-2 items-center">
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
      
      <div className="p-4 bg-card-bg border-t border-border-main relative z-10">
        <div className="flex items-center space-x-3 bg-card-alt p-2 rounded-xl border border-border-main focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:border-primary-500 transition-all shadow-inner">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your skill gaps, courses, or learning path..." 
            className="flex-1 px-4 py-2 bg-transparent focus:outline-none text-text-main placeholder-text-secondary"
            disabled={isLoading}
          />
          <button 
            onClick={() => handleSend()} 
            disabled={isLoading || !input.trim()}
            className="bg-primary-600 text-white p-3 rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:hover:bg-primary-600 flex items-center justify-center shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
