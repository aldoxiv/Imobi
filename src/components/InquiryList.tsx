import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, db, handleFirestoreError, OperationType, updateDoc, doc } from '../lib/firebase';
import { Inquiry } from '../types';
import { useAuth } from '../lib/AuthContext';
import { CheckCircle2, Clock, Mail, Phone, MessageSquare, ArrowRight, Home as HomeIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';

export function InquiryList() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // We query inquiries where current user is the agent
    const q = query(
      collection(db, 'inquiries'), 
      where('agentId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInquiries(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'inquiries');
    });

    return unsubscribe;
  }, [user]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const inquiryRef = doc(db, 'inquiries', id);
      await updateDoc(inquiryRef, { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `inquiries/${id}`);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h2 className="serif text-5xl font-light mb-4">Gestão de Leads</h2>
        <p className="text-[#8E8E8E] leading-relaxed">
          Acompanhe as manifestações de interesse e gerencie o processo de conversão dos seus clientes.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center opacity-40">Carregando leads...</div>
      ) : inquiries.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-[#E5E1DA] rounded-3xl opacity-60">
          <p className="serif text-2xl italic mb-2">Nenhum lead no momento</p>
          <p className="text-sm text-[#8E8E8E]">Suas futuras oportunidades de negócio aparecerão aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {inquiries.map((inquiry) => (
              <motion.div 
                key={inquiry.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-[#E5E1DA] rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-8 items-start md:items-center"
              >
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider",
                      inquiry.status === 'new' ? "bg-amber-50 text-amber-600 border border-amber-200" :
                      inquiry.status === 'contacted' ? "bg-blue-50 text-blue-600 border border-blue-200" :
                      "bg-green-50 text-green-600 border border-green-200"
                    )}>
                      {inquiry.status === 'new' ? 'Novo Lead' : inquiry.status === 'contacted' ? 'Em Contato' : 'Fechado'}
                    </span>
                    <span className="flex items-center text-[10px] text-[#8E8E8E] font-medium">
                      <Clock size={12} className="mr-1" />
                      {inquiry.timestamp?.toDate ? formatDistanceToNow(inquiry.timestamp.toDate(), { addSuffix: true, locale: ptBR }) : 'Agora'}
                    </span>
                  </div>

                  <h3 className="serif text-2xl mb-4 text-[#1A1A1A]">{inquiry.userName}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 text-xs text-[#5A5A5A] bg-[#F9F8F6] p-3 rounded-lg border border-[#E5E1DA]/50">
                      <Mail size={16} className="text-[#8E8E8E]" />
                      {inquiry.userEmail}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#5A5A5A] bg-[#F9F8F6] p-3 rounded-lg border border-[#E5E1DA]/50">
                      <Phone size={16} className="text-[#8E8E8E]" />
                      {inquiry.phone || 'Não informado'}
                    </div>
                  </div>

                  <div className="p-4 bg-[#F5F2ED] rounded-xl border-l-4 border-[#1A1A1A] text-sm italic text-[#5A5A5A] mb-4">
                    <MessageSquare size={14} className="mb-2 opacity-30" />
                    "{inquiry.message}"
                  </div>

                  {inquiry.aiSummary && (
                    <div className="bg-[#1A1A1A] text-white p-6 rounded-2xl shadow-inner">
                      <div className="flex items-center gap-2 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A5A40]">
                        <Sparkles size={14} /> Perfil Qualificado por IA
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Objetivo</p>
                          <p className="text-xs font-medium">{inquiry.aiSummary.objetivo}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Localização</p>
                          <p className="text-xs font-medium">{inquiry.aiSummary.localizacao}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Budget</p>
                          <p className="text-xs font-medium">{inquiry.aiSummary.budget}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Urgência</p>
                          <p className="text-xs font-medium">{inquiry.aiSummary.urgencia}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Observações do Concierge</p>
                        <p className="text-xs leading-relaxed text-white/80 italic">{inquiry.aiSummary.observacoes}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-row md:flex-col gap-3 w-full md:w-48 shrink-0">
                  <button 
                    onClick={() => updateStatus(inquiry.id, 'contacted')}
                    className="flex-1 px-4 py-3 bg-white border border-[#1A1A1A] text-[#1A1A1A] text-[9px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#F5F2ED] transition-all flex items-center justify-center gap-2"
                  >
                    Marcar: Contatado
                  </button>
                  <button 
                    onClick={() => updateStatus(inquiry.id, 'closed')}
                    className="flex-1 px-4 py-3 bg-[#1A1A1A] text-white text-[9px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#5A5A40] transition-all flex items-center justify-center gap-2"
                  >
                    Marcar: Finalizado <CheckCircle2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
