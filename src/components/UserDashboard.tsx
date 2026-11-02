import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Wallet,
  ShoppingBag,
  Package,
  Clock,
  Bell,
  HelpCircle,
  LogOut,
  Edit2,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Key,
  Mail,
  Calendar,
  AlertCircle,
  Loader2,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Product, Order, UserNotification, TransactionRecord } from '../types';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { deleteProductListing } from '../services/marketServices';

interface UserDashboardProps {
  setActiveTab: (tab: string) => void;
  openAddProduct: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ setActiveTab, openAddProduct }) => {
  const { userProfile, updateProfileData, logoutUser } = useAuth();
  const [activeDashTab, setActiveDashTab] = useState<'profile' | 'my_products' | 'my_orders' | 'transactions' | 'notifications'>('profile');

  // Profile Edit State
  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [whatsApp, setWhatsApp] = useState<string>('');
  const [gamingId, setGamingId] = useState<string>('');
  const [photoURL, setPhotoURL] = useState<string>('');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  // Firestore Collections
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [myOrdersBought, setMyOrdersBought] = useState<Order[]>([]);
  const [myOrdersSold, setMyOrdersSold] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName);
      setWhatsApp(userProfile.whatsApp);
      setGamingId(userProfile.gamingId);
      setPhotoURL(userProfile.photoURL);

      // Listener for user's listed products
      const qProd = query(
        collection(db, 'products'),
        where('sellerId', '==', userProfile.uid),
        orderBy('createdAt', 'desc')
      );
      const unSubProd = onSnapshot(qProd, (snap) => {
        setMyProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[]);
      });

      // Listener for Orders Bought
      const qBought = query(
        collection(db, 'orders'),
        where('buyerId', '==', userProfile.uid),
        orderBy('createdAt', 'desc')
      );
      const unSubBought = onSnapshot(qBought, (snap) => {
        setMyOrdersBought(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[]);
      });

      // Listener for Orders Sold
      const qSold = query(
        collection(db, 'orders'),
        where('sellerId', '==', userProfile.uid),
        orderBy('createdAt', 'desc')
      );
      const unSubSold = onSnapshot(qSold, (snap) => {
        setMyOrdersSold(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[]);
      });

      // Listener for Notifications
      const qNotif = query(
        collection(db, 'notifications'),
        where('userId', '==', userProfile.uid),
        orderBy('createdAt', 'desc')
      );
      const unSubNotif = onSnapshot(qNotif, (snap) => {
        setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as UserNotification[]);
      });

      // Listener for Transactions
      const qTrx = query(
        collection(db, 'transactions'),
        where('userId', '==', userProfile.uid),
        orderBy('createdAt', 'desc')
      );
      const unSubTrx = onSnapshot(qTrx, (snap) => {
        setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as TransactionRecord[]);
      });

      return () => {
        unSubProd();
        unSubBought();
        unSubSold();
        unSubNotif();
        unSubTrx();
      };
    }
  }, [userProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfileData({
        fullName: fullName.trim(),
        whatsApp: whatsApp.trim(),
        gamingId: gamingId.trim(),
        photoURL: photoURL.trim(),
      });
      setEditingProfile(false);
    } catch (err) {
      console.error('Save profile failed:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to remove this product listing?')) {
      await deleteProductListing(id);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="space-y-8">
      
      {/* Top Banner Header */}
      <div className="cyber-card p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={userProfile.photoURL || '/src/assets/images/gaming_avatar_default_1793627363341.jpg'}
            alt={userProfile.fullName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-display font-black text-white">{userProfile.fullName}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  userProfile.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {userProfile.status}
              </span>
            </div>
            <p className="text-xs text-cyan-400 font-mono flex items-center gap-2">
              <span>Gaming ID: <strong>{userProfile.gamingId}</strong></span>
              <span>•</span>
              <span>Role: <strong className="uppercase">{userProfile.role}</strong></span>
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-500" /> {userProfile.email}
            </p>
          </div>
        </div>

        {/* Balance & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left shrink-0">
            <span className="text-[10px] text-slate-400 font-mono block">Available Balance</span>
            <span className="text-xl font-tech font-bold text-cyan-300">৳{userProfile.balance.toLocaleString()}</span>
          </div>

          <button
            onClick={() => setActiveTab('wallet')}
            className="px-4 py-3 rounded-2xl bg-cyan-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
          >
            Deposit Funds
          </button>

          <button
            onClick={openAddProduct}
            className="px-4 py-3 rounded-2xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs uppercase hover:bg-slate-800 transition-all"
          >
            + Sell Product
          </button>

          <button
            onClick={logoutUser}
            className="px-4 py-3 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-300 hover:bg-red-900 font-bold text-xs uppercase transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveDashTab('profile')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeDashTab === 'profile'
              ? 'bg-cyan-500 text-black font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <UserIcon className="w-4 h-4" /> My Profile
        </button>

        <button
          onClick={() => setActiveDashTab('my_products')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeDashTab === 'my_products'
              ? 'bg-cyan-500 text-black font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Package className="w-4 h-4" /> My Products ({myProducts.length})
        </button>

        <button
          onClick={() => setActiveDashTab('my_orders')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeDashTab === 'my_orders'
              ? 'bg-cyan-500 text-black font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> My Orders ({myOrdersBought.length + myOrdersSold.length})
        </button>

        <button
          onClick={() => setActiveDashTab('transactions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeDashTab === 'transactions'
              ? 'bg-cyan-500 text-black font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" /> Transactions ({transactions.length})
        </button>

        <button
          onClick={() => setActiveDashTab('notifications')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeDashTab === 'notifications'
              ? 'bg-cyan-500 text-black font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" /> Notifications ({notifications.length})
        </button>
      </div>

      {/* DASHBOARD TAB CONTENT */}
      <div>
        
        {/* PROFILE TAB */}
        {activeDashTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="cyber-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-display font-bold text-white text-base">Account Information</h3>
                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-cyan-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> {editingProfile ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {editingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      value={whatsApp}
                      onChange={(e) => setWhatsApp(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Drive Zone Gaming ID</label>
                    <input
                      type="text"
                      value={gamingId}
                      onChange={(e) => setGamingId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Profile Photo URL</label>
                    <input
                      type="text"
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs uppercase"
                  >
                    {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </form>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-800/60">
                    <span className="text-slate-400">Full Name:</span>
                    <strong className="text-white">{userProfile.fullName}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800/60">
                    <span className="text-slate-400">Email Address:</span>
                    <strong className="text-white">{userProfile.email}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800/60">
                    <span className="text-slate-400">WhatsApp Number:</span>
                    <strong className="text-emerald-400 font-mono">{userProfile.whatsApp}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800/60">
                    <span className="text-slate-400">Drive Zone Gaming ID:</span>
                    <strong className="text-cyan-400 font-mono">{userProfile.gamingId}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800/60">
                    <span className="text-slate-400">Account Joined:</span>
                    <strong className="text-slate-300 font-mono">
                      {new Date(userProfile.createdAt).toLocaleDateString()}
                    </strong>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={logoutUser}
                      className="w-full py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Log Out Account
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wallet Quick Metrics */}
            <div className="cyber-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="font-display font-bold text-white text-base border-b border-slate-800 pb-3">
                Wallet Overview
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Available Balance:</span>
                  <span className="font-tech font-bold text-cyan-300 text-base">
                    ৳{userProfile.balance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Total Deposits Approved:</span>
                  <span className="font-tech font-bold text-emerald-400 text-base">
                    ৳{(userProfile.totalDeposits || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Total Marketplace Spending:</span>
                  <span className="font-tech font-bold text-blue-400 text-base">
                    ৳{(userProfile.totalSpending || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Total User Transfers:</span>
                  <span className="font-tech font-bold text-amber-400 text-base">
                    ৳{(userProfile.totalTransfers || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* MY PRODUCTS TAB */}
        {activeDashTab === 'my_products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-white text-base">My Listed Marketplace Products</h3>
              <button
                onClick={openAddProduct}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 text-black font-extrabold text-xs uppercase flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> Add Product
              </button>
            </div>

            {myProducts.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                You haven't listed any gaming products yet. Click "Add Product" to list a hypercar, skin, or account.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myProducts.map((p) => (
                  <div
                    key={p.id}
                    className="cyber-card p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex gap-3">
                      <img
                        src={p.productImage}
                        alt={p.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="space-y-1 text-xs">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                          {p.category}
                        </span>
                        <h4 className="font-bold text-white line-clamp-1">{p.title}</h4>
                        <p className="font-tech font-bold text-cyan-400">৳{p.price.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {p.status}
                      </span>

                      {p.status === 'active' && (
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MY ORDERS TAB */}
        {activeDashTab === 'my_orders' && (
          <div className="space-y-6">
            
            {/* Purchases */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-white text-sm text-cyan-400">
                Purchased Orders ({myOrdersBought.length})
              </h3>
              {myOrdersBought.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500">
                  No purchases completed yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {myOrdersBought.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={ord.productImage}
                          alt={ord.productTitle}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-white">{ord.productTitle}</h4>
                          <p className="text-slate-400 text-[11px]">Seller: {ord.sellerName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Order ID: {ord.id} • {new Date(ord.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-tech font-bold text-emerald-400 text-sm">৳{ord.amount}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 block mt-1">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sales */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-white text-sm text-blue-400">
                Sold Orders ({myOrdersSold.length})
              </h3>
              {myOrdersSold.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500">
                  No products sold yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {myOrdersSold.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={ord.productImage}
                          alt={ord.productTitle}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-white">{ord.productTitle}</h4>
                          <p className="text-slate-400 text-[11px]">Buyer: {ord.buyerName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Order ID: {ord.id} • {new Date(ord.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-tech font-bold text-cyan-400 text-sm">+৳{ord.amount}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 block mt-1">
                          Credited to Wallet
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeDashTab === 'transactions' && (
          <div className="space-y-3">
            <h3 className="font-display font-bold text-white text-sm">Full Transaction Ledger</h3>
            <div className="space-y-2">
              {transactions.map((trx) => (
                <div
                  key={trx.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="text-white font-semibold">{trx.description}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{new Date(trx.createdAt).toLocaleString()}</p>
                  </div>
                  <span
                    className={`font-tech font-bold text-sm ${
                      trx.amount > 0 ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {trx.amount > 0 ? `+৳${trx.amount}` : `-৳${Math.abs(trx.amount)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeDashTab === 'notifications' && (
          <div className="space-y-3">
            <h3 className="font-display font-bold text-white text-sm">Real-time Notifications</h3>
            {notifications.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-500">
                No notifications received yet.
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">{notif.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(notif.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-300">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
