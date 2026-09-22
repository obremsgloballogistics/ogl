import { useState, useEffect } from 'react';
import {
  UserCheck, Plus, Trash2, CheckCircle2, X, AlertCircle,
  Copy, Check, Eye, EyeOff, Shield, ChevronDown, RefreshCw, Pencil,
} from 'lucide-react';
import api from '../../services/api';

const ROLES = [
  'Super Admin',
  'Admin',
  'UK Manager',
  'Ghana Manager',
  'China Manager',
  'Ghana Customs Agent',
  'Dispatcher',
  'Operations Manager',
  'Shipment Officer',
  'Finance Officer',
  'Customer Support',
  'Content Manager',
  'Media Manager',
] as const;

const ACCESS_OPTIONS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'shipments', label: 'Shipments' },
  { key: 'qrCode', label: 'QR & SMS Hub' },
  { key: 'customers', label: 'Customers' },
  { key: 'quotes', label: 'Quotes' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'content', label: 'Content' },
  { key: 'contentServices', label: 'Services & Routes' },
  { key: 'contentBlog', label: 'Blog' },
  { key: 'contentFaqs', label: 'FAQs' },
  { key: 'contentTestimonials', label: 'Testimonials' },
  { key: 'assets', label: 'Assets' },
  { key: 'messages', label: 'Messages' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'activityLog', label: 'Activity Log' },
  { key: 'settings', label: 'Settings' },
  { key: 'users', label: 'Users & Roles' },
] as const;
const DEFAULT_PERMISSIONS = ['dashboard', 'shipments'];

type Role = typeof ROLES[number] | (string & {});

interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  permissions: string[];
  status: 'Active' | 'Inactive';
  mustChangePassword: boolean;
  createdAt?: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; temporaryPassword: string } | null>(null);
  const [credentialsCopied, setCredentialsCopied] = useState(false);
  const [credentialsAcknowledged, setCredentialsAcknowledged] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<StaffUser | null>(null);
  const [accessUser, setAccessUser] = useState<StaffUser | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('Dispatcher');
  const [permissions, setPermissions] = useState<string[]>(DEFAULT_PERMISSIONS);

  // Copy states for credentials modal
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [showTempPass, setShowTempPass] = useState(false);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch {
      setFetchError('Failed to load staff members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setName(''); setEmail(''); setPhone(''); setRole('Dispatcher'); setPermissions(DEFAULT_PERMISSIONS);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) return;
    setSubmitting(true);
    try {
      const res = await api.post('/users', { name, email, phone, role, permissions });
      const created = res.data.data;
      setUsers((prev) => [
        {
          id: created.id,
          name: created.name,
          email: created.email,
          phone: created.phone,
          role: created.role as Role,
          permissions: created.permissions || permissions,
          status: 'Active',
          mustChangePassword: true,
          createdAt: created.createdAt,
        },
        ...prev,
      ]);
      setShowModal(false);
      resetForm();
      setCredentials({ email: created.email, temporaryPassword: created.temporaryPassword });
      setCredentialsAcknowledged(false);
      setCopiedEmail(false);
      setCopiedPass(false);
      setShowTempPass(false);
      setShowCredentials(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create user. Please try again.';
      triggerToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openAccessEditor = (user: StaffUser) => {
    setAccessUser(user);
    setSelectedPermissions(user.permissions || []);
  };

  const saveAccess = async () => {
    if (!accessUser) return;
    try {
      const res = await api.patch(`/users/${accessUser.id}`, { permissions: selectedPermissions });
      const updatedPermissions = res.data.data.permissions || selectedPermissions;
      setUsers((prev) => prev.map((u) => u.id === accessUser.id ? { ...u, permissions: updatedPermissions } : u));
      setAccessUser(null);
      triggerToast('Content access updated successfully.');
    } catch {
      triggerToast('Failed to update content access.', 'error');
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await api.patch(`/users/${userId}`, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      triggerToast('Role updated successfully.');
    } catch {
      triggerToast('Failed to update role.', 'error');
    }
  };

  const handleStatusToggle = async (user: StaffUser) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(`/users/${user.id}`, { status: newStatus });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: newStatus } : u));
      triggerToast(`${user.name} is now ${newStatus}.`);
    } catch {
      triggerToast('Failed to update status.', 'error');
    }
  };

  const handleDelete = async (user: StaffUser) => {
    try {
      await api.delete(`/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setDeleteConfirm(null);
      triggerToast(`${user.name} has been removed.`);
    } catch {
      triggerToast('Failed to delete user.', 'error');
    }
  };

  const copyToClipboard = async (text: string, field: 'email' | 'pass') => {
    try {
      await navigator.clipboard.writeText(text);
      if (field === 'email') { setCopiedEmail(true); setTimeout(() => setCopiedEmail(false), 2000); }
      else { setCopiedPass(true); setCredentialsCopied(true); setTimeout(() => setCopiedPass(false), 2000); }
    } catch {}
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-lg shadow-xl border border-white/20 flex items-center gap-3 animate-in slide-in-from-top-2 ${toast.type === 'error' ? 'bg-rose-700' : 'bg-[#063B66]'} text-white`}>
          {toast.type === 'error'
            ? <AlertCircle className="w-5 h-5 text-white shrink-0" />
            : <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#063B66]/10 flex items-center justify-center text-[#063B66]">
            <UserCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#063B66]">Users & Staff Access Controls</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage administrative team members, roles, permissions and regional hub access</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B63CE] hover:bg-[#0952AD] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {fetchError && (
        <div className="bg-white rounded-xl border border-rose-200 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">{fetchError}</p>
          </div>
          <button onClick={fetchUsers} className="text-xs font-bold text-[#0B63CE] hover:underline">Retry</button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                <div className="h-4 w-1/5 bg-slate-100 rounded" />
                <div className="h-4 w-1/4 bg-slate-100 rounded" />
                <div className="h-4 w-1/6 bg-slate-100 rounded" />
                <div className="h-4 w-1/6 bg-slate-100 rounded" />
                <div className="h-4 w-16 bg-slate-100 rounded" />
                <div className="h-4 w-8 bg-slate-100 rounded ml-auto" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
              <Shield className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-700">No staff members yet</p>
            <p className="text-xs text-slate-500">Add your first team member to get started.</p>
            <button onClick={() => { resetForm(); setShowModal(true); }} className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#0B63CE] text-white text-xs font-bold rounded-lg">
              <Plus className="w-4 h-4" /> Add Staff Member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-white text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Staff Name</th>
                  <th className="px-6 py-3.5">Email Address</th>
                  <th className="px-6 py-3.5">Phone Number</th>
                  <th className="px-6 py-3.5">Assigned Role</th>
                  <th className="px-6 py-3.5">Access</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-900">{u.name}</span>
                        {u.mustChangePassword && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 w-fit">
                            Must change password
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono">{u.email}</td>
                    <td className="px-6 py-4 text-slate-600">{u.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        className="px-2.5 py-1 rounded-md bg-[#063B66]/10 text-[#063B66] text-[10px] font-bold uppercase border-none focus:outline-none focus:ring-1 focus:ring-[#0B63CE] cursor-pointer"
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openAccessEditor(u)}
                        className="px-2.5 py-1 rounded-md bg-slate-100 text-[#063B66] text-[10px] font-bold hover:bg-[#063B66]/10"
                      >
                        {u.role === 'Super Admin' ? 'All sections' : `${u.permissions?.length || 0} sections`}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleStatusToggle(u)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                          u.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {u.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openAccessEditor(u)}
                        className="inline-flex items-center gap-1.5 mr-2 px-2.5 py-1.5 text-[#0B63CE] bg-[#0B63CE]/10 hover:bg-[#0B63CE]/20 rounded-md text-[10px] font-bold transition-colors"
                        title="Edit user access"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(u)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Remove user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#063B66] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Add Staff Account</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              <div>
                <label htmlFor="staff-name" className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  id="staff-name" type="text" required value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samuel K. Osei"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]/20"
                />
              </div>
              <div>
                <label htmlFor="staff-email" className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  id="staff-email" type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="samuel@obrems.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]/20"
                />
              </div>
              <div>
                <label htmlFor="staff-phone" className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  id="staff-phone" type="tel" value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 24 123 4567"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]/20"
                />
              </div>
              <div>
                <label htmlFor="staff-role" className="block font-bold text-slate-700 mb-1">Role Assignment *</label>
                <select
                  id="staff-role" value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE]"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <p className="block font-bold text-slate-700 mb-2">Content Access</p>
                <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  {ACCESS_OPTIONS.map((option) => (
                    <label key={option.key} className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={permissions.includes(option.key)}
                        onChange={(e) => setPermissions((current) => e.target.checked ? [...current, option.key] : current.filter((key) => key !== option.key))}
                        className="accent-[#0B63CE]"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-[#0B63CE] hover:bg-[#0952AD] text-white font-bold shadow-sm disabled:opacity-60">
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Access Editor Modal */}
      {accessUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-[#063B66] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Content Access</h3>
                <p className="text-[10px] text-slate-300 mt-0.5">{accessUser.name} · {accessUser.email}</p>
              </div>
              <button onClick={() => setAccessUser(null)} className="text-slate-300 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              {accessUser.role === 'Super Admin' ? (
                <p className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 font-semibold">Super Admins automatically have access to every section.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {ACCESS_OPTIONS.map((option) => (
                    <label key={option.key} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2.5 font-semibold text-slate-700 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(option.key)}
                        onChange={(e) => setSelectedPermissions((current) => e.target.checked ? [...current, option.key] : current.filter((key) => key !== option.key))}
                        className="accent-[#0B63CE]"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button onClick={() => setAccessUser(null)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold">Cancel</button>
                <button onClick={saveAccess} disabled={accessUser.role === 'Super Admin'} className="px-5 py-2 rounded-lg bg-[#0B63CE] text-white font-bold disabled:opacity-40">Save Access</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentials && credentials && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-emerald-600 text-white flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-bold text-sm">Staff Account Created ✓</h3>
            </div>
            <div className="p-6 space-y-5 text-xs">
                <p className="text-slate-600">A secure temporary password was generated automatically. Share these credentials securely; the password is shown here once, and the user must change it after their first login.</p>

              {/* Email */}
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                  <span className="flex-1 font-mono text-slate-800">{credentials.email}</span>
                  <button onClick={() => copyToClipboard(credentials.email, 'email')}
                    className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-[#0B63CE] transition-colors" title="Copy email">
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Temporary Password */}
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Temporary Password</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                  <span className="flex-1 font-mono text-slate-800 tracking-widest">
                    {showTempPass ? credentials.temporaryPassword : '•'.repeat(credentials.temporaryPassword.length)}
                  </span>
                  <button onClick={() => setShowTempPass(!showTempPass)}
                    className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors" title="Show/hide password">
                    {showTempPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => copyToClipboard(credentials.temporaryPassword, 'pass')}
                    className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-[#0B63CE] transition-colors" title="Copy password">
                    {copiedPass ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg p-3.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-amber-800 font-semibold">For security, this password will not be shown again. Please copy it now.</p>
              </div>

              {/* Acknowledgement */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={credentialsAcknowledged}
                  onChange={(e) => setCredentialsAcknowledged(e.target.checked)}
                  className="mt-0.5 accent-[#0B63CE]" />
                <span className="text-slate-700 font-semibold leading-relaxed">I have copied the temporary password and will share it securely with the new staff member.</span>
              </label>

              <div className="pt-2 flex justify-end border-t border-slate-100">
                <button
                  disabled={!credentialsAcknowledged}
                  onClick={() => { setShowCredentials(false); setCredentials(null); triggerToast('Staff account setup complete.'); }}
                  className="px-5 py-2 rounded-lg bg-[#0B63CE] hover:bg-[#0952AD] text-white font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-rose-600 text-white flex items-center gap-3">
              <Trash2 className="w-5 h-5" />
              <h3 className="font-bold text-sm">Remove Staff Member</h3>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">Are you sure you want to remove <strong className="text-slate-900">{deleteConfirm.name}</strong>? This cannot be undone.</p>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm">
                  Yes, Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
