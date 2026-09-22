import { useState } from 'react';
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function getStrength(pw: string): { label: string; color: string; width: string; score: number } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Weak', color: 'bg-rose-500', width: 'w-1/5', score };
  if (score <= 2) return { label: 'Fair', color: 'bg-amber-500', width: 'w-2/5', score };
  if (score <= 3) return { label: 'Good', color: 'bg-yellow-500', width: 'w-3/5', score };
  if (score === 4) return { label: 'Strong', color: 'bg-emerald-500', width: 'w-4/5', score };
  return { label: 'Very Strong', color: 'bg-emerald-600', width: 'w-full', score };
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const strength = getStrength(newPassword);
  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit = currentPassword && newPassword.length >= 8 && passwordsMatch && strength.score >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setSubmitting(true);
    try {
      await api.post('/users/change-password', { currentPassword, newPassword });
      setSuccess(true);
      // Clear mustChangePassword flag from localStorage user data if stored
      try {
        const stored = localStorage.getItem('obrems_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.mustChangePassword = false;
          localStorage.setItem('obrems_user', JSON.stringify(parsed));
        }
      } catch {}
      setTimeout(() => navigate('/admin', { replace: true }), 2200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F7FA] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#063B66]/10 flex items-center justify-center text-[#063B66] mx-auto mb-4">
            <Lock className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#063B66]">Change Your Password</h1>
          <p className="mt-2 text-sm text-slate-500">You're using a temporary password. Please set a new secure password to continue.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
              <p className="text-lg font-bold text-slate-800">Password Changed Successfully</p>
              <p className="text-sm text-slate-500">Redirecting you to the dashboard…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Current Password */}
              <div>
                <label htmlFor="current-password" className="block font-bold text-slate-700 mb-1.5">Current / Temporary Password *</label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your temporary password"
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]/20 pr-10"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="new-password" className="block font-bold text-slate-700 mb-1.5">New Password * <span className="text-slate-400 font-normal">(min. 8 characters)</span></label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNew ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]/20 pr-10"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength Bar */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                    </div>
                    <p className={`text-[10px] font-bold ${strength.score <= 1 ? 'text-rose-600' : strength.score <= 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {strength.label} password
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm-password" className="block font-bold text-slate-700 mb-1.5">Confirm New Password *</label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className={`w-full px-3.5 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]/20 pr-10 ${
                      confirmPassword && !passwordsMatch ? 'border-rose-400' : 'border-slate-300'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="mt-1 text-[10px] font-bold text-rose-600">Passwords do not match.</p>
                )}
              </div>

              {/* Hints */}
              <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                <p className="text-slate-600 font-semibold mb-1.5">Password requirements:</p>
                {[
                  { label: 'At least 8 characters', ok: newPassword.length >= 8 },
                  { label: 'At least one uppercase letter', ok: /[A-Z]/.test(newPassword) },
                  { label: 'At least one number', ok: /[0-9]/.test(newPassword) },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center gap-2">
                    <ShieldCheck className={`w-3.5 h-3.5 ${ok ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span className={ok ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-rose-800 font-semibold">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="w-full py-3 rounded-lg bg-[#0B63CE] hover:bg-[#0952AD] text-white font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Changing Password…' : 'Change Password'}
              </button>

              <p className="text-center text-slate-400">
                <button type="button" onClick={() => navigate('/admin')} className="hover:text-[#0B63CE] underline">
                  Skip for now (you'll be asked again next login)
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
