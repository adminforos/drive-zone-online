import React from 'react';
import { MessageSquare, ShieldCheck, Zap, Lock, Headset } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const WHATSAPP_NUMBER = '01625174905';
  const WHATSAPP_LINK = `https://wa.me/8801625174905?text=Hello%20Drive%20Zone%20Online%20Support`;

  return (
    <footer className="bg-[#05070c] border-t border-slate-800/80 text-slate-400 mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/60">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-black font-extrabold font-display">
                DZ
              </div>
              <span className="font-display font-extrabold text-white text-lg tracking-wider">
                DRIVE ZONE <span className="text-cyan-400">ONLINE</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The ultimate trusted gaming marketplace for Drive Zone Online players in Bangladesh. Buy, sell, transfer wallet funds, and manage game items securely.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                WhatsApp: {WHATSAPP_NUMBER}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-display font-bold text-white uppercase tracking-wider text-cyan-400">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('marketplace')} className="hover:text-cyan-400 transition-colors">
                  Explore Products
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('marketplace')} className="hover:text-cyan-400 transition-colors">
                  Vehicles & Hypercar Skins
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('marketplace')} className="hover:text-cyan-400 transition-colors">
                  VIP Game Accounts
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('marketplace')} className="hover:text-cyan-400 transition-colors">
                  In-Game Coins & Diamonds
                </button>
              </li>
            </ul>
          </div>

          {/* Wallet & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-display font-bold text-white uppercase tracking-wider text-cyan-400">
              Payment & Wallet
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('wallet')} className="hover:text-cyan-400 transition-colors">
                  bKash / Nagad / Rocket Deposit
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('wallet')} className="hover:text-cyan-400 transition-colors">
                  User-to-User Transfer (৳20 Fee)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('wallet')} className="hover:text-cyan-400 transition-colors">
                  Wallet Withdrawal Requests
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('help')} className="hover:text-cyan-400 transition-colors">
                  Payment Verification Help
                </button>
              </li>
            </ul>
          </div>

          {/* Help & Policies */}
          <div className="space-y-3">
            <h4 className="text-sm font-display font-bold text-white uppercase tracking-wider text-cyan-400">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('help')} className="hover:text-cyan-400 transition-colors">
                  Help Center & FAQs
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-cyan-400 transition-colors">
                  About Drive Zone Online
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-cyan-400 transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Security badges & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              100% Secure Atomic Transactions
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Zap className="w-4 h-4 text-amber-400" />
              Instant Wallet Transfers
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Headset className="w-4 h-4 text-emerald-400" />
              WhatsApp Support: {WHATSAPP_NUMBER}
            </span>
          </div>
          <p>© {new Date().getFullYear()} DRIVE ZONE ONLINE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
