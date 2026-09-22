import { useEffect, useState } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Plane,
  Ship,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import api from '../../services/api';

interface ServiceTier {
  id: string;
  name: string;
  category: 'Air Freight' | 'Sea Shipping' | 'Door Delivery';
  rate: string;
  transitTime: string;
  origin: string;
  destination: string;
  imageUrl?: string;
  status: 'Active' | 'Inactive';
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceTier[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Air Freight' | 'Sea Shipping' | 'Door Delivery'>('Air Freight');
  const [rate, setRate] = useState('');
  const [transitTime, setTransitTime] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    api.get('/services')
      .then((response) => {
        setServices((response.data?.data || []).map((service: any) => ({
          id: service._id,
          name: service.title,
          category: service.route?.includes('Sea') ? 'Sea Shipping' : 'Air Freight',
          rate: service.description || '',
          transitTime: service.transitTime || '',
          origin: service.route?.split('→')[0]?.trim() || '',
          destination: service.route?.split('→')[1]?.trim() || '',
          imageUrl: service.imageUrl || '',
          status: service.active === false ? 'Inactive' : 'Active',
        })));
      })
      .catch(() => setServices([]));
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rate) return;

    api.post('/services', {
      title: name,
      description: rate,
      route: `${origin || 'International Hub'} → ${destination || 'Ghana Destination'}`,
      transitTime: transitTime || '3-5 Days',
      active: true,
      imageUrl,
    }).then((response) => {
      const service = response.data?.data;
      if (service) {
        setServices((current) => [{
          id: service._id,
          name: service.title,
          category,
          rate: service.description,
          transitTime: service.transitTime,
          origin,
          destination,
          imageUrl: service.imageUrl || imageUrl,
          status: 'Active',
        }, ...current]);
      }
      setShowModal(false);
      setName(''); setRate(''); setTransitTime(''); setOrigin(''); setDestination(''); setImageUrl('');
      triggerToast(`Service ${name} configured successfully!`);
    }).catch(() => triggerToast('Failed to save service.'));
  };

  const handleDelete = (id: string) => {
    api.delete(`/services/${id}`)
      .then(() => {
        setServices((current) => current.filter((service) => service.id !== id));
        triggerToast('Service tier deleted.');
      })
      .catch(() => triggerToast('Failed to delete service.'));
  };

  const toggleStatus = (id: string) => {
    setServices(
      services.map((s) =>
        s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s
      )
    );
    triggerToast('Service status toggled.');
  };

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
            <Package className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#063B66]">Services & Rates Manager</h1>
            <p className="text-xs text-slate-500 mt-0.5">Configure air freight rates per kg, sea shipping CBM tiers, and delivery zones</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B63CE] hover:bg-[#0952AD] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service Tier</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-[#063B66]/10 text-[#063B66] text-[10px] font-bold uppercase tracking-wider">
                  {srv.category}
                </span>

                <button
                  onClick={() => toggleStatus(srv.id)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    srv.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {srv.status}
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#063B66]">{srv.name}</h3>
                <p className="text-2xl font-extrabold text-[#0B63CE] mt-1">{srv.rate}</p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <p>
                  <strong className="text-slate-800">Est. Transit Time:</strong> {srv.transitTime}
                </p>
                <p>
                  <strong className="text-slate-800">Origin Corridor:</strong> {srv.origin}
                </p>
                <p>
                  <strong className="text-slate-800">Destination Corridor:</strong> {srv.destination}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handleDelete(srv.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Service"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#063B66] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Add New Service Tier</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. UK Direct Express Flight"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                >
                  <option value="Air Freight">Air Freight</option>
                  <option value="Sea Shipping">Sea Shipping</option>
                  <option value="Door Delivery">Door Delivery</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rate Pricing (e.g. £7.50 / kg) *</label>
                <input
                  type="text"
                  required
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="£7.50 / kg"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimated Transit Time</label>
                <input
                  type="text"
                  value={transitTime}
                  onChange={(e) => setTransitTime(e.target.value)}
                  placeholder="e.g. 3-5 Days"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Origin</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="UK LHR Hub"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Ghana ACC"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                />
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
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
