import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Copy,
  Check,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldAlert,
  Send,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PaymentMethod, TransactionRecord, DepositRequest, WithdrawalRequest } from '../types';
import {
  submitDepositRequest,
  transferMoneyAtomic,
  submitWithdrawalRequest,
} from '../services/marketServices';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const PAYMENT_NUMBER = '01625174905';
const FIXED_FEE = 20;

export const WalletView: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'deposit' | 'transfer' | 'withdraw' | 'history'>('deposit');

  // Deposit Form State
  const [depositMethod, setDepositMethod] = useState<PaymentMethod>('bKash');
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [depositTrxId, setDepositTrxId] = useState<string>('');
  const [depositSubmitting, setDepositSubmitting] = useState<boolean>(false);
  const [depositMsg, setDepositMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Transfer Form State
  const [transferRecipient, setTransferRecipient] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(200);
  const [transferSubmitting, setTransferSubmitting] = useState<boolean>(false);
  const [transferMsg, setTransferMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Withdrawal Form State
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentMethod>('bKash');
  const [withdrawAccount, setWithdrawAccount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(300);
  const [withdrawSubmitting, setWithdrawSubmitting] = useState<boolean>(false);
  const [withdrawMsg, setWithdrawMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Lists State
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  // Real-time Firestore Listeners
  useEffect(() => {
    if (!userProfile) return;

    // Transactions listener
    const qTrx = query(
      collection(db, 'transactions'),
      where('userId', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );
    const unSubTrx = onSnapshot(qTrx, (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as TransactionRecord[]);
    });

    // Deposit Requests listener
    const qDep = query(
      collection(db, 'depositRequests'),
      where('userId', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );
    const unSubDep = onSnapshot(qDep, (snap) => {
      setDepositRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as DepositRequest[]);
    });

    // Withdrawal Requests listener
    const qWith = query(
      collection(db, 'withdrawalRequests'),
      where('userId', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );
    const unSubWith = onSnapshot(qWith, (snap) => {
      setWithdrawalRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as WithdrawalRequest[]);
    });

    return () => {
      unSubTrx();
      unSubDep();
      unSubWith();
    };
  }, [userProfile]);

  const copyPaymentNumber = () => {
    navigator.clipboard.writeText(PAYMENT_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    if (depositAmount <= 0) {
      setDepositMsg({ type: 'error', text: 'Deposit amount must be greater than ৳0' });
      return;
    }
    if (!depositTrxId.trim()) {
      setDepositMsg({ type: 'error', text: 'Please enter the Transaction ID (TrxID) from your mobile banking SMS' });
      return;
    }

    setDepositSubmitting(true);
    setDepositMsg(null);

    try {
      await submitDepositRequest(userProfile, depositMethod, depositAmount, depositTrxId);
      setDepositMsg({
        type: 'success',
        text: `Deposit request of ৳${depositAmount} submitted successfully! Admin will verify and credit your wallet.`,
      });
      setDepositTrxId('');
    } catch (err: any) {
      setDepositMsg({ type: 'error', text: err.message || 'Deposit submission failed.' });
    } finally {
      setDepositSubmitting(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    if (!transferRecipient.trim()) {
      setTransferMsg({ type: 'error', text: 'Please enter recipient Gaming ID or Email' });
      return;
    }
    if (transferAmount <= 0) {
      setTransferMsg({ type: 'error', text: 'Transfer amount must be greater than ৳0' });
      return;
    }

    setTransferSubmitting(true);
    setTransferMsg(null);

    try {
      const recipientName = await transferMoneyAtomic(userProfile, transferRecipient, transferAmount);
      setTransferMsg({
        type: 'success',
        text: `Successfully transferred ৳${transferAmount} to ${recipientName}! Fee of ৳${FIXED_FEE} applied.`,
      });
      setTransferRecipient('');
      setTransferAmount(200);
    } catch (err: any) {
      setTransferMsg({ type: 'error', text: err.message || 'Transfer failed.' });
    } finally {
      setTransferSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    if (!withdrawAccount.trim()) {
      setWithdrawMsg({ type: 'error', text: 'Please enter your mobile banking account number' });
      return;
    }
    if (withdrawAmount <= 0) {
      setWithdrawMsg({ type: 'error', text: 'Withdrawal amount must be greater than ৳0' });
      return;
    }

    setWithdrawSubmitting(true);
    setWithdrawMsg(null);

    try {
      await submitWithdrawalRequest(userProfile, withdrawMethod, withdrawAccount, withdrawAmount);
      setWithdrawMsg({
        type: 'success',
        text: `Withdrawal request of ৳${withdrawAmount} submitted! Pending admin payout approval.`,
      });
      setWithdrawAccount('');
    } catch (err: any) {
      setWithdrawMsg({ type: 'error', text: err.message || 'Withdrawal request failed.' });
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="space-y-8">
      
      {/* Wallet Balance Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Main Available Balance */}
        <div className="cyber-card p-5 rounded-2xl border border-cyan-500/40 relative overflow-hidden group">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Available Balance</span>
            <Wallet className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-tech font-extrabold text-white tracking-wider">
            ৳{userProfile.balance.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ready for marketplace purchases & transfers</p>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />
        </div>

        {/* Total Deposits */}
        <div className="cyber-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Deposits</span>
            <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-tech font-bold text-emerald-400">
            ৳{(userProfile.totalDeposits || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Approved bKash/Nagad/Rocket deposits</p>
        </div>

        {/* Total Spending */}
        <div className="cyber-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Spending</span>
            <ArrowUpRight className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-tech font-bold text-blue-400">
            ৳{(userProfile.totalSpending || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Marketplace item purchases</p>
        </div>

        {/* Total Transfers */}
        <div className="cyber-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Transfers</span>
            <ArrowRightLeft className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-tech font-bold text-amber-400">
            ৳{(userProfile.totalTransfers || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Transferred to other players</p>
        </div>

      </div>

      {/* Wallet Operations Sub-Tabs */}
      <div className="cyber-card p-6 rounded-3xl border border-slate-800 space-y-6">
        
        {/* Subtab Buttons */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('deposit')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'deposit'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" /> Deposit Money (01625174905)
          </button>

          <button
            onClick={() => setActiveSubTab('transfer')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'transfer'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" /> Transfer to User (৳20 Fee)
          </button>

          <button
            onClick={() => setActiveSubTab('withdraw')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'withdraw'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" /> Request Withdrawal
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'history'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" /> Transaction Logs
          </button>
        </div>

        {/* 1. DEPOSIT SECTION */}
        {activeSubTab === 'deposit' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Payment Instructions Box */}
            <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Building className="w-5 h-5 text-cyan-400" />
                <h3 className="font-display font-bold text-white text-sm">Deposit Payment Instructions</h3>
              </div>

              {/* Display Payment Number */}
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
                <span className="text-[11px] text-cyan-300 font-mono block">Official Payment Number (Send Money / Cash In):</span>
                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-700">
                  <span className="font-tech font-extrabold text-lg text-white tracking-widest">{PAYMENT_NUMBER}</span>
                  <button
                    onClick={copyPaymentNumber}
                    className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 text-xs font-bold hover:bg-cyan-500 hover:text-black transition-colors flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Fee Notice */}
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  Deposit Processing Fee: ৳20
                </p>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  A fixed ৳20 fee applies per deposit request. Ensure you enter the exact Transaction ID received in your SMS.
                </p>
              </div>

              {/* Step by step guide */}
              <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside leading-relaxed pt-1">
                <li>Select payment method (bKash, Nagad, or Rocket).</li>
                <li>Send money to payment number <strong>{PAYMENT_NUMBER}</strong> manually.</li>
                <li>Copy the <strong>Transaction ID (TrxID)</strong> from your payment SMS.</li>
                <li>Enter the deposit amount and TrxID in the form and submit.</li>
                <li>Admin will verify payment and credit your wallet balance promptly.</li>
              </ol>
            </div>

            {/* Deposit Submission Form */}
            <div className="lg:col-span-7 space-y-4">
              <form onSubmit={handleDepositSubmit} className="space-y-4">
                
                {/* Method selector */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['bKash', 'Nagad', 'Rocket'] as PaymentMethod[]).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setDepositMethod(method)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                          depositMethod === method
                            ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount input */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Deposit Amount (৳)</label>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-tech font-bold text-base focus:outline-none focus:border-cyan-500"
                    required
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>Processing Fee: ৳{FIXED_FEE}</span>
                    <span>Net Credit to Wallet: ৳{Math.max(0, depositAmount)}</span>
                  </div>
                </div>

                {/* TrxID Input */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Transaction ID (TrxID)</label>
                  <input
                    type="text"
                    placeholder="e.g. 8N7A6F2K9"
                    value={depositTrxId}
                    onChange={(e) => setDepositTrxId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm uppercase placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Double check TrxID to prevent rejection or delays.</p>
                </div>

                {depositMsg && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                      depositMsg.type === 'success'
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : 'bg-red-950/60 border-red-500/50 text-red-300'
                    }`}
                  >
                    {depositMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{depositMsg.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={depositSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
                >
                  {depositSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting Deposit Request...
                    </>
                  ) : (
                    `Submit ৳${depositAmount} Deposit Request`
                  )}
                </button>

              </form>

              {/* User's Pending Deposit Requests List */}
              {depositRequests.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    My Deposit Requests History
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {depositRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-tech font-bold text-white text-sm">৳{req.amount}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {req.paymentMethod} • TrxID: {req.trxId}
                          </span>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              req.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : req.status === 'rejected'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {req.status}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* 2. TRANSFER MONEY SECTION */}
        {activeSubTab === 'transfer' && (
          <div className="max-w-xl mx-auto space-y-6 py-2">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-display font-bold text-white">Transfer Funds to Another Player</h3>
              <p className="text-xs text-slate-400">
                Instantly transfer wallet balance to any registered Drive Zone user using their Gaming ID or Email.
              </p>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Recipient Gaming ID or Registered Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. DZO-771042 or user@email.com"
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Transfer Amount (৳)</label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-tech font-bold text-base focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Fee Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Transfer Amount:</span>
                  <span className="font-tech text-white">৳{transferAmount}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Transfer Fee:</span>
                  <span className="font-tech text-amber-400">৳{FIXED_FEE}</span>
                </div>
                <div className="flex justify-between text-slate-200 pt-1 border-t border-slate-800 font-bold">
                  <span>Total Deduction from Wallet:</span>
                  <span className="font-tech text-cyan-400">৳{transferAmount + FIXED_FEE}</span>
                </div>
              </div>

              {transferMsg && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                    transferMsg.type === 'success'
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                      : 'bg-red-950/60 border-red-500/50 text-red-300'
                  }`}
                >
                  {transferMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{transferMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={transferSubmitting || userProfile.balance < transferAmount + FIXED_FEE}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                {transferSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing Transfer...
                  </>
                ) : (
                  <><Send className="w-4 h-4" /> Transfer ৳{transferAmount} (+ ৳{FIXED_FEE} Fee)</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* 3. WITHDRAWAL SECTION */}
        {activeSubTab === 'withdraw' && (
          <div className="max-w-xl mx-auto space-y-6 py-2">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-display font-bold text-white">Withdraw Balance to Mobile Banking</h3>
              <p className="text-xs text-slate-400">
                Request a payout directly to your bKash, Nagad, or Rocket account.
              </p>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Select Payout Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['bKash', 'Nagad', 'Rocket'] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setWithdrawMethod(method)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        withdrawMethod === method
                          ? 'bg-cyan-500/20 border-cyan-400 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Mobile Account Number ({withdrawMethod})
                </label>
                <input
                  type="text"
                  placeholder="017XXXXXXXX"
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Withdrawal Amount (৳)</label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-tech font-bold text-base focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {withdrawMsg && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                    withdrawMsg.type === 'success'
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                      : 'bg-red-950/60 border-red-500/50 text-red-300'
                  }`}
                >
                  {withdrawMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{withdrawMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={withdrawSubmitting || userProfile.balance < withdrawAmount}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                {withdrawSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                  </>
                ) : (
                  `Request ৳${withdrawAmount} Payout`
                )}
              </button>
            </form>

            {/* Withdrawal Requests History */}
            {withdrawalRequests.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Withdrawal Request History
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {withdrawalRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-tech font-bold text-white text-sm">৳{req.amount}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {req.paymentMethod} • {req.accountNumber}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            req.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : req.status === 'rejected'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* 4. TRANSACTION LOGS HISTORY */}
        {activeSubTab === 'history' && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-white text-sm">Real-time Transaction Ledger</h3>

            {transactions.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-500">
                No transactions recorded yet.
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((trx) => (
                  <div
                    key={trx.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            trx.amount > 0
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {trx.type.replace('_', ' ')}
                        </span>
                        <span className="text-slate-300 font-semibold">{trx.description}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        ID: {trx.id} • {new Date(trx.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-tech font-bold text-base ${
                          trx.amount > 0 ? 'text-emerald-400' : 'text-slate-200'
                        }`}
                      >
                        {trx.amount > 0 ? `+৳${trx.amount}` : `-৳${Math.abs(trx.amount)}`}
                      </span>
                      {trx.fee > 0 && (
                        <span className="text-[10px] text-amber-400/80 block font-mono">
                          Fee: ৳{trx.fee}
                        </span>
                      )}
                    </div>
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
