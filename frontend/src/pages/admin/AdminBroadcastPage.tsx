import { useEffect, useState } from 'react';
import { CheckCircle2, Mail, MessageSquare, Send, Users } from 'lucide-react';
import api from '../../services/api';

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
}

export default function AdminBroadcastPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [channel, setChannel] = useState<'email' | 'sms' | 'both'>('email');
  const [audience, setAudience] = useState<'all' | 'selected'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/customers').then((response) => setCustomers(response.data?.data || [])).catch(() => setError('Unable to load customers.'));
  }, []);

  const toggleCustomer = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setToast(null);
    if (audience === 'selected' && !selectedIds.length) {
      setError('Select at least one customer.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/messages/broadcast', {
        channel,
        customerIds: audience === 'selected' ? selectedIds : [],
        subject: channel === 'sms' ? undefined : subject,
        message,
      });
      const result = response.data?.data;
      const delivered = channel === 'both' ? `${result.email.sent} emails and ${result.sms.sent} SMS` : `${result[channel].sent} ${channel}`;
      setToast(`Broadcast complete: ${delivered} delivered.`);
      setSubject('');
      setMessage('');
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Broadcast failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {toast && <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800"><CheckCircle2 className="w-4 h-4" />{toast}</div>}
      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{error}</div>}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#063B66]/10 flex items-center justify-center text-[#063B66]"><Send className="w-6 h-6" /></div>
        <div><h1 className="text-xl font-bold text-[#063B66]">Customer Broadcasts</h1><p className="text-xs text-slate-500 mt-0.5">Send targeted email and SMS updates to your customers.</p></div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_360px] gap-6">
        <section className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Delivery channel</label>
            <div className="grid grid-cols-3 gap-2">
              {([['email', 'Email', Mail], ['sms', 'SMS', MessageSquare], ['both', 'Both', Send]] as const).map(([value, label, Icon]) => (
                <button key={value} type="button" onClick={() => setChannel(value)} className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-xs font-bold ${channel === value ? 'border-[#0B63CE] bg-blue-50 text-[#0B63CE]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}><Icon className="w-4 h-4" />{label}</button>
              ))}
            </div>
          </div>

          {channel !== 'sms' && <label className="block text-xs font-bold text-slate-700">Email subject<input required value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Important update from OBREMS" className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-3 text-xs font-normal focus:outline-none focus:border-[#0B63CE]" /></label>}
          <label className="block text-xs font-bold text-slate-700">Message<textarea required minLength={3} rows={9} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write your customer update..." className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-3 text-xs font-normal leading-relaxed focus:outline-none focus:border-[#0B63CE]" /></label>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4"><p className="text-[11px] text-slate-500">Messages are sent immediately to the selected audience.</p><button disabled={loading} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#0B63CE] px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#0952AD] disabled:opacity-60"><Send className="w-4 h-4" />{loading ? 'Sending...' : 'Send broadcast'}</button></div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4 h-fit">
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-[#063B66]" /><h2 className="text-sm font-bold text-[#063B66]">Audience</h2></div>
          <div className="space-y-2 text-xs"><label className="flex items-center gap-2 font-semibold text-slate-700"><input type="radio" checked={audience === 'all'} onChange={() => setAudience('all')} /> All customers ({customers.length})</label><label className="flex items-center gap-2 font-semibold text-slate-700"><input type="radio" checked={audience === 'selected'} onChange={() => setAudience('selected')} /> Selected customers ({selectedIds.length})</label></div>
          {audience === 'selected' && <div className="max-h-72 overflow-y-auto border-t border-slate-100 pt-3 space-y-2">{customers.map((customer) => <label key={customer._id} className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50 text-xs"><input type="checkbox" checked={selectedIds.includes(customer._id)} onChange={() => toggleCustomer(customer._id)} className="mt-0.5" /><span><strong className="block text-slate-700">{customer.name}</strong><span className="text-slate-400">{customer.email || customer.phone || customer.whatsapp || 'No contact details'}</span></span></label>)}</div>}
          <p className="border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-500">Customers without a matching email address or phone number will be skipped.</p>
        </section>
      </form>
    </div>
  );
}
