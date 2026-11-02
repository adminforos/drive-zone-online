import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingBag, AlertCircle, CheckCircle2, Shield, Loader2, Sparkles, PlusCircle } from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { ProductCard } from './ProductCard';
import { subscribeActiveProducts, purchaseProductAtomic, removeAllDemoProducts } from '../services/marketServices';
import { useAuth } from '../context/AuthContext';

interface MarketplaceGridProps {
  openAuthModal: () => void;
  openDeposit: () => void;
  openAddProduct?: () => void;
}

const CATEGORIES: (ProductCategory | 'All')[] = [
  'All',
  'Vehicles & Skins',
  'Game Accounts',
  'In-Game Coins/Diamonds',
  'VIP & Passes',
  'Other',
];

export const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({ openAuthModal, openDeposit, openAddProduct }) => {
  const { currentUser, userProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Purchase Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buying, setBuying] = useState<boolean>(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);

  // Subscribe to products in Firestore and purge any demo products
  useEffect(() => {
    // Purge any residual demo items from database
    removeAllDemoProducts();

    const unsubscribe = subscribeActiveProducts((items) => {
      setProducts(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.gamingId && p.gamingId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleInitiateBuy = (product: Product) => {
    if (!currentUser || !userProfile) {
      openAuthModal();
      return;
    }
    setSelectedProduct(product);
    setPurchaseError(null);
    setPurchaseSuccess(false);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedProduct || !userProfile) return;
    setBuying(true);
    setPurchaseError(null);

    try {
      await purchaseProductAtomic(userProfile, selectedProduct);
      setPurchaseSuccess(true);
      setTimeout(() => {
        setSelectedProduct(null);
        setPurchaseSuccess(false);
      }, 2500);
    } catch (err: any) {
      setPurchaseError(err.message || 'Purchase failed. Please check your wallet balance.');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-black font-extrabold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products or Gaming ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>

      </div>

      {/* Grid Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
          AVAILABLE MARKETPLACE PRODUCTS
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {filteredProducts.length} Items
          </span>
        </h2>
      </div>

      {/* Loading Skeleton / Product Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-xs font-mono">Loading Drive Zone marketplace items...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No active listings available</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'All'
              ? `No products match "${searchQuery || selectedCategory}".`
              : 'The marketplace currently has no user listings. Be the first to post a product for sale!'}
          </p>
          {openAddProduct && (
            <button
              onClick={openAddProduct}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs uppercase"
            >
              <PlusCircle className="w-4 h-4" /> Post First Product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onBuy={handleInitiateBuy}
              isOwner={currentUser?.uid === p.sellerId}
            />
          ))}
        </div>
      )}

      {/* PURCHASE CONFIRMATION MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="cyber-card max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 rounded-3xl border border-cyan-500/40 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-display font-extrabold text-white text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-cyan-400" />
                Confirm Order Purchase
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {purchaseSuccess ? (
              <div className="p-6 text-center space-y-3 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-white">Purchase Completed!</h4>
                <p className="text-xs text-slate-300">
                  You purchased "{selectedProduct.title}" for ৳{selectedProduct.price.toLocaleString()}. Check your dashboard for order details.
                </p>
              </div>
            ) : (
              <>
                {/* Item Details Box */}
                <div className="flex gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <img
                    src={selectedProduct.productImage}
                    alt={selectedProduct.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-1 text-xs">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                      {selectedProduct.category}
                    </span>
                    <h4 className="font-bold text-white text-sm line-clamp-1">{selectedProduct.title}</h4>
                    <p className="text-slate-400 text-[11px]">Seller: {selectedProduct.sellerName}</p>
                    {selectedProduct.gamingId && (
                      <p className="text-cyan-400 font-mono text-[11px]">Gaming ID: {selectedProduct.gamingId}</p>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Product Price:</span>
                    <span className="font-tech font-bold text-white">৳{selectedProduct.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Marketplace Transaction Fee:</span>
                    <span className="font-tech font-bold text-emerald-400">৳0 (Free)</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800 font-bold">
                    <span>Your Current Balance:</span>
                    <span className="font-tech text-cyan-300">৳{userProfile?.balance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 font-bold">
                    <span>Remaining After Purchase:</span>
                    <span
                      className={`font-tech ${
                        (userProfile?.balance || 0) < selectedProduct.price
                          ? 'text-red-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      ৳{((userProfile?.balance || 0) - selectedProduct.price).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Error Banner */}
                {purchaseError && (
                  <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <div>
                      <p className="font-bold">Purchase Error</p>
                      <p className="text-[11px]">{purchaseError}</p>
                      {(userProfile?.balance || 0) < selectedProduct.price && (
                        <button
                          onClick={() => {
                            setSelectedProduct(null);
                            openDeposit();
                          }}
                          className="mt-2 inline-block font-extrabold text-cyan-400 underline hover:text-cyan-300 text-xs"
                        >
                          Deposit Funds to Wallet Now →
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Confirm / Cancel Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPurchase}
                    disabled={buying || (userProfile?.balance || 0) < selectedProduct.price}
                    className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    {buying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Processing Transaction...
                      </>
                    ) : (
                      `Confirm Purchase – ৳${selectedProduct.price.toLocaleString()}`
                    )}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
