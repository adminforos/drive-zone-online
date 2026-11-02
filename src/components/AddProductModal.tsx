import React, { useState } from 'react';
import { PlusCircle, Image, Upload, X, Tag, Key, DollarSign, Loader2, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProductCategory } from '../types';
import { createProductListing } from '../services/marketServices';
import { compressImageFile } from '../lib/imageCompressor';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_IMAGES = [
  { name: 'Hypercar Skin', url: '/src/assets/images/product_lamborghini_skin_1793627363437.jpg' },
  { name: 'VIP Account Badge', url: '/src/assets/images/product_game_account_vip_1793627363648.jpg' },
  { name: 'In-Game Coins Bundle', url: '/src/assets/images/product_coins_bundle_1793627363447.jpg' },
];

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose }) => {
  const { userProfile } = useAuth();
  
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<number>(1000);
  const [category, setCategory] = useState<ProductCategory>('Vehicles & Skins');
  const [gamingId, setGamingId] = useState<string>('');
  const [productImage, setProductImage] = useState<string>(PRESET_IMAGES[0].url);

  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !userProfile) return null;

  // Handle direct file upload with automatic client-side compression to prevent Firestore 1MB limits
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    try {
      // Compress image client-side to ~80KB JPEG Data URL before saving to Firestore
      const compressedDataUrl = await compressImageFile(file);
      setProductImage(compressedDataUrl);
    } catch (err: any) {
      setErrorMsg('Failed to process and compress uploaded image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }
    if (price <= 0) {
      setErrorMsg('Price must be greater than ৳0.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await createProductListing({
        title: title.trim(),
        description: description.trim(),
        price: price,
        category: category,
        productImage: productImage || PRESET_IMAGES[0].url,
        sellerId: userProfile.uid,
        sellerName: userProfile.fullName,
        sellerGamingId: userProfile.gamingId,
        gamingId: gamingId.trim() || undefined,
      });

      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setPrice(1000);
      setGamingId('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to list product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="cyber-card max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border border-cyan-500/40 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display font-extrabold text-white text-lg">List Gaming Product for Sale</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="text-slate-300 font-bold block mb-1">Product Title *</label>
            <input
              type="text"
              placeholder="e.g. Bugatti Bolide Cyber Vinyl Skin"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Vehicles & Skins">Vehicles & Skins</option>
                <option value="Game Accounts">Game Accounts</option>
                <option value="In-Game Coins/Diamonds">In-Game Coins/Diamonds</option>
                <option value="VIP & Passes">VIP & Passes</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Price (৳) *</label>
              <input
                type="number"
                min="10"
                step="10"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-tech font-bold text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Product Description</label>
            <textarea
              rows={3}
              placeholder="Describe your item, vehicle stats, or account details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Gaming ID (for account or item transfer)</label>
            <input
              type="text"
              placeholder="e.g. SKIN-BOLIDE-991"
              value={gamingId}
              onChange={(e) => setGamingId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Image Upload & Selection Options */}
          <div className="space-y-3">
            <label className="text-slate-300 font-bold block">Product Image Upload Option</label>
            
            {/* Live Preview Box */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <img
                src={productImage || PRESET_IMAGES[0].url}
                alt="Selected Product Preview"
                className="w-16 h-16 rounded-xl object-cover border border-cyan-500/40 shrink-0"
                onError={(e) => {
                  e.currentTarget.src = PRESET_IMAGES[0].url;
                }}
              />
              <div className="space-y-1 text-xs">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-cyan-400" /> Image Selected
                </span>
                <p className="text-[11px] text-slate-400">
                  {productImage.startsWith('data:')
                    ? 'Optimized & compressed from device'
                    : 'Preset / Remote image selected'}
                </p>
              </div>
            </div>

            {/* Option A: Upload File from Phone/Desktop with auto-compression */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all">
              <label className="cursor-pointer flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Upload Image File from Device</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="px-3 py-1.5 rounded-xl bg-cyan-500 text-black text-[11px] font-extrabold uppercase">
                  {uploading ? 'Compressing...' : 'Browse File'}
                </span>
              </label>
            </div>

            {/* Option B: Choose Preset Images */}
            <div>
              <span className="text-[11px] text-slate-400 font-mono block mb-1.5">Or Choose Preset Asset:</span>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_IMAGES.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProductImage(img.url)}
                    className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      productImage === img.url
                        ? 'border-cyan-400 bg-cyan-500/20'
                        : 'border-slate-800 bg-slate-950 opacity-60'
                    }`}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-12 rounded-lg object-cover" />
                    <span className="text-[10px] text-slate-300 truncate w-full text-center">{img.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Option C: Image URL Input */}
            <input
              type="text"
              placeholder="Or enter direct image URL (https://...)"
              value={productImage.startsWith('data:') ? '' : productImage}
              onChange={(e) => setProductImage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Publishing Product...
              </>
            ) : (
              `Publish Listing – ৳${price.toLocaleString()}`
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
