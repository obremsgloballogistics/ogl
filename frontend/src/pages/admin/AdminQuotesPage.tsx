import { useEffect, useState } from 'react';
import {
  Search,
  FileText,
  Filter,
  Download,
  Eye,
  Edit2,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Save,
  Plane,
  Ship,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';

const STATUS_STYLES: Record<string, string> = {
  'Pending': 'bg-white text-slate-700 border border-slate-200',
  'Reviewed': 'bg-white text-slate-700 border border-slate-200',
  'Quoted': 'bg-white text-slate-700 border border-slate-200',
  'Accepted': 'bg-white text-slate-700 border border-slate-200',
  'Declined': 'bg-white text-slate-700 border border-slate-200',
};

const STATUS_ICON: Record<string, any> = {
  'Accepted': CheckCircle2,
  'Pending': Clock,
  'Declined': XCircle,
};

const TABS = ['All', 'Pending', 'Reviewed', 'Quoted', 'Accepted', 'Declined'];

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selected, setSelected] = useState<any>(null);
  const [showNewQuote, setShowNewQuote] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // New quote form state
  const [nqName, setNqName] = useState('');
  const [nqEmail, setNqEmail] = useState('');
  const [nqPhone, setNqPhone] = useState('');
  const [nqRoute, setNqRoute] = useState('UK → Ghana (Air)');
  const [nqMethod, setNqMethod] = useState('Air Freight');
  const [nqWeight, setNqWeight] = useState('');
  const [nqNotes, setNqNotes] = useState('');
  const [nqSaving, setNqSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    api.get('/quotes')
      .then((res) => setQuotes(res.data?.data || []))
      .catch(() => setQuotes([]));
  }, []);

  const updateStatus = async (status: string) => {
    try {
      const response = await api.put(`/quotes/${selected._id}`, { ...selected, status });
      const updated = response.data?.data || { ...selected, status };
      setQuotes((current) => current.map((quote) => quote._id === selected._id ? updated : quote));
      setSelected(updated);
      showToast('Quote status updated!');
    } catch {
      showToast('Failed to update quote status.');
    }
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nqName || !nqEmail) return;
    setNqSaving(true);
    try {
      const res = await api.post('/quotes', {
        fullName: nqName,
        email: nqEmail,
        phone: nqPhone,
        route: nqRoute,
        method: nqMethod,
        weight: nqWeight,
        notes: nqNotes,
        status: 'Pending',
      });
      if (res.data?.data) {
        setQuotes((prev) => [res.data.data, ...prev]);
        showToast('Quote request created!');
      }
      setShowNewQuote(false);
      setNqName(''); setNqEmail(''); setNqPhone(''); setNqWeight(''); setNqNotes('');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to create quote.');
    } finally {
      setNqSaving(false);
    }
  };

  const filtered = quotes.filter((q) => {
    const matchSearch =
      q._id?.toLowerCase().includes(search.toLowerCase()) ||
      q.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      q.route?.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'All' || q.status === activeTab;
    return matchSearch && matchTab;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleTabChange = (tab: string) => { setActiveTab(tab); setCurrentPage(1); };
  const handleSearch = (val: string) => { setSearch(val); setCurrentPage(1); };

  const stats = [
    { label: 'Total Quotes', value: quotes.length, color: 'text-slate-600 bg-white border border-slate-200' },
    { label: 'Pending', value: quotes.filter(q => q.status === 'Pending').length, color: 'text-slate-600 bg-white border border-slate-200' },
    { label: 'Accepted', value: quotes.filter(q => q.status === 'Accepted').length, color: 'text-slate-600 bg-white border border-slate-200' },
    { label: 'Declined', value: quotes.filter(q => q.status === 'Declined').length, color: 'text-slate-600 bg-white border border-slate-200' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl border bg-[#063B66] text-white text-xs font-semibold animate-in slide-in-from-top-2">
          {toast}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#063B66]">Quote Requests</h2>
          <p className="text-xs text-slate-500 mt-1">Review, respond to and manage customer quote requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button onClick={() => setShowNewQuote(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0B63CE] hover:bg-[#0952AD] text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            New Quote
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#063B66]">{s.value}</p>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by quote ID, customer or route..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:bg-white transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                activeTab === tab ? 'bg-[#063B66] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab}
              <span className="ml-1.5 opacity-70">
                ({tab === 'All' ? quotes.length : quotes.filter(q => q.status === tab).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Quote ID</th>
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Route</th>
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Method</th>
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Weight</th>
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Received</th>
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 font-semibold">No quotes found.</td>
                </tr>
              ) : (
                paginated.map((q) => {
                  const IconComp = STATUS_ICON[q.status];
                  return (
                    <tr key={q._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#063B66]">{q._id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#063B66] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {(q.fullName || '??').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{q.fullName}</p>
                            <p className="text-[10px] text-slate-400">{q.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{q.route || `${q.origin} → ${q.destination}`}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          {q.method?.includes('Air') ? <Plane className="w-3.5 h-3.5 text-[#0B63CE]" /> : <Ship className="w-3.5 h-3.5 text-emerald-500" />}
                          {q.method}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{q.weight || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[q.status] || 'bg-white text-slate-700 border border-slate-200'}`}>
                          {IconComp && <IconComp className="w-3 h-3 text-slate-600" />}
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{q.received || (q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '-')}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelected(q)}
                            className="p-1.5 text-slate-400 hover:text-[#0B63CE] hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setSelected(q)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing <strong className="text-slate-700">{paginated.length}</strong> of <strong className="text-slate-700">{filtered.length}</strong> quotes</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                  page === currentPage ? 'bg-[#063B66] text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quote Detail Panel (slide-over) */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-start justify-end">
          <div className="bg-white h-full w-full max-w-md shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-sm font-extrabold text-[#063B66] uppercase tracking-wider">Quote Details</h3>
              <button onClick={() => setSelected(null)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Quote ID & Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quote ID</p>
                  <p className="text-lg font-extrabold text-[#063B66] mt-0.5">{selected._id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${STATUS_STYLES[selected.status]}`}>
                  {selected.status}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Customer</p>
                <p className="font-extrabold text-[#063B66]">{selected.fullName}</p>
                <p className="text-xs text-slate-500">{selected.email}</p>
                <p className="text-xs text-slate-500">{selected.phone}</p>
              </div>

              {/* Shipment Details */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shipment Details</p>
                {[
                  { label: 'Route', value: selected.route },
                  { label: 'Method', value: selected.method },
                  { label: 'Weight', value: selected.weight },
                  { label: 'Received', value: selected.received },
                ].map((d) => (
                  <div key={d.label} className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                    <span className="font-semibold text-slate-500">{d.label}</span>
                    <span className="font-bold text-slate-800">{d.value || '-'}</span>
                  </div>
                ))}
                {selected.notes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                    <strong>Notes:</strong> {selected.notes}
                  </div>
                )}
              </div>

              {/* Update Status */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Status</p>
                <select defaultValue={selected.status} onChange={(event) => updateStatus(event.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0B63CE] transition-colors">
                  {TABS.filter(t => t !== 'All').map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Quote Modal */}
      {showNewQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-extrabold text-[#063B66] uppercase tracking-wider">New Quote Request</h3>
              <button onClick={() => setShowNewQuote(false)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateQuote} className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Full Name', placeholder: 'Customer full name', span: 2, value: nqName, set: setNqName, required: true },
                { label: 'Email Address', placeholder: 'customer@email.com', span: 1, value: nqEmail, set: setNqEmail, required: true },
                { label: 'Phone', placeholder: '+233 24 000 0000', span: 1, value: nqPhone, set: setNqPhone, required: false },
                { label: 'Weight', placeholder: 'e.g. 5 kg', span: 1, value: nqWeight, set: setNqWeight, required: false },
              ].map((f) => (
                <div key={f.label} className={`space-y-1.5 ${f.span === 2 ? 'col-span-2' : ''}`}>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">{f.label}</label>
                  <input
                    type="text"
                    required={f.required}
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] transition-colors"
                  />
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Route</label>
                <select value={nqRoute} onChange={(e) => setNqRoute(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B63CE]">
                  <option>UK → Ghana (Air)</option>
                  <option>China → Ghana (Sea &amp; Air)</option>
                  <option>USA → Ghana (Air)</option>
                  <option>Dubai → Ghana (Air)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Method</label>
                <select value={nqMethod} onChange={(e) => setNqMethod(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B63CE]">
                  <option>Air Freight</option>
                  <option>Sea &amp; Air Freight</option>
                  <option>Door Delivery</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Notes</label>
                <textarea value={nqNotes} onChange={(e) => setNqNotes(e.target.value)} rows={3} placeholder="Any special requirements..." className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] resize-none" />
              </div>
              <div className="col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowNewQuote(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={nqSaving} className="flex items-center gap-2 px-4 py-2 bg-[#0B63CE] hover:bg-[#0952AD] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors">
                  <Save className="w-3.5 h-3.5" />
                  {nqSaving ? 'Saving...' : 'Create Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
