import React, { useState } from 'react';
import axios from 'axios';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

const AiAssistant = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your Gemini-powered Skill Intel Assistant. How can I help you analyze your competencies or find a learning path today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { id: Date.now(), text: input, sender: 'user' }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/chat', { messages: newMessages });
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: response.data.reply,
        sender: 'bot'
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I'm sorry, I am currently offline. Please try again later.",
        sender: 'bot',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-white/60 backdrop-blur-3xl rounded-3xl shadow-xl shadow-secondary-100/50 border border-white/50 overflow-hidden relative">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Gemini Assistant</h2>
            <p className="text-primary-100 text-sm flex items-center">
              <span className="w-2 h-2 bg-success-400 rounded-full mr-2 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" />
              Online | Powered by Google AI
            </p>
          </div>
        </div>
        <Sparkles className="w-6 h-6 text-white/50" />
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto space-y-6 relative z-10 custom-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] flex space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white' 
                  : 'bg-white border border-gray-100 text-secondary-600'
              }`}>
                {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`p-4 text-[15px] leading-relaxed shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-primary-600 text-white rounded-2xl rounded-tr-none' 
                  : msg.isError 
                    ? 'bg-red-50 border border-red-100 text-red-700 rounded-2xl rounded-tl-none'
                    : 'bg-white border border-gray-100 text-gray-700 rounded-2xl rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-secondary-600 shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex space-x-2 items-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 relative z-10">
        <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:border-primary-500 transition-all shadow-inner">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your skill gaps, courses, or learning path..." 
            className="flex-1 px-4 py-2 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            className="bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 disabled:hover:bg-primary-600 flex items-center justify-center shadow-md shadow-primary-500/30"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
