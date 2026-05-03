import React, { useState } from 'react';
import { Property, Inquiry } from '../types';
import { useAuth } from '../lib/AuthContext';
import { db, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType } from '../lib/firebase';
import { X, Send, Phone, MessageSquare, CheckCircle2, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice, cn } from '../lib/utils';
import { LeadAIChat } from './LeadAIChat';

interface PropertyDetailsProps {
  property: Property;
  onClose: () => void;
}

export function PropertyDetails({ property, onClose }: PropertyDetailsProps) {
  const { user, profile } = useAuth();
  const [message, setMessage] = useState('Olá, tenho interesse neste imóvel. Gostaria de mais informações.');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Por favor, faça login para entrar em contato.');
    
    setIsSubmitting(true);
    try {
      const inquiryData: any = {
        propertyId: property.id,
        userId: user.uid,
        userName: profile?.displayName || user.displayName || 'Anônimo',
        userEmail: profile?.email || user.email || '',
        agentId: property.agentId,
        message: message,
        phone: phoneNumber,
        timestamp: serverTimestamp(),
        status: 'new'
      };

      const docRef = await addDoc(collection(db, 'inquiries'), inquiryData);
      setInquiryId(docRef.id);
      setSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'inquiries');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8"
    >
      <div className="absolute inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-5xl h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col md:flex-row"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all md:text-[#1A1A1A] md:bg-[#F5F2ED] md:hover:bg-[#E5E1DA]"
        >
          <X size={20} />
        </button>

        {/* Media Side */}
        <div className="w-full md:w-3/5 h-1/2 md:h-full bg-[#1A1A1A] overflow-y-auto custom-scrollbar">
          <div className="flex flex-col">
            {property.images.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={`${property.title} - ${idx + 1}`} 
                className="w-full h-auto object-cover border-b border-white/5"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
        </div>

        {/* Content Side */}
        <div className="w-full md:w-2/5 h-1/2 md:h-full overflow-y-auto p-8 md:p-12 flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E8E8E] px-3 py-1 border border-[#E5E1DA] rounded-full">
                {property.type}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A5A40]">
                {property.status === 'active' ? 'Disponível' : 'Indisponível'}
              </span>
            </div>
            <h2 className="serif text-4xl font-light mb-2 leading-tight">{property.title}</h2>
            <p className="text-[#8E8E8E] text-sm mb-6 flex items-center">
              <span className="font-medium mr-2">{property.address.city}, {property.address.state}</span>
              • {property.sqft} m²
            </p>
            <div className="text-3xl font-medium tracking-tight text-[#1A1A1A]">
              {formatPrice(property.price, property.currency)}
              {property.category === 'rent' && <span className="text-lg font-normal text-[#8E8E8E]">/mês</span>}
            </div>
          </div>

          <div className="prose prose-sm prose-stone mb-12">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A] border-b border-[#F0EFEA] pb-2 mb-4">Descrição</h4>
            <p className="text-[#5A5A5A] leading-relaxed italic border-l-2 border-[#E5E1DA] pl-4">
              "{property.description}"
            </p>
          </div>

          <div className="mb-12">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A] border-b border-[#F0EFEA] pb-2 mb-4">Destaques</h4>
            <div className="grid grid-cols-2 gap-3">
              {property.features.map((feature, idx) => (
                <div key={idx} className="flex items-center text-xs text-[#5A5A5A] gap-2">
                  <CheckCircle2 size={14} className="text-[#5A5A40]" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Lead Form */}
          <div className="mt-auto pt-8 border-t border-[#F0EFEA]">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#F0F7F0] p-8 rounded-2xl text-center border border-[#D5E6D5]"
                >
                  <div className="w-12 h-12 bg-[#5A8F5A] rounded-full flex items-center justify-center text-white mx-auto mb-4">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="serif text-xl mb-2 font-medium">Interesse enviado</h4>
                  <p className="text-xs text-[#5A8F5A] font-medium leading-relaxed mb-6">
                    Obrigado! Um de nossos curadores especialistas entrará em contato em breve.
                  </p>
                  <button 
                    onClick={() => setShowAIChat(true)}
                    className="w-full py-4 bg-[#5A8F5A] text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-[#4A7F4A] transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Sparkles size={16} /> Acelerar Atendimento com IA
                  </button>
                </motion.div>
              ) : (
                <div className="p-1 px-1">
                  <h4 className="serif text-2xl mb-6">Agendar Visita</h4>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] ml-1">Telefone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E8E]" size={16} />
                        <input 
                          type="tel" 
                          required
                          placeholder="(00) 00000-0000"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-[#F9F8F6] border border-[#E5E1DA] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] ml-1">Mensagem</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 text-[#8E8E8E]" size={16} />
                        <textarea 
                          required
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={3}
                          className="w-full pl-11 pr-4 py-3 bg-[#F9F8F6] border border-[#E5E1DA] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] transition-all resize-none"
                        />
                      </div>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-4 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-[0.3em] rounded-xl hover:bg-[#5A5A40] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl"
                    >
                      {isSubmitting ? 'Enviando...' : <><Send size={16} /> Enviar Manifestação</>}
                    </button>

                    <div className="flex items-center gap-2 p-3 bg-[#F0F2F5] rounded-lg text-[9px] text-[#8E8E8E] leading-tight">
                      <Info size={12} className="shrink-0" />
                      Ao enviar, você concorda com nossos termos de privacidade e autoriza o contato de um consultor.
                    </div>
                  </form>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showAIChat && inquiryId && (
          <LeadAIChat 
            inquiryId={inquiryId} 
            onClose={() => setShowAIChat(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
