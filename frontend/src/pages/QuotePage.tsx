import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Plane,
  Ship,
  ArrowRight,
  Package,
  Calculator,
  ShieldCheck,
  Clock,
  MapPin,
  FileText,
  Truck,
  Sparkles,
  Info
} from 'lucide-react';
import api from '../services/api';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { localImages, localizeImage } from '../utils/localImages';

interface QuoteFormData {
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  companyName?: string;
  origin: string;
  destination: string;
  shippingMethod: string;
  cargoType: string;
  quantity: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  preferredDeliveryMethod: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  insuranceRequired: boolean;
  customsAssistance: boolean;
  additionalNotes?: string;
}

export default function QuotePage() {
  const { settings } = useSiteSettings();
  const quoteHeroImage = localizeImage(settings?.quoteHeroImageUrl, localImages.heroSlide3);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<QuoteFormData>({
    defaultValues: {
      origin: 'United Kingdom',
      destination: 'Ghana - Accra',
      shippingMethod: 'UK to Ghana Air Freight Standard',
      cargoType: 'General Merchandise',
      quantity: 1,
      weight: 10,
      length: 40,
      width: 30,
      height: 25,
      preferredDeliveryMethod: 'Door-to-Door',
      insuranceRequired: false,
      customsAssistance: true,
    }
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [error, setError] = useState('');

  // Watch fields for live volumetric & pricing calculation
  const watchedOrigin = watch('origin');
  const watchedDestination = watch('destination');
  const watchedMethod = watch('shippingMethod');
  const watchedWeight = Number(watch('weight')) || 0;
  const watchedLength = Number(watch('length')) || 0;
  const watchedWidth = Number(watch('width')) || 0;
  const watchedHeight = Number(watch('height')) || 0;
  const watchedQuantity = Math.max(1, Number(watch('quantity')) || 1);

  // Real-time Volumetric & Weight Calculations
  const calculations = useMemo(() => {
    const singleCbm = (watchedLength * watchedWidth * watchedHeight) / 1000000;
    const totalCbm = singleCbm * watchedQuantity;
    
    // Standard IATA air volumetric weight: (L x W x H in cm) / 5000
    const singleVolumetricWeight = (watchedLength * watchedWidth * watchedHeight) / 5000;
    const totalVolumetricWeight = singleVolumetricWeight * watchedQuantity;

    const totalActualWeight = watchedWeight * watchedQuantity;
    const isSea = watchedMethod.toLowerCase().includes('sea');
    const chargeableWeight = isSea ? totalActualWeight : Math.max(totalActualWeight, totalVolumetricWeight);

    // Indicative estimation
    let estRatePerKg = 6.5; // GBP default standard air
    if (watchedMethod.includes('Express')) estRatePerKg = 8.5;
    else if (watchedMethod.includes('China')) estRatePerKg = 2.8;

    let estimatedMinCost = 0;
    let estimatedMaxCost = 0;

    if (isSea) {
      // Sea freight based on CBM (typical ~£180 - £260 per CBM)
      const minPerCbm = 180;
      const maxPerCbm = 260;
      estimatedMinCost = Math.max(75, totalCbm * minPerCbm);
      estimatedMaxCost = Math.max(100, totalCbm * maxPerCbm);
    } else {
      estimatedMinCost = Math.max(35, chargeableWeight * estRatePerKg);
      estimatedMaxCost = Math.max(45, chargeableWeight * (estRatePerKg + 1.5));
    }

    return {
      totalActualWeight,
      totalCbm,
      totalVolumetricWeight,
      chargeableWeight,
      isSea,
      estimatedMinCost,
      estimatedMaxCost,
    };
  }, [watchedLength, watchedWidth, watchedHeight, watchedQuantity, watchedWeight, watchedMethod]);

  const onSubmit = async (data: QuoteFormData) => {
    try {
      setLoading(true);
      setError('');
      setSuccessData(null);

      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp || data.phone,
        origin: data.origin,
        destination: data.destination,
        shippingMethod: data.shippingMethod,
        packageType: `${data.cargoType} (Qty: ${data.quantity})`,
        weight: calculations.chargeableWeight,
        dimensions: `${data.length} x ${data.width} x ${data.height} cm (Qty: ${data.quantity})`,
        preferredDeliveryMethod: data.preferredDeliveryMethod,
        additionalNotes: [
          data.companyName ? `Company: ${data.companyName}` : '',
          data.pickupAddress ? `Pickup Address: ${data.pickupAddress}` : '',
          data.deliveryAddress ? `Delivery Address: ${data.deliveryAddress}` : '',
          `Actual Weight: ${calculations.totalActualWeight.toFixed(2)} kg`,
          `Volumetric Weight: ${calculations.totalVolumetricWeight.toFixed(2)} kg`,
          `Volume: ${calculations.totalCbm.toFixed(4)} CBM`,
          `Chargeable Weight: ${calculations.chargeableWeight.toFixed(2)} kg`,
          data.insuranceRequired ? 'Insurance requested' : 'Standard liability',
          data.customsAssistance ? 'Customs clearance required' : 'Self-cleared',
          data.additionalNotes || '',
        ].filter(Boolean).join('\n'),
      };

      const res = await api.post('/quotes', payload);
      setSuccessData({
        quoteId: res.data?.data?._id || `QTE-${Date.now().toString().slice(-6)}`,
        name: data.fullName,
        email: data.email,
        route: `${data.origin} → ${data.destination}`,
        method: data.shippingMethod,
        chargeableWeight: calculations.chargeableWeight,
        cbm: calculations.totalCbm,
      });
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to submit quote request. Please try again or contact us via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-[#F4F7FA] border border-slate-200 rounded-xl text-xs sm:text-sm text-[#172B3A] placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:ring-2 focus:ring-[#0B63CE]/10 focus:bg-white transition";
  const labelClass = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2";

  return (
    <main className="bg-[#F4F7FA] text-[#172B3A] min-h-screen pb-20">

      {/* ── FULL IMAGE HERO BANNER ── */}
      <section className="relative min-h-[320px] flex items-center overflow-hidden">
        <img
          src={quoteHeroImage}
          alt="Get a Shipping Quote"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
        <div className="relative z-10 container mx-auto px-4 max-w-5xl py-14">
          <span className="inline-block text-xs font-bold text-sky-400 uppercase tracking-[0.25em] mb-3 anim-fade-down">
            Instant Calculator & Freight Quotation
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4 anim-fade-up">
            Calculate & Request a Quote
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed anim-fade-up delay-200">
            Get accurate freight estimates with live volumetric calculations for express air shipping and ocean container freight between the UK, China, and Ghana.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl py-12 space-y-10">

        {/* ── QUICK ROUTE PRESETS ── */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: Plane,
              title: 'UK → Ghana (Air)',
              sub: 'Express 1–3 Days · Standard 3–7 Days',
              method: 'UK to Ghana Air Freight Standard',
              orig: 'United Kingdom',
              dest: 'Ghana - Accra',
              bg: 'from-[#063B66] to-[#0B63CE]'
            },
            {
              icon: Plane,
              title: 'Ghana → UK (Air)',
              sub: 'Express 1–3 Days · Standard 3–7 Days',
              method: 'Ghana to UK Air Freight Express',
              orig: 'Ghana - Accra',
              dest: 'United Kingdom',
              bg: 'from-[#063B66] to-[#0B63CE]'
            },
            {
              icon: Ship,
              title: 'China → Ghana (Sea)',
              sub: '25 – 35 Days FCL & LCL Ocean',
              method: 'China to Ghana Sea Freight',
              orig: 'China',
              dest: 'Ghana - Accra',
              bg: 'from-slate-800 to-slate-700'
            },
          ].map(({ icon: Icon, title, sub, method, orig, dest, bg }) => (
            <button
              key={title}
              type="button"
              onClick={() => {
                setValue('origin', orig);
                setValue('destination', dest);
                setValue('shippingMethod', method);
              }}
              className={`text-left relative rounded-2xl p-4 bg-gradient-to-br ${bg} text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all flex items-start gap-3.5 border-2 ${
                watchedMethod === method ? 'border-sky-400 ring-2 ring-sky-400/30' : 'border-transparent'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-sky-300" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-sm">{title}</p>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{sub}</p>
                {watchedMethod === method && (
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-sky-300">
                    ✓ Selected Route
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* ── SUCCESS MODAL BANNER ── */}
        {successData && (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-extrabold text-emerald-900">
                  Quote Request Received! Reference: {successData.quoteId}
                </h3>
                <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                  Thank you, <strong>{successData.name}</strong>. Our freight desk has logged your request for <strong>{successData.route}</strong> ({successData.method}).
                </p>
                <div className="mt-3 grid sm:grid-cols-3 gap-2 bg-white/80 p-3 rounded-xl border border-emerald-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Route</span>
                    <span className="font-bold text-slate-800">{successData.route}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Chargeable Wt</span>
                    <span className="font-bold text-slate-800">{successData.chargeableWeight.toFixed(2)} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Calculated Volume</span>
                    <span className="font-bold text-slate-800">{successData.cbm.toFixed(4)} CBM</span>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-700 mt-3">
                  We will contact you via email (<strong>{successData.email}</strong>) and WhatsApp shortly with your finalized formal invoice and collection booking.
                </p>
                <button
                  onClick={() => setSuccessData(null)}
                  className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-sm transition-colors"
                >
                  Submit Another Quote
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MAIN INTERACTIVE CALCULATOR & FORM ── */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* Left Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-[#063B66] px-6 py-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-sky-400" />
                <div>
                  <h2 className="text-base font-bold">Shipment Quote Details</h2>
                  <p className="text-[11px] text-slate-300">Complete the form for an exact logistics quotation</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-white/10 px-2.5 py-1 rounded-full text-sky-300">
                24h Response
              </span>
            </div>

            {error && (
              <div className="m-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-8">

              {/* ── STEP 1: ROUTE & SERVICE ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-[#063B66] text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">1</span>
                  <h3 className="font-bold text-[#063B66] text-sm uppercase tracking-wide">Route & Method</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Origin Country / City *</label>
                    <select {...register('origin', { required: 'Origin is required' })} className={inputClass}>
                      <option value="United Kingdom">United Kingdom (London Hub / Nationwide)</option>
                      <option value="Ghana - Accra">Ghana – Accra Hub</option>
                      <option value="Ghana - Kumasi">Ghana – Kumasi Hub</option>
                      <option value="China">China (Guangzhou / Yiwu / Shanghai)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Destination *</label>
                    <select {...register('destination', { required: 'Destination is required' })} className={inputClass}>
                      <option value="Ghana - Accra">Ghana – Accra (Door Delivery & Hub)</option>
                      <option value="Ghana - Kumasi">Ghana – Kumasi Hub & Delivery</option>
                      <option value="Ghana - Other Regions">Ghana – Other Regional Delivery</option>
                      <option value="United Kingdom">United Kingdom (Nationwide Door Delivery)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Shipping Service Tier *</label>
                  <select {...register('shippingMethod', { required: 'Shipping method is required' })} className={inputClass}>
                    <option value="UK to Ghana Air Freight Express">UK → Ghana · Express Air (1–3 Business Days)</option>
                    <option value="UK to Ghana Air Freight Standard">UK → Ghana · Standard Air (3–7 Business Days)</option>
                    <option value="Ghana to UK Air Freight Express">Ghana → UK · Express Air (1–3 Business Days)</option>
                    <option value="Ghana to UK Air Freight Standard">Ghana → UK · Standard Air (3–7 Business Days)</option>
                    <option value="China to Ghana Sea Freight">China → Ghana · Sea Freight (25–35 Days Ocean)</option>
                  </select>
                </div>
              </div>

              {/* ── STEP 2: CARGO DIMENSIONS & WEIGHT ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-[#063B66] text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">2</span>
                  <h3 className="font-bold text-[#063B66] text-sm uppercase tracking-wide">Cargo Specs & Dimensions</h3>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Cargo Description *</label>
                    <input
                      type="text"
                      {...register('cargoType', { required: 'Cargo type is required' })}
                      placeholder="e.g. Clothing, Electronics, Foodstuff, Spare Parts"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Quantity (Packages) *</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      {...register('quantity', { required: true, min: 1 })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className={labelClass}>Weight / Pkg (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      {...register('weight', { required: 'Weight is required' })}
                      placeholder="10"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Length (cm) *</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      {...register('length', { required: true })}
                      placeholder="40"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Width (cm) *</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      {...register('width', { required: true })}
                      placeholder="30"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Height (cm) *</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      {...register('height', { required: true })}
                      placeholder="25"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className={labelClass}>Delivery Preference</label>
                    <select {...register('preferredDeliveryMethod')} className={inputClass}>
                      <option value="Door-to-Door">Door-to-Door Delivery</option>
                      <option value="Warehouse Pickup">Warehouse / Hub Collection</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Pickup / Collection Address</label>
                    <input
                      type="text"
                      {...register('pickupAddress')}
                      placeholder="Street, Postcode, City (if collection requested)"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* ── STEP 3: CONTACT & SUBMISSION ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-[#063B66] text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">3</span>
                  <h3 className="font-bold text-[#063B66] text-sm uppercase tracking-wide">Contact Details</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input
                      type="text"
                      {...register('fullName', { required: 'Your name is required' })}
                      placeholder="e.g. Seth Owusu"
                      className={inputClass}
                    />
                    {errors.fullName && <p className="text-[11px] text-rose-500 mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Email Address *</label>
                    <input
                      type="email"
                      {...register('email', { required: 'Valid email is required' })}
                      placeholder="seth@example.com"
                      className={inputClass}
                    />
                    {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number *</label>
                    <input
                      type="tel"
                      {...register('phone', { required: 'Phone number is required' })}
                      placeholder="+44 7460 554358"
                      className={inputClass}
                    />
                    {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>WhatsApp Number</label>
                    <input
                      type="tel"
                      {...register('whatsapp')}
                      placeholder="If same or different from phone"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      {...register('customsAssistance')}
                      className="accent-[#0B63CE] w-4 h-4 rounded"
                    />
                    <span>Include Customs Clearance Handling</span>
                  </label>
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      {...register('insuranceRequired')}
                      className="accent-[#0B63CE] w-4 h-4 rounded"
                    />
                    <span>Add All-Risk Cargo Insurance</span>
                  </label>
                </div>

                <div>
                  <label className={labelClass}>Special Instructions / Notes</label>
                  <textarea
                    rows={2}
                    {...register('additionalNotes')}
                    placeholder="Fragile cargo, high value, special packing requirements, etc."
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500">
                  ⚡ Accurate responses generated within <strong>24 business hours</strong>.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#063B66] hover:bg-[#0B63CE] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Submitting Quote...' : 'Submit Quote Request'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Live Calculator & Breakdown Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">

            {/* Live Metrics Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-[#063B66]">
                  <Calculator className="w-5 h-5 text-[#0B63CE]" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">Live Freight Estimator</h3>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-[#0B63CE]">
                  Auto-Computed
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Packages Count:</span>
                  <span className="font-bold text-slate-800">{watchedQuantity} pkg{watchedQuantity > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Total Actual Weight:</span>
                  <span className="font-bold text-slate-800">{calculations.totalActualWeight.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Calculated Volume:</span>
                  <span className="font-mono font-bold text-slate-800">{calculations.totalCbm.toFixed(4)} CBM</span>
                </div>
                {!calculations.isSea && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Volumetric Weight (Air):</span>
                    <span className="font-mono font-semibold text-slate-700">{calculations.totalVolumetricWeight.toFixed(2)} kg</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 bg-blue-50/70 px-3 rounded-xl">
                  <div>
                    <span className="font-bold text-[#063B66] block">Chargeable Weight:</span>
                    <span className="text-[10px] text-slate-500">
                      {calculations.isSea
                        ? 'Sea freight billing based on CBM'
                        : calculations.chargeableWeight === calculations.totalActualWeight
                        ? 'Higher actual weight applied'
                        : 'Higher volumetric weight applied'}
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-[#063B66] font-mono">
                    {calculations.isSea ? `${calculations.totalCbm.toFixed(3)} CBM` : `${calculations.chargeableWeight.toFixed(2)} kg`}
                  </span>
                </div>
              </div>

              {/* Indicative Cost Band */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#063B66] to-[#0B63CE] text-white space-y-1 shadow-md">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-sky-300 block">
                  Indicative Freight Cost Range
                </span>
                <p className="text-2xl font-black tracking-tight">
                  £{calculations.estimatedMinCost.toFixed(2)} – £{calculations.estimatedMaxCost.toFixed(2)}
                </p>
                <p className="text-[10px] text-sky-200 leading-relaxed pt-1">
                  *Official rate confirmed by our logistics team within 24 hours based on final dimensions and destination address.
                </p>
              </div>

              {/* Guarantee highlights */}
              <div className="space-y-2.5 pt-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Door-to-door insurance & handling coverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0B63CE] shrink-0" />
                  <span>Real-time milestone tracking on all routes</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Accra, Kumasi & Nationwide Ghana drop-off</span>
                </div>
              </div>
            </div>

            {/* Need direct assistance? */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between gap-4 shadow-2xs">
              <div>
                <p className="font-extrabold text-xs text-[#063B66]">Need immediate support?</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Direct chat with our London & Accra freight desk.</p>
              </div>
              <a
                href="https://wa.me/447460554358"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 transition-colors shadow-sm"
              >
                WhatsApp Us
              </a>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
