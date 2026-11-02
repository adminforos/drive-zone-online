import React from 'react';
import { ShoppingBag, Wallet, ShieldCheck, Zap, PlusCircle, ArrowRight } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
  onDeposit: () => void;
  onPostProduct: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onDeposit, onPostProduct }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-cyan-500/20 bg-[#0b0f19] mb-8 sm:mb-12 shadow-2xl w-full max-w-full">
      {/* Background Hero Image with Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_car_game_banner_1793627363143.jpg"
          alt="Drive Zone Online High-Speed Hypercar"
          className="w-full h-full object-cover object-center opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080b11] via-[#080b11]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b11] via-transparent to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl px-4 py-8 sm:px-12 sm:py-20 space-y-4 sm:space-y-6">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-wider">
          <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
          Official Drive Zone Marketplace
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl lg:text-6xl font-display font-black tracking-tight text-white leading-tight break-words">
          BUY, SELL & TRADE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500">
            DRIVE ZONE ASSETS
          </span>
        </h1>

        <p className="text-slate-300 text-xs sm:text-base max-w-xl leading-relaxed">
          The official marketplace for Drive Zone Online players. Trade hypercars, custom vinyl skins, VIP accounts, and in-game diamonds securely with instant wallet payouts.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-4 pt-2 w-full max-w-full">
          <button
            onClick={onExplore}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl shadow-cyan-500/25 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            Explore Products
          </button>

          <button
            onClick={onDeposit}
            className="flex items-center justify-center gap-2 bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-lg backdrop-blur"
          >
            <Wallet className="w-4 h-4 text-cyan-400" />
            Deposit Funds (01625174905)
          </button>

          <button
            onClick={onPostProduct}
            className="flex items-center justify-center gap-2 bg-slate-900/60 border border-slate-700/80 hover:border-slate-500 text-slate-300 hover:text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Sell Product
          </button>
        </div>

        {/* Value Props Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-800/80 max-w-2xl text-[11px] sm:text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>100% Verified Wallet Protection</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>bKash / Nagad / Rocket Payments</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Fee: ৳20 Deposit / Transfer</span>
          </div>
        </div>

      </div>
    </div>
  );
};
