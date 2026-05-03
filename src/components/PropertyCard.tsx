import React from 'react';
import { Property } from '../types';
import { formatPrice } from '../lib/utils';
import { Bed, Bath, Maximize, Heart, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClick: (property: Property) => void;
}

export function PropertyCard({ property, isFavorite, onToggleFavorite, onClick }: PropertyCardProps) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-[#E5E1DA]"
    >
      <div className="relative h-64 overflow-hidden aspect-[4/3]">
        <img 
          src={property.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider text-[#1A1A1A] rounded-full">
            {property.category === 'buy' ? 'À Venda' : 'Aluguel'}
          </span>
          {property.status === 'sold' && (
            <span className="px-3 py-1 bg-red-500/90 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider text-white rounded-full">
              Vendido
            </span>
          )}
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(property.id);
          }}
          className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
        >
          <Heart 
            className={isFavorite ? "fill-red-500 stroke-red-500" : "stroke-[#1A1A1A]"} 
            size={18} 
          />
        </button>
      </div>

      <div className="p-6 cursor-pointer" onClick={() => onClick(property)}>
        <div className="mb-2">
          <h3 className="serif text-2xl font-light leading-tight group-hover:text-[#5A5A40] transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center text-[#8E8E8E] text-xs mt-1">
            <MapPin size={12} className="mr-1" />
            {property.address.city}, {property.address.state}
          </div>
        </div>

        <div className="flex items-center gap-4 text-[#8E8E8E] text-[11px] uppercase tracking-wider mb-4 font-medium border-t border-b border-[#F0EFEA] py-3">
          <span className="flex items-center">
            <Bed size={14} className="mr-1.5" /> {property.bedrooms} Quartos
          </span>
          <span className="flex items-center">
            <Bath size={14} className="mr-1.5" /> {property.bathrooms} Banhos
          </span>
          <span className="flex items-center">
            <Maximize size={14} className="mr-1.5" /> {property.sqft} m²
          </span>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] uppercase text-[#8E8E8E] font-semibold tracking-widest block mb-0.5">
              Valor
            </span>
            <p className="text-xl font-medium tracking-tight">
              {formatPrice(property.price, property.currency)}
              {property.category === 'rent' && <span className="text-sm font-normal text-[#8E8E8E]">/mês</span>}
            </p>
          </div>
          <button className="text-[11px] font-bold uppercase tracking-widest border-b border-[#1A1A1A] pb-0.5 hover:text-[#5A5A40] hover:border-[#5A5A40] transition-all">
            Detalhes
          </button>
        </div>
      </div>
    </motion.div>
  );
}
