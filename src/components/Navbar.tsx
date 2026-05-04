import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { LogIn, LogOut, Heart, User, Home, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface NavbarProps {
  currentView: 'listings' | 'clients';
  setCurrentView: (view: 'listings' | 'clients') => void;
}

export function Navbar({ currentView, setCurrentView }: NavbarProps) {
  const { user, profile, signIn, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-[#F5F2ED]/80 backdrop-blur-md border-b border-[#E5E1DA]">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('listings')}>
          <div className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center text-[#F5F2ED]">
            <Home size={20} />
          </div>
          <h1 className="serif text-3xl font-light tracking-tighter uppercase italic">Imobi</h1>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-[#8E8E8E]">
          <button 
            onClick={() => setCurrentView('listings')}
            className={cn("transition-colors uppercase tracking-widest", currentView === 'listings' ? "text-[#1A1A1A]" : "hover:text-[#1A1A1A]")}
          >
            Imóveis
          </button>
          {profile?.role === 'agent' && (
            <button 
              onClick={() => setCurrentView('clients')}
              className={cn("transition-colors uppercase tracking-widest flex items-center gap-2", currentView === 'clients' ? "text-[#1A1A1A]" : "hover:text-[#1A1A1A]")}
            >
              <Users size={14} /> Clientes
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-6">
              <button className="relative group">
                <Heart size={20} className="text-[#1A1A1A] group-hover:text-red-500 transition-colors" />
                {profile?.favorites.length ? (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold">
                    {profile.favorites.length}
                  </span>
                ) : null}
              </button>
              <div className="flex items-center gap-3 pl-6 border-l border-[#E5E1DA]">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Avatar" className="w-9 h-9 rounded-full border border-[#E5E1DA]" />
                ) : (
                  <div className="w-9 h-9 bg-white border border-[#E5E1DA] rounded-full flex items-center justify-center">
                    <User size={18} className="text-[#8E8E8E]" />
                  </div>
                )}
                <div className="hidden lg:block text-right">
                  <p className="text-[11px] font-bold uppercase tracking-wider leading-none mb-1">{profile?.displayName?.split(' ')[0]}</p>
                  <button 
                    onClick={signOut}
                    className="text-[9px] uppercase tracking-widest text-[#8E8E8E] hover:text-red-500 transition-colors block ml-auto"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={signIn}
              className="px-6 py-2.5 bg-[#1A1A1A] text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#5A5A40] transition-all flex items-center gap-2 shadow-lg active:scale-95"
            >
              <LogIn size={16} /> Entrar
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
