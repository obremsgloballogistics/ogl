import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Truck,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  Save,
  QrCode,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import { generateTrackingNumber, getSuffixFlag, getSuffixLabel } from '../../utils/trackingUtils';

function numberToWords(value: number): string {
  const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const whole = Math.floor(Math.abs(value));
  const decimals = Math.round((Math.abs(value) - whole) * 100);
  const underThousand = (number: number): string => {
    if (number < 20) return ones[number];
    if (number < 100) return `${tens[Math.floor(number / 10)]}${number % 10 ? `-${ones[number % 10]}` : ''}`;
    return `${ones[Math.floor(number / 100)]} hundred${number % 100 ? ` and ${underThousand(number % 100)}` : ''}`;
  };
  const words = whole === 0 ? 'zero' : whole < 1000 ? underThousand(whole) : `${underThousand(Math.floor(whole / 1000))} thousand${whole % 1000 ? ` ${underThousand(whole % 1000)}` : ''}`;
  return `${words} pounds${decimals ? ` and ${underThousand(decimals)} pence` : ''}`;
}

const STATUS_COLORS: Record<string, string> = {
  'Delivered': 'bg-white text-slate-700 border border-slate-200',
  'In Transit': 'bg-white text-slate-700 border border-slate-200',
  'Arrived in UK': 'bg-white text-slate-700 border border-slate-200',
  'Arrived in Ghana': 'bg-white text-slate-700 border border-slate-200',
  'Out for Delivery': 'bg-white text-slate-700 border border-slate-200',
  'Customs Clearance': 'bg-white text-slate-700 border border-slate-200',
  'Processing': 'bg-white text-slate-700 border border-slate-200',
  'Pending': 'bg-white text-slate-700 border border-slate-200',
};

const TABS = ['All', 'In Transit', 'Delivered', 'Pending', 'Customs Clearance'];

const ORIGIN_COUNTRIES = [
  { label: 'United Kingdom', value: 'London, UK', suffix: 'UK' },
  { label: 'China', value: 'Guangzhou, China', suffix: 'CN' },
  { label: 'Ghana', value: 'Accra, Ghana', suffix: 'GH' },
];

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [presets, setPresets] = useState<any[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [measurementType, setMeasurementType] = useState<'weight' | 'dimensions' | 'both'>('weight');

  // Preset-driven pricing state
  const [presetPricingMethod, setPresetPricingMethod] = useState('');
  const [presetRate, setPresetRate] = useState(0);
  const [presetMinCharge, setPresetMinCharge] = useState(0);
  const [presetFixedFee, setPresetFixedFee] = useState(0);
  const [presetHandlingFee, setPresetHandlingFee] = useState(0);
  const [presetInsurance, setPresetInsurance] = useState(0);
  const [presetCustoms, setPresetCustoms] = useState(0);
  const [presetTax, setPresetTax] = useState(0);
  const [presetDiscount, setPresetDiscount] = useState(0);

  // Create form state
  const [formOrigin, setFormOrigin] = useState('London, UK');
  const [formDest, setFormDest] = useState('');
  const [formCustomer, setFormCustomer] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [dimensionMode, setDimensionMode] = useState<'lbh' | 'cbm'>('lbh');
  const [formLength, setFormLength] = useState('');
  const [formBreadth, setFormBreadth] = useState('');
  const [formHeight, setFormHeight] = useState('');
  const [formCbm, setFormCbm] = useState('');
  const [formCurrency, setFormCurrency] = useState<'GBP' | 'GHS' | 'CNY' | 'USD' | 'EUR'>('GBP');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [dimensionUnit, setDimensionUnit] = useState<'cm' | 'm' | 'in'>('cm');
  const [formMethod, setFormMethod] = useState('Air Freight (UK → Ghana)');
  const [formTracking, setFormTracking] = useState(() => generateTrackingNumber('London, UK'));
  const [formStatus, setFormStatus] = useState('Pending');
  const [formSaving, setFormSaving] = useState(false);
  const [formRequestPayment, setFormRequestPayment] = useState(false);
  const [formAmountDue, setFormAmountDue] = useState('');
  const rawCbm = dimensionMode === 'cbm'
    ? Number(formCbm) || 0
    : Number(formLength) * Number(formBreadth) * Number(formHeight) * (dimensionUnit === 'm' ? 1 : dimensionUnit === 'in' ? 0.0000163871 : 0.000001);
  const calculatedCbm = rawCbm;

  const refreshTracking = useCallback(() => {
    setFormTracking(generateTrackingNumber(formOrigin));
  }, [formOrigin]);

  // Re-generate tracking number when origin changes
  const handleOriginChange = (val: string) => {
    setFormOrigin(val);
    if (!editId) {
      setFormTracking(generateTrackingNumber(val));
    }
  };

  const handleEdit = (s: any) => {
    setEditId(s._id);
    setFormOrigin(s.origin || 'London, UK');
    setFormDest(s.destination || '');
    setFormCustomer(s.customer?._id || s.customer || '');
    setFormWeight(s.weight?.toString() || '');
    setFormLength(s.dimensions?.length?.toString() || '');
    setFormBreadth(s.dimensions?.width?.toString() || '');
    setFormHeight(s.dimensions?.height?.toString() || '');
    setFormCbm(s.volumeCbm?.toString() || '');
    setDimensionMode(s.volumeCbm && !s.dimensions?.length ? 'cbm' : 'lbh');
    setFormCurrency(s.currency || 'GBP');
    setSelectedPresetId(s.shippingPresetId || '');
    setWeightUnit(s.weightUnit || 'kg');
    setDimensionUnit(s.dimensionUnit || 'cm');
    setFormMethod(s.shippingMethod || s.method || 'Air Freight (UK → Ghana)');
    setFormTracking(s.trackingNumber || '');
    setFormStatus(s.status || 'Pending');
    setFormRequestPayment(s.paymentStatus === 'unpaid' && Number(s.amountDue) > 0);
    setFormAmountDue(s.amountDue?.toString() || '');
    setShowCreate(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this shipment?')) return;
    try {
      await api.delete(`/shipments/${id}`);
      setShipments(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      alert('Failed to delete shipment');
    }
  };

  const resetForm = () => {
    setEditId(null);
    setSelectedPresetId('');
    setFormCustomer(''); setFormDest(''); setFormWeight('');
    setCustomerSearch('');
    setFormLength(''); setFormBreadth(''); setFormHeight(''); setFormCbm(''); setDimensionMode('lbh');
    setFormStatus('Pending');
    setFormTracking(generateTrackingNumber('London, UK'));
    setFormOrigin('London, UK');
    setFormRequestPayment(false);
    setFormAmountDue('');
    setMeasurementType('weight');
    // Reset preset pricing
    setPresetPricingMethod('');
    setPresetRate(0); setPresetMinCharge(0); setPresetFixedFee(0);
    setPresetHandlingFee(0); setPresetInsurance(0); setPresetCustoms(0);
    setPresetTax(0); setPresetDiscount(0);
  };

  useEffect(() => {
    api.get('/shipments')
      .then((res) => setShipments(res.data?.data || []))
      .catch(() => setShipments([]));
      
    api.get('/customers')
      .then((res) => { if (res.data?.data?.length) setCustomers(res.data.data); })
      .catch(() => {});
    api.get('/shipping-presets?active=true')
      .then((res) => setPresets(res.data?.data || []))
      .catch(() => {});
    api.get('/settings')
      .then((res) => {
        const preferences = res.data?.data?.shippingPreferences;
        if (preferences) {
          setFormCurrency(preferences.currency || 'GBP');
          setWeightUnit(preferences.weightUnit || 'kg');
          setDimensionUnit(preferences.dimensionUnit || 'cm');
        }
      })
      .catch(() => {});
  }, []);

  const applyPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = presets.find((item) => item._id === presetId);
    if (!preset) {
      // Clear preset pricing when deselected
      setPresetPricingMethod('');
      setPresetRate(0); setPresetMinCharge(0); setPresetFixedFee(0);
      setPresetHandlingFee(0); setPresetInsurance(0); setPresetCustoms(0);
      setPresetTax(0); setPresetDiscount(0);
      return;
    }
    setFormOrigin(preset.origin || formOrigin);
    setFormDest(preset.destination || '');
    setFormMethod(preset.shippingMethod || formMethod);
    setFormCurrency(preset.currency || 'GBP');
    setWeightUnit((preset.weightUnit || 'KG').toLowerCase() === 'lb' ? 'lb' : 'kg');
    setDimensionUnit((preset.dimensionUnit || 'CM').toLowerCase() as 'cm' | 'm' | 'in');
    setDimensionMode(preset.pricingMethod === 'Per CBM' ? 'cbm' : 'lbh');
    // Set measurement type based on preset pricing method
    if (preset.pricingMethod === 'Per CBM') {
      setMeasurementType('dimensions');
    } else if (preset.pricingMethod === 'Per KG') {
      setMeasurementType('weight');
    } else if (preset.pricingMethod === 'Per KG + Fixed Fee') {
      setMeasurementType('both');
    }
    // Load pricing fields from preset
    setPresetPricingMethod(preset.pricingMethod || '');
    setPresetRate(Number(preset.rate) || 0);
    setPresetMinCharge(Number(preset.minimumCharge) || 0);
    setPresetFixedFee(Number(preset.fixedDeliveryFee) || 0);
    setPresetHandlingFee(Number(preset.additionalHandlingFee) || 0);
    setPresetInsurance(Number(preset.insuranceFee) || 0);
    setPresetCustoms(Number(preset.customsFee) || 0);
    setPresetTax(Number(preset.tax) || 0);
    setPresetDiscount(Number(preset.discount) || 0);
  };

  // ─── Live pricing calculation from preset ─────────────────────────────────
  const presetPricing = useMemo(() => {
    if (!selectedPresetId || !presetPricingMethod) return null;

    const weight = Number(formWeight) || 0;
    const cbm = calculatedCbm || 0;

    let baseCharge = 0;
    if (presetPricingMethod === 'Per KG') {
      baseCharge = weight * presetRate;
    } else if (presetPricingMethod === 'Per CBM') {
      baseCharge = cbm * presetRate;
    } else if (presetPricingMethod === 'Fixed Delivery Fee') {
      baseCharge = presetFixedFee;
    } else if (presetPricingMethod === 'Per KG + Fixed Fee') {
      baseCharge = weight * presetRate + presetFixedFee;
    }

    baseCharge = Math.max(baseCharge, presetMinCharge);

    const handlingFee = presetHandlingFee;
    const insuranceFee = presetInsurance;
    const customsFee = presetCustoms;
    const subtotal = baseCharge + handlingFee + insuranceFee + customsFee;
    const taxAmount = subtotal * (presetTax / 100);
    const discountAmount = subtotal * (presetDiscount / 100);
    const total = Math.max(0, subtotal + taxAmount - discountAmount);

    return { baseCharge, handlingFee, insuranceFee, customsFee, taxAmount, discountAmount, subtotal, total };
  }, [
    selectedPresetId, presetPricingMethod, presetRate, presetFixedFee, presetMinCharge,
    presetHandlingFee, presetInsurance, presetCustoms, presetTax, presetDiscount,
    formWeight, calculatedCbm,
  ]);

  // Auto-fill amount due whenever preset pricing changes
  useEffect(() => {
    if (presetPricing && presetPricing.total > 0) {
      setFormAmountDue(presetPricing.total.toFixed(2));
      setFormRequestPayment(true);
    }
  }, [presetPricing]);

  const filtered = shipments.filter((s) => {

    let customerName = '';
    if (typeof s.customer === 'string') {
      customerName = s.customer;
    } else if (s.customer?.name) {
      customerName = s.customer.name;
    }

    const matchSearch =
      s.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.route?.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'All' || s.status === activeTab;
    return matchSearch && matchTab;
  });

  const stats = [
    { label: 'Total', value: shipments.length, icon: Package, color: 'text-slate-600 bg-white border border-slate-200' },
    { label: 'In Transit', value: shipments.filter(s => s.status === 'In Transit').length, icon: Truck, color: 'text-slate-600 bg-white border border-slate-200' },
    { label: 'Delivered', value: shipments.filter(s => s.status === 'Delivered').length, icon: CheckCircle2, color: 'text-slate-600 bg-white border border-slate-200' },
    { label: 'Pending', value: shipments.filter(s => ['Processing', 'Pending'].includes(s.status)).length, icon: Clock, color: 'text-slate-600 bg-white border border-slate-200' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Uniform Page Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#063B66]/10 flex items-center justify-center text-[#063B66]">
            <Truck className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#063B66]">Shipments</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage shipment records, status updates, and tracking events</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B63CE] hover:bg-[#0952AD] text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Shipment
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#063B66]">{s.value}</p>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tracking number, customer or route..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:bg-white transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                activeTab === tab
                  ? 'bg-[#063B66] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab}
              <span className="ml-1.5 opacity-70">
                ({tab === 'All' ? shipments.length : shipments.filter(s => s.status === tab).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Tracking Number</th>
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Route</th>
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Method</th>
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Weight</th>
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Amount Due</th>
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Last Update</th>
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 font-semibold">
                    No shipments found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const customerId = typeof s.customer === 'string' ? s.customer : s.customer?._id;
                  const matchedCustomer = customers.find((customer) => customer._id === customerId);
                  const custName = typeof s.customer === 'string'
                    ? matchedCustomer?.name || s.customer
                    : s.customer?.name || matchedCustomer?.name || 'Unknown';
                  return (
                  <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#063B66]">{s.trackingNumber}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#063B66] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          {custName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{custName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-[#0B63CE] shrink-0" />
                        {s.route || `${s.origin} → ${s.destination}`}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{s.method || 'Air Freight'}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{s.weight || '-'}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {Number(s.amountDue) > 0 ? (
                        <div>
                          <div className="font-bold">£{Number(s.amountDue).toFixed(2)}</div>
                          <div className="text-[10px] text-slate-400 capitalize">{numberToWords(Number(s.amountDue))}</div>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[s.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {s.updated || (s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : '-')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/qr-scanner?tracking=${s.trackingNumber}`}
                          className="p-1.5 text-slate-400 hover:text-[#0B63CE] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Generate QR Label & Send SMS"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/track?number=${s.trackingNumber}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-[#0B63CE] hover:bg-blue-50 rounded-lg transition-colors" title="View Tracking">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button 
                          onClick={() => handleEdit(s)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(s._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
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

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing <strong className="text-slate-700">{filtered.length}</strong> of <strong className="text-slate-700">{shipments.length}</strong> shipments</span>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-lg bg-[#063B66] text-white font-bold">1</span>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Shipment Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#063B66] uppercase tracking-wider">
                {editId ? 'Edit Shipment' : 'Create New Shipment'}
              </h3>
              <button onClick={() => { setShowCreate(false); resetForm(); }} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">

              {/* Shipping preset */}
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                <label className="text-[11px] font-bold text-[#063B66] uppercase tracking-wide">Shipping Preset</label>
                <select value={selectedPresetId} onChange={(e) => applyPreset(e.target.value)} className="w-full mt-1.5 px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800">
                  <option value="">Select a shipping preset...</option>
                  {presets.map((preset) => <option key={preset._id} value={preset._id}>{preset.name} · {preset.currency} · {preset.pricingMethod}</option>)}
                </select>

                {/* Live pricing breakdown */}
                {presetPricing && (
                  <div className="mt-3 rounded-lg border border-blue-200 bg-white overflow-hidden">
                    <div className="px-3 py-2 bg-[#063B66] flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Auto-Calculated Cost Breakdown</span>
                      <span className="text-[10px] text-sky-200 font-semibold">{presetPricingMethod}</span>
                    </div>
                    <div className="divide-y divide-slate-100 text-[11px]">
                      <div className="flex justify-between px-3 py-1.5">
                        <span className="text-slate-500">Base charge</span>
                        <span className="font-semibold text-slate-700">{presetPricing.baseCharge.toFixed(2)}</span>
                      </div>
                      {presetPricing.handlingFee > 0 && (
                        <div className="flex justify-between px-3 py-1.5">
                          <span className="text-slate-500">Handling fee</span>
                          <span className="font-semibold text-slate-700">+{presetPricing.handlingFee.toFixed(2)}</span>
                        </div>
                      )}
                      {presetPricing.insuranceFee > 0 && (
                        <div className="flex justify-between px-3 py-1.5">
                          <span className="text-slate-500">Insurance</span>
                          <span className="font-semibold text-slate-700">+{presetPricing.insuranceFee.toFixed(2)}</span>
                        </div>
                      )}
                      {presetPricing.customsFee > 0 && (
                        <div className="flex justify-between px-3 py-1.5">
                          <span className="text-slate-500">Customs fee</span>
                          <span className="font-semibold text-slate-700">+{presetPricing.customsFee.toFixed(2)}</span>
                        </div>
                      )}
                      {presetPricing.taxAmount > 0 && (
                        <div className="flex justify-between px-3 py-1.5">
                          <span className="text-slate-500">Tax ({presetTax}%)</span>
                          <span className="font-semibold text-slate-700">+{presetPricing.taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {presetPricing.discountAmount > 0 && (
                        <div className="flex justify-between px-3 py-1.5">
                          <span className="text-slate-500">Discount ({presetDiscount}%)</span>
                          <span className="font-semibold text-emerald-600">−{presetPricing.discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between px-3 py-2 bg-[#063B66]/5">
                        <span className="font-bold text-[#063B66] uppercase tracking-wide">Total Due</span>
                        <span className="font-extrabold text-[#063B66] text-sm">{formCurrency === 'GBP' ? '£' : formCurrency === 'GHS' ? '₵' : formCurrency === 'USD' ? '$' : formCurrency === 'CNY' ? '¥' : '€'}{presetPricing.total.toFixed(2)}</span>
                      </div>
                    </div>
                    {Number(formWeight) === 0 && presetPricingMethod !== 'Fixed Delivery Fee' && (
                      <p className="px-3 py-2 text-[10px] text-amber-600 font-semibold bg-amber-50 border-t border-amber-100">
                        ⚠ Enter weight{presetPricingMethod === 'Per CBM' ? '/dimensions' : ''} above to see the full cost calculation.
                      </p>
                    )}
                  </div>
                )}
              </div>


              {/* Tracking Number Preview */}
              <div className="p-3 bg-[#063B66]/5 border border-[#063B66]/20 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-[#063B66] uppercase tracking-wider mb-0.5">Auto-Generated Tracking No.</p>
                  <p className="text-base font-extrabold text-[#063B66] font-mono tracking-widest">
                    {getSuffixFlag(formTracking)} {formTracking}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Origin: {getSuffixLabel(formTracking)}</p>
                </div>
                <button
                  type="button"
                  onClick={refreshTracking}
                  title="Regenerate tracking number"
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-[#0B63CE] hover:border-[#0B63CE] transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Origin Country */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Origin Country *</label>
                <select
                  value={formOrigin}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0B63CE] transition-colors"
                >
                  {ORIGIN_COUNTRIES.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Override tracking number */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Tracking Number (editable)</label>
                <input
                  type="text"
                  value={formTracking}
                  onChange={(e) => setFormTracking(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#063B66] font-mono placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] transition-colors"
                />
              </div>

              {/* Customer Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Customer *</label>
                  {customers.length === 0 && (
                    <span className="text-[10px] text-amber-500 font-semibold">No customers found. Add one first.</span>
                  )}
                </div>
                <input
                  type="search"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search customer by name or email..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE]"
                />
                <select
                  value={formCustomer}
                  onChange={(e) => setFormCustomer(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0B63CE] transition-colors"
                >
                  <option value="" disabled>Select a customer...</option>
                  {customers.filter((c) => `${c.name || ''} ${c.email || ''}`.toLowerCase().includes(customerSearch.toLowerCase())).map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Destination *</label>
                <input
                  type="text"
                  value={formDest}
                  onChange={(e) => setFormDest(e.target.value)}
                  placeholder="e.g. Accra, Ghana"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] transition-colors"
                />
              </div>

              {/* Measurement Type Selector + Weight / Dimensions */}
              <div className="space-y-3 rounded-lg border border-slate-200 overflow-hidden">
                {/* Toggle tabs */}
                <div className="grid grid-cols-3 text-center text-[11px] font-bold border-b border-slate-200">
                  {([
                    { key: 'weight', label: '⚖ Weight Only' },
                    { key: 'dimensions', label: '📐 Dimensions Only' },
                    { key: 'both', label: '⚖+📐 Both' },
                  ] as const).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setMeasurementType(key);
                        if (key === 'dimensions') { setFormWeight(''); }
                        if (key === 'weight') { setFormLength(''); setFormBreadth(''); setFormHeight(''); setFormCbm(''); }
                      }}
                      className={`py-2.5 transition-colors ${
                        measurementType === key
                          ? 'bg-[#063B66] text-white'
                          : 'bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="px-4 pb-4 space-y-3">
                  {/* Weight input */}
                  {(measurementType === 'weight' || measurementType === 'both') && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Weight</label>
                        <div className="flex rounded-md overflow-hidden border border-slate-200 text-[10px] font-bold">
                          {(['kg', 'lb'] as const).map(u => (
                            <button key={u} type="button" onClick={() => setWeightUnit(u)}
                              className={`px-2.5 py-1 transition-colors ${weightUnit === u ? 'bg-[#0B63CE] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                              {u}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="number" min="0" step="0.01"
                        value={formWeight}
                        onChange={(e) => setFormWeight(e.target.value)}
                        placeholder={`e.g. 12.5 ${weightUnit}`}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] transition-colors"
                      />
                    </div>
                  )}

                  {/* Dimensions input */}
                  {(measurementType === 'dimensions' || measurementType === 'both') && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Cargo Dimensions</label>
                        <div className="flex items-center gap-2">
                          <div className="flex rounded-md overflow-hidden border border-slate-200 text-[10px] font-bold">
                            {(['cm', 'm', 'in'] as const).map(u => (
                              <button key={u} type="button" onClick={() => setDimensionUnit(u)}
                                className={`px-2.5 py-1 transition-colors ${dimensionUnit === u ? 'bg-[#0B63CE] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                                {u}
                              </button>
                            ))}
                          </div>
                          <div className="flex rounded-md overflow-hidden border border-slate-200 text-[10px] font-bold">
                            {(['lbh', 'cbm'] as const).map(m => (
                              <button key={m} type="button" onClick={() => setDimensionMode(m)}
                                className={`px-2.5 py-1 transition-colors ${dimensionMode === m ? 'bg-[#0B63CE] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                                {m.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {dimensionMode === 'lbh' ? (
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            ['L', formLength, setFormLength],
                            ['W', formBreadth, setFormBreadth],
                            ['H', formHeight, setFormHeight],
                          ] as const).map(([lbl, val, setter]) => (
                            <div key={lbl}>
                              <label className="text-[10px] font-semibold text-slate-500">{lbl} ({dimensionUnit})</label>
                              <input type="number" min="0" step="0.01" value={val}
                                onChange={(e) => setter(e.target.value)}
                                className="w-full mt-1 px-2.5 py-2 bg-white border border-slate-200 rounded-md text-xs" placeholder="0" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500">Cubic Metres (CBM)</label>
                          <input type="number" min="0" step="0.001" value={formCbm}
                            onChange={(e) => setFormCbm(e.target.value)}
                            className="w-full mt-1 px-2.5 py-2 bg-white border border-slate-200 rounded-md text-xs" placeholder="e.g. 1.250" />
                        </div>
                      )}

                      {dimensionMode === 'lbh' && Number(formLength) > 0 && Number(formBreadth) > 0 && Number(formHeight) > 0 && (
                        <p className="text-[11px] font-bold text-[#063B66]">Calculated volume: {calculatedCbm.toFixed(3)} CBM</p>
                      )}
                    </div>
                  )}
                </div>
              </div>


              {/* Currency Selector — prominent chip picker */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Billing Currency</label>
                <div className="grid grid-cols-5 gap-2">
                  {([
                    { code: 'GBP', symbol: '£', name: 'British Pound' },
                    { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
                    { code: 'USD', symbol: '$', name: 'US Dollar' },
                    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
                    { code: 'EUR', symbol: '€', name: 'Euro' },
                  ] as const).map(({ code, symbol, name }) => (
                    <button
                      key={code}
                      type="button"
                      title={name}
                      onClick={() => setFormCurrency(code)}
                      className={`flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-lg border-2 transition-all duration-150 ${
                        formCurrency === code
                          ? 'border-[#0B63CE] bg-[#0B63CE] text-white shadow-md scale-[1.03]'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-[#0B63CE]/40 hover:bg-blue-50'
                      }`}
                    >
                      <span className="text-base font-extrabold leading-none">{symbol}</span>
                      <span className="text-[10px] font-bold leading-none">{code}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400">
                  Selected: <span className="font-semibold text-slate-600">{formCurrency === 'GBP' ? '£ GBP — British Pound' : formCurrency === 'GHS' ? '₵ GHS — Ghanaian Cedi' : formCurrency === 'USD' ? '$ USD — US Dollar' : formCurrency === 'CNY' ? '¥ CNY — Chinese Yuan' : '€ EUR — Euro'}</span>
                </p>
              </div>


              {/* Shipping Method */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Shipping Method</label>
                <select
                  value={formMethod}
                  onChange={(e) => setFormMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0B63CE] transition-colors"
                >
                  <option>Air Freight (UK → Ghana)</option>
                  <option>Sea &amp; Air Freight (China → Ghana)</option>
                  <option>Sea Freight (China → Ghana)</option>
                  <option>Air Freight (Ghana → UK)</option>
                </select>
              </div>

              {/* Payment Request Toggle */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Request Payment from Customer</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Show payment gateway on their tracking page</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formRequestPayment} onChange={(e) => setFormRequestPayment(e.target.checked)} />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0B63CE]"></div>
                  </label>
                </div>
                
                {formRequestPayment && (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5 animate-in slide-in-from-top-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Amount Due *</label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={formAmountDue}
                      onChange={(e) => setFormAmountDue(e.target.value)}
                      placeholder="e.g. 150.00"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0B63CE]"
                    />
                  </div>
                )}
              </div>
              {/* Status (Edit Only) */}
              {editId && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0B63CE] transition-colors"
                  >
                    {Object.keys(STATUS_COLORS).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => { setShowCreate(false); resetForm(); }} className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                disabled={formSaving}
                onClick={async () => {
                  setFormSaving(true);
                  try {
                    const payload = {
                      trackingNumber: formTracking,
                      shippingPresetId: selectedPresetId || undefined,
                      origin: formOrigin,
                      destination: formDest,
                      customer: formCustomer,
                      weight: parseFloat(formWeight) || 0,
                      shippingMethod: formMethod,
                      status: formStatus,
                      paymentStatus: formRequestPayment ? 'unpaid' : 'paid',
                      amountDue: formRequestPayment ? (parseFloat(formAmountDue) || 0) : 0,
                      dimensions: {
                        length: dimensionMode === 'lbh' ? (parseFloat(formLength) || 0) : 0,
                        width: dimensionMode === 'lbh' ? (parseFloat(formBreadth) || 0) : 0,
                        height: dimensionMode === 'lbh' ? (parseFloat(formHeight) || 0) : 0,
                      },
                      volumeCbm: dimensionMode === 'cbm'
                        ? (parseFloat(formCbm) || 0)
                        : (parseFloat(formLength) || 0) * (parseFloat(formBreadth) || 0) * (parseFloat(formHeight) || 0) / 1000000,
                      currency: formCurrency,
                      weightUnit,
                      dimensionUnit,
                    };
                    
                    if (editId) {
                      const res = await api.put(`/shipments/${editId}`, payload);
                      if (res.data?.data) {
                        setShipments(prev => prev.map(s => s._id === editId ? res.data.data : s));
                      }
                    } else {
                      const res = await api.post('/shipments', payload);
                      if (res.data?.data) {
                        setShipments(prev => [res.data.data, ...prev]);
                      }
                    }
                    setShowCreate(false);
                    resetForm();
                  } catch {
                    // keep modal open on error
                    alert('Failed to save shipment');
                  } finally {
                    setFormSaving(false);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0B63CE] hover:bg-[#0952AD] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {formSaving ? 'Saving…' : (editId ? 'Save Changes' : 'Create Shipment')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
