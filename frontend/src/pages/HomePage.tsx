import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plane,
  Ship,
  ShieldCheck,
  Package,
  Globe,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeftRight,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import api from '../services/api';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { localImages, localizeImage } from '../utils/localImages';

export default function HomePage() {
  const { settings } = useSiteSettings();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ukGhanaImage = localImages.ukLandmark;
  const chinaGhanaImage = localImages.chinaLandmark;

  const heroImages = [
    {
      url: localizeImage(settings?.heroImageUrl, localImages.heroMain),
      alt: 'OBREMS Global Logistics freight truck'
    },
    {
      url: localizeImage(settings?.heroImageUrl2, localImages.heroSlide2),
      alt: 'UK to Ghana Air Freight aeroplane'
    },
    {
      url: localizeImage(settings?.heroImageUrl3, localImages.heroSlide3),
      alt: 'China to Ghana Sea Freight cargo container ship'
    },
    {
      url: localizeImage(settings?.heroImageUrl4, localImages.heroSlide4),
      alt: 'Courier delivery man holding cardboard parcel box'
    }
  ];

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Please enter a valid tracking number');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/tracking/${trackingNumber.trim()}`);
      setTrackingData(response.data.data);
    } catch (err: any) {
      setTrackingData(null);
      setError(err.response?.data?.message || 'Tracking number not found. Try OGL245678912UK');
    } finally {
      setLoading(false);
    }
  };

  const serviceCards = [
    {
      title: 'UK to Ghana (Air Freight)',
      routeBadge: 'UK to Ghana Air',
      description: 'Express Air (1–3 Days) & Standard Air (3–7 Days) door-to-door shipping to Accra & Kumasi.',
      transitTime: 'Express 1–3 Days | Standard 3–7 Days',
      serviceType: 'Express & Standard Air',
      guarantee: '100% Guaranteed',
      icon: Plane,
      image: localImages.heroSlide2,
      link: '/services',
    },
    {
      title: 'Ghana to UK (Air Freight)',
      routeBadge: 'Ghana to UK Air',
      description: 'Express Air (1–3 Days) & Standard Air (3–7 Days) dispatch from Accra & Kumasi to the UK.',
      transitTime: 'Express 1–3 Days | Standard 3–7 Days',
      serviceType: 'Express & Standard Air',
      guarantee: '100% Guaranteed',
      icon: Plane,
      image: localImages.aircraft,
      link: '/services',
    },
    {
      title: 'China to Ghana (Sea Freight)',
      routeBadge: 'China to Ghana Sea',
      description: 'Economical ocean container shipping (FCL/LCL) from major China ports to Tema & Accra.',
      transitTime: '25 – 35 Days',
      serviceType: 'FCL & LCL Containers',
      guarantee: '100% Guaranteed',
      icon: Ship,
      image: localImages.heroSlide3,
      link: '/services',
    },
  ];

  return (
    <main className="bg-[#F4F7FA] text-[#172B3A]">
      {settings?.advertBanner?.enabled && (settings.advertBanner.title || settings.advertBanner.text) && (
        <section className="border-b border-slate-200 bg-white">
          <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4">
            {settings.advertBanner.imageUrl && <img src={settings.advertBanner.imageUrl} alt="" className="h-14 w-24 rounded-lg object-cover" />}
            <div><p className="text-sm font-extrabold text-[#063B66]">{settings.advertBanner.title}</p><p className="mt-1 text-xs text-slate-600">{settings.advertBanner.text}</p></div>
            {settings.advertBanner.buttonText && settings.advertBanner.buttonUrl && <a href={settings.advertBanner.buttonUrl} className="inline-flex items-center gap-2 rounded-lg bg-[#063B66] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B63CE]"><span>{settings.advertBanner.buttonText}</span><ArrowRight className="h-4 w-4" /></a>}
          </div>
        </section>
      )}
      {/* HERO SECTION */}
      <section className="relative text-white pt-20 pb-28 overflow-hidden min-h-[500px] flex items-center">
        {/* Background Images Auto Slider without Blue Overlay */}
        {heroImages.map((hero, idx) => (
          <div
            key={hero.url}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              idx === currentHeroIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={{ backgroundImage: `url('${hero.url}')` }}
          />
        ))}

        {/* Clean Neutral Dark Overlay (No Blue Tint) */}
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-y-0 left-0 w-full md:w-2/3 bg-gradient-to-r from-slate-950/75 via-slate-950/35 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl py-8">
            {/* Top Subtitle Tag */}
            <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-slate-300 mb-8">
              {settings.homepageHero?.subtitle || settings.heroSubtitle}
            </span>

            {/* Main Headline formatted on 2 clean lines */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white mb-8">
              {settings.homepageHero?.headline || settings.heroHeadline}
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl text-slate-200 font-normal leading-relaxed mb-12 max-w-2xl">
              {settings.homepageHero?.description || settings.heroSubtitle}
            </p>

            {/* Hero CTA Buttons */}
            <div className="flex flex-wrap items-center gap-6 mb-14">
              <Link
                to="/tracking"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-lg bg-slate-100 text-slate-950 text-sm font-semibold hover:bg-white transition-colors shadow-md"
              >
                <Package className="w-4 h-4 text-[#0B63CE]" />
                <span>Track Shipment</span>
              </Link>
              <Link
                to="/quote"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-lg border border-white/30 bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Get a Quote</span>
              </Link>
            </div>

            {/* Slide indicators */}
            <div className="flex items-center gap-2">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentHeroIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === currentHeroIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3 FEATURE SERVICE CARDS - FULL OVERLAY BANNER IMAGES */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {serviceCards.map((card) => {
            const IconComp = card.icon;
            return (
              <div
                key={card.title}
                className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 min-h-[360px] flex flex-col justify-between group"
              >
                {/* Background Image */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Dark Gradient Overlay for perfect text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/55 to-slate-900/10" />

                {/* Top Badge / Icon */}
                <div className="relative z-10 p-6 flex justify-between items-start">
                  <div className="w-10 h-10 flex items-center justify-center text-white">
                    <IconComp className="w-6 h-6 stroke-[2]" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">
                    {card.routeBadge}
                  </span>
                </div>

                {/* Content Overlayed directly on Image without background box */}
                <div className="relative z-10 p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white tracking-tight">{card.title}</h3>
                    <p className="text-sm text-slate-200 leading-relaxed font-normal">{card.description}</p>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={card.link}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#063B66] hover:bg-[#0B63CE] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-white border-y border-slate-200 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="flex items-center gap-4 justify-center py-2">
              <Package className="w-8 h-8 text-[#0B63CE] shrink-0" />
              <div>
                <p className="text-2xl font-extrabold text-[#063B66]">500+</p>
                <p className="text-xs font-semibold text-slate-500">Shipments Delivered</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center py-2">
              <Globe className="w-8 h-8 text-[#0B63CE] shrink-0" />
              <div>
                <p className="text-2xl font-extrabold text-[#063B66]">2</p>
                <p className="text-xs font-semibold text-slate-500">Major Routes</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center py-2">
              <Users className="w-8 h-8 text-[#0B63CE] shrink-0" />
              <div>
                <p className="text-2xl font-extrabold text-[#063B66]">1000+</p>
                <p className="text-xs font-semibold text-slate-500">Happy Customers</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center py-2">
              <Calendar className="w-8 h-8 text-[#0B63CE] shrink-0" />
              <div>
                <p className="text-2xl font-extrabold text-[#063B66]">10+</p>
                <p className="text-xs font-semibold text-slate-500">Years of Experience</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center py-2 col-span-2 md:col-span-1">
              <ShieldCheck className="w-8 h-8 text-[#0B63CE] shrink-0" />
              <div>
                <p className="text-2xl font-extrabold text-[#063B66]">99%</p>
                <p className="text-xs font-semibold text-slate-500">On-Time Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT OBREMS GLOBAL LOGISTICS SECTION - FULL IMAGE OVERLAY BANNER */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl min-h-[480px] flex items-center p-8 sm:p-14">
          {/* Background Image */}
          <img
            src={localImages.tracking}
            alt="Warehouse & Freight Logistics"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/20" />

          {/* Content Overlayed directly on Image */}
          <div className="relative z-10 max-w-2xl space-y-6 text-white">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-[0.25em] mb-2 block">
                ABOUT OBREMS GLOBAL LOGISTICS
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Your Trusted Logistics Partner
              </h2>
            </div>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-normal">
              OBREMS GLOBAL LOGISTICS is a leading international shipping and freight forwarding company. We provide reliable, efficient and cost-effective shipping solutions from the UK and China to Ghana.
            </p>
            <p className="text-slate-200 text-sm leading-relaxed font-normal">
              We are committed to speed, safety and customer satisfaction every step of the way.
            </p>

            {/* Checklist */}
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              {[
                'Real-time shipment tracking',
                'Secure handling of your goods',
                'Competitive rates',
                'Dedicated customer support',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-100">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg bg-[#063B66] hover:bg-[#0B63CE] text-white font-bold text-sm transition-all shadow-md"
              >
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR ROUTES SECTION */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#0B63CE] uppercase tracking-[0.2em]">
              POPULAR ROUTES
            </span>
            <h2 className="text-3xl font-extrabold text-[#063B66] mt-2">
              Our Major Shipping Routes
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Route Card 1: UK ↔ Ghana */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 min-h-[400px] flex flex-col justify-between group">
              <img
                src={ukGhanaImage}
                alt="UK Ghana Route"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                onError={(e) => {
                  e.currentTarget.src = localImages.airport;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/55 to-slate-900/10 pointer-events-none" />

              {/* Header inside Card Overlay */}
              <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    UK <ArrowLeftRight className="w-5 h-5 text-sky-400" /> Ghana
                  </h3>
                </div>
                <span className="text-sky-400 text-xs font-bold uppercase tracking-wider bg-black/40 px-3 py-1 rounded-full">
                  Air Freight
                </span>
              </div>

              {/* Spec Details overlayed directly on Image */}
              <div className="relative z-10 p-6 sm:p-8 space-y-3">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 font-medium">Fast Transit Time</span>
                    <span className="font-bold text-white">Express 1–3 Days | Standard 3–7 Days</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2.5 border-t border-white/10">
                    <span className="text-slate-300 font-medium">Reliable Service</span>
                    <span className="font-bold text-white">Express &amp; Standard Air</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2.5 border-t border-white/10">
                    <span className="text-slate-300 font-medium">Safe &amp; Secure</span>
                    <span className="font-bold text-sky-400">100% Guaranteed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Route Card 2: China -> Ghana */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 min-h-[400px] flex flex-col justify-between group">
              <img
                src={chinaGhanaImage}
                alt="China Ghana Route"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                onError={(e) => {
                  e.currentTarget.src = localImages.airport;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/55 to-slate-900/10 pointer-events-none" />

              {/* Header inside Card Overlay */}
              <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">China → Ghana</h3>
                </div>
                <span className="text-sky-400 text-xs font-bold uppercase tracking-wider bg-black/40 px-3 py-1 rounded-full">
                  Sea Freight
                </span>
              </div>

              {/* Spec Details overlayed directly on Image */}
              <div className="relative z-10 p-6 sm:p-8 space-y-3">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 font-medium">Ocean Transit Time</span>
                    <span className="font-bold text-white">25 – 35 Days</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2.5 border-t border-white/10">
                    <span className="text-slate-300 font-medium">Cost Effective</span>
                    <span className="font-bold text-white">Best Market Rates</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2.5 border-t border-white/10">
                    <span className="text-slate-300 font-medium">Door-to-Door Delivery</span>
                    <span className="font-bold text-sky-400">Nationwide</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-[#063B66] text-white text-sm font-semibold hover:bg-[#0B63CE] transition-colors shadow-sm"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
