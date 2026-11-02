import React from 'react';
import { ShoppingCart, ShieldCheck, User, Tag, Key } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product) => void;
  isOwner: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onBuy, isOwner }) => {
  return (
    <div className="cyber-card group rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-cyan-500/10">
      
      {/* Card Header & Image */}
      <div>
        <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
          <img
            src={product.productImage || '/src/assets/images/product_lamborghini_skin_1793627363437.jpg'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback image if broken
              e.currentTarget.src = '/src/assets/images/product_lamborghini_skin_1793627363437.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-transparent to-transparent opacity-80" />

          {/* Category Tag */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-cyan-300 text-[11px] font-semibold backdrop-blur">
            {product.category}
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-cyan-500 text-black font-tech font-extrabold text-base tracking-wider shadow-lg shadow-cyan-500/30">
            ৳{product.price.toLocaleString()}
          </div>
        </div>

        {/* Details Section */}
        <div className="p-5 space-y-3">
          <h3 className="font-display font-bold text-white text-base leading-snug group-hover:text-cyan-300 transition-colors line-clamp-1">
            {product.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Gaming ID / Seller Info */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs">
            {product.gamingId && (
              <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                <Key className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Gaming ID: <strong className="text-white">{product.gamingId}</strong></span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Seller: <strong className="text-slate-200">{product.sellerName}</strong>
              </span>
              <span className="font-mono text-cyan-400/80 text-[10px]">
                {product.sellerGamingId || 'Verified'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 pt-0">
        {isOwner ? (
          <div className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center text-xs font-semibold text-slate-400">
            Your Listing
          </div>
        ) : (
          <button
            onClick={() => onBuy(product)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20 active:scale-95"
          >
            <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
            Buy Now – ৳{product.price.toLocaleString()}
          </button>
        )}
      </div>

    </div>
  );
};
