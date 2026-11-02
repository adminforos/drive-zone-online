import React, { useState } from 'react';
import { User, Mail, Lock, Phone, Key, Image, X, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { loginUser, registerUser, resetUserPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode);

  // Form Fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [whatsApp, setWhatsApp] = useState<string>('01625174905');
  const [gamingId, setGamingId] = useState<string>('');
  const [photoURL, setPhotoURL] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        await loginUser(email.trim(), password);
        onClose();
      } else if (mode === 'register') {
        if (!fullName.trim()) throw new Error('Full Name is required.');
        if (!whatsApp.trim()) throw new Error('WhatsApp Number is required.');

        await registerUser({
          email: email.trim(),
          pass: password,
          fullName: fullName.trim(),
          whatsApp: whatsApp.trim(),
          gamingId: gamingId.trim() || 'DZO-' + Math.floor(100000 + Math.random() * 900000),
          photoURL: photoURL.trim() || '/src/assets/images/gaming_avatar_default_1793627363341.jpg',
        });
        onClose();
      } else if (mode === 'reset') {
        await resetUserPassword(email.trim());
        setSuccessMsg('Password reset link sent to your email address!');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="cyber-card max-w-md w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border border-cyan-500/40 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white text-sm font-bold p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Tabs */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-display font-black text-white">
              DRIVE ZONE <span className="text-cyan-400">ONLINE</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'login' ? 'Welcome back! Sign in to your account.' : mode === 'register' ? 'Create your official gaming marketplace account.' : 'Reset your password.'}
            </p>
          </div>

          {mode !== 'reset' && (
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`w-1/2 py-2 rounded-lg text-xs font-extrabold uppercase transition-all ${
                  mode === 'login' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className={`w-1/2 py-2 rounded-lg text-xs font-extrabold uppercase transition-all ${
                  mode === 'register' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {mode === 'register' && (
            <>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">WhatsApp Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="01625174905"
                    value={whatsApp}
                    onChange={(e) => setWhatsApp(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Drive Zone Gaming ID</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. DZO-882910"
                    value={gamingId}
                    onChange={(e) => setGamingId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-slate-300 font-bold block mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <label className="text-slate-300 font-bold block mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs">
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              'Log In to Wallet'
            ) : mode === 'register' ? (
              'Create Marketplace Account'
            ) : (
              'Send Reset Link'
            )}
          </button>

          {mode === 'login' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                ← Back to Login
              </button>
            </div>
          )}

        </form>

      </div>
    </div>
  );
};
