import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db, collection, addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp, handleFirestoreError, OperationType, doc } from '../lib/firebase';
import { Client } from '../types';
import { User, Mail, Phone, MapPin, FileText, Plus, Trash2, Edit2, X, Check, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function ClientManagement() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;

    const clientsQuery = query(
      collection(db, 'clients'),
      where('agentId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(clientsQuery, (snapshot) => {
      const clientList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[];
      setClients(clientList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'clients');
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingClient) return;

    try {
      if (isEditing && editingClient.id) {
        const { id, ...dataToUpdate } = editingClient;
        const clientRef = doc(db, 'clients', id!);
        await updateDoc(clientRef, {
          ...dataToUpdate,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'clients'), {
          ...editingClient,
          agentId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      resetForm();
    } catch (error) {
      handleFirestoreError(error, isEditing ? OperationType.UPDATE : OperationType.CREATE, 'clients');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingClient(null);
    setShowForm(false);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      await deleteDoc(doc(db, 'clients', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `clients/${id}`);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="serif text-5xl font-light mb-2 italic text-[#1A1A1A]">Gerenciamento de Clientes</h2>
          <p className="text-[#8E8E8E] text-[10px] uppercase tracking-[0.2em] font-bold">Portal do Corretor / CRM</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-3 bg-[#1A1A1A] text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#333] transition-all shadow-xl active:scale-95"
        >
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      <div className="mb-8 relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/30" size={18} />
        <input 
          type="text" 
          placeholder="Buscar clientes por nome ou email..."
          className="w-full pl-12 pr-6 py-4 bg-white border border-[#E5E1DA] rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]/20 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/40 backdrop-blur-sm"
          >
            <div className="bg-[#F5F2ED] w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="serif text-3xl italic">{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                  <button onClick={resetForm} className="p-2 hover:bg-black/5 rounded-full transition-all">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] ml-1">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/30" size={18} />
                        <input 
                          required
                          className="w-full pl-12 pr-6 py-4 bg-white border border-[#E5E1DA] rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]/20 shadow-sm"
                          value={editingClient?.name || ''}
                          onChange={e => setEditingClient(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] ml-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/30" size={18} />
                        <input 
                          required
                          type="email"
                          className="w-full pl-12 pr-6 py-4 bg-white border border-[#E5E1DA] rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]/20 shadow-sm"
                          value={editingClient?.email || ''}
                          onChange={e => setEditingClient(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] ml-1">Telefone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/30" size={18} />
                        <input 
                          className="w-full pl-12 pr-6 py-4 bg-white border border-[#E5E1DA] rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]/20 shadow-sm"
                          value={editingClient?.phone || ''}
                          onChange={e => setEditingClient(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] ml-1">Endereço</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/30" size={18} />
                        <input 
                          className="w-full pl-12 pr-6 py-4 bg-white border border-[#E5E1DA] rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]/20 shadow-sm"
                          value={editingClient?.address || ''}
                          onChange={e => setEditingClient(prev => ({ ...prev, address: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] ml-1">Notas e Preferências</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 text-[#1A1A1A]/30" size={18} />
                      <textarea 
                        className="w-full pl-12 pr-6 py-4 bg-white border border-[#E5E1DA] rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]/20 shadow-sm min-h-[120px]"
                        placeholder="Quais tipos de imóveis o cliente busca?"
                        value={editingClient?.notes || ''}
                        onChange={e => setEditingClient(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button 
                      type="submit"
                      className="flex-1 bg-[#1A1A1A] text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <Check size={18} /> {isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                    </button>
                    <button 
                      type="button"
                      onClick={resetForm}
                      className="px-8 border border-[#E5E1DA] text-[#1A1A1A] py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white transition-all shadow-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="text-xs uppercase tracking-widest font-bold">Carregando Clientes...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white border border-[#E5E1DA] rounded-[2.5rem] p-32 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#F5F2ED] rounded-full mb-8">
            <User size={32} className="text-[#1A1A1A]/20" />
          </div>
          <h3 className="serif text-3xl mb-4 italic">Nenhum cliente encontrado.</h3>
          <p className="text-[#8E8E8E] max-w-sm mx-auto text-sm leading-relaxed">
            {searchTerm ? 'Tente ajustar sua busca ou limpar os filtros.' : 'Comece cadastrando seu primeiro cliente para gerenciar suas preferências.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClients.map((client) => (
            <motion.div 
              layout
              key={client.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group bg-white border border-[#E5E1DA] rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 bg-[#F5F2ED] rounded-2xl flex items-center justify-center text-[#1A1A1A]/40 group-hover:bg-[#1A1A1A] group-hover:text-white transition-all duration-500">
                    <User size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(client)}
                      className="p-3 hover:bg-[#F5F2ED] rounded-xl transition-all text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(client.id)}
                      className="p-3 hover:bg-red-50 rounded-xl transition-all text-[#1A1A1A]/40 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="serif text-2xl font-medium mb-1 group-hover:tracking-wide transition-all duration-500">{client.name}</h4>
                  <p className="text-[#8E8E8E] text-[10px] font-bold uppercase tracking-widest">{client.email}</p>
                </div>

                <div className="space-y-4 pt-6 border-t border-[#F5F2ED]">
                  <div className="flex items-center gap-3 text-xs text-[#8E8E8E]">
                    <Phone size={14} className="opacity-40" /> {client.phone || 'Sem telefone'}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#8E8E8E]">
                    <MapPin size={14} className="opacity-40" /> {client.address || 'Sem endereço'}
                  </div>
                </div>

                {client.notes && (
                  <div className="mt-8 p-6 bg-[#F5F2ED] rounded-2xl">
                    <p className="text-xs text-[#1A1A1A]/60 italic leading-relaxed line-clamp-3">
                      "{client.notes}"
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
