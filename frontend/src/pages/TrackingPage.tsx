import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle, Calendar, Check, CheckCircle2, Clock3, Copy, FileDown,
  MapPin, Package, Plane, RefreshCw, Search, ShieldCheck, Truck,
  Lock, ChevronDown, CreditCard, Landmark, Smartphone, Send, Upload, X,
} from 'lucide-react';
import api from '../services/api';
import { useSiteSettings } from '../hooks/useSiteSettings';

const STATUS_STEPS = [
  { key: 'created', label: 'Confirmed', icon: CheckCircle2, matches: ['created', 'pending'] },
  { key: 'picked-up', label: 'Picked Up', icon: Package, matches: ['picked up', 'received'] },
  { key: 'processing', label: 'Processing', icon: Clock3, matches: ['processing', 'customs'] },
  { key: 'in-transit', label: 'In Transit', icon: Plane, matches: ['transit', 'departed', 'arrived'] },
  { key: 'out-for-delivery', label: 'Out for Delivery', icon: Truck, matches: ['out for delivery'] },
  { key: 'delivered', label: 'Delivered', icon: Check, matches: ['delivered'] },
];

const formatDate = (value: any, fallback = 'Not available') => {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
};

const formatDateTime = (value: any) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not available' : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

const formatCurrency = (amount: any, currency = 'GBP') => {
  const val = Number(amount) || 0;
  const symbols: Record<string, string> = { GBP: '£', USD: '$', EUR: '€', GHS: 'GH₵ ', CNY: '¥' };
  return `${symbols[currency] ?? currency}${val.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const customerStatus = (status = '') => {
  const value = status.toLowerCase();
  if (value.includes('delivered')) return { title: 'Delivered', message: 'Your shipment has been successfully delivered.' };
  if (value.includes('delay')) return { title: 'Delivery Delayed', message: 'Your shipment has been delayed due to an operational issue.' };
  if (value.includes('out for delivery')) return { title: 'Out for Delivery', message: 'Your package is with a delivery agent and is expected to arrive today.' };
  if (value.includes('custom')) return { title: 'Customs Processing', message: 'Your shipment is being reviewed by customs before the next stage.' };
  if (value.includes('arrived')) return { title: 'Arrived at Facility', message: 'Your shipment has arrived at the latest known facility and is being processed.' };
  if (value.includes('pending')) return { title: 'Confirmed', message: 'Your shipment has been registered and is awaiting its next handling step.' };
  return { title: 'In Transit', message: 'Your shipment is currently on its way to the destination.' };
};

const eventStatus = (status = '') => {
  const value = status.toLowerCase();
  if (value.includes('deliver')) return 'Delivered';
  if (value.includes('out for')) return 'Out for delivery';
  if (value.includes('custom')) return 'Customs processing';
  if (value.includes('transit') || value.includes('depart')) return 'Shipment in transit';
  if (value.includes('arriv')) return 'Arrived at facility';
  if (value.includes('pick') || value.includes('receiv')) return 'Shipment picked up';
  if (value.includes('process')) return 'Shipment processing';
  return 'Shipment confirmed';
};

const normalizePhone = (p: string) => p.replace(/\D/g, '');

export default function TrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings } = useSiteSettings();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get('code') || '');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Verification state
  const [enteredName, setEnteredName] = useState('');
  const [enteredPhone, setEnteredPhone] = useState('');
  const [rawData, setRawData] = useState<any>(null); // fetched but not yet verified
  const [verified, setVerified] = useState(false);
  const [verifiedBanner, setVerifiedBanner] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Payment UI state
  const [openPaymentMethod, setOpenPaymentMethod] = useState<string | null>(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyMethod, setNotifyMethod] = useState('Bank Transfer');
  const [notifyRef, setNotifyRef] = useState('');
  const [notifyAmount, setNotifyAmount] = useState('');
  const [notifyFile, setNotifyFile] = useState<File | null>(null);
  const [notifyFilePreview, setNotifyFilePreview] = useState('');
  const [notifySubmitting, setNotifySubmitting] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [notifyError, setNotifyError] = useState('');

  // Card payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardSubmitting, setCardSubmitting] = useState(false);
  const [cardSuccess, setCardSuccess] = useState(false);

  const fetchTracking = async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) { setError('Enter a tracking number to continue.'); setTrackingData(null); setRawData(null); setVerified(false); return; }
    try {
      setLoading(true); setError(''); setVerified(false); setVerifyError(''); setRawData(null); setTrackingData(null);
      const response = await api.get(`/tracking/${encodeURIComponent(cleanCode)}`);
      const data = response.data.data;
      setRawData(data);
      setTrackingNumber(cleanCode);
      setSearchParams({ code: cleanCode });
    } catch (err: any) {
      setTrackingData(null); setRawData(null);
      setError(err.response?.status === 404 ? "We couldn't find a shipment associated with this tracking number." : 'We could not load this shipment right now. Please try again.');
    } finally { setLoading(false); }
  };

  useEffect(() => { const code = searchParams.get('code'); if (code) fetchTracking(code); }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawData?.trackingNumber || !enteredName.trim() || !enteredPhone.trim()) return;
    setVerifying(true);
    setVerifyError('');
    api.get(`/tracking/${encodeURIComponent(rawData.trackingNumber)}?name=${encodeURIComponent(enteredName.trim())}&phone=${encodeURIComponent(normalizePhone(enteredPhone))}`)
      .then((response) => {
        setVerified(true);
        setTrackingData(response.data.data);
        setVerifiedBanner(true);
        setTimeout(() => setVerifiedBanner(false), 3500);
      })
      .catch((err) => setVerifyError(err.response?.data?.message || 'The name or phone number does not match our records.'))
      .finally(() => setVerifying(false));
  };

  const shipment = trackingData?.shipment || null;
  const events = useMemo(() => [...(trackingData?.events || [])].sort((a, b) => new Date(b.eventDate || b.timestamp || b.createdAt || 0).getTime() - new Date(a.eventDate || a.timestamp || a.createdAt || 0).getTime()), [trackingData]);
  const current = customerStatus(shipment?.status);
  const currentLocation = shipment?.currentLocation || events[0]?.location;
  const lastUpdated = shipment?.updatedAt || events[0]?.eventDate || events[0]?.timestamp;
  const currentStep = Math.max(0, STATUS_STEPS.findIndex((step) => step.matches.some((match) => (shipment?.status || '').toLowerCase().includes(match))));
  const customerName = typeof shipment?.customer === 'string' ? shipment.customer : shipment?.customer?.name;
  const optionalDetails = [['Container number', shipment?.containerNumber], ['Air waybill number', shipment?.airWaybillNumber], ['Bill of lading number', shipment?.billOfLadingNumber], ['Vessel name', shipment?.vesselName], ['Flight number', shipment?.flightNumber], ['Port of origin', shipment?.portOfOrigin], ['Port of destination', shipment?.portOfDestination], ['Estimated departure', shipment?.estimatedDeparture && formatDate(shipment.estimatedDeparture)], ['Actual departure', shipment?.actualDeparture && formatDate(shipment.actualDeparture)], ['Actual arrival', shipment?.actualArrival && formatDate(shipment.actualArrival)]].filter(([, value]) => value);

  const copyCode = async () => { if (!shipment?.trackingNumber) return; await navigator.clipboard?.writeText(shipment.trackingNumber); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  const handleTrack = (e: React.FormEvent) => { e.preventDefault(); fetchTracking(trackingNumber); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNotifyFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setNotifyFilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyRef) { setNotifyError('Please enter a transaction reference.'); return; }
    setNotifySubmitting(true); setNotifyError('');
    try {
      await api.post('/payments/notify', {
        trackingNumber: shipment?.trackingNumber,
        customerName: enteredName,
        method: notifyMethod,
        referenceId: notifyRef,
        amountPaid: notifyAmount,
        screenshotBase64: notifyFilePreview || null,
      });
      setNotifySuccess(true);
    } catch {
      setNotifyError('Could not send notification. Please try again or contact us directly.');
    } finally {
      setNotifySubmitting(false);
    }
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCardSubmitting(true);
    setTimeout(() => {
      setCardSubmitting(false);
      setCardSuccess(true);
    }, 1500);
  };

  const hasOutstandingBalance = shipment && shipment.paymentStatus !== 'paid' && Number(shipment.amountDue) > 0;
  const paymentSettings = settings?.paymentSettings || {};

  return (
    <main className="min-h-screen bg-[#F4F7FA] text-[#172B3A]">
      {/* Search Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#0B63CE]">OBREMS GLOBAL LOGISTICS</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#063B66] sm:text-5xl">Track Your Shipment</h1>
            <p className="mt-4 text-base text-slate-600">Follow your shipment from pickup to delivery with real-time updates.</p>
            <form onSubmit={handleTrack} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  aria-label="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full rounded-lg border border-slate-300 bg-white py-4 pl-12 pr-4 font-mono text-sm outline-none transition focus:border-[#0B63CE] focus:ring-2 focus:ring-[#0B63CE]/10"
                />
              </div>
              <button disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#063B66] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#0B63CE] disabled:cursor-wait disabled:opacity-70">
                <Package className="h-4 w-4" />{loading ? 'Searching...' : 'Track Shipment'}
              </button>
            </form>
            <p className="mt-3 text-xs text-slate-500">Example: OBG-2026-000184 or an official OGL tracking number</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:py-10">
        {/* Error */}
        {error && (
          <section className="border border-rose-200 bg-white p-6 shadow-sm rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <h2 className="font-bold text-[#063B66]">Shipment Not Found</h2>
                <p className="mt-1 text-sm text-slate-600">{error}</p>
                <p className="mt-1 text-sm text-slate-600">Check your tracking number and try again.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => setError('')} className="rounded-lg bg-[#063B66] px-4 py-2 text-sm font-bold text-white">Try Again</button>
              <a href={`mailto:${settings.contactEmail}`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-[#063B66]">Contact Support</a>
            </div>
          </section>
        )}

        {/* Verification Gate — shown after data fetch but before verification */}
        {rawData && !verified && (
          <section className="border border-slate-200 bg-white p-6 shadow-sm rounded-xl animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#063B66]/10 flex items-center justify-center text-[#063B66] shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#063B66]">Verify Your Identity</h2>
                <p className="text-sm text-slate-500 mt-0.5">Please confirm your name and phone number to view shipment details.</p>
              </div>
            </div>
            <form onSubmit={handleVerify} className="space-y-4 max-w-md text-xs">
              <div>
                <label htmlFor="verify-name" className="block font-bold text-slate-700 mb-1.5">Full Name *</label>
                <input
                  id="verify-name" type="text" required
                  value={enteredName} onChange={(e) => setEnteredName(e.target.value)}
                  placeholder="Enter the name on the shipment"
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]/20"
                />
              </div>
              <div>
                <label htmlFor="verify-phone" className="block font-bold text-slate-700 mb-1.5">Phone Number *</label>
                <input
                  id="verify-phone" type="tel" required
                  value={enteredPhone} onChange={(e) => setEnteredPhone(e.target.value)}
                  placeholder="+233 24 123 4567"
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]/20"
                />
              </div>
              {verifyError && (
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-rose-800 font-semibold">{verifyError}</p>
                </div>
              )}
              <button type="submit" disabled={verifying}
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#063B66] hover:bg-[#0B63CE] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-60">
                <ShieldCheck className="w-4 h-4" />
                {verifying ? 'Verifying…' : 'Verify & View Shipment'}
              </button>
            </form>
          </section>
        )}

        {/* Verified banner */}
        {verifiedBanner && (
          <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span className="text-xs font-semibold">Identity verified — viewing your shipment</span>
          </div>
        )}

        {/* Shipment Details (shown after verification) */}
        {shipment && <>
          <section className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8 rounded-lg">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Shipment</p>
                <div className="mt-1 flex items-center gap-2">
                  <h2 className="font-mono text-2xl font-extrabold text-[#063B66]">#{shipment.trackingNumber}</h2>
                  <button onClick={copyCode} title="Copy tracking number" className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-[#0B63CE]">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button onClick={() => fetchTracking(shipment.trackingNumber)} title="Refresh tracking" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-[#063B66] hover:bg-slate-50">
                <RefreshCw className="h-4 w-4" />Refresh
              </button>
            </div>
            <div className="grid gap-6 py-7 sm:grid-cols-2 lg:grid-cols-4">
              <div><p className="text-xs font-bold uppercase text-slate-500">Current status</p><p className="mt-2 text-xl font-extrabold uppercase text-[#0B63CE]">{current.title}</p></div>
              <div><p className="text-xs font-bold uppercase text-slate-500">Current location</p><p className="mt-2 flex gap-2 font-bold text-slate-800"><MapPin className="h-4 w-4 shrink-0 text-[#0B63CE]" />{currentLocation || 'Latest location pending'}</p></div>
              <div><p className="text-xs font-bold uppercase text-slate-500">Last updated</p><p className="mt-2 flex gap-2 font-bold text-slate-800"><Clock3 className="h-4 w-4 shrink-0 text-[#0B63CE]" />{formatDateTime(lastUpdated)}</p></div>
              <div><p className="text-xs font-bold uppercase text-slate-500">Estimated delivery</p><p className="mt-2 flex gap-2 font-bold text-slate-800"><Calendar className="h-4 w-4 shrink-0 text-[#0B63CE]" />{formatDate(shipment.estimatedDelivery)}</p></div>
            </div>
            <div className={`border-l-4 p-4 ${current.title === 'Delivery Delayed' ? 'border-amber-500 bg-amber-50' : 'border-[#0B63CE] bg-[#F4F7FA]'}`}>
              <p className="font-bold text-[#063B66]">{current.title}</p>
              <p className="mt-1 text-sm text-slate-600">{current.message}</p>
            </div>
          </section>

          {/* Shipment Journey */}
          <section className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8 rounded-lg">
            <h2 className="text-lg font-extrabold text-[#063B66]">Shipment Journey</h2>
            <div className="mt-7 grid gap-5 md:grid-cols-6">
              {STATUS_STEPS.map((step, index) => {
                const Icon = step.icon;
                const done = index <= currentStep;
                const active = index === currentStep;
                return (
                  <div key={step.key} className="relative flex items-center gap-3 md:flex-col md:text-center">
                    {index < STATUS_STEPS.length - 1 && <div className={`absolute left-4 top-9 h-[calc(100%+1.25rem)] w-px md:left-1/2 md:top-5 md:h-px md:w-full ${index < currentStep ? 'bg-[#063B66]' : 'bg-slate-200'}`} />}
                    <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${active ? 'border-[#0B63CE] bg-[#0B63CE] text-white ring-4 ring-[#0B63CE]/15' : done ? 'border-[#063B66] bg-[#063B66] text-white' : 'border-slate-300 bg-white text-slate-400'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`relative z-10 text-sm font-bold ${active ? 'text-[#0B63CE]' : done ? 'text-[#063B66]' : 'text-slate-400'}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Payment Section */}
          {hasOutstandingBalance && (
            <section className="border border-[#0B63CE]/30 bg-white p-6 shadow-sm sm:p-8 rounded-xl">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B63CE]/10 flex items-center justify-center text-[#0B63CE] shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#063B66]">Outstanding Balance</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Payment is required to release your shipment.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase text-slate-500">Amount Due</p>
                  <p className="text-2xl font-extrabold text-[#0B63CE] mt-1">{formatCurrency(shipment.amountDue, shipment.currency || 'GBP')}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {/* Bank Transfer */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button onClick={() => setOpenPaymentMethod(openPaymentMethod === 'bank' ? null : 'bank')}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Landmark className="w-5 h-5 text-[#063B66]" />
                      <span className="text-sm font-bold text-slate-800">Bank Transfer</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openPaymentMethod === 'bank' ? 'rotate-180' : ''}`} />
                  </button>
                  {openPaymentMethod === 'bank' && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-3 text-xs">
                      <p className="text-slate-600">Transfer the outstanding balance to the account below and use your tracking number as the reference.</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          ['Bank Name', paymentSettings.bankName || 'Barclays Bank UK'],
                          ['Account Name', paymentSettings.accountName || 'OBREMS GLOBAL LOGISTICS LTD'],
                          ['Account Number', paymentSettings.accountNumber || '20491823'],
                          ['Sort Code', paymentSettings.sortCode || '20-04-15'],
                          ['IBAN', paymentSettings.iban || 'GB29BARC20041520491823'],
                          ['SWIFT / BIC', paymentSettings.swiftBic || 'BARCGB22'],
                        ].map(([label, value]) => (
                          <div key={label} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <p className="text-slate-500 uppercase tracking-wider font-bold text-[10px]">{label}</p>
                            <p className="font-mono font-bold text-slate-800 mt-0.5">{value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-[#F4F7FA] border border-slate-200 rounded-lg p-3">
                        <p className="font-bold text-[#063B66]">Payment Reference</p>
                        <p className="font-mono font-bold text-slate-800 mt-1">{shipment.trackingNumber}</p>
                        <p className="text-slate-500 mt-1">{paymentSettings.paymentInstructions || 'Use your tracking number as the payment reference.'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Money */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button onClick={() => setOpenPaymentMethod(openPaymentMethod === 'momo' ? null : 'momo')}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-[#063B66]" />
                      <span className="text-sm font-bold text-slate-800">Mobile Money (MTN / Telecel)</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openPaymentMethod === 'momo' ? 'rotate-180' : ''}`} />
                  </button>
                  {openPaymentMethod === 'momo' && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-3 text-xs">
                      <p className="text-slate-600">Send payment via mobile money to the number below.</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          ['Account Name', paymentSettings.mobileMoneyName || 'OBREMS LOGISTICS GH'],
                          ['MoMo Number', paymentSettings.mobileMoneyNumber || '+233 24 555 9900 (MTN MoMo / Telecel Cash)'],
                        ].map(([label, value]) => (
                          <div key={label} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <p className="text-slate-500 uppercase tracking-wider font-bold text-[10px]">{label}</p>
                            <p className="font-mono font-bold text-slate-800 mt-0.5">{value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-[#F4F7FA] border border-slate-200 rounded-lg p-3">
                        <p className="font-bold text-[#063B66]">Reference</p>
                        <p className="font-mono font-bold text-slate-800 mt-1">{shipment.trackingNumber}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Payment */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button onClick={() => setOpenPaymentMethod(openPaymentMethod === 'card' ? null : 'card')}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-[#063B66]" />
                      <span className="text-sm font-bold text-slate-800">Card Payment</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openPaymentMethod === 'card' ? 'rotate-180' : ''}`} />
                  </button>
                  {openPaymentMethod === 'card' && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 text-xs">
                      {cardSuccess ? (
                        <div className="py-6 flex flex-col items-center gap-3">
                          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                          <p className="font-bold text-slate-800 text-sm">Payment Submitted</p>
                          <p className="text-slate-500 text-center">We'll confirm your payment within 24 hours and update your shipment status.</p>
                        </div>
                      ) : (
                        <form onSubmit={handleCardSubmit} className="space-y-4 mt-3">
                          <div>
                            <label htmlFor="card-name" className="block font-bold text-slate-700 mb-1">Name on Card *</label>
                            <input id="card-name" type="text" required value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="John Mensah" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE]" />
                          </div>
                          <div>
                            <label htmlFor="card-number" className="block font-bold text-slate-700 mb-1">Card Number *</label>
                            <input id="card-number" type="text" required value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="•••• •••• •••• ••••" maxLength={19} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] font-mono" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="card-expiry" className="block font-bold text-slate-700 mb-1">Expiry Date *</label>
                              <input id="card-expiry" type="text" required value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM / YY" maxLength={7} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE]" />
                            </div>
                            <div>
                              <label htmlFor="card-cvv" className="block font-bold text-slate-700 mb-1">CVV *</label>
                              <input id="card-cvv" type="text" required value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} placeholder="•••" maxLength={4} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE]" />
                            </div>
                          </div>
                          <button type="submit" disabled={cardSubmitting}
                            className="w-full py-3 rounded-lg bg-[#0B63CE] hover:bg-[#0952AD] text-white font-bold transition-colors disabled:opacity-60">
                            {cardSubmitting ? 'Processing…' : `Pay ${formatCurrency(shipment.amountDue, shipment.currency || 'GBP')}`}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Made Notify */}
              <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-700">Already made a payment?</p>
                  <p className="text-xs text-slate-500 mt-0.5">Notify us and we'll verify and update your shipment status.</p>
                </div>
                <button onClick={() => { setShowNotifyModal(true); setNotifySuccess(false); setNotifyError(''); }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#063B66] hover:bg-[#0B63CE] text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                  <Send className="w-4 h-4" /> Payment Made? Notify Us
                </button>
              </div>
            </section>
          )}

          {/* History & Details */}
          <div className="grid gap-6">
            <section className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8 rounded-lg">
              <h2 className="text-lg font-extrabold text-[#063B66]">Shipment History</h2>
              {events.length ? (
                <div className="mt-6 space-y-6">
                  {events.map((event: any, index: number) => {
                    const date = event.eventDate || event.timestamp || event.createdAt;
                    return (
                      <div key={event._id || index} className="relative flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className={`mt-1 h-3 w-3 rounded-full ${index === 0 ? 'bg-[#0B63CE] ring-4 ring-[#0B63CE]/15' : 'bg-slate-300'}`} />
                          {index < events.length - 1 && <span className="mt-2 h-full w-px bg-slate-200" />}
                        </div>
                        <div className="-mt-1 pb-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{formatDate(date)}</p>
                          <h3 className="mt-1 font-bold text-[#063B66]">{eventStatus(event.status)}</h3>
                          {event.location && <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-700"><MapPin className="h-3.5 w-3.5 text-[#0B63CE]" />{event.location}</p>}
                          <p className="mt-1 text-sm text-slate-600">{event.description || 'Your shipment has been updated in our logistics network.'}</p>
                          <p className="mt-1 text-xs text-slate-400">{formatDateTime(date)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="mt-6 border border-dashed border-slate-300 p-5 text-sm text-slate-500">Shipment history will appear here as your shipment moves through our network.</p>}
            </section>
            <section className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8 rounded-lg">
              <h2 className="text-lg font-extrabold text-[#063B66]">Shipment Details</h2>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[['Tracking number', shipment.trackingNumber], ['Shipment type', shipment.packageType || shipment.shippingMethod], ['Sender', shipment.sender?.name || shipment.sender || 'Obrems customer'], ['Recipient', customerName], ['Pickup location', shipment.origin], ['Destination', shipment.destination], ['Weight', shipment.weight ? `${shipment.weight} kg` : 'Not available'], ['Packages', shipment.packages || shipment.pieces || 'Not available']].filter(([, value]) => value).map(([label, value]) => (
                  <div key={label} className="border-b border-slate-100 pb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {optionalDetails.length > 0 && (
            <section className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8 rounded-lg">
              <h2 className="text-lg font-extrabold text-[#063B66]">International Shipping Information</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {optionalDetails.map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {shipment.customsStatus && (
            <section className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8 rounded-lg">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-6 w-6 text-[#0B63CE]" />
                <div>
                  <h2 className="text-lg font-extrabold text-[#063B66]">Customs Clearance</h2>
                  <p className="mt-1 font-bold text-slate-800">{shipment.customsStatus}</p>
                  <p className="mt-1 text-sm text-slate-600">{shipment.customsMessage || 'Your shipment customs status will be updated as processing continues.'}</p>
                </div>
              </div>
            </section>
          )}

          {shipment.proofOfDelivery && (
            <section className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8 rounded-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-[#063B66]">Delivery Confirmation</h2>
                  <p className="mt-1 text-sm text-slate-600">Delivered {formatDateTime(shipment.deliveredAt)} at {shipment.deliveryLocation || shipment.destination}.</p>
                </div>
                <a href={shipment.proofOfDelivery} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#063B66] px-4 py-2.5 text-sm font-bold text-white">
                  <FileDown className="h-4 w-4" />View Proof of Delivery
                </a>
              </div>
            </section>
          )}
        </>}
      </div>

      {/* Payment Notification Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#063B66] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                <h3 className="font-bold text-sm">Notify Us of Your Payment</h3>
              </div>
              <button onClick={() => setShowNotifyModal(false)} className="text-slate-300 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {notifySuccess ? (
              <div className="p-8 flex flex-col items-center gap-3 text-center">
                <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                <p className="text-base font-bold text-slate-800">Notification Received!</p>
                <p className="text-sm text-slate-500">We'll verify your payment and update your shipment status within 24 hours.</p>
                <button onClick={() => setShowNotifyModal(false)} className="mt-3 px-5 py-2 rounded-lg bg-[#0B63CE] text-white font-bold text-xs">Close</button>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label htmlFor="notify-method" className="block font-bold text-slate-700 mb-1">Payment Method Used *</label>
                  <select id="notify-method" value={notifyMethod} onChange={(e) => setNotifyMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE]">
                    <option>Bank Transfer</option>
                    <option>MTN Mobile Money</option>
                    <option>Telecel Cash</option>
                    <option>Card Payment</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="notify-ref" className="block font-bold text-slate-700 mb-1">Transaction / Reference ID *</label>
                  <input id="notify-ref" type="text" required value={notifyRef} onChange={(e) => setNotifyRef(e.target.value)}
                    placeholder="e.g. TXN123456789 or GIP2026..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE]" />
                </div>
                <div>
                  <label htmlFor="notify-amount" className="block font-bold text-slate-700 mb-1">Amount Paid</label>
                  <input id="notify-amount" type="text" value={notifyAmount} onChange={(e) => setNotifyAmount(e.target.value)}
                    placeholder="e.g. £120.00"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE]" />
                </div>
                <div>
                  <label htmlFor="notify-screenshot" className="block font-bold text-slate-700 mb-1">Screenshot / Proof of Payment (optional)</label>
                  <div className="flex items-center gap-3">
                    <label htmlFor="notify-screenshot" className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-600">{notifyFile ? notifyFile.name : 'Choose file'}</span>
                    </label>
                    <input id="notify-screenshot" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    {notifyFilePreview && <img src={notifyFilePreview} alt="preview" className="h-10 w-10 rounded-lg object-cover border border-slate-200" />}
                  </div>
                </div>
                {notifyError && (
                  <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-rose-800 font-semibold">{notifyError}</p>
                  </div>
                )}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowNotifyModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold">
                    Cancel
                  </button>
                  <button type="submit" disabled={notifySubmitting}
                    className="px-5 py-2 rounded-lg bg-[#0B63CE] hover:bg-[#0952AD] text-white font-bold shadow-sm disabled:opacity-60">
                    {notifySubmitting ? 'Sending…' : 'Send Notification'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}