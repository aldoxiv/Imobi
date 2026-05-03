import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Property, PropertyCategory, PropertyType } from '../types';
import { PropertyCard } from './PropertyCard';
import { PropertyDetails } from './PropertyDetails';
import { useAuth } from '../lib/AuthContext';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Listings() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<PropertyCategory | 'all'>('all');
  const [type, setType] = useState<PropertyType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    let q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
    
    if (category !== 'all') {
      q = query(q, where('category', '==', category));
    }
    if (type !== 'all') {
      q = query(q, where('type', '==', type));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      setProperties(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'properties');
    });

    return unsubscribe;
  }, [category, type]);

  const toggleFavorite = async (id: string) => {
    if (!profile) return;
    try {
      const userRef = doc(db, 'users', profile.id);
      const isFavorite = profile.favorites.includes(id);
      await updateDoc(userRef, {
        favorites: isFavorite ? arrayRemove(id) : arrayUnion(id)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.id}`);
    }
  };

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.address.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-xl">
          <h2 className="serif text-5xl font-light mb-4">Descubra Seu Novo Refúgio</h2>
          <p className="text-[#8E8E8E] leading-relaxed">
            Explore nossa seleção exclusiva de propriedades de alto padrão, curadas para oferecer o máximo em conforto e sofisticação.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E8E]" size={18} />
            <input 
              type="text" 
              placeholder="Ex: São Paulo, Casa Luxo..."
              className="pl-10 pr-4 py-2.5 bg-white border border-[#E5E1DA] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5A5A40] transition-all w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-white border border-[#E5E1DA] rounded-lg p-1">
            <button 
              onClick={() => setCategory('all')}
              className={cn("px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all", category === 'all' ? "bg-[#1A1A1A] text-white" : "text-[#8E8E8E] hover:text-[#1A1A1A]")}
            >
              Todos
            </button>
            <button 
              onClick={() => setCategory('buy')}
              className={cn("px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all", category === 'buy' ? "bg-[#1A1A1A] text-white" : "text-[#8E8E8E] hover:text-[#1A1A1A]")}
            >
              Venda
            </button>
            <button 
              onClick={() => setCategory('rent')}
              className={cn("px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all", category === 'rent' ? "bg-[#1A1A1A] text-white" : "text-[#8E8E8E] hover:text-[#1A1A1A]")}
            >
              Aluguel
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-40">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p className="text-sm font-medium tracking-widest uppercase">Carregando Acervo...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProperties.map(property => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                isFavorite={profile?.favorites.includes(property.id) || false}
                onToggleFavorite={toggleFavorite}
                onClick={(p) => setSelectedProperty(p)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selectedProperty && (
          <PropertyDetails 
            property={selectedProperty} 
            onClose={() => setSelectedProperty(null)} 
          />
        )}
      </AnimatePresence>

      {!loading && filteredProperties.length === 0 && (
        <div className="text-center py-32 border-2 border-dashed border-[#E5E1DA] rounded-3xl opacity-60">
          <p className="serif text-2xl italic mb-2">Nenhum imóvel encontrado</p>
          <p className="text-sm text-[#8E8E8E]">Tente ajustar seus filtros ou termos de pesquisa.</p>
        </div>
      )}
    </div>
  );
}
