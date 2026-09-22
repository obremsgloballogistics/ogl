import { useEffect, useState } from 'react';
import { Copy, Edit2, Eye, Plus, Power, Trash2, X } from 'lucide-react';
import api from '../../services/api';

type Preset = {
  _id: string;
  name: string;
  origin: string;
  destination: string;
  shippingMethod: string;
  currency: string;
  measurementType: string;
  weightUnit: string;
  dimensionUnit: string;
  volumeUnit: string;
  pricingMethod: string;
  rate: number;
  minimumCharge: number;
  fixedDeliveryFee: number;
  additionalHandlingFee: number;
  insuranceFee: number;
  customsFee: number;
  tax: number;
  discount: number;
  isActive: boolean;
  updatedAt?: string;
};

const blank: Partial<Preset> = {
  name: '', origin: '', destination: '', shippingMethod: 'Air', currency: 'GBP', measurementType: 'Weight',
  weightUnit: 'KG', dimensionUnit: 'CM', volumeUnit: 'CBM', pricingMethod: 'Per KG', rate: 0,
  minimumCharge: 0, fixedDeliveryFee: 0, additionalHandlingFee: 0, insuranceFee: 0, customsFee: 0, tax: 0, discount: 0, isActive: true,
};

const money = (value: number, currency: string) => `${currency === 'GBP' ? '£' : currency === 'GHS' ? '₵' : currency === 'USD' ? '$' : currency === 'CNY' ? '¥' : '€'}${Number(value || 0).toFixed(2)}`;

export default function AdminShippingPresetsPage() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Preset> | null>(null);
  const [details, setDetails] = useState<Preset | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/shipping-presets'); setPresets(res.data.data || []); } catch { setError('Failed to load shipping presets.'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true); setError('');
    try {
      const res = editing._id ? await api.put(`/shipping-presets/${editing._id}`, editing) : await api.post('/shipping-presets', editing);
      setPresets((current) => editing._id ? current.map((preset) => preset._id === editing._id ? res.data.data : preset) : [res.data.data, ...current]);
      setEditing(null);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to save preset.'); } finally { setSaving(false); }
  };
  const remove = async (preset: Preset) => {
    if (!window.confirm(`Delete ${preset.name}? Existing shipments keep their saved snapshot.`)) return;
    await api.delete(`/shipping-presets/${preset._id}`); setPresets((current) => current.filter((item) => item._id !== preset._id));
  };
  const toggle = async (preset: Preset) => {
    const res = await api.put(`/shipping-presets/${preset._id}`, { ...preset, isActive: !preset.isActive });
    setPresets((current) => current.map((item) => item._id === preset._id ? res.data.data : item));
  };
  const duplicate = (preset: Preset) => setEditing({ ...preset, _id: undefined, name: `${preset.name} Copy`, isActive: false });
  const set = (key: keyof Preset, value: string | number | boolean) => setEditing((current) => ({ ...current, [key]: value }));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
        <div><h1 className="text-xl font-bold text-[#063B66]">Shipping Presets</h1><p className="text-xs text-slate-500 mt-1">Manage reusable routes, pricing methods, units, and fees.</p></div>
        <button onClick={() => setEditing({ ...blank })} className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B63CE] text-white rounded-lg text-xs font-bold"><Plus className="w-4 h-4" /> New Preset</button>
      </div>
      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-4 py-3 text-xs font-semibold">{error}</div>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 text-slate-500 uppercase"><tr>{['Preset Name', 'Route', 'Method', 'Currency', 'Unit', 'Pricing', 'Rate', 'Status', 'Updated', 'Actions'].map((label) => <th key={label} className="px-4 py-3 font-bold whitespace-nowrap">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan={10} className="p-10 text-center text-slate-400">Loading presets...</td></tr> : presets.map((preset) => (
              <tr key={preset._id} className="hover:bg-slate-50">
                <td className="px-4 py-4 font-bold text-[#063B66]">{preset.name}</td><td className="px-4 py-4">{preset.origin} → {preset.destination}</td><td className="px-4 py-4">{preset.shippingMethod}</td><td className="px-4 py-4">{preset.currency}</td><td className="px-4 py-4">{preset.pricingMethod === 'Per CBM' ? 'CBM' : preset.weightUnit || 'Fixed'}</td><td className="px-4 py-4">{preset.pricingMethod}</td><td className="px-4 py-4 font-bold">{money(preset.pricingMethod === 'Fixed Delivery Fee' ? preset.fixedDeliveryFee : preset.rate, preset.currency)}</td>
                <td className="px-4 py-4"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${preset.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{preset.isActive ? 'Active' : 'Inactive'}</span></td><td className="px-4 py-4 text-slate-400">{preset.updatedAt ? new Date(preset.updatedAt).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-4"><div className="flex items-center gap-1"><button title="View details" onClick={() => setDetails(preset)} className="p-1.5 text-slate-400 hover:text-[#0B63CE]"><Eye className="w-4 h-4" /></button><button title="Edit" onClick={() => setEditing({ ...preset })} className="p-1.5 text-slate-400 hover:text-amber-600"><Edit2 className="w-4 h-4" /></button><button title="Duplicate" onClick={() => duplicate(preset)} className="p-1.5 text-slate-400 hover:text-[#0B63CE]"><Copy className="w-4 h-4" /></button><button title="Activate/deactivate" onClick={() => toggle(preset)} className="p-1.5 text-slate-400 hover:text-emerald-600"><Power className="w-4 h-4" /></button><button title="Delete" onClick={() => remove(preset)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"><div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"><div className="px-6 py-4 bg-[#063B66] text-white flex justify-between"><h2 className="font-bold">{editing._id ? 'Edit Shipping Preset' : 'New Shipping Preset'}</h2><button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button></div><div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {([['name', 'Preset Name'], ['origin', 'Origin'], ['destination', 'Destination']] as const).map(([key, label]) => <label key={key} className="font-bold text-slate-600">{label}<input value={(editing[key] as string) || ''} onChange={(e) => set(key, e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg font-normal" /></label>)}
        <label className="font-bold text-slate-600">Shipping Method<select value={editing.shippingMethod} onChange={(e) => set('shippingMethod', e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg font-normal">{['Air', 'Sea', 'Local Delivery', 'Other'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="font-bold text-slate-600">Currency<select value={editing.currency} onChange={(e) => set('currency', e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg font-normal">{['GBP', 'USD', 'GHS', 'CNY', 'EUR'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="font-bold text-slate-600">Measurement Type<select value={editing.measurementType} onChange={(e) => set('measurementType', e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg font-normal">{['Weight', 'Volume', 'Fixed'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="font-bold text-slate-600">Pricing Method<select value={editing.pricingMethod} onChange={(e) => set('pricingMethod', e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg font-normal">{['Per KG', 'Per CBM', 'Fixed Delivery Fee', 'Per Shipment'].map((item) => <option key={item}>{item}</option>)}</select></label>
        {editing.pricingMethod === 'Per KG' && <label className="font-bold text-slate-600">Weight Unit<select value={editing.weightUnit} onChange={(e) => set('weightUnit', e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg font-normal">{['KG', 'LB', 'G'].map((item) => <option key={item}>{item}</option>)}</select></label>}
        {editing.pricingMethod === 'Per CBM' && <label className="font-bold text-slate-600">Volume Unit<select value={editing.volumeUnit} onChange={(e) => set('volumeUnit', e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg font-normal"><option>CBM</option></select></label>}
        <label className="font-bold text-slate-600">Rate<input type="number" min="0" step="0.01" value={editing.rate || 0} onChange={(e) => set('rate', Number(e.target.value))} className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg font-normal" /></label>
        {editing.pricingMethod === 'Fixed Delivery Fee' && <label className="font-bold text-slate-600">Fixed Delivery Fee<input type="number" min="0" step="0.01" value={editing.fixedDeliveryFee || 0} onChange={(e) => set('fixedDeliveryFee', Number(e.target.value))} className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg font-normal" /></label>}
        {(['minimumCharge', 'additionalHandlingFee', 'insuranceFee', 'customsFee', 'tax', 'discount'] as const).map((key) => <label key={key} className="font-bold text-slate-600">{key.replace(/([A-Z])/g, ' $1')}<input type="number" min="0" step="0.01" value={editing[key] || 0} onChange={(e) => set(key, Number(e.target.value))} className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg font-normal" /></label>)}
        <label className="flex items-center gap-2 font-bold text-slate-600"><input type="checkbox" checked={editing.isActive !== false} onChange={(e) => set('isActive', e.target.checked)} /> Active</label>
      </div><div className="px-6 py-4 border-t flex justify-end gap-3"><button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg bg-slate-100 text-xs font-semibold">Cancel</button><button onClick={save} disabled={saving} className="px-5 py-2 rounded-lg bg-[#0B63CE] text-white text-xs font-bold">{saving ? 'Saving...' : 'Save Preset'}</button></div></div></div>}
      {details && <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"><div className="bg-white rounded-xl w-full max-w-md p-6"><div className="flex justify-between"><h2 className="font-bold text-[#063B66]">{details.name}</h2><button onClick={() => setDetails(null)}><X className="w-5 h-5" /></button></div><div className="mt-4 grid grid-cols-2 gap-3 text-xs">{Object.entries(details).filter(([key]) => !['_id', 'createdAt', 'updatedAt'].includes(key)).map(([key, value]) => <div key={key}><span className="block text-slate-400 capitalize">{key}</span><strong className="text-slate-700 break-words">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</strong></div>)}</div></div></div>}
    </div>
  );
}
