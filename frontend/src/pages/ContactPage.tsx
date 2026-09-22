import { useState } from 'react';
import { MapPin, Mail, Phone, Clock, Send, CheckCircle2, AlertCircle, MessageSquare, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { localImages, localizeImage } from '../utils/localImages';

export default function ContactPage() {
  const { settings } = useSiteSettings();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const phone = settings?.contactPhone || '+44 7460 554358';
  const email = settings?.contactEmail || 'info@obremsgloballogistics.com';
  const officeUk = settings?.officeUk || '25 Weston Road, Smethwick, West Midlands, B67 7DS';
  const businessHours = settings?.businessHours || 'Mon – Fri, 08:00 – 18:00';
  const contactHeroImage = localizeImage(settings?.contactHeroImageUrl, localImages.freightWarehouse);
  const accraOfficeImage = '/office/accra-office.jpg';
  const kumasiOfficeImage = '/office/kumasi-office.jpg';
  const officeLocations = settings?.officeLocations || [];
  const contactMethods = settings?.contactMethods || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await api.post('/messages', formData);
      setSuccess('Thank you! Your message has been sent. We will reply within 24 hours.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again or reach us on WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#F4F7FA] text-[#172B3A] min-h-screen">

      {/* ── FULL IMAGE HERO BANNER ── */}
      <section className="relative min-h-[340px] flex items-center overflow-hidden">
        <img
          src={contactHeroImage}
          alt="Contact Obrems Global Logistics"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
        <div className="relative z-10 container mx-auto px-4 max-w-4xl py-16">
          <span className="inline-block text-xs font-bold text-sky-400 uppercase tracking-[0.25em] mb-4">
            Contact Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            {settings?.contact?.title || 'Contact Us'}
          </h1>
          <p className="text-slate-300 text-base max-w-xl leading-relaxed">
            {settings?.contact?.description || ''}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl py-16 space-y-12">

        {/* ── 4 INFO CARDS ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Phone, label: 'UK Phone / WhatsApp', value: phone, href: `tel:${phone.replace(/\s+/g, '')}`, note: 'Tap to call or message' },
            { icon: Mail, label: 'Email Address', value: email, href: `mailto:${email}`, note: 'Reply within 24 hours' },
            { icon: MapPin, label: 'UK Office', value: officeUk, href: undefined, note: 'Smethwick, West Midlands' },
            { icon: Clock, label: 'Business Hours', value: businessHours, href: undefined, note: 'UK & Ghana teams' },
          ].map(({ icon: Icon, label, value, href, note }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow group">
              <div className="w-11 h-11 rounded-xl bg-[#063B66] flex items-center justify-center text-white shrink-0 group-hover:bg-[#0B63CE] transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                {href ? (
                  <a href={href} className="text-sm font-bold text-[#063B66] hover:text-[#0B63CE] break-all leading-snug block">
                    {value}
                  </a>
                ) : (
                  <p className="text-sm font-bold text-[#063B66] leading-snug">{value}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">{note}</p>
              </div>
            </div>
          ))}
        </div>

        {contactMethods.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{contactMethods.map((contact: any, index: number) => <div key={`${contact.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{contact.title || 'Contact line'}</p>{contact.phone && <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="mt-3 block text-sm font-bold text-[#063B66]">{contact.phone}</a>}{contact.email && <a href={`mailto:${contact.email}`} className="mt-1 block break-all text-sm font-semibold text-[#0B63CE]">{contact.email}</a>}{contact.whatsapp && <p className="mt-1 text-xs text-slate-500">WhatsApp: {contact.whatsapp}</p>}</div>)}</div>}

        {/* ── GHANA OFFICES ── */}
        {officeLocations.length > 0 && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{officeLocations.map((office: any, index: number) => <div key={`${office.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><MapPin className="h-6 w-6 text-[#0B63CE]" /><h3 className="mt-4 font-extrabold text-[#063B66]">{office.title || 'Office location'}</h3><p className="mt-2 text-sm text-slate-600">{office.address}</p>{office.phone && <a href={`tel:${office.phone.replace(/\s+/g, '')}`} className="mt-3 flex items-center gap-2 text-sm font-bold text-[#0B63CE]"><Phone className="h-4 w-4" />{office.phone}</a>}{office.email && <a href={`mailto:${office.email}`} className="mt-1 block break-all text-xs font-semibold text-[#0B63CE]">{office.email}</a>}{office.mapUrl && <a href={office.mapUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#063B66]">Open in Google Maps <ArrowRight className="h-3.5 w-3.5" /></a>}</div>)}</div>}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Accra Office Card */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl min-h-[200px] flex items-center p-7 group">
            <img
              src={accraOfficeImage}
              alt="Accra Ghana"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/60 to-slate-950/30" />
            <div className="relative z-10 flex items-start gap-4 w-full">
              <div className="w-11 h-11 rounded-xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-sky-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white text-base">Ghana – Accra Office</h4>
                <p className="text-xs text-slate-300 mt-0.5">Direct contact for Accra collections &amp; deliveries</p>
                <a href="tel:+233246472761" className="inline-flex items-center gap-2 mt-3 text-sky-400 font-bold text-sm hover:text-sky-300 transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                  +233 24 647 2761
                </a>
              </div>
            </div>
          </div>

          {/* Kumasi Office Card */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl min-h-[200px] flex items-center p-7 group">
            <img
              src={kumasiOfficeImage}
              alt="Kumasi Ghana"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/60 to-slate-950/30" />
            <div className="relative z-10 flex items-start gap-4 w-full">
              <div className="w-11 h-11 rounded-xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-sky-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white text-base">Ghana – Kumasi Office</h4>
                <p className="text-xs text-slate-300 mt-0.5">Direct contact for Kumasi collections &amp; deliveries</p>
                <a href="tel:+233547181769" className="inline-flex items-center gap-2 mt-3 text-sky-400 font-bold text-sm hover:text-sky-300 transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                  +233 54 718 1769
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* ── FORM + MAP ── */}
        <div className="grid lg:grid-cols-5 gap-8">

          {/* Contact Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-[#063B66] px-8 py-6 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-sky-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Send Us a Message</h2>
                <p className="text-xs text-slate-400 mt-0.5">We'll respond within 24 hours</p>
              </div>
            </div>

            <div className="p-8 space-y-5">
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

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Full Name *</label>
                    <input
                      type="text" required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Kofi Mensah"
                      className="w-full px-4 py-3 bg-[#F4F7FA] border border-slate-200 rounded-xl text-sm text-[#172B3A] placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:ring-2 focus:ring-[#0B63CE]/10 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+233 24 555 9900"
                      className="w-full px-4 py-3 bg-[#F4F7FA] border border-slate-200 rounded-xl text-sm text-[#172B3A] placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:ring-2 focus:ring-[#0B63CE]/10 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Email Address *</label>
                  <input
                    type="email" required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="yourname@email.com"
                    className="w-full px-4 py-3 bg-[#F4F7FA] border border-slate-200 rounded-xl text-sm text-[#172B3A] placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:ring-2 focus:ring-[#0B63CE]/10 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Message *</label>
                  <textarea
                    required rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your cargo, shipping route, or any questions..."
                    className="w-full px-4 py-3 bg-[#F4F7FA] border border-slate-200 rounded-xl text-sm text-[#172B3A] placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:ring-2 focus:ring-[#0B63CE]/10 focus:bg-white transition resize-none"
                  />
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#063B66] hover:bg-[#0B63CE] text-white font-bold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* Map + Quick Links */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex-1">
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-[#063B66]">{settings?.contact?.mapTitle || 'Find an Obrems office'}</h2>
              <iframe
                className="w-full h-full min-h-[280px]"
                title="OBREMS UK Office"
                src={settings?.contact?.mapUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2429.0!2d-1.984!3d52.489!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4870958a8b63b36d%3A0x6c67a4d9d43d7e6c!2sSmethwick%2C%20West%20Midlands!5e0!3m2!1sen!2suk!4v1700000000000'}
                loading="lazy"
              />
            </div>

            <div className="bg-[#063B66] rounded-2xl p-6 text-white space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-widest text-sky-400">Quick Actions</h3>
              <a
                href={`https://wa.me/${phone.replace(/\s+/g, '').replace('+', '')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-semibold"
              >
                <span>WhatsApp Us</span>
                <ArrowRight className="w-4 h-4 text-sky-400" />
              </a>
              <a
                href={`mailto:${email}`}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-semibold"
              >
                <span>Send Email</span>
                <ArrowRight className="w-4 h-4 text-sky-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
