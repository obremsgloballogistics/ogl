import { Link } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle2, Target, Eye, ArrowRight
} from 'lucide-react';



import { useSiteSettings } from '../hooks/useSiteSettings';
import { localImages, localizeImage } from '../utils/localImages';

export default function AboutPage() {
  const { settings } = useSiteSettings();
  const aboutImage = localizeImage(settings?.aboutHeroImageUrl || settings?.heroImageUrl, localImages.freightWarehouse);
  const missionImage = localizeImage(settings?.missionImageUrl, localImages.mission);
  const visionImage = localizeImage(settings?.visionImageUrl, localImages.city);
  const aboutCtaImage = localizeImage(settings?.aboutCtaImageUrl, localImages.heroSlide4);
  const aboutText = settings?.about?.description || settings?.aboutText || '';

  return (
    <main className="bg-[#F4F7FA] text-[#172B3A]">

      {/* ── ABOUT BANNER — FULL IMAGE OVERLAY (matches homepage About section) ── */}
      <section className="container mx-auto px-4 pb-16">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl min-h-[480px] flex items-center p-8 sm:p-14">
          <img
            src={aboutImage}
            alt="Obrems Global Logistics Operations"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-slate-950/20" />
          <div className="relative z-10 max-w-2xl space-y-6 text-white">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-[0.25em] mb-2 block">
                Who We Are
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                {settings?.about?.title || 'About Us'}
              </h2>
            </div>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-normal">
              {aboutText}
            </p>
            <p className="text-slate-200 text-sm leading-relaxed font-normal">
              We manage every aspect of the supply chain — from warehouse consolidation to customs documentation and door-to-door delivery across all regions of Ghana.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              {[
                'Real-time shipment tracking',
                'Secure handling of your goods',
                'Competitive freight rates',
                'Dedicated customer support',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-100">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION & VISION CARDS — FULL OVERLAY ── */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#0B63CE] uppercase tracking-[0.2em]">Our Purpose</span>
            <h2 className="text-3xl font-extrabold text-[#063B66] mt-2">Mission & Vision</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-xl min-h-[320px] flex flex-col justify-end group">
              <img
                src={missionImage}
                alt="Our Mission"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/55 to-slate-900/10" />
              <div className="relative z-10 p-8 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#063B66] flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Our Mission</h3>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">
                  To deliver dependable, transparent and hassle-free global logistics services that empower businesses and individuals to import seamlessly from the UK and China into Ghana — with absolute peace of mind at every step.
                </p>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl min-h-[320px] flex flex-col justify-end group">
              <img
                src={visionImage}
                alt="Our Vision"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/55 to-slate-900/10" />
              <div className="relative z-10 p-8 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B63CE] flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Our Vision</h3>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">
                  To become the most reliable and technologically advanced freight forwarding brand in West Africa — setting the standard for speed, cargo safety, customer service and end-to-end operational transparency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl min-h-[260px] flex items-center p-8 sm:p-14">
          <img
            src={aboutCtaImage}
            alt="Ship with Obrems"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/20" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8 w-full">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Ready to Ship with Obrems?</h2>
              <p className="text-slate-300 text-sm max-w-xl">
                Get a fast, competitive quote or reach out to our team in the UK or Ghana today.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 shrink-0">
              <Link
                to="/quote"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[#063B66] hover:bg-[#0B63CE] text-white font-bold text-sm transition-all shadow-md"
              >
                Get a Quote <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-white/30 bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                Contact Us <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
