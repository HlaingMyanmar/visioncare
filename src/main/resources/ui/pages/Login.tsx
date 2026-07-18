import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, User as UserIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import { User } from '../types';
import { authService } from '../services/api';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [usernameOremail, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(usernameOremail.trim(), password);
      if (response.success) {
        onLoginSuccess({
          username: response.data.username,
          roles: response.data.roles || [],
          permissions: response.data.permissions || []
        });
      }
    } catch (err: any) {
      const message = err.message || 'Login failed. Please check your username and password.';
      setError(message);
      Swal.fire({ icon: 'error', title: 'Login failed', text: message, confirmButtonColor: '#0f766e' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#edf8f7] px-4 py-8">
      <section className="w-full max-w-[390px] overflow-hidden rounded-lg border border-teal-100 bg-white shadow-[0_22px_70px_rgba(15,118,110,0.16)]">
        <div className="bg-gradient-to-b from-teal-50 to-white px-7 pb-5 pt-8 text-center">
          <div className="mx-auto mb-4 flex h-[74px] w-[74px] items-center justify-center rounded-full bg-white shadow-[0_10px_28px_rgba(15,118,110,0.16)] ring-1 ring-teal-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <Eye size={35} strokeWidth={1.8} />
            </div>
          </div>
          <h1 className="text-[26px] font-black leading-tight tracking-tight text-slate-950">VisionCare</h1>
          <p className="mt-1 text-sm font-semibold text-teal-700">&#4121;&#4155;&#4096;&#4154;&#4101;&#4141;&#4102;&#4145;&#4152;&#4097;&#4116;&#4154;&#4152; Login</p>
        </div>

        <div className="px-7 pb-7 pt-2">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p className="text-xs font-semibold leading-5">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-left">
              <span className="mb-1.5 block text-xs font-black text-slate-600">Username or Email</span>
              <span className="relative block">
                <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={usernameOremail}
                  onChange={(event) => setUsername(event.target.value)}
                  className="focus-ring h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-800 placeholder:text-slate-300"
                  placeholder="Enter username"
                />
              </span>
            </label>

            <label className="block text-left">
              <span className="mb-1.5 block text-xs font-black text-slate-600">Password</span>
              <span className="relative block">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="focus-ring h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-11 text-sm font-semibold text-slate-800 placeholder:text-slate-300"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-teal-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-black text-white shadow-[0_10px_24px_rgba(15,118,110,0.2)] transition hover:bg-teal-800 disabled:opacity-60"
            >
              {loading ? <><Loader2 className="animate-spin" size={16} /> Logging in</> : 'Login'}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] font-semibold leading-5 text-slate-400">
            Authorized clinic staff only
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;

