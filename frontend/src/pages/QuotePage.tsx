import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, CheckCircle2, AlertCircle, Plane, Ship, ArrowRight, Package } from 'lucide-react';
import api from '../services/api';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { localImages, localizeImage } from '../utils/localImages';

export default function QuotePage() {
  const { settings } = useSiteSettings();
  const quoteHeroImage = localizeImage(settings?.quoteHeroImageUrl, localImages.heroSlide3);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await api.post('/quotes', data);
      setSuccess('Your quote request has been submitted! Our team will contact you within 24 hours.');
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to submit. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-[#F4F7FA] border border-slate-200 rounded-xl text-sm text-[#172B3A] placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:ring-2 focus:ring-[#0B63CE]/10 focus:bg-white transition";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2";

  return (
    <main className="bg-[#F4F7FA] text-[#172B3A] min-h-screen">

      {/* ── FULL IMAGE HERO BANNER ── */}
      <section className="relative min-h-[340px] flex items-center overflow-hidden">
        <img
          src={quoteHeroImage}
          alt="Get a Shipping Quote"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
        <div className="relative z-10 container mx-auto px-4 max-w-4xl py-16">
          <span className="inline-block text-xs font-bold text-sky-400 uppercase tracking-[0.25em] mb-4">
            Freight Calculator & Estimates
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Request a<br className="hidden sm:inline" /> Shipping Quote
          </h1>
          <p className="text-slate-300 text-base max-w-xl leading-relaxed">
            Fill in your shipment details and receive a competitive freight rate from our logistics team within 24 hours.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl py-16 space-y-10">

        {/* ── ROUTE OVERVIEW CARDS ── */}
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: Plane, title: 'UK → Ghana', sub: 'Air Freight', detail: 'Express 1–3 Days · Standard 3–7 Days', bg: 'from-[#063B66] to-[#0B63CE]' },
            { icon: Plane, title: 'Ghana → UK', sub: 'Air Freight', detail: 'Express 1–3 Days · Standard 3–7 Days', bg: 'from-[#063B66] to-[#0B63CE]' },
            { icon: Ship,  title: 'China → Ghana', sub: 'Sea Freight', detail: '25 – 35 Days Ocean Transit', bg: 'from-slate-800 to-slate-700' },
          ].map(({ icon: Icon, title, sub, detail, bg }) => (
            <div key={title} className={`relative rounded-2xl p-5 bg-gradient-to-br ${bg} text-white shadow-md flex items-start gap-4 overflow-hidden`}>
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-sky-300" />
              </div>
              <div>
                <p className="font-extrabold text-base">{title}</p>
                <p className="text-xs text-sky-300 font-semibold mt-0.5">{sub}</p>
                <p className="text-xs text-slate-300 mt-1">{detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── FORM CARD ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Form header */}
          <div className="bg-[#063B66] px-8 py-6 flex items-center gap-3">
            <Package className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Shipment Quote Request</h2>
              <p className="text-xs text-slate-400 mt-0.5">Complete all sections for the most accurate quote</p>
            </div>
          </div>

          <div className="p-8 space-y-10">
            {success && (
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 flex items-center gap-3 text-sky-800 text-sm">
                <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0" />
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-10">

              {/* ── STEP 1 ── */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <span className="w-8 h-8 rounded-full bg-[#063B66] text-white text-xs font-extrabold flex items-center justify-center shrink-0">1</span>
                  <h3 className="font-bold text-[#063B66] text-base">Personal & Contact Information</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input type="text" autoComplete="off" {...register('fullName', { required: true })} placeholder="Your full name" className={inputClass} />
                    {errors.fullName && <p className="text-xs text-rose-500 mt-1">Full name is required</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Email Address *</label>
                    <input type="email" autoComplete="off" {...register('email', { required: true })} placeholder="yourname@email.com" className={inputClass} />
                    {errors.email && <p className="text-xs text-rose-500 mt-1">Email is required</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number *</label>
                    <input type="tel" autoComplete="off" {...register('phone', { required: true })} placeholder="+44 / +233 number" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>WhatsApp Number</label>
                    <input type="tel" autoComplete="off" {...register('whatsapp')} placeholder="If different from phone" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* ── STEP 2 ── */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <span className="w-8 h-8 rounded-full bg-[#063B66] text-white text-xs font-extrabold flex items-center justify-center shrink-0">2</span>
                  <h3 className="font-bold text-[#063B66] text-base">Shipment Route & Method</h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>Origin *</label>
                    <select {...register('origin', { required: true })} className={inputClass}>
                      <option value="">Select origin</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Ghana - Accra">Ghana – Accra</option>
                      <option value="Ghana - Kumasi">Ghana – Kumasi</option>
                      <option value="China">China</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Destination *</label>
                    <select {...register('destination', { required: true })} className={inputClass}>
                      <option value="">Select destination</option>
                      <option value="Ghana - Accra">Ghana – Accra</option>
                      <option value="Ghana - Kumasi">Ghana – Kumasi</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Shipping Method *</label>
                    <select {...register('shippingMethod', { required: true })} className={inputClass}>
                      <option value="">Select method</option>
                      <option value="UK to Ghana Air Freight Express">UK → Ghana – Air Express (1–3 Days)</option>
                      <option value="UK to Ghana Air Freight Standard">UK → Ghana – Air Standard (3–7 Days)</option>
                      <option value="Ghana to UK Air Freight Express">Ghana → UK – Air Express (1–3 Days)</option>
                      <option value="Ghana to UK Air Freight Standard">Ghana → UK – Air Standard (3–7 Days)</option>
                      <option value="China to Ghana Sea Freight">China → Ghana – Sea Freight (25–35 Days)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── STEP 3 ── */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <span className="w-8 h-8 rounded-full bg-[#063B66] text-white text-xs font-extrabold flex items-center justify-center shrink-0">3</span>
                  <h3 className="font-bold text-[#063B66] text-base">Cargo Specifications</h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="lg:col-span-2">
                    <label className={labelClass}>Package / Cargo Type</label>
                    <input type="text" {...register('packageType')} placeholder="e.g. Electronics, Clothing, Personal Effects" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Weight (kg)</label>
                    <input type="number" step="0.1" {...register('weight')} placeholder="e.g. 25" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Dimensions (cm)</label>
                    <input type="text" {...register('dimensions')} placeholder="L × W × H" className={inputClass} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Delivery Preference</label>
                    <select {...register('preferredDeliveryMethod')} className={inputClass}>
                      <option value="Door-to-Door">Door-to-Door Delivery</option>
                      <option value="Warehouse Pickup">Warehouse Pickup (Accra)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Special Instructions</label>
                    <input type="text" {...register('additionalNotes')} placeholder="Fragile, hazardous, oversized, etc." className={inputClass} />
                  </div>
                </div>
              </div>

              {/* ── SUBMIT ── */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                  By submitting, you agree to be contacted by our team. We typically respond within <strong>24 hours</strong>.
                </p>
                <button
                  type="submit" disabled={loading}
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#063B66] hover:bg-[#0B63CE] text-white font-bold text-sm rounded-xl transition-colors shadow-md disabled:opacity-60 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Submitting...' : 'Submit Quote Request'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </main>
  );
}
