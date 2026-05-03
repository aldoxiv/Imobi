import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Property, PropertyCategory, PropertyType } from '../types';
import { PropertyCard } from './PropertyCard';
import { PropertyDetails } from './PropertyDetails';
import { useAuth } from '../lib/AuthContext';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Listings() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<PropertyCategory | 'all'>('all');
  const [type, setType] = useState<PropertyType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minBedrooms, setMinBedrooms] = useState<number | 'all'>('all');
  const [minBathrooms, setMinBathrooms] = useState<number | 'all'>('all');
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

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.address.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMinPrice = minPrice === '' || p.price >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === '' || p.price <= parseFloat(maxPrice);
    const matchesBedrooms = minBedrooms === 'all' || p.bedrooms >= minBedrooms;
    const matchesBathrooms = minBathrooms === 'all' || p.bathrooms >= minBathrooms;

    return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesBedrooms && matchesBathrooms;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-xl">
          <h2 className="serif text-5xl font-light mb-4">Descubra Seu Novo Refúgio</h2>
          <p className="text-[#8E8E8E] leading-relaxed">
            Explore nossa seleção exclusiva de propriedades de alto padrão, curadas para oferecer o máximo em conforto e sofisticação.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" size={18} />
            <input 
              type="text" 
              placeholder="Localização ou Título..."
              className="pl-10 pr-4 py-3 bg-white border border-[#E5E1DA] rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] transition-all w-64 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-white border border-[#E5E1DA] rounded-full p-1 shadow-sm">
            <button 
              onClick={() => setCategory('all')}
              className={cn("px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all", category === 'all' ? "bg-[#1A1A1A] text-white" : "text-[#8E8E8E] hover:text-[#1A1A1A]")}
            >
              Todos
            </button>
            <button 
              onClick={() => setCategory('buy')}
              className={cn("px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all", category === 'buy' ? "bg-[#1A1A1A] text-white" : "text-[#8E8E8E] hover:text-[#1A1A1A]")}
            >
              Venda
            </button>
            <button 
              onClick={() => setCategory('rent')}
              className={cn("px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all", category === 'rent' ? "bg-[#1A1A1A] text-white" : "text-[#8E8E8E] hover:text-[#1A1A1A]")}
            >
              Aluguel
            </button>
          </div>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all shadow-sm",
              showFilters ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#1A1A1A] border-[#E5E1DA] hover:border-[#1A1A1A]"
            )}
          >
            <SlidersHorizontal size={14} />
            Filtros
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-12"
          >
            <div className="p-8 bg-white border border-[#E5E1DA] rounded-[2rem] shadow-sm grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E8E8E]">Faixa de Preço (BRL)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    placeholder="Min"
                    className="w-full px-4 py-3 bg-[#F5F2ED] border-none rounded-xl text-sm focus:ring-1 focus:ring-[#1A1A1A] outline-none"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <div className="w-4 h-[1px] bg-[#E5E1DA]"></div>
                  <input 
                    type="number" 
                    placeholder="Max"
                    className="w-full px-4 py-3 bg-[#F5F2ED] border-none rounded-xl text-sm focus:ring-1 focus:ring-[#1A1A1A] outline-none"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E8E8E]">Dormitórios</label>
                <div className="flex bg-[#F5F2ED] p-1 rounded-xl">
                  {['all', 1, 2, 3, 4].map((n) => (
                    <button
                      key={`bed-${n}`}
                      onClick={() => setMinBedrooms(n as any)}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                        minBedrooms === n ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#8E8E8E] hover:text-[#1A1A1A]"
                      )}
                    >
                      {n === 'all' ? 'Todos' : `${n}+`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E8E8E]">Banheiros</label>
                <div className="flex bg-[#F5F2ED] p-1 rounded-xl">
                  {['all', 1, 2, 3, 4].map((n) => (
                    <button
                      key={`bath-${n}`}
                      onClick={() => setMinBathrooms(n as any)}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                        minBathrooms === n ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#8E8E8E] hover:text-[#1A1A1A]"
                      )}
                    >
                      {n === 'all' ? 'Todos' : `${n}+`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end">
                <button 
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                    setMinBedrooms('all');
                    setMinBathrooms('all');
                    setSearchTerm('');
                    setCategory('all');
                  }}
                  className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] border-b border-[#1A1A1A] hover:opacity-60 transition-all text-center mb-1"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
