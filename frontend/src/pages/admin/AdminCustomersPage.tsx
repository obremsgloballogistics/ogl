import { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Users,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Package,
  X,
  Save
} from 'lucide-react';
import api from '../../services/api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWhatsApp, setFormWhatsApp] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setEditId(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormWhatsApp('');
    setFormAddress('');
  };

  const handleEdit = (c: any) => {
    setEditId(c._id);
    setFormName(c.name || '');
    setFormEmail(c.email || '');
    setFormPhone(c.phone || '');
    setFormWhatsApp(c.whatsapp || '');
    setFormAddress(c.address || '');
    setShowCreate(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      setCustomers(prev => prev.filter(c => c._id !== id));
      showToast('Customer deleted successfully!');
    } catch (err) {
      showToast('Failed to delete customer');
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast('Name and email are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        whatsapp: formWhatsApp.trim(),
        address: formAddress.trim(),
      };

      if (editId) {
        const res = await api.put(`/customers/${editId}`, payload);
        if (res.data?.data) {
          setCustomers(prev => prev.map(c => c._id === editId ? res.data.data : c));
          showToast('Customer updated successfully!');
        }
      } else {
        const res = await api.post('/customers', payload);
        if (res.data?.data) {
          setCustomers([res.data.data, ...customers]);
          showToast('Customer added successfully!');
        }
      }
      setShowCreate(false);
      resetForm();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    api.get('/customers')
      .then((res) => setCustomers(res.data?.data || []))
      .catch(() => setCustomers([]));
  }, []);

  const filtered = customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {toast && (
        <div className="fixed top-20 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl border bg-[#063B66] text-white text-xs font-semibold animate-in slide-in-from-top-2">
          {toast}
        </div>
      )}
      {/* Uniform Page Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#063B66]/10 flex items-center justify-center text-[#063B66]">
            <Users className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#063B66]">Customers</h1>
            <p className="text-xs text-slate-500 mt-0.5">View and manage all customer records and shipment history</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B63CE] hover:bg-[#0952AD] text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, color: 'text-slate-600 bg-white border border-slate-200' },
          { label: 'Active', value: customers.filter(c => c.status === 'Active').length, color: 'text-slate-600 bg-white border border-slate-200' },
          { label: 'Inactive', value: customers.filter(c => c.status === 'Inactive').length, color: 'text-slate-600 bg-white border border-slate-200' },
          { label: 'New This Month', value: 3, color: 'text-slate-600 bg-white border border-slate-200' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#063B66]">{s.value}</p>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or location..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:bg-white transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${viewMode === 'table' ? 'bg-[#063B66] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${viewMode === 'grid' ? 'bg-[#063B66] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F7FA] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Location</th>
                  <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Shipments</th>
                  <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Total Spent</th>
                  <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                  <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#063B66] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                          {c.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-bold text-[#063B66]">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{c.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{c.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-[#0B63CE] shrink-0" />
                        {c.address}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-800">{c.totalShipments || 0}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-[#063B66]">{c.totalSpent || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        c.status === 'Active'
                          ? 'bg-white text-slate-700 border-slate-200'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}>
                        {c.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{c.joinDate || '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="p-2 text-slate-400 hover:text-[#0B63CE] hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(c)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Customer">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(c._id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Customer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing <strong className="text-slate-700">{filtered.length}</strong> of <strong className="text-slate-700">{customers.length}</strong> customers</span>
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 rounded-lg bg-[#063B66] text-white font-bold">1</span>
              <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#063B66] text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                    {c.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-extrabold text-[#063B66] text-sm">{c.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-200 ${c.status === 'Active' ? 'bg-white text-slate-700' : 'bg-white text-slate-600'}`}>
                      {c.status || 'Active'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 text-slate-400 hover:text-[#0B63CE] hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleEdit(c)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{c.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{c.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#0B63CE] shrink-0" />
                  <span>{c.address}</span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs">
                <span className="text-slate-500">{c.totalShipments || 0} shipments</span>
                <span className="font-extrabold text-[#063B66]">{c.totalSpent || '$0'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Customer Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-extrabold text-[#063B66] uppercase tracking-wider">
                {editId ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button onClick={() => { setShowCreate(false); resetForm(); }} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveCustomer} className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Full Name', placeholder: 'e.g. John Mensah', span: 2, value: formName, set: setFormName },
                { label: 'Email Address', placeholder: 'e.g. john@example.com', span: 2, value: formEmail, set: setFormEmail },
                { label: 'Phone Number', placeholder: 'e.g. +44 7712 345678', span: 1, value: formPhone, set: setFormPhone },
                { label: 'WhatsApp', placeholder: 'e.g. +44 7712 345678', span: 1, value: formWhatsApp, set: setFormWhatsApp },
                { label: 'Location / Address', placeholder: 'e.g. London, UK', span: 2, value: formAddress, set: setFormAddress },
              ].map((f) => (
                <div key={f.label} className={`space-y-1.5 ${f.span === 2 ? 'col-span-2' : ''}`}>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">{f.label}</label>
                  <input
                    type="text"
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:bg-white transition-colors"
                  />
                </div>
              ))}
              <div className="col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); resetForm(); }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0B63CE] hover:bg-[#0952AD] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : (editId ? 'Save Changes' : 'Add Customer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
