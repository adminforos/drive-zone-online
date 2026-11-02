import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Package,
  ShoppingBag,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Search,
  Check,
  X,
  Loader2,
  DollarSign,
  AlertTriangle,
  Edit2,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DepositRequest, WithdrawalRequest, UserProfile, Product, Order } from '../types';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  approveDepositAtomic,
  rejectDeposit,
  approveWithdrawal,
  rejectWithdrawal,
  toggleUserSuspension,
  adminAdjustBalance,
  deleteProductListing,
} from '../services/marketServices';

export const AdminDashboard: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [adminTab, setAdminTab] = useState<'deposits' | 'withdrawals' | 'users' | 'products' | 'orders'>('deposits');

  // Firestore collections state
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  // Action states
  const [adminNote, setAdminNote] = useState<{ [id: string]: string }>({});
  const [actionLoading, setActionLoading] = useState<{ [id: string]: boolean }>({});
  const [actionMsg, setActionMsg] = useState<{ [id: string]: string }>({});
  const [userSearch, setUserSearch] = useState<string>('');

  // Balance edit state
  const [editingBalanceId, setEditingBalanceId] = useState<string | null>(null);
  const [newBalance, setNewBalance] = useState<number>(0);

  useEffect(() => {
    if (!isAdmin) return;

    // Listen to Deposit Requests
    const qDep = query(collection(db, 'depositRequests'), orderBy('createdAt', 'desc'));
    const unSubDep = onSnapshot(qDep, (snap) => {
      setDepositRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as DepositRequest[]);
    });

    // Listen to Withdrawal Requests
    const qWith = query(collection(db, 'withdrawalRequests'), orderBy('createdAt', 'desc'));
    const unSubWith = onSnapshot(qWith, (snap) => {
      setWithdrawalRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as WithdrawalRequest[]);
    });

    // Listen to Users
    const qUsers = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unSubUsers = onSnapshot(qUsers, (snap) => {
      setAllUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })) as UserProfile[]);
    });

    // Listen to Products
    const qProds = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unSubProds = onSnapshot(qProds, (snap) => {
      setAllProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[]);
    });

    // Listen to Orders
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unSubOrders = onSnapshot(qOrders, (snap) => {
      setAllOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[]);
    });

    return () => {
      unSubDep();
      unSubWith();
      unSubUsers();
      unSubProds();
      unSubOrders();
    };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-12 text-center cyber-card rounded-3xl border border-red-500/40 space-y-3 max-w-lg mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-display font-bold text-white">Access Denied</h2>
        <p className="text-xs text-slate-300">
          Only the authorized administrator (<strong className="text-amber-400">adminforos777@gmail.com</strong>) can access the Admin Dashboard.
        </p>
      </div>
    );
  }

  // Calculate Metrics
  const pendingDeposits = depositRequests.filter((r) => r.status === 'pending');
  const approvedDeposits = depositRequests.filter((r) => r.status === 'approved');
  const rejectedDeposits = depositRequests.filter((r) => r.status === 'rejected');
  const pendingWithdrawals = withdrawalRequests.filter((r) => r.status === 'pending');
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.amount, 0);

  const handleApproveDeposit = async (requestId: string) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      await approveDepositAtomic(requestId, adminNote[requestId] || 'Approved by Admin');
      setActionMsg((prev) => ({ ...prev, [requestId]: 'Deposit approved & user wallet credited!' }));
    } catch (err: any) {
      setActionMsg((prev) => ({ ...prev, [requestId]: err.message || 'Approval failed.' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRejectDeposit = async (requestId: string) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      await rejectDeposit(requestId, adminNote[requestId] || 'Invalid or duplicate Transaction ID');
      setActionMsg((prev) => ({ ...prev, [requestId]: 'Deposit request rejected.' }));
    } catch (err: any) {
      setActionMsg((prev) => ({ ...prev, [requestId]: err.message || 'Rejection failed.' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleApproveWithdrawal = async (requestId: string) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      await approveWithdrawal(requestId, adminNote[requestId] || 'Payout completed');
      setActionMsg((prev) => ({ ...prev, [requestId]: 'Withdrawal request approved!' }));
    } catch (err: any) {
      setActionMsg((prev) => ({ ...prev, [requestId]: err.message || 'Approval failed.' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRejectWithdrawal = async (requestId: string) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      await rejectWithdrawal(requestId, adminNote[requestId] || 'Details mismatch');
      setActionMsg((prev) => ({ ...prev, [requestId]: 'Withdrawal request rejected.' }));
    } catch (err: any) {
      setActionMsg((prev) => ({ ...prev, [requestId]: err.message || 'Rejection failed.' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.gamingId.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.whatsApp.includes(userSearch)
  );

  return (
    <div className="space-y-8">
      
      {/* Admin Header */}
      <div className="cyber-card p-6 rounded-3xl border border-amber-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold uppercase tracking-wider">
            Secure Admin Dashboard
          </span>
          <h1 className="text-2xl font-display font-black text-white mt-2">
            DRIVE ZONE ONLINE <span className="text-amber-400">ADMIN CONTROL</span>
          </h1>
          <p className="text-xs text-slate-400">Administrator: {currentUser?.email}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-emerald-400 font-bold">Admin Privileges Verified</span>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="cyber-card p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-mono block">Registered Users</span>
          <span className="text-xl font-tech font-extrabold text-white">{allUsers.length}</span>
        </div>

        <div className="cyber-card p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-mono block">Active Products</span>
          <span className="text-xl font-tech font-extrabold text-cyan-400">
            {allProducts.filter((p) => p.status === 'active').length}
          </span>
        </div>

        <div className="cyber-card p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-mono block">Total Orders</span>
          <span className="text-xl font-tech font-extrabold text-blue-400">{allOrders.length}</span>
        </div>

        <div className="cyber-card p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-mono block">Total Revenue</span>
          <span className="text-xl font-tech font-extrabold text-emerald-400">৳{totalRevenue.toLocaleString()}</span>
        </div>

        <div className="cyber-card p-4 rounded-2xl border border-amber-500/30 text-center bg-amber-500/10">
          <span className="text-[10px] text-amber-300 font-mono block">Pending Deposits</span>
          <span className="text-xl font-tech font-extrabold text-amber-400">{pendingDeposits.length}</span>
        </div>

        <div className="cyber-card p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-mono block">Approved Deposits</span>
          <span className="text-xl font-tech font-extrabold text-emerald-400">{approvedDeposits.length}</span>
        </div>

        <div className="cyber-card p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-mono block">Pending Payouts</span>
          <span className="text-xl font-tech font-extrabold text-rose-400">{pendingWithdrawals.length}</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setAdminTab('deposits')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'deposits'
              ? 'bg-amber-500 text-black font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          Deposit Requests ({pendingDeposits.length} Pending)
        </button>

        <button
          onClick={() => setAdminTab('withdrawals')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'withdrawals'
              ? 'bg-amber-500 text-black font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          Withdrawal Requests ({pendingWithdrawals.length} Pending)
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'users'
              ? 'bg-amber-500 text-black font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" /> User Accounts ({allUsers.length})
        </button>

        <button
          onClick={() => setAdminTab('products')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'products'
              ? 'bg-amber-500 text-black font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Package className="w-4 h-4" /> All Products ({allProducts.length})
        </button>

        <button
          onClick={() => setAdminTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'orders'
              ? 'bg-amber-500 text-black font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Order History ({allOrders.length})
        </button>
      </div>

      {/* 1. DEPOSIT MANAGEMENT */}
      {adminTab === 'deposits' && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-white text-base">Wallet Deposit Verification Requests</h3>

          {depositRequests.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-500">
              No deposit requests submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {depositRequests.map((req) => (
                <div
                  key={req.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    req.status === 'pending'
                      ? 'bg-slate-950 border-amber-500/40 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{req.userName}</span>
                        <span className="text-xs text-cyan-400 font-mono">({req.userEmail})</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Method: <strong className="text-slate-200">{req.paymentMethod}</strong> • Date:{' '}
                        {new Date(req.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-tech font-extrabold text-emerald-400 text-lg">৳{req.amount}</span>
                        <span className="text-[10px] text-slate-400 block">Fee: ৳{req.fee || 20}</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                          req.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : req.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>

                  {/* TrxID Highlight Box */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] font-mono block">Submitted Transaction ID (TrxID):</span>
                      <span className="font-mono font-extrabold text-cyan-300 text-sm tracking-wider">{req.trxId}</span>
                    </div>
                    {req.adminNote && (
                      <span className="text-[11px] text-slate-400 italic">Note: {req.adminNote}</span>
                    )}
                  </div>

                  {/* Action Controls for Pending Requests */}
                  {req.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <input
                        type="text"
                        placeholder="Admin Note (optional)"
                        value={adminNote[req.id] || ''}
                        onChange={(e) => setAdminNote({ ...adminNote, [req.id]: e.target.value })}
                        className="w-full sm:w-1/2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />

                      <div className="flex items-center gap-2 w-full sm:w-1/2">
                        <button
                          onClick={() => handleRejectDeposit(req.id)}
                          disabled={actionLoading[req.id]}
                          className="w-1/2 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 font-bold text-xs uppercase flex items-center justify-center gap-1 transition-all"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>

                        <button
                          onClick={() => handleApproveDeposit(req.id)}
                          disabled={actionLoading[req.id]}
                          className="w-1/2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs uppercase flex items-center justify-center gap-1 transition-all shadow-md shadow-emerald-600/20"
                        >
                          {actionLoading[req.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <><Check className="w-4 h-4 stroke-[3]" /> Approve & Credit</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {actionMsg[req.id] && (
                    <p className="text-xs text-cyan-300 font-bold pt-1">{actionMsg[req.id]}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. WITHDRAWAL MANAGEMENT */}
      {adminTab === 'withdrawals' && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-white text-base">User Payout Withdrawal Requests</h3>

          {withdrawalRequests.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-500">
              No withdrawal requests submitted.
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawalRequests.map((req) => (
                <div key={req.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-sm">{req.userName} ({req.userEmail})</h4>
                      <p className="text-slate-400">Method: {req.paymentMethod} • Account: <strong className="text-cyan-300 font-mono">{req.accountNumber}</strong></p>
                    </div>
                    <span className="font-tech font-extrabold text-amber-400 text-lg">৳{req.amount}</span>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        placeholder="Admin Note"
                        value={adminNote[req.id] || ''}
                        onChange={(e) => setAdminNote({ ...adminNote, [req.id]: e.target.value })}
                        className="w-1/2 px-3 py-1.5 bg-slate-900 border border-slate-700 text-xs text-white rounded-lg"
                      />
                      <button
                        onClick={() => handleRejectWithdrawal(req.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-950 text-red-300 font-bold text-xs"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveWithdrawal(req.id)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black font-extrabold text-xs"
                      >
                        Approve Payout
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. USER MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-display font-bold text-white text-base">Registered Users ({filteredUsers.length})</h3>
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user, email, Gaming ID..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredUsers.map((u) => (
              <div
                key={u.uid}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={u.photoURL || '/src/assets/images/gaming_avatar_default_1793627363341.jpg'}
                    alt={u.fullName}
                    className="w-10 h-10 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{u.fullName}</span>
                      <span className="text-[10px] text-cyan-400 font-mono">({u.gamingId})</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Email: {u.email} • WhatsApp: <span className="text-emerald-400">{u.whatsApp}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">Wallet Balance</span>
                    <span className="font-tech font-bold text-cyan-300 text-base">৳{u.balance?.toLocaleString() || 0}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleUserSuspension(u.uid, u.status)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 ${
                        u.status === 'active'
                          ? 'bg-red-950 text-red-300 border border-red-500/30 hover:bg-red-900'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900'
                      }`}
                    >
                      {u.status === 'active' ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                      {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PRODUCT MANAGEMENT */}
      {adminTab === 'products' && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-white text-base">Marketplace Products Moderation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allProducts.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-3">
                  <img src={p.productImage} alt={p.title} className="w-14 h-14 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-white line-clamp-1">{p.title}</h4>
                    <p className="text-slate-400 text-[11px]">Seller: {p.sellerName}</p>
                    <p className="font-tech font-bold text-cyan-400">৳{p.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">Status: {p.status}</span>
                  {p.status === 'active' && (
                    <button
                      onClick={() => deleteProductListing(p.id)}
                      className="text-red-400 hover:text-red-300 font-bold text-xs"
                    >
                      Delete Product
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ORDER HISTORY LOG */}
      {adminTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-white text-base">Platform Completed Orders ({allOrders.length})</h3>
          <div className="space-y-2">
            {allOrders.map((o) => (
              <div key={o.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white">{o.productTitle}</h4>
                  <p className="text-[11px] text-slate-400">Buyer: {o.buyerName} • Seller: {o.sellerName}</p>
                  <p className="text-[10px] text-slate-500 font-mono">ID: {o.id} • {new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <span className="font-tech font-extrabold text-emerald-400 text-sm">৳{o.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
