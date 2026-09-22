import { useState } from 'react';
import { Bell, Plus, Trash2, CheckCircle2, X, AlertTriangle, Info } from 'lucide-react';

interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'Info' | 'Warning' | 'Urgent';
  targetAudience: string;
  date: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'NOTIF-1',
      title: 'London Heathrow Terminal 4 Holiday Operational Hours',
      message: 'UK warehouse drop-offs will close at 3:00 PM GMT on Bank Holiday Monday.',
      type: 'Info',
      targetAudience: 'All Customers',
      date: '2026-08-11 10:00',
    },
    {
      id: 'NOTIF-2',
      title: 'Customs Tax Exemption Certificate Update',
      message: 'Importers with commercial tax exemption certificates must upload Form C2 prior to container clearance at Tema Port.',
      type: 'Urgent',
      targetAudience: 'Ghana Importers',
      date: '2026-08-10 14:30',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'Info' | 'Warning' | 'Urgent'>('Info');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreateNotif = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    const newNotif: SystemNotification = {
      id: `NOTIF-${Date.now()}`,
      title,
      message,
      type,
      targetAudience: 'All Users',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setNotifications([newNotif, ...notifications]);
    setShowModal(false);
    setTitle('');
    setMessage('');
    triggerToast('Broadcast alert sent successfully!');
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    triggerToast('Notification deleted.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#063B66] text-white px-5 py-3 rounded-lg shadow-xl border border-white/20 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#063B66]/10 flex items-center justify-center text-[#063B66]">
            <Bell className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#063B66]">System Notifications & Broadcast Alerts</h1>
            <p className="text-xs text-slate-500 mt-0.5">Send real-time logistics announcements, schedule updates, and system maintenance alerts</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B63CE] hover:bg-[#0952AD] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Broadcast Alert</span>
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((notif) => (
          <div key={notif.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  notif.type === 'Urgent' ? 'bg-rose-100 text-rose-800' : 'bg-[#0B63CE]/10 text-[#0B63CE]'
                }`}>
                  {notif.type}
                </span>
                <span className="text-xs text-slate-400 font-mono">{notif.date}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{notif.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
            </div>

            <button onClick={() => handleDelete(notif.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#063B66] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Send Broadcast Alert</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotif} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Alert Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Severity Type</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE]"
                >
                  <option value="Info">General Info</option>
                  <option value="Warning">Warning</option>
                  <option value="Urgent">Urgent Notice</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message Content *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type notification broadcast body..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0B63CE] text-white font-bold shadow-sm"
                >
                  Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
