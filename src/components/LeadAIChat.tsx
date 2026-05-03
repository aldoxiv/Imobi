import React, { useState, useEffect, useRef } from 'react';
import { startQualificationChat, summarizeLeadProfile } from '../services/geminiService';
import { Sparkles, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, doc, updateDoc, handleFirestoreError, OperationType } from '../lib/firebase';
import { cn } from '../lib/utils';

interface LeadAIChatProps {
  inquiryId: string;
  onClose: () => void;
}

export function LeadAIChat({ inquiryId, onClose }: LeadAIChatProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initChat() {
      const c = await startQualificationChat();
      setChat(c);
      const response = await c.sendMessage({ message: "Olá! Gostaria de começar a minha qualificação." });
      setMessages([{ role: 'model', content: response.text }]);
    }
    initChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chat || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chat.sendMessage({ message: userMessage });
      setMessages(prev => [...prev, { role: 'model', content: response.text }]);
      
      // Check if conversation seems to be ending or has enough info to summarize
      // For this demo, we'll just check if history length is > 8 (approx 4 turns each)
      if (messages.length > 8) {
        const history = [
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
          { role: 'user' as const, parts: [{ text: userMessage }] },
          { role: 'model' as const, parts: [{ text: response.text }] }
        ];
        const summary = await summarizeLeadProfile(history);
        
      try {
        // Save summary to inquiry
        const inquiryRef = doc(db, 'inquiries', inquiryId);
        await updateDoc(inquiryRef, { aiSummary: summary });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `inquiries/${inquiryId}`);
      }
      }
    } catch (error) {
      console.error('Chat error', error);
      setMessages(prev => [...prev, { role: 'model', content: "Desculpe, tive um problema técnico. Posso tentar novamente?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-6 right-6 z-[70] w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E5E1DA] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="bg-[#1A1A1A] p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F5F2ED]/10 rounded-full flex items-center justify-center text-[#F5F2ED]">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="serif text-lg font-light italic">Consultor Virtual Imobi</h3>
            <p className="text-[9px] uppercase tracking-widest text-white/50">Qualificação Inteligente</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 h-96 overflow-y-auto p-6 space-y-4 bg-[#F9F8F6] custom-scrollbar"
      >
        {messages.map((m, idx) => (
          <div key={idx} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
              m.role === 'user' 
                ? "bg-[#1A1A1A] text-white rounded-tr-none shadow-sm" 
                : "bg-white text-[#1A1A1A] border border-[#E5E1DA] rounded-tl-none shadow-sm"
            )}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#E5E1DA] p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-[#5A5A40]" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8E8E8E]">Consultando Acervo...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-[#E5E1DA]">
        <div className="relative flex items-center">
          <input 
            type="text" 
            placeholder="Responda aqui..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="w-full pl-6 pr-14 py-4 bg-[#F5F2ED] border-none rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-3 bg-[#1A1A1A] text-white rounded-xl hover:bg-[#5A5A40] transition-all disabled:opacity-30"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[9px] text-center text-[#8E8E8E] mt-3 uppercase tracking-widest">
          IA pode cometer erros. Verifique informações importantes.
        </p>
      </div>
    </motion.div>
  );
}
