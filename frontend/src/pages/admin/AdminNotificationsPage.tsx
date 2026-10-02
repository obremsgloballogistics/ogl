import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, CheckCircle2, Info, Plus, Send, Trash2, X } from 'lucide-react';
import api from '../../services/api';

type AlertSeverity = 'Info' | 'Warning' | 'Urgent';

interface OperationsAlert {
  _id: string;
  title: string;
  message: string;
  type: AlertSeverity;
  createdAt: string;
}

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  Info: 'bg-blue-50 text-blue-800 border-blue-200',
  Warning: 'bg-amber-50 text-amber-800 border-amber-200',
  Urgent: 'bg-rose-50 text-rose-800 border-rose-200',
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AdminNotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<OperationsAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AlertSeverity>('Info');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<{ data: OperationsAlert[] }>('/notifications');
      setNotifications(response.data.data);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Unable to load saved operations alerts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications, reloadKey]);

  const handleCreateAlert = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setSaving(true);
    try {
      const response = await api.post<{ data: OperationsAlert }>('/notifications', {
        title: title.trim(),
        message: message.trim(),
        type,
      });
      setNotifications((current) => [response.data.data, ...current]);
      setShowModal(false);
      setTitle('');
      setMessage('');
      setType('Info');
      setSuccessMessage('Operations alert saved.');
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Unable to save the operations alert.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this saved operations alert?')) return;
    setError('');
    setSuccessMessage('');
    setDeletingId(id);
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((current) => current.filter((notification) => notification._id !== id));
      setSuccessMessage('Operations alert deleted.');
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Unable to delete the operations alert.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {successMessage && (
        <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">
          <span>{error}</span>
          {!showModal && (
            <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="shrink-0 underline">
              Retry
            </button>
          )}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#063B66]/10 flex items-center justify-center text-[#063B66]">
            <Bell className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#063B66]">Operations Alerts</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Saved admin alerts only. These are not sent to customers.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate('../broadcasts')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#063B66] hover:bg-slate-50"
          >
            <Send className="w-4 h-4" />
            Customer broadcasts
          </button>
          <button
            type="button"
            onClick={() => {
              setError('');
              setSuccessMessage('');
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B63CE] hover:bg-[#0952AD] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Operations Alert</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="rounded-xl border border-slate-200 bg-white py-10 text-center text-sm text-slate-500">Loading saved alerts…</p>
        ) : notifications.length ? notifications.map((notification) => {
          const knownSeverity = ['Info', 'Warning', 'Urgent'].includes(notification.type);
          const severity = knownSeverity ? notification.type : null;
          const SeverityIcon = severity === 'Urgent' || severity === 'Warning' ? AlertTriangle : Info;
          return (
            <div key={notification._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  {severity ? (
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${SEVERITY_STYLES[severity]}`}>
                      <SeverityIcon className="h-3 w-3" />
                      {severity}
                    </span>
                  ) : (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                      Unclassified
                    </span>
                  )}
                  <span className="text-xs text-slate-400">{formatDate(notification.createdAt)}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{notification.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{notification.message}</p>
              </div>
              <button
                type="button"
                disabled={deletingId === notification._id}
                onClick={() => void handleDelete(notification._id)}
                aria-label={`Delete alert: ${notification.title}`}
                className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        }) : !error && (
          <p className="rounded-xl border border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
            No saved operations alerts.
          </p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#063B66] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Save Operations Alert</h3>
                <p className="mt-1 text-[11px] text-slate-200">This does not send a customer notification.</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} aria-label="Close" className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="p-6 space-y-4 text-xs">
              <div>
                <label htmlFor="alert-title" className="block font-bold text-slate-700 mb-1">Alert Title *</label>
                <input
                  id="alert-title"
                  type="text"
                  required
                  maxLength={160}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Operations alert title"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE]"
                />
              </div>

              <div>
                <label htmlFor="alert-severity" className="block font-bold text-slate-700 mb-1">Severity</label>
                <select
                  id="alert-severity"
                  value={type}
                  onChange={(event) => setType(event.target.value as AlertSeverity)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE]"
                >
                  <option value="Info">Info</option>
                  <option value="Warning">Warning</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label htmlFor="alert-message" className="block font-bold text-slate-700 mb-1">Message *</label>
                <textarea
                  id="alert-message"
                  rows={4}
                  required
                  maxLength={4000}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Describe the operations alert..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#0B63CE] text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
