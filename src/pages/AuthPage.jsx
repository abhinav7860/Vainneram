import React, { useState } from 'react';
import { Lock, User, Mail, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register, loginAsDemo } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!username.trim() || !email.trim() || !password) {
          throw new Error('All fields are required');
        }
        await register(username.trim(), email.trim(), password, displayName.trim());
      } else {
        if (!identifier.trim() || !password) {
          throw new Error('Username/email and password required');
        }
        await login(identifier.trim(), password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setDemoLoading(true);
      setError('');
      await loginAsDemo();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0c1813]">
      {/* Background radial gradients for warm dusk atmosphere */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-[#d9822b]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#1a4433]/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Card */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d9822b] to-[#8f430b] mx-auto flex items-center justify-center text-3xl shadow-xl shadow-black/50 mb-3 border border-[#deb17a]/30">
            🍵
          </div>
          <h1 className="font-serif-vintage text-3xl font-bold text-[#f7f2e8] tracking-wide">
            വൈകുന്നേരം
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#deb17a] font-medium mt-1">
            Vainneram Music Library
          </p>
          <p className="text-xs text-[#829c8e] mt-1.5 font-malayalam">
            ചായയും മഴയും നല്ല പാട്ടുകളും
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl bg-[#11231a]/90 backdrop-blur-xl border border-[#214132] p-7 shadow-2xl shadow-black/70 space-y-5">
          {/* 1-Click Demo Login Button */}
          <div className="p-3.5 rounded-2xl bg-[#173326] border border-[#2c5b43] text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#deb17a]">
              <Sparkles className="w-4 h-4 text-[#d9822b]" />
              <span>Instant Exploration</span>
            </div>
            <p className="text-[11px] text-[#86a193]">
              Pre-loaded with tea stall ambient tunes, playlists, and recordings.
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading || loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#d9822b] to-[#e69a38] hover:from-[#e69a38] hover:to-[#f59e0b] text-white text-xs font-bold shadow-lg shadow-black/40 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {demoLoading ? 'Brewing session...' : (
                <>
                  <span>Enter as Demo User (സുജിത്ത്)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 my-2">
            <div className="h-px bg-[#1f3d2f] flex-1" />
            <span className="text-[11px] text-[#718d7e] uppercase tracking-wider font-mono">
              or your private library
            </span>
            <div className="h-px bg-[#1f3d2f] flex-1" />
          </div>

          {/* Form Tabs */}
          <div className="flex rounded-xl bg-[#0c1913] p-1 border border-[#1b3528]">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                !isRegister ? 'bg-[#183628] text-[#f7f2e8] shadow-sm' : 'text-[#7d9688] hover:text-[#f7f2e8]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isRegister ? 'bg-[#183628] text-[#f7f2e8] shadow-sm' : 'text-[#7d9688] hover:text-[#f7f2e8]'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3 text-xs rounded-xl bg-[#3b1818] border border-[#7a2f2f] text-[#ffb4b4]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-[#8fa799] mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#5c7a6b] absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Sujith or Ananya"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0b1712] border border-[#1f3d2f] text-xs text-[#f7f2e8] focus:outline-none focus:border-[#d9822b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8fa799] mb-1">
                    Username <span className="text-[#d9822b]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#5c7a6b] absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="unique_username"
                      required
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0b1712] border border-[#1f3d2f] text-xs text-[#f7f2e8] focus:outline-none focus:border-[#d9822b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8fa799] mb-1">
                    Email Address <span className="text-[#d9822b]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#5c7a6b] absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      required
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0b1712] border border-[#1f3d2f] text-xs text-[#f7f2e8] focus:outline-none focus:border-[#d9822b]"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium text-[#8fa799] mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5c7a6b] absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your username or email"
                    required
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0b1712] border border-[#1f3d2f] text-xs text-[#f7f2e8] focus:outline-none focus:border-[#d9822b]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#8fa799] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5c7a6b] absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0b1712] border border-[#1f3d2f] text-xs text-[#f7f2e8] focus:outline-none focus:border-[#d9822b]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#1b3b2c] hover:bg-[#234d3a] border border-[#2a5942] text-[#f7f2e8] text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isRegister ? 'Create Personal Library' : 'Sign In to Library'}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="flex items-center gap-2 pt-2 text-[11px] text-[#6b8577] border-t border-[#1a3528]">
            <ShieldCheck className="w-4 h-4 text-[#deb17a] flex-shrink-0" />
            <span>All uploads, playlists, and listening history remain private to your account.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
