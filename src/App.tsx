import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MarketplaceGrid } from './components/MarketplaceGrid';
import { UserDashboard } from './components/UserDashboard';
import { WalletView } from './components/WalletView';
import { AdminDashboard } from './components/AdminDashboard';
import { HelpCenter } from './components/HelpCenter';
import { AboutUs } from './components/AboutUs';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { AddProductModal } from './components/AddProductModal';

function MainAppContent() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('marketplace');
  
  // Modal States
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [addProductOpen, setAddProductOpen] = useState<boolean>(false);

  const handleOpenAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenAddProduct = () => {
    if (!currentUser) {
      handleOpenAuthModal('login');
      return;
    }
    setAddProductOpen(true);
  };

  const handleOpenDeposit = () => {
    if (!currentUser) {
      handleOpenAuthModal('login');
      return;
    }
    setActiveTab('wallet');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080b11] text-slate-100 font-sans antialiased">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAuthModal={handleOpenAuthModal}
        openAddProduct={handleOpenAddProduct}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'marketplace' && (
          <div className="space-y-8">
            <Hero
              onExplore={() => {
                const el = document.getElementById('market-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onDeposit={handleOpenDeposit}
              onPostProduct={handleOpenAddProduct}
            />
            <div id="market-grid">
              <MarketplaceGrid
                openAuthModal={() => handleOpenAuthModal('login')}
                openDeposit={handleOpenDeposit}
              />
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <UserDashboard
            setActiveTab={setActiveTab}
            openAddProduct={handleOpenAddProduct}
          />
        )}

        {activeTab === 'wallet' && <WalletView />}

        {activeTab === 'admin' && <AdminDashboard />}

        {activeTab === 'help' && <HelpCenter />}

        {activeTab === 'about' && <AboutUs />}

        {activeTab === 'notifications' && (
          <UserDashboard
            setActiveTab={setActiveTab}
            openAddProduct={handleOpenAddProduct}
          />
        )}

      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      <AddProductModal
        isOpen={addProductOpen}
        onClose={() => setAddProductOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
