import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Package } from 'lucide-react';
import api from '../../services/api';

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      const { token, user } = response.data;
      localStorage.setItem('obrems_token', token);
      if (user) {
        localStorage.setItem('obrems_user', JSON.stringify(user));
      }
      // Redirect to change-password if this is a temporary password login
      if (user?.mustChangePassword) {
        navigate('/admin/change-password', { replace: true });
      } else {
        navigate('/admin', { replace: true });
      }
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F7FA] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#063B66] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Package className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#063B66]">OBREMS GLOBAL LOGISTICS</h1>
          <p className="mt-1.5 text-sm text-slate-500">Secure access to the logistics management platform.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-[#063B66]" />
            <h2 className="text-sm font-bold text-[#063B66]">Admin Login</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            <div>
              <label htmlFor="login-email" className="block font-bold text-slate-700 mb-1.5">Email Address</label>
              <input
                id="login-email"
                type="email"
                {...register('email', { required: true })}
                placeholder="admin@obrems.com"
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]/20"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: true })}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]/20 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-rose-600 font-semibold bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#063B66] hover:bg-[#0B63CE] text-white font-bold shadow-sm disabled:opacity-60 transition-colors mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">© {new Date().getFullYear()} OBREMS GLOBAL LOGISTICS. All rights reserved.</p>
      </div>
    </main>
  );
}
