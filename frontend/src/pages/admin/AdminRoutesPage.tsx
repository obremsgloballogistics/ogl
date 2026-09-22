import { useEffect, useState } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Globe,
  Plane,
  Ship,
  Truck,
  Filter
} from 'lucide-react';
import api from '../../services/api';

interface RouteCorridor {
  id: string;
  corridorCode: string;
  originHub: string;
  destinationHub: string;
  mode: 'Air' | 'Sea' | 'Land';
  frequency: string;
  leadTime: string;
  status: 'Active' | 'Under Maintenance';
}

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<RouteCorridor[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [routeFilter, setRouteFilter] = useState<'All' | 'Air' | 'Sea' | 'Land'>('All');

  // Form State
  const [corridorCode, setCorridorCode] = useState('');
  const [originHub, setOriginHub] = useState('');
  const [destinationHub, setDestinationHub] = useState('');
  const [mode, setMode] = useState<'Air' | 'Sea' | 'Land'>('Air');
  const [frequency, setFrequency] = useState('');
  const [leadTime, setLeadTime] = useState('');

  useEffect(() => {
    api.get('/routes').then((response) => {
      setRoutes((response.data?.data || []).map((route: any) => ({
        id: route._id,
        corridorCode: route.corridorCode || `${route.origin}-${route.destination}`,
        originHub: route.origin,
        destinationHub: route.destination,
        mode: route.mode || (route.shippingMethod?.includes('Sea') ? 'Sea' : route.shippingMethod?.includes('Land') ? 'Land' : 'Air'),
        frequency: route.frequency || 'Configured route',
        leadTime: route.transitTime || '',
        status: route.active === false ? 'Under Maintenance' : 'Active',
      })));
    }).catch(() => setRoutes([]));
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originHub || !destinationHub) return;

    api.post('/routes', { corridorCode: corridorCode || undefined, origin: originHub, destination: destinationHub, mode, shippingMethod: `${mode} Freight`, frequency: frequency || 'Daily', transitTime: leadTime || '3-5 Days', active: true }).then((response) => {
      const route = response.data?.data;
      if (route) setRoutes((current) => [{ id: route._id, corridorCode: route.corridorCode || corridorCode, originHub: route.origin, destinationHub: route.destination, mode, frequency: route.frequency, leadTime: route.transitTime, status: 'Active' }, ...current]);
      setShowModal(false); setCorridorCode(''); setOriginHub(''); setDestinationHub(''); setFrequency(''); setLeadTime('');
      triggerToast('Route corridor added.');
    }).catch(() => triggerToast('Failed to save route corridor.'));
  };

  const handleDelete = (id: string) => {
    api.delete(`/routes/${id}`).then(() => { setRoutes((current) => current.filter((route) => route.id !== id)); triggerToast('Route corridor deleted.'); }).catch(() => triggerToast('Failed to delete route corridor.'));
  };

  const filteredRoutes = routeFilter === 'All' ? routes : routes.filter((route) => route.mode === routeFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#063B66] text-white px-5 py-3 rounded-lg shadow-xl border border-white/20 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#063B66]/10 flex items-center justify-center text-[#063B66]">
            <MapPin className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#063B66]">Routes & Hub Corridors</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage international flight lanes, sea vessel routes, and domestic dispatch networks</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B63CE] hover:bg-[#0952AD] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Route Corridor</span>
        </button>
      </div>

      {/* Routes List */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        <Filter className="ml-1 h-4 w-4 text-slate-400" />
        {(['All', 'Air', 'Sea', 'Land'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setRouteFilter(filter)}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${routeFilter === filter ? 'bg-[#063B66] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {filter} routes
          </button>
        ))}
        <span className="ml-auto px-2 text-xs font-semibold text-slate-400">{filteredRoutes.length} of {routes.length}</span>
      </div>
      <div className="space-y-4">
        {filteredRoutes.map((rt) => (
          <div
            key={rt.id}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#063B66] shrink-0">
                {rt.mode === 'Air' ? (
                  <Plane className="w-6 h-6" />
                ) : rt.mode === 'Sea' ? (
                  <Ship className="w-6 h-6" />
                ) : (
                  <Truck className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-[#063B66]">{rt.corridorCode}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                    {rt.status}
                  </span>
                </div>

                <div className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                  <span>{rt.originHub}</span>
                  <span className="text-[#0B63CE]">→</span>
                  <span>{rt.destinationHub}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>
                    <strong className="text-slate-700">Frequency:</strong> {rt.frequency}
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-slate-700">Transit Window:</strong> {rt.leadTime}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDelete(rt.id)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors self-end md:self-center"
              title="Delete Route"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#063B66] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Add Route Corridor</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoute} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Corridor Code</label>
                <input
                  type="text"
                  value={corridorCode}
                  onChange={(e) => setCorridorCode(e.target.value)}
                  placeholder="e.g. UK-ACC-AIR-02"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Origin Hub *</label>
                <input
                  type="text"
                  required
                  value={originHub}
                  onChange={(e) => setOriginHub(e.target.value)}
                  placeholder="London LHR Logistics Hub"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Destination Hub *</label>
                <input
                  type="text"
                  required
                  value={destinationHub}
                  onChange={(e) => setDestinationHub(e.target.value)}
                  placeholder="Kotoka Airport Accra"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Transport Mode</label>
                <select
                  value={mode}
                  onChange={(e: any) => setMode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                >
                  <option value="Air">Air Flight</option>
                  <option value="Sea">Sea Vessel</option>
                  <option value="Land">Overland Dispatch</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Frequency</label>
                  <input
                    type="text"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="3x Weekly"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lead Time</label>
                  <input
                    type="text"
                    value={leadTime}
                    onChange={(e) => setLeadTime(e.target.value)}
                    placeholder="3-5 Days"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0B63CE] hover:bg-[#0952AD] text-white font-bold shadow-sm"
                >
                  Save Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
