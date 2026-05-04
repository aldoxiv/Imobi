import React, { useState } from 'react';
import { AuthProvider } from './lib/AuthContext';
import { Navbar } from './components/Navbar';
import { Listings } from './components/Listings';
import { InquiryList } from './components/InquiryList';
import { ClientManagement } from './components/ClientManagement';
import { useAuth } from './lib/AuthContext';
import { db, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType } from './lib/firebase';
import { Sparkles, Database } from 'lucide-react';

function Dashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'listings' | 'clients'>('listings');

  const seedDatabase = async () => {
    if (!user) return;
    
    const mockProperties = [
      {
        title: "Mansão Contemporânea no Jardim Europa",
        description: "Uma obra-prima da arquitetura moderna, com acabamentos em mármore travertino e concreto aparente. Possui home theater privativo, adega subterrânea e piscina aquecida com borda infinita.",
        price: 12500000,
        currency: "BRL",
        category: "buy",
        type: "house",
        bedrooms: 5,
        bathrooms: 7,
        sqft: 850,
        address: { street: "Rua Groenlândia", city: "São Paulo", state: "SP", zip: "01445-000" },
        images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200", "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200"],
        features: ["Piscina", "Adega", "Automação", "Segurança 24h"],
        agentId: user.uid,
        status: "active",
        createdAt: serverTimestamp()
      },
      {
        title: "Cobertura Duplex Duas Faces",
        description: "Exclusividade e vista 360º de Curitiba. Com projeto de iluminação impecável e terraço gourmet espaçoso para recepções inesquecíveis.",
        price: 4800000,
        currency: "BRL",
        category: "buy",
        type: "apartment",
        bedrooms: 4,
        bathrooms: 5,
        sqft: 320,
        address: { street: "Av. Batel", city: "Curitiba", state: "PR", zip: "80420-000" },
        images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200"],
        features: ["Cobertura", "Gourmet", "Ar Condicionado"],
        agentId: user.uid,
        status: "active",
        createdAt: serverTimestamp()
      },
      {
        title: "Refúgio Contemporâneo na Serra",
        description: "Integrada à natureza, esta residência em Campos do Jordão combina o calor da madeira com vãos amplos de vidro. Lareira central suspensa em cobre.",
        price: 18000,
        currency: "BRL",
        category: "rent",
        type: "house",
        bedrooms: 3,
        bathrooms: 4,
        sqft: 280,
        address: { street: "Estrada das Flores", city: "Campos do Jordão", state: "SP", zip: "12460-000" },
        images: ["https://images.unsplash.com/photo-1542318238-430169a5c7c2?auto=format&fit=crop&q=80&w=1200"],
        features: ["Lareira", "Natureza", "Deck"],
        agentId: user.uid,
        status: "active",
        createdAt: serverTimestamp()
      }
    ];

    try {
      for (const p of mockProperties) {
        await addDoc(collection(db, 'properties'), p);
      }
      alert('Imóveis de exemplo adicionados com sucesso!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'properties');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      
      <main>
        {currentView === 'listings' ? (
          <>
            {/* Hero Section */}
            <div className="relative h-[60vh] bg-[#1A1A1A] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000"
                className="w-full h-full object-cover opacity-50 scale-105"
                alt="Luxury Home"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                <div className="max-w-4xl">
                  <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md text-[#F5F2ED] text-[10px] font-bold uppercase tracking-[0.4em] mb-8 border border-white/20 rounded-full">
                    Exclusividade Brasileira
                  </span>
                  <h2 className="serif text-6xl md:text-8xl text-white font-light tracking-tighter mb-8 leading-tight italic">
                    Onde a sofisticação encontra <br /> o seu novo endereço.
                  </h2>
                  <div className="flex flex-wrap items-center justify-center gap-6">
                    <button className="px-10 py-4 bg-[#F5F2ED] text-[#1A1A1A] text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-white transition-all shadow-xl">
                      Explorar Propriedades
                    </button>
                    <button className="px-10 py-4 bg-transparent text-white border border-white/40 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-white/10 backdrop-blur-sm transition-all">
                      Consultar Agente
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Listings />

            {/* Leads Management Section for Agents */}
            {user && (
              <div className="bg-white/50 backdrop-blur-sm pt-8 pb-12 border-t border-[#E5E1DA]">
                <InquiryList />
              </div>
            )}

            {/* Admin/User Seed Section */}
            {user && (
              <div className="max-w-7xl mx-auto px-4 py-12 mb-12">
                <div className="bg-[#1A1A1A] rounded-[2rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <h3 className="serif text-4xl mb-4 italic">Bem-vindo, {user.displayName?.split(' ')[0]}.</h3>
                    <p className="text-white/60 max-w-md leading-relaxed whitespace-pre-line">
                      Para começar sua experiência, você pode carregar algumas propriedades de exemplo para ver como o portal se comporta.
                    </p>
                  </div>
                  <button 
                    onClick={seedDatabase}
                    className="relative z-10 group flex items-center gap-4 bg-white text-[#1A1A1A] px-8 py-5 rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#F5F2ED] transition-all shadow-xl active:scale-95"
                  >
                    <Database size={18} /> Carregar Imóveis Modelos
                    <Sparkles size={16} className="text-[#5A5A40] animate-pulse" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <ClientManagement />
        )}
      </main>

      <footer className="bg-[#F0EFEA] border-t border-[#E5E1DA] py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="serif text-5xl font-light italic mb-8">Imobi</h2>
          <div className="flex justify-center gap-12 text-[10px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E] mb-12">
            <a href="#" className="hover:text-[#1A1A1A] transition-all">Privacidade</a>
            <a href="#" className="hover:text-[#1A1A1A] transition-all">Termos</a>
            <a href="#" className="hover:text-[#1A1A1A] transition-all">Imprensa</a>
            <a href="#" className="hover:text-[#1A1A1A] transition-all">Carreiras</a>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-[#8E8E8E]">
            © 2026 Imobi Portal Imobiliário. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
