import React from 'react';
import { ShieldCheck, Zap, Users, ShoppingBag, MessageSquare, Info, Lock } from 'lucide-react';

export const AboutUs: React.FC = () => {
  const WHATSAPP_NUMBER = '01625174905';

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Info className="w-3.5 h-3.5" /> Official Platform Information
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black text-white">
          ABOUT <span className="text-cyan-400">DRIVE ZONE ONLINE</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          The Premier Gaming Marketplace for Drive Zone Online Gamers in Bangladesh.
        </p>
      </div>

      {/* About Platform */}
      <div className="cyber-card p-8 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-cyan-400" /> About the Platform
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>DRIVE ZONE ONLINE</strong> is a dedicated digital gaming marketplace engineered specifically for Drive Zone Online players. Our platform bridges gamers looking to trade high-tier hypercars, custom vinyl skins, max-level VIP accounts, and in-game diamonds securely using local Bangladeshi payment gateways like bKash, Nagad, and Rocket.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <Zap className="w-8 h-8 text-amber-400" />
          <h3 className="font-display font-bold text-white text-sm">Instant Wallet Deposits</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Quickly add funds via bKash, Nagad, or Rocket with manual TrxID verification and fixed ৳20 fee.
          </p>
        </div>

        <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <ShieldCheck className="w-8 h-8 text-cyan-400" />
          <h3 className="font-display font-bold text-white text-sm">Atomic Order Security</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Transactions are guaranteed by database transactions—funds are safely credited only when item availability is confirmed.
          </p>
        </div>

        <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <Users className="w-8 h-8 text-emerald-400" />
          <h3 className="font-display font-bold text-white text-sm">User-to-User Transfer</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Transfer wallet balance directly to fellow gamers by Gaming ID or Email with ৳20 processing fee.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="cyber-card p-8 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-xl font-display font-bold text-white">How It Works</h2>
        <ol className="text-xs text-slate-300 space-y-3 list-decimal list-inside leading-relaxed">
          <li><strong>Register Account:</strong> Sign up with your email, WhatsApp number, and Drive Zone Gaming ID.</li>
          <li><strong>Deposit Funds:</strong> Add money to your wallet using bKash/Nagad/Rocket payment number 01625174905.</li>
          <li><strong>Browse & Buy:</strong> Select products from verified sellers and click Buy Now.</li>
          <li><strong>Sell Items:</strong> Post your own hypercar skins or game accounts to earn wallet balance.</li>
        </ol>
      </div>

      {/* Terms & Privacy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <h3 className="font-display font-bold text-white text-sm text-cyan-400">Terms & Conditions</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All users must provide genuine Transaction IDs for deposits. Fraudulent or duplicate TrxID submissions will lead to immediate account suspension. Users are responsible for accurate account transfers.
          </p>
        </div>

        <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <h3 className="font-display font-bold text-white text-sm text-cyan-400">Privacy Policy</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your user information (email, WhatsApp number, Gaming ID) is stored securely on Google Firebase Cloud Firestore and is only used to manage marketplace orders and support inquiries.
          </p>
        </div>
      </div>

    </div>
  );
};
