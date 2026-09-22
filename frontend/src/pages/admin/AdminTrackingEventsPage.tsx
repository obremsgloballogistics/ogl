import { useState } from 'react';
import {
  Activity,
  Plus,
  Search,
  MapPin,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Truck,
  Plane,
  Ship,
  Package
} from 'lucide-react';

interface ScanEvent {
  id: string;
  trackingNumber: string;
  location: string;
  statusTitle: string;
  details: string;
  operator: string;
  timestamp: string;
  transportMode: 'Air' | 'Sea' | 'Road';
}

export default function AdminTrackingEventsPage() {
  const [events, setEvents] = useState<ScanEvent[]>([
    {
      id: 'EV-1001',
      trackingNumber: 'OGL245678912UK',
      location: 'London Heathrow Logistics Hub (LHR)',
      statusTitle: 'Consignment Scanned & Received',
      details: 'Package received from sender, inspected, weighed, and queued for departure.',
      operator: 'John Mensah (Operator ID #88)',
      timestamp: '2026-08-11 14:30',
      transportMode: 'Air',
    },
    {
      id: 'EV-1002',
      trackingNumber: 'OGL99823412CN',
      location: 'Port of Guangzhou Container Hub',
      statusTitle: 'Vessel Loaded & Departed',
      details: 'Container loaded onto cargo vessel CMA CGM for Tema Port transit.',
      operator: 'Chen Wei (Logistics Agent)',
      timestamp: '2026-08-10 09:15',
      transportMode: 'Sea',
    },
    {
      id: 'EV-1003',
      trackingNumber: 'OGL88371920GH',
      location: 'Kotoka International Airport (ACC)',
      statusTitle: 'Customs Clearance Complete',
      details: 'Customs duties verified and cleared by GRA officer.',
      operator: 'Kofi Owusu (Clearance Officer)',
      timestamp: '2026-08-11 16:45',
      transportMode: 'Air',
    },
    {
      id: 'EV-1004',
      trackingNumber: 'OGL33410928UK',
      location: 'Accra Central Dispatch Depot',
      statusTitle: 'Out for Door Delivery',
      details: 'Dispatched to delivery van for final destination in East Legon.',
      operator: 'Kwame Addo (Courier Driver)',
      timestamp: '2026-08-11 08:20',
      transportMode: 'Road',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form
  const [trackingNumber, setTrackingNumber] = useState('');
  const [location, setLocation] = useState('');
  const [statusTitle, setStatusTitle] = useState('');
  const [details, setDetails] = useState('');
  const [transportMode, setTransportMode] = useState<'Air' | 'Sea' | 'Road'>('Air');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filteredEvents = events.filter(
    (ev) =>
      ev.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.statusTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber || !location || !statusTitle) return;

    const newEv: ScanEvent = {
      id: `EV-${Math.floor(1000 + Math.random() * 9000)}`,
      trackingNumber: trackingNumber.trim().toUpperCase(),
      location,
      statusTitle,
      details: details || 'Scan checkpoint updated by system admin.',
      operator: 'John Mensah (Admin)',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      transportMode,
    };

    setEvents([newEv, ...events]);
    setShowModal(false);
    setTrackingNumber('');
    setLocation('');
    setStatusTitle('');
    setDetails('');
    triggerToast(`New scan event published for ${newEv.trackingNumber}!`);
  };

  const handleDelete = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
    triggerToast('Scan event log deleted.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
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
            <Activity className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#063B66]">Tracking Scan Events</h1>
            <p className="text-xs text-slate-500 mt-0.5">Record live barcode scans, milestone updates, and airport/seaport checkpoints</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B63CE] hover:bg-[#0952AD] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Scan Checkpoint</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Tracking Code (e.g. OGL245678912UK) or location..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 text-xs">
            No tracking scan events matching query.
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#063B66] shrink-0 mt-1">
                  {ev.transportMode === 'Air' ? (
                    <Plane className="w-5 h-5" />
                  ) : ev.transportMode === 'Sea' ? (
                    <Ship className="w-5 h-5" />
                  ) : (
                    <Truck className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-sm text-[#063B66]">{ev.trackingNumber}</span>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#0B63CE]/10 text-[#0B63CE] text-[10px] font-bold uppercase">
                      {ev.transportMode} Cargo
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: {ev.id}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{ev.statusTitle}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{ev.details}</p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-[#0B63CE]" />
                      {ev.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {ev.timestamp}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      {ev.operator}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => handleDelete(ev.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#063B66] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Record Scan Checkpoint</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tracking Code *</label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. OGL245678912UK"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Checkpoint Location *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kotoka Int Airport Cargo Terminal"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Title *</label>
                <input
                  type="text"
                  required
                  value={statusTitle}
                  onChange={(e) => setStatusTitle(e.target.value)}
                  placeholder="e.g. Customs Clearance Approved"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Transport Mode</label>
                <select
                  value={transportMode}
                  onChange={(e: any) => setTransportMode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                >
                  <option value="Air">Air Freight</option>
                  <option value="Sea">Sea Shipping</option>
                  <option value="Road">Road Dispatch</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Additional Details</label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Enter specific notes or scan details..."
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
                  Publish Scan Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
