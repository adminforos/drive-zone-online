import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Wallet,
  User as UserIcon,
  Bell,
  LogOut,
  PlusCircle,
  HelpCircle,
  Info,
  ShoppingBag,
  X,
  Menu,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
  openAddProduct: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAuthModal,
  openAddProduct,
}) => {
  const { currentUser, userProfile, isAdmin, logoutUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      where('read', '==', false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });
    return () => unsubscribe();
  }, [currentUser]);

  return (
    <header className="sticky top-0 z-40 bg-[#080b11]/95 backdrop-blur-md border-b border-slate-800/80 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2 shrink min-w-0">
            <button
              onClick={() => setActiveTab('marketplace')}
              className="group flex items-center gap-2 text-left focus:outline-none min-w-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-black font-extrabold shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform shrink-0">
                <span className="font-display text-sm sm:text-lg tracking-tighter">DZ</span>
              </div>
              <div className="min-w-0">
                <span className="font-display text-sm sm:text-lg lg:text-xl font-black tracking-wider text-white block truncate">
                  DRIVE ZONE <span className="text-cyan-400 font-extrabold">ONLINE</span>
                </span>
                <span className="text-[9px] sm:text-[10px] text-cyan-400/80 font-mono tracking-widest hidden sm:block -mt-1 uppercase truncate">
                  Official Marketplace
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-300">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'marketplace' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-1' : ''
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Marketplace
            </button>

            {currentUser && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'dashboard' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-1' : ''
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  Dashboard
                </button>

                <button
                  onClick={() => setActiveTab('wallet')}
                  className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'wallet' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-1' : ''
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  Wallet & Deposit
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('help')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'help' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-1' : ''
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Help Center
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'about' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-1' : ''
              }`}
            >
              <Info className="w-4 h-4" />
              About Us
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 font-bold px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 ${
                  activeTab === 'admin' ? 'bg-amber-500/20 border-amber-400' : ''
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Admin Panel
              </button>
            )}
          </nav>

          {/* Zone 3: Actions & User Info */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {currentUser && userProfile ? (
              <>
                {/* Balance Display */}
                <button
                  onClick={() => setActiveTab('wallet')}
                  className="hidden md:flex items-center gap-2 bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 px-3 py-1.5 rounded-xl transition-all shadow-inner group"
                >
                  <Wallet className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <span className="text-[9px] text-slate-400 font-mono block leading-none">Wallet</span>
                    <span className="text-xs font-tech font-bold text-white group-hover:text-cyan-300">
                      ৳{userProfile.balance.toLocaleString()}
                    </span>
                  </div>
                </button>

                {/* Sell Item CTA */}
                <button
                  onClick={openAddProduct}
                  className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 active:scale-95 whitespace-nowrap"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  Sell
                </button>

                {/* Notifications Bell */}
                <button
                  onClick={() => setActiveTab('notifications')}
                  className="relative p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-cyan-500 text-black text-[10px] sm:text-[11px] font-black flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Profile */}
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all"
                  title="My Dashboard"
                >
                  <img
                    src={userProfile.photoURL || '/src/assets/images/gaming_avatar_default_1793627363341.jpg'}
                    alt={userProfile.fullName}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>

                {/* Desktop Logout Button */}
                <button
                  onClick={logoutUser}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-red-400 hover:text-red-300 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-xs font-bold transition-colors"
                  title="Log Out Account"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span className="hidden lg:inline">Log Out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="text-xs font-bold text-slate-200 hover:text-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900 sm:bg-transparent border border-slate-800 sm:border-none transition-colors whitespace-nowrap"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-[11px] sm:text-xs uppercase tracking-wider px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all shadow-md shadow-cyan-500/20 active:scale-95 whitespace-nowrap"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-slate-300 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-2 bg-[#080b11] rounded-b-2xl px-2">
            {currentUser && userProfile && (
              <div className="p-3 mb-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={userProfile.photoURL || '/src/assets/images/gaming_avatar_default_1793627363341.jpg'}
                    alt={userProfile.fullName}
                    className="w-9 h-9 rounded-lg object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{userProfile.fullName}</p>
                    <p className="text-[10px] text-cyan-400 font-mono">{userProfile.gamingId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-mono">Balance</p>
                  <p className="text-sm font-tech font-bold text-cyan-300">৳{userProfile.balance.toLocaleString()}</p>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setActiveTab('marketplace');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-900 hover:text-cyan-400 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-cyan-400" /> Marketplace
            </button>

            {currentUser ? (
              <>
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-900 hover:text-cyan-400 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-cyan-400" /> User Dashboard
                </button>
                <button
                  onClick={() => {
                    setActiveTab('wallet');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-900 hover:text-cyan-400 flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4 text-cyan-400" /> Wallet & Deposit (bKash/Nagad/Rocket)
                </button>
                <button
                  onClick={() => {
                    openAddProduct();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-black bg-cyan-400 flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" /> Post New Gaming Product
                </button>

                <button
                  onClick={() => {
                    logoutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-red-400 bg-red-950/40 border border-red-500/30 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-red-400" /> Log Out Account
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2 pb-1">
                <button
                  onClick={() => {
                    openAuthModal('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 border border-slate-800 flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" /> Log In
                </button>
                <button
                  onClick={() => {
                    openAuthModal('register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 rounded-xl text-xs font-extrabold text-black bg-cyan-400 flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Register
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setActiveTab('help');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-900 hover:text-cyan-400 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" /> Help Center (WhatsApp)
            </button>

            <button
              onClick={() => {
                setActiveTab('about');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-900 hover:text-cyan-400 flex items-center gap-2"
            >
              <Info className="w-4 h-4 text-cyan-400" /> About Us
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" /> Admin Dashboard
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
