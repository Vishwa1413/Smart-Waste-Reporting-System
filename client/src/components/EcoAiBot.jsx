import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User, RefreshCw, Lightbulb, Zap, ShieldAlert, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const AI_KNOWLEDGE_BASE = [
  {
    keywords: ['hi', 'hello', 'hey', 'start', 'help'],
    reply: "Hello! 👋 I'm **EcoBot AI**, your intelligent environmental assistant. How can I help you report waste, classify garbage, or earn Eco-Points today?"
  },
  {
    keywords: ['report', 'complaint', 'submit', 'how to'],
    reply: "To submit a report: 1️⃣ Click **Upload Photo** or use our **AI Auto-Scan**, 2️⃣ Tap your location on the map, 3️⃣ Click **Submit Report**. Our authorities get notified instantly!"
  },
  {
    keywords: ['ai', 'scan', 'scanner', 'detect', 'classify'],
    reply: "Our AI Waste Scanner analyzes uploaded images using machine learning algorithms to identify plastic, e-waste, organic waste, and hazard levels with over **96% accuracy**!"
  },
  {
    keywords: ['points', 'reward', 'eco', 'score'],
    reply: "You earn **25-100 Eco-Points** for every verified report! High-hazard reports (like toxic leaks or e-waste dumps) earn extra bonus points redeemable for eco-certificates."
  },
  {
    keywords: ['hazard', 'danger', 'chemical', 'toxic'],
    reply: "⚠️ Hazardous waste includes batteries, paint cans, e-waste, and medical supplies. When reported, our system immediately flags them with **HIGH URGENCY** status!"
  },
  {
    keywords: ['recycle', 'plastic', 'organic', 'waste'],
    reply: "♻️ **Waste Segregation Guide**:\n- **Green Bin**: Food & Organic Waste\n- **Blue Bin**: Paper, Plastic & Glass\n- **Red Bin**: Hazardous & E-Waste\n- **Yellow Bin**: Metal & Construction Debris."
  }
];

const EcoAiBot = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 Hi! I'm **EcoBot AI**. Ask me anything about waste reporting, recycling, or AI image classification!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMessage = {
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = "I'm analyzing your query! You can use our **AI Auto-Scan** feature while reporting waste to automatically identify material types and hazard severity levels.";
      const lower = text.toLowerCase();

      for (const item of AI_KNOWLEDGE_BASE) {
        if (item.keywords.some(kw => lower.includes(kw))) {
          botResponse = item.reply;
          break;
        }
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const quickPrompts = [
    { text: '📸 How AI photo scan works?', icon: Zap },
    { text: '♻️ Waste Segregation Tips', icon: Lightbulb },
    { text: '⚠️ Report Toxic Waste', icon: ShieldAlert },
    { text: '🏆 How to get Eco-Points?', icon: Award }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-[90vw] sm:w-[380px] h-[520px] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className={`p-4 ${theme.buttonClass} text-white flex items-center justify-between shadow-lg`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur border border-white/30">
                  <Bot size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-1.5">
                    EcoBot AI <Sparkles size={14} className="text-amber-300" />
                  </h3>
                  <span className="text-[11px] text-emerald-100 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                    Online • AI Waste Assistant
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      msg.sender === 'user'
                        ? 'bg-slate-800 text-white'
                        : `${theme.accentBg} text-white shadow-md`
                    }`}
                  >
                    {msg.sender === 'user' ? <User size={14} /> : <Bot size={16} />}
                  </div>
                  <div
                    className={`max-w-[78%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-slate-800 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span className="text-[9px] opacity-60 block text-right mt-1 font-mono">
                      {msg.time}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                  <Bot size={16} className={theme.accentText} />
                  <span>EcoBot AI is thinking...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto">
              {quickPrompts.map((qp, i) => {
                const Icon = qp.icon;
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleSend(qp.text)}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 text-[10px] font-semibold text-slate-700 hover:text-emerald-700 shrink-0 border border-slate-200 transition-all flex items-center gap-1"
                  >
                    <Icon size={12} className={theme.accentText} />
                    {qp.text}
                  </motion.button>
                );
              })}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center"
            >
              <input
                type="text"
                placeholder="Ask EcoBot AI..."
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                className={`p-2 rounded-xl ${theme.buttonClass} text-white shrink-0`}
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bot Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl ${theme.buttonClass} text-white flex items-center justify-center shadow-2xl relative group`}
      >
        <Bot size={28} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center">
          <span className="w-2 h-2 bg-white rounded-full animate-ping" />
        </span>
        <div className="absolute right-16 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
          Ask AI EcoBot 🤖
        </div>
      </motion.button>
    </div>
  );
};

export default EcoAiBot;
