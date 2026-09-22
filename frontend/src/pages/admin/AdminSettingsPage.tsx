import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  Save,
  Globe,
  Phone,
  MapPin,
  Building2,
  Image as ImageIcon,
  Bell,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Building,
  Landmark,
  Smartphone,
  TrendingUp,
  FileText,
  Layout
} from 'lucide-react';
import api from '../../services/api';
import ImageUploader from '../../components/admin/ImageUploader';
import { refreshSiteSettings } from '../../hooks/useSiteSettings';

const SECTIONS = [
  { key: 'company', label: 'Company & Branding', icon: Building2 },
  { key: 'payment', label: 'Payment & Banking', icon: CreditCard },
  { key: 'contact', label: 'Contact Settings', icon: Phone },
  { key: 'content', label: 'Website Content', icon: Layout },
  { key: 'images', label: 'Images & Media', icon: ImageIcon },
  { key: 'offices', label: 'Office Locations', icon: MapPin },
  { key: 'social', label: 'Social Media', icon: Globe },
  { key: 'currencyRates', label: 'Currency Rates', icon: TrendingUp },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: ShieldCheck },
];

const inputClass =
  'w-full px-3.5 py-2.5 bg-[#F4F7FA] border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:bg-white transition-colors';
const labelClass = 'text-[11px] font-bold text-slate-600 uppercase tracking-wider';

export default function AdminSettingsPage() {
  const { register, handleSubmit, reset, watch, setValue, control } = useForm();
  const { fields: officeFields, append: appendOffice, remove: removeOffice } = useFieldArray({ control, name: 'officeLocations' });
  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({ control, name: 'contactMethods' });
  const [success, setSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeSection, setActiveSection] = useState('company');
  const [fetchingRates, setFetchingRates] = useState(false);
  const [ratesMessage, setRatesMessage] = useState('');
  const [currentRates, setCurrentRates] = useState<any>({
    GBP_GHS: 15.20,
    GBP_CNY: 9.10,
    GBP_USD: 1.27,
    GBP_EUR: 1.17,
    GHS_CNY: 0.60,
    GHS_USD: 0.084,
    CNY_GHS: 1.67,
    CNY_GBP: 0.11,
    USD_GHS: 11.90,
    USD_GBP: 0.79,
    EUR_GBP: 0.85,
    EUR_GHS: 12.95,
    EUR_CNY: 7.78,
  });

  const handleFetchLiveRates = async () => {
    setFetchingRates(true);
    setRatesMessage('');
    try {
      const resGbp = await fetch('https://open.er-api.com/v6/latest/GBP');
      if (!resGbp.ok) throw new Error('Failed to fetch GBP rates');
      const dataGbp = await resGbp.json();
      
      const rates = dataGbp.rates || {};
      const gbp_usd = rates.USD || 1.27;
      const gbp_ghs = rates.GHS || 15.20;
      const gbp_cny = rates.CNY || 9.10;
      const gbp_eur = rates.EUR || 1.17;

      const resUsd = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!resUsd.ok) throw new Error('Failed to fetch USD rates');
      const dataUsd = await resUsd.json();
      const usdRates = dataUsd.rates || {};
      const usd_ghs = usdRates.GHS || 11.90;
      const usd_gbp = usdRates.GBP || 0.79;

      const resCny = await fetch('https://open.er-api.com/v6/latest/CNY');
      if (!resCny.ok) throw new Error('Failed to fetch CNY rates');
      const dataCny = await resCny.json();
      const cnyRates = dataCny.rates || {};
      const cny_ghs = cnyRates.GHS || 1.67;
      const cny_gbp = cnyRates.GBP || 0.11;
      const cny_eur = cnyRates.EUR || 0.129;

      const ghs_cny = parseFloat((gbp_cny / gbp_ghs).toFixed(4)) || 0.60;
      const ghs_usd = parseFloat((gbp_usd / gbp_ghs).toFixed(4)) || 0.084;
      const eur_gbp = parseFloat((1 / gbp_eur).toFixed(4)) || 0.85;
      const eur_ghs = parseFloat((gbp_ghs / gbp_eur).toFixed(4)) || 12.95;
      const eur_cny = parseFloat((gbp_cny / gbp_eur).toFixed(4)) || 7.78;

      setValue('GBP_GHS', parseFloat(gbp_ghs.toFixed(4)));
      setValue('GBP_CNY', parseFloat(gbp_cny.toFixed(4)));
      setValue('GBP_USD', parseFloat(gbp_usd.toFixed(4)));
      setValue('GBP_EUR', parseFloat(gbp_eur.toFixed(4)));

      setValue('GHS_CNY', ghs_cny);
      setValue('GHS_USD', ghs_usd);

      setValue('CNY_GHS', parseFloat(cny_ghs.toFixed(4)));
      setValue('CNY_GBP', parseFloat(cny_gbp.toFixed(4)));

      setValue('USD_GHS', parseFloat(usd_ghs.toFixed(4)));
      setValue('USD_GBP', parseFloat(usd_gbp.toFixed(4)));
      setValue('EUR_GBP', eur_gbp);
      setValue('EUR_GHS', eur_ghs);
      setValue('EUR_CNY', eur_cny);

      setRatesMessage('Rates fetched successfully! Click "Save All Settings" below to apply.');
      setTimeout(() => setRatesMessage(''), 6000);
    } catch (err) {
      setRatesMessage('Error fetching live rates. Please try again.');
      setTimeout(() => setRatesMessage(''), 4000);
    } finally {
      setFetchingRates(false);
    }
  };

  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        if (res.data?.data) {
          const d = res.data.data;
          reset({
            ...d,
            bankName: d.paymentSettings?.bankName || 'Barclays Bank UK',
            accountName: d.paymentSettings?.accountName || 'OBREMS GLOBAL LOGISTICS LTD',
            accountNumber: d.paymentSettings?.accountNumber || '20491823',
            sortCode: d.paymentSettings?.sortCode || '20-04-15',
            iban: d.paymentSettings?.iban || 'GB29BARC20041520491823',
            swiftBic: d.paymentSettings?.swiftBic || 'BARCGB22',
            mobileMoneyName: d.paymentSettings?.mobileMoneyName || 'OBREMS LOGISTICS GH',
            mobileMoneyNumber: d.paymentSettings?.mobileMoneyNumber || '+233 24 555 9900 (MTN MoMo / Telecel Cash)',
            paymentInstructions: d.paymentSettings?.paymentInstructions || 'Please use your Invoice Number as the reference when making payments.',
            companyRegistrationNumber: d.registrationNumber || 'OGL-REG-847291',
            companyWebsite: d.website || 'https://www.obremsglobal.com',
            companyBillingEmail: d.billingEmail || 'billing@obremsgloballogistics.com',
            companyAddress: d.companyAddress || '123 Logistics Way, London, UK',
            companyCity: d.companyCity || 'London',
            companyCountry: d.companyCountry || 'United Kingdom',
            heroImageUrl: d.heroImageUrl || '',
            logoUrl: d.logoUrl || '',
            faviconUrl: d.faviconUrl || '',
            heroImageUrl2: d.heroImageUrl2 || '',
            heroImageUrl3: d.heroImageUrl3 || '',
            heroImageUrl4: d.heroImageUrl4 || '',
            ctaBannerImageUrl: d.ctaBannerImageUrl || '',
            aboutHeroImageUrl: d.aboutHeroImageUrl || '',
            missionImageUrl: d.missionImageUrl || '',
            visionImageUrl: d.visionImageUrl || '',
            aboutCtaImageUrl: d.aboutCtaImageUrl || '',
            contactHeroImageUrl: d.contactHeroImageUrl || '',
            contactAccraOfficeImageUrl: d.contactAccraOfficeImageUrl || '',
            contactKumasiOfficeImageUrl: d.contactKumasiOfficeImageUrl || '',
            quoteHeroImageUrl: d.quoteHeroImageUrl || '',
            trackHeroImageUrl: d.trackHeroImageUrl || '',
            heroHeadline: d.heroHeadline || 'Expert Shipping Services You Can Trust',
            heroSubtitle: d.heroSubtitle || 'From the UK and China to Ghana by Air, Sea & Air.',
            footerText: d.footerText || 'Reliable international shipping and freight forwarding.',
            aboutText: d.aboutText || 'OBREMS GLOBAL LOGISTICS is a leading international shipping company.',
            homepageHeroHeadline: d.homepageHero?.headline || 'Expert Shipping Services You Can Trust',
            homepageHeroSubtitle: d.homepageHero?.subtitle || 'RELIABLE. FAST. GLOBAL.',
            homepageHeroDescription: d.homepageHero?.description || '',
            homepageHeroButtonText: d.homepageHero?.buttonText || 'Track Shipment',
            homepageHeroSecondaryButtonText: d.homepageHero?.secondaryButtonText || 'Get a Quote',
            homepageHeroTrustText: d.homepageHero?.trustText || '',
            aboutTitle: d.about?.title || 'Delivering Excellence Across Oceans & Skies',
            aboutIntro: d.about?.intro || '',
            aboutMission: d.about?.mission || '',
            aboutVision: d.about?.vision || '',
            servicesTitle: d.servicesPage?.title || 'Expert Shipping Solutions',
            servicesDescription: d.servicesPage?.description || '',
            contactTitle: d.contact?.title || 'Get in Touch With Our Team',
            contactDescription: d.contact?.description || '',
            footerDescription: d.footer?.description || '',
            footerCopyright: d.footer?.copyright || '',
            GBP_GHS: d.currencyRates?.GBP_GHS || 15.20,
            GBP_CNY: d.currencyRates?.GBP_CNY || 9.10,
            GBP_USD: d.currencyRates?.GBP_USD || 1.27,
            GBP_EUR: d.currencyRates?.GBP_EUR || 1.17,
            GHS_CNY: d.currencyRates?.GHS_CNY || 0.60,
            GHS_USD: d.currencyRates?.GHS_USD || 0.084,
            CNY_GHS: d.currencyRates?.CNY_GHS || 1.67,
            CNY_GBP: d.currencyRates?.CNY_GBP || 0.11,
            USD_GHS: d.currencyRates?.USD_GHS || 11.90,
            USD_GBP: d.currencyRates?.USD_GBP || 0.79,
            EUR_GBP: d.currencyRates?.EUR_GBP || 0.85,
            EUR_GHS: d.currencyRates?.EUR_GHS || 12.95,
            EUR_CNY: d.currencyRates?.EUR_CNY || 7.78,
            footerCollapsible: d.footerCollapsible ?? false,
            officeLocations: d.officeLocations || [
              { title: 'UK Office', address: d.officeUk || '', phone: d.contactPhone || '', email: d.contactEmail || '', mapUrl: '' },
              { title: 'Ghana Office', address: d.officeGhana || '', phone: '', email: '', mapUrl: '' },
            ],
            contactMethods: d.contactMethods || [{ title: 'General Enquiries', phone: d.contactPhone || '', email: d.contactEmail || '', whatsapp: d.contactWhatsApp || '' }],
            advertBanner: d.advertBanner || { enabled: false, title: '', text: '', imageUrl: '', buttonText: '', buttonUrl: '' },
          });
          if (d.currencyRates) {
            setCurrentRates({
              GBP_GHS: d.currencyRates.GBP_GHS ?? 15.20,
              GBP_CNY: d.currencyRates.GBP_CNY ?? 9.10,
              GBP_USD: d.currencyRates.GBP_USD ?? 1.27,
              GBP_EUR: d.currencyRates.GBP_EUR ?? 1.17,
              GHS_CNY: d.currencyRates.GHS_CNY ?? 0.60,
              GHS_USD: d.currencyRates.GHS_USD ?? 0.084,
              CNY_GHS: d.currencyRates.CNY_GHS ?? 1.67,
              CNY_GBP: d.currencyRates.CNY_GBP ?? 0.11,
              USD_GHS: d.currencyRates.USD_GHS ?? 11.90,
              USD_GBP: d.currencyRates.USD_GBP ?? 0.79,
              EUR_GBP: d.currencyRates.EUR_GBP ?? 0.85,
              EUR_GHS: d.currencyRates.EUR_GHS ?? 12.95,
              EUR_CNY: d.currencyRates.EUR_CNY ?? 7.78,
            });
          }
        }
      })
      .catch(() => {
        reset({
          companyName: 'OBREMS GLOBAL LOGISTICS',
          registrationNumber: 'OGL-REG-847291',
          website: 'https://www.obremsglobal.com',
          billingEmail: 'billing@obremsgloballogistics.com',
          companyAddress: '123 Logistics Way, London, UK',
          companyCity: 'London',
          companyCountry: 'United Kingdom',
          bankName: 'Barclays Bank UK',
          accountName: 'OBREMS GLOBAL LOGISTICS LTD',
          accountNumber: '20491823',
          sortCode: '20-04-15',
          iban: 'GB29BARC20041520491823',
          swiftBic: 'BARCGB22',
          mobileMoneyName: 'OBREMS LOGISTICS GH',
          mobileMoneyNumber: '+233 24 555 9900 (MTN MoMo / Telecel Cash)',
          paymentInstructions: 'Please use your Invoice Number as payment reference for fast clearance.',
          contactPhone: '+44 7460 554358',
          contactWhatsApp: '+44 7460 554358',
          contactEmail: 'info@obremsgloballogistics.com',
          businessHours: 'Mon – Fri: 9:00 AM – 6:00 PM GMT',
          officeUk: '123 Logistics Way, London, UK',
          officeGhana: 'Accra, Greater Accra Region, Ghana',
          facebookUrl: 'https://facebook.com/obremsglobal',
          instagramUrl: 'https://instagram.com/obremsglobal',
          linkedinUrl: 'https://linkedin.com/company/obremsglobal',
          twitterUrl: 'https://x.com/obremsglobal',
          tiktokUrl: 'https://tiktok.com/@obremsglobal',
          snapchatUrl: 'https://snapchat.com/add/obremsglobal',
          GBP_GHS: 15.20,
          GBP_CNY: 9.10,
          GBP_USD: 1.27,
          GHS_CNY: 0.60,
          GHS_USD: 0.084,
          CNY_GHS: 1.67,
          CNY_GBP: 0.11,
          USD_GHS: 11.90,
          USD_GBP: 0.79,
          footerCollapsible: false,
        });
      });
  }, [reset]);

  const onSubmit = async (data: any) => {
    try {
      const ensureHttp = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
      };

      const payload = {
        ...data,
        facebookUrl: ensureHttp(data.facebookUrl),
        instagramUrl: ensureHttp(data.instagramUrl),
        linkedinUrl: ensureHttp(data.linkedinUrl),
        twitterUrl: ensureHttp(data.twitterUrl),
        youtubeUrl: ensureHttp(data.youtubeUrl),
        tiktokUrl: ensureHttp(data.tiktokUrl),
        snapchatUrl: ensureHttp(data.snapchatUrl),
        registrationNumber: data.companyRegistrationNumber || data.registrationNumber,
        website: data.companyWebsite || data.website,
        billingEmail: data.companyBillingEmail || data.billingEmail,
        footerCollapsible: data.footerCollapsible,
        logoUrl: data.logoUrl,
        faviconUrl: data.faviconUrl,
        heroImageUrl: data.heroImageUrl,
        heroImageUrl2: data.heroImageUrl2,
        heroImageUrl3: data.heroImageUrl3,
        heroImageUrl4: data.heroImageUrl4,
        ctaBannerImageUrl: data.ctaBannerImageUrl,
        aboutHeroImageUrl: data.aboutHeroImageUrl,
        missionImageUrl: data.missionImageUrl,
        visionImageUrl: data.visionImageUrl,
        aboutCtaImageUrl: data.aboutCtaImageUrl,
        contactHeroImageUrl: data.contactHeroImageUrl,
        contactAccraOfficeImageUrl: data.contactAccraOfficeImageUrl,
        contactKumasiOfficeImageUrl: data.contactKumasiOfficeImageUrl,
        quoteHeroImageUrl: data.quoteHeroImageUrl,
        trackHeroImageUrl: data.trackHeroImageUrl,
        heroHeadline: data.heroHeadline,
        heroSubtitle: data.heroSubtitle,
        footerText: data.footerText,
        aboutText: data.aboutText,
        homepageHero: {
          headline: data.homepageHeroHeadline,
          subtitle: data.homepageHeroSubtitle,
          description: data.homepageHeroDescription,
          buttonText: data.homepageHeroButtonText,
          secondaryButtonText: data.homepageHeroSecondaryButtonText,
          trustText: data.homepageHeroTrustText,
        },
        about: {
          title: data.aboutTitle,
          intro: data.aboutIntro,
          mission: data.aboutMission,
          vision: data.aboutVision,
        },
        servicesPage: {
          title: data.servicesTitle,
          description: data.servicesDescription,
        },
        contact: {
          title: data.contactTitle,
          description: data.contactDescription,
        },
        footer: {
          description: data.footerDescription,
          copyright: data.footerCopyright,
        },
        officeLocations: data.officeLocations || [],
        contactMethods: data.contactMethods || [],
        advertBanner: data.advertBanner || { enabled: false, title: '', text: '', imageUrl: '', buttonText: '', buttonUrl: '' },
        paymentSettings: {
          bankName: data.bankName,
          accountName: data.accountName,
          accountNumber: data.accountNumber,
          sortCode: data.sortCode,
          iban: data.iban,
          swiftBic: data.swiftBic,
          mobileMoneyName: data.mobileMoneyName,
          mobileMoneyNumber: data.mobileMoneyNumber,
          paymentInstructions: data.paymentInstructions,
        },
        currencyRates: {
          GBP_GHS: parseFloat(data.GBP_GHS) || 0,
          GBP_CNY: parseFloat(data.GBP_CNY) || 0,
          GBP_USD: parseFloat(data.GBP_USD) || 0,
          GBP_EUR: parseFloat(data.GBP_EUR) || 0,
          GHS_CNY: parseFloat(data.GHS_CNY) || 0,
          GHS_USD: parseFloat(data.GHS_USD) || 0,
          CNY_GHS: parseFloat(data.CNY_GHS) || 0,
          CNY_GBP: parseFloat(data.CNY_GBP) || 0,
          USD_GHS: parseFloat(data.USD_GHS) || 0,
          USD_GBP: parseFloat(data.USD_GBP) || 0,
          EUR_GBP: parseFloat(data.EUR_GBP) || 0,
          EUR_GHS: parseFloat(data.EUR_GHS) || 0,
          EUR_CNY: parseFloat(data.EUR_CNY) || 0,
          lastUpdated: new Date().toISOString(),
        },
      };

      await api.put('/settings', payload);
      await refreshSiteSettings();
      setCurrentRates(payload.currencyRates);
      setSuccess('Business & Payment Settings saved successfully! All generated invoices will use these updated details.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to save settings');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const logoUrlPreview = watch('logoUrl');

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Uniform Page Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#063B66]/10 flex items-center justify-center text-[#063B66]">
            <Save className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#063B66]">Business & System Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage company identity, banking details, invoices configuration, and contacts</p>
          </div>
        </div>
        {success && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-700 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            {success}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-700 shadow-sm animate-in fade-in">
            {errorMsg}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-60 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold transition-colors border-b border-slate-100 last:border-0 ${
                    activeSection === s.key
                      ? 'bg-[#063B66] text-white font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    {s.label}
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${activeSection === s.key ? 'text-white' : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Company & Branding */}
            {activeSection === 'company' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#063B66]/10 text-[#063B66] flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#063B66]">Company Information & Branding</h3>
                    <p className="text-[11px] text-slate-400">Dynamic company data appearing on invoices, headers and legal documents</p>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className={labelClass}>Company Registered Name *</label>
                    <input {...register('companyName')} placeholder="OBREMS GLOBAL LOGISTICS" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Company Registration Number *</label>
                    <input {...register('companyRegistrationNumber')} placeholder="OGL-REG-847291" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Official Website URL</label>
                    <input {...register('companyWebsite')} placeholder="https://www.obremsglobal.com" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Billing & Invoicing Email *</label>
                    <input {...register('companyBillingEmail')} placeholder="billing@obremsgloballogistics.com" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>General Support Email</label>
                    <input {...register('supportEmail')} placeholder="support@obremsgloballogistics.com" className={inputClass} />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className={labelClass}>Head Office Address *</label>
                    <input {...register('companyAddress')} placeholder="123 Logistics Way, London, UK" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>City *</label>
                    <input {...register('companyCity')} placeholder="London" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Country *</label>
                    <input {...register('companyCountry')} placeholder="United Kingdom" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Official Phone Number *</label>
                    <input {...register('contactPhone')} placeholder="+44 7460 554358" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Official WhatsApp Line *</label>
                    <input {...register('contactWhatsApp')} placeholder="+44 7460 554358" className={inputClass} />
                  </div>
                  <div className="md:col-span-2 space-y-2 pt-2 border-t border-slate-100">
                    <label className={labelClass}>Company Logo URL</label>
                    <p className="text-[11px] text-slate-400">Displayed at the top-left of the invoice header. Leave empty to use default vector badge.</p>
                    <input {...register('logoUrl')} placeholder="https://your-domain.com/logo.png" className={inputClass} />
                    {logoUrlPreview && (
                      <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg inline-flex items-center gap-3">
                        <img src={logoUrlPreview} alt="Logo Preview" className="h-10 object-contain max-w-[160px]" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Live Invoice Logo Preview</span>
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 pt-2 border-t border-slate-100">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" {...register('footerCollapsible')} className="mt-1 w-4 h-4 text-[#0B63CE] border-slate-200 rounded focus:ring-[#0B63CE]" />
                      <div>
                        <span className="text-xs font-bold text-[#063B66]">Enable Collapsible Sitemap Footer</span>
                        <p className="text-[11px] text-slate-400">If checked, the main sitemap links and contact blocks in the footer will be collapsed by default behind an "Explore Sitemap & Contact" button on the customer-facing website pages. If unchecked, the sitemap is always fully visible.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Payment & Banking Settings */}
            {activeSection === 'payment' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#063B66]/10 text-[#063B66] flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#063B66]">Payment Details & Banking Settings</h3>
                    <p className="text-[11px] text-slate-400">Dynamic bank information and mobile money instructions printed on customer invoices</p>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Bank Details Sub-card */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#063B66]">
                      <Landmark className="w-4 h-4 text-[#0B63CE]" />
                      <span>Primary Bank Account Information (UK / International)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className={labelClass}>Bank Name *</label>
                        <input {...register('bankName')} placeholder="Barclays Bank UK" className={inputClass} />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Account Name *</label>
                        <input {...register('accountName')} placeholder="OBREMS GLOBAL LOGISTICS LTD" className={inputClass} />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Account Number *</label>
                        <input {...register('accountNumber')} placeholder="20491823" className={inputClass} />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Sort Code *</label>
                        <input {...register('sortCode')} placeholder="20-04-15" className={inputClass} />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>IBAN (Optional)</label>
                        <input {...register('iban')} placeholder="GB29BARC20041520491823" className={inputClass} />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>SWIFT / BIC (Optional)</label>
                        <input {...register('swiftBic')} placeholder="BARCGB22" className={inputClass} />
                      </div>
                    </div>
                  </div>

                  {/* Mobile Money Sub-card */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#063B66]">
                      <Smartphone className="w-4 h-4 text-[#0B63CE]" />
                      <span>Ghana Mobile Money Details</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className={labelClass}>Mobile Money Merchant / Account Name</label>
                        <input {...register('mobileMoneyName')} placeholder="OBREMS LOGISTICS GH" className={inputClass} />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>MoMo Number &amp; Networks</label>
                        <input {...register('mobileMoneyNumber')} placeholder="+233 24 555 9900 (MTN MoMo / Telecel Cash)" className={inputClass} />
                      </div>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="space-y-1.5">
                    <label className={labelClass}>Payment Instructions &amp; Reference Policy</label>
                    <textarea
                      {...register('paymentInstructions')}
                      rows={3}
                      placeholder="Please include your Invoice Number (e.g., OGL-INV-2026-000001) as the reference..."
                      className={`${inputClass} resize-none`}
                    />
                    <p className="text-[11px] text-slate-400">This instruction note is automatically displayed inside the Payment Details box on all customer invoice documents.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Settings */}
            {activeSection === 'contact' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#063B66]">Contact Settings</h3>
                    <p className="text-[11px] text-slate-400">Public contact information shown on your website</p>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className={labelClass}>Contact Phone</label>
                    <input {...register('contactPhone')} placeholder="+44 7460 554358" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>WhatsApp Number</label>
                    <input {...register('contactWhatsApp')} placeholder="+44 7460 554358" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Email Address</label>
                    <input {...register('contactEmail')} placeholder="info@obremsgloballogistics.com" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Business Hours</label>
                    <input {...register('businessHours')} placeholder="Mon – Fri: 9:00 AM – 6:00 PM GMT" className={inputClass} />
                  </div>
                </div>
              </div>
            )}

            {/* Office Locations */}
            {activeSection === 'offices' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#063B66]">Office Locations</h3>
                    <p className="text-[11px] text-slate-400">Your UK, China and Ghana office addresses</p>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  {officeFields.map((field, index) => (
                    <div key={field.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                      <div className="flex items-center justify-between"><span className="text-xs font-bold text-[#063B66]">Office {index + 1}</span><button type="button" onClick={() => removeOffice(index)} className="text-xs font-bold text-rose-600 hover:underline">Remove</button></div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <input {...register(`officeLocations.${index}.title`)} placeholder="Office title" className={inputClass} />
                        <input {...register(`officeLocations.${index}.address`)} placeholder="Full office address" className={inputClass} />
                        <input {...register(`officeLocations.${index}.phone`)} placeholder="Office phone" className={inputClass} />
                        <input {...register(`officeLocations.${index}.email`)} placeholder="Office email" className={inputClass} />
                        <input {...register(`officeLocations.${index}.mapUrl`)} placeholder="Google Maps URL" className={`${inputClass} md:col-span-2`} />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => appendOffice({ title: '', address: '', phone: '', email: '', mapUrl: '' })} className="rounded-lg border border-[#0B63CE] px-4 py-2 text-xs font-bold text-[#0B63CE] hover:bg-[#0B63CE] hover:text-white">+ Add Office Location</button>
                  <div className="border-t border-slate-200 pt-5 space-y-3"><div className="flex items-center justify-between"><h4 className="text-xs font-bold uppercase tracking-wider text-[#063B66]">Contact Lines</h4><button type="button" onClick={() => appendContact({ title: '', phone: '', email: '', whatsapp: '' })} className="text-xs font-bold text-[#0B63CE]">+ Add Contact</button></div>{contactFields.map((field, index) => <div key={field.id} className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2"><input {...register(`contactMethods.${index}.title`)} placeholder="Contact title" className={inputClass} /><input {...register(`contactMethods.${index}.phone`)} placeholder="Phone" className={inputClass} /><input {...register(`contactMethods.${index}.email`)} placeholder="Email" className={inputClass} /><input {...register(`contactMethods.${index}.whatsapp`)} placeholder="WhatsApp" className={inputClass} /><button type="button" onClick={() => removeContact(index)} className="text-left text-xs font-bold text-rose-600 hover:underline">Remove contact</button></div>)}</div>
                  <div className="border-t border-slate-200 pt-5 space-y-3"><h4 className="text-xs font-bold uppercase tracking-wider text-[#063B66]">Google Maps Heading</h4><input {...register('contact.mapTitle')} placeholder="Find an Obrems office" className={inputClass} /><input {...register('contact.mapUrl')} placeholder="Default Google Maps embed or location URL" className={inputClass} /></div>
                </div>
              </div>
            )}

            {/* Images & Media */}
            {activeSection === 'images' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#063B66]">Images & Media</h3>
                    <p className="text-[11px] text-slate-400">Upload or paste URLs for all website images. Changes are reflected live on the public site after saving.</p>
                  </div>
                </div>
                <div className="p-6 space-y-8">
                  <div>
                    <h4 className="text-xs font-bold text-[#063B66] uppercase tracking-wider mb-4 flex items-center gap-2"><span className="w-5 h-0.5 bg-[#0B63CE] inline-block" />Branding Images</h4>
                    <div className="space-y-5">
                      <ImageUploader label="Company Logo" fieldName="logoUrl" currentUrl={watch('logoUrl') || ''} onChange={(url) => setValue('logoUrl', url)} hint="Main logo displayed in the navbar and footer. Best size: 200x50px transparent PNG." />
                      <ImageUploader label="Favicon" fieldName="faviconUrl" currentUrl={watch('faviconUrl') || ''} onChange={(url) => setValue('faviconUrl', url)} hint="Small icon displayed in the browser tab. Best size: 32x32px or 64x64px." />
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-xs font-bold text-[#063B66] uppercase tracking-wider mb-4 flex items-center gap-2"><span className="w-5 h-0.5 bg-[#0B63CE] inline-block" />Homepage Hero Slides</h4>
                    <div className="space-y-5">
                      <ImageUploader label="Hero Slide 1 (Main)" fieldName="heroImageUrl" currentUrl={watch('heroImageUrl') || ''} onChange={(url) => setValue('heroImageUrl', url)} hint="Shown as the first slide in the homepage hero carousel." />
                      <ImageUploader label="Hero Slide 2" fieldName="heroImageUrl2" currentUrl={watch('heroImageUrl2') || ''} onChange={(url) => setValue('heroImageUrl2', url)} hint="Second slide in the hero carousel." />
                      <ImageUploader label="Hero Slide 3" fieldName="heroImageUrl3" currentUrl={watch('heroImageUrl3') || ''} onChange={(url) => setValue('heroImageUrl3', url)} hint="Third slide in the hero carousel." />
                      <ImageUploader label="Hero Slide 4" fieldName="heroImageUrl4" currentUrl={watch('heroImageUrl4') || ''} onChange={(url) => setValue('heroImageUrl4', url)} hint="Fourth slide in the hero carousel." />
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-xs font-bold text-[#063B66] uppercase tracking-wider mb-4 flex items-center gap-2"><span className="w-5 h-0.5 bg-[#0B63CE] inline-block" />About Page Images</h4>
                    <div className="space-y-5">
                      <ImageUploader label="About Hero Banner" fieldName="aboutHeroImageUrl" currentUrl={watch('aboutHeroImageUrl') || ''} onChange={(url) => setValue('aboutHeroImageUrl', url)} hint="Full-width hero banner on the About page." />
                      <ImageUploader label="Mission Card Image" fieldName="missionImageUrl" currentUrl={watch('missionImageUrl') || ''} onChange={(url) => setValue('missionImageUrl', url)} hint="Background image for the Mission card." />
                      <ImageUploader label="Vision Card Image" fieldName="visionImageUrl" currentUrl={watch('visionImageUrl') || ''} onChange={(url) => setValue('visionImageUrl', url)} hint="Background image for the Vision card." />
                      <ImageUploader label="About CTA Banner" fieldName="aboutCtaImageUrl" currentUrl={watch('aboutCtaImageUrl') || ''} onChange={(url) => setValue('aboutCtaImageUrl', url)} hint="Background for the Call-to-Action section at the bottom of the About page." />
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-xs font-bold text-[#063B66] uppercase tracking-wider mb-4 flex items-center gap-2"><span className="w-5 h-0.5 bg-[#0B63CE] inline-block" />Contact & Other Pages</h4>
                    <div className="space-y-5">
                      <ImageUploader label="Contact Page Hero" fieldName="contactHeroImageUrl" currentUrl={watch('contactHeroImageUrl') || ''} onChange={(url) => setValue('contactHeroImageUrl', url)} hint="Hero banner on the Contact page." />
                      <ImageUploader label="Accra Office Image" fieldName="contactAccraOfficeImageUrl" currentUrl={watch('contactAccraOfficeImageUrl') || ''} onChange={(url) => setValue('contactAccraOfficeImageUrl', url)} hint="Photo shown for the Accra office card." />
                      <ImageUploader label="Kumasi Office Image" fieldName="contactKumasiOfficeImageUrl" currentUrl={watch('contactKumasiOfficeImageUrl') || ''} onChange={(url) => setValue('contactKumasiOfficeImageUrl', url)} hint="Photo shown for the Kumasi office card." />
                      <ImageUploader label="Tracking Page Hero" fieldName="trackHeroImageUrl" currentUrl={watch('trackHeroImageUrl') || ''} onChange={(url) => setValue('trackHeroImageUrl', url)} hint="Hero image on the Shipment Tracking page." />
                      <ImageUploader label="Quote Page Hero" fieldName="quoteHeroImageUrl" currentUrl={watch('quoteHeroImageUrl') || ''} onChange={(url) => setValue('quoteHeroImageUrl', url)} hint="Hero image on the Get a Quote page." />
                      <ImageUploader label="CTA Banner Image" fieldName="ctaBannerImageUrl" currentUrl={watch('ctaBannerImageUrl') || ''} onChange={(url) => setValue('ctaBannerImageUrl', url)} hint="Background for the main CTA/promo section." />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Website Content */}
            {activeSection === 'content' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3"><Bell className="w-4 h-4 text-[#0B63CE]" /><div><h3 className="text-sm font-extrabold text-[#063B66]">Advert Banner</h3><p className="text-[11px] text-slate-400">Create a promotional banner for the homepage.</p></div></div>
                  <div className="p-6 grid grid-cols-1 gap-4 md:grid-cols-2"><label className="flex items-center gap-2 text-xs font-bold text-[#063B66] md:col-span-2"><input type="checkbox" {...register('advertBanner.enabled')} className="h-4 w-4" /> Show advert banner</label><input {...register('advertBanner.title')} placeholder="Advert title" className={inputClass} /><input {...register('advertBanner.text')} placeholder="Advert message" className={inputClass} /><input {...register('advertBanner.buttonText')} placeholder="Button text" className={inputClass} /><input {...register('advertBanner.buttonUrl')} placeholder="Button URL" className={inputClass} /><input {...register('advertBanner.imageUrl')} placeholder="Banner image URL (optional)" className={`${inputClass} md:col-span-2`} /></div>
                </div>
                {/* Homepage Content */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#063B66]/10 text-[#063B66] flex items-center justify-center">
                      <Layout className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#063B66]">Homepage Content</h3>
                      <p className="text-[11px] text-slate-400">Edit the hero banner text, CTAs and trust tagline shown on the homepage</p>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className={labelClass}>Hero Main Headline *</label>
                      <input {...register('homepageHeroHeadline')} placeholder="Expert Shipping Services You Can Trust" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Hero Subtitle / Tagline</label>
                      <input {...register('homepageHeroSubtitle')} placeholder="RELIABLE. FAST. GLOBAL." className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Trust Text (below headline)</label>
                      <input {...register('homepageHeroTrustText')} placeholder="Trusted by businesses and families across Ghana and the UK." className={inputClass} />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className={labelClass}>Hero Description Paragraph</label>
                      <textarea {...register('homepageHeroDescription')} rows={2} placeholder="UK → Ghana, Ghana → UK and China → Ghana freight solutions..." className={`${inputClass} resize-none`} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Primary Button Text</label>
                      <input {...register('homepageHeroButtonText')} placeholder="Track Shipment" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Secondary Button Text</label>
                      <input {...register('homepageHeroSecondaryButtonText')} placeholder="Get a Quote" className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* About Page Content */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#063B66]/10 text-[#063B66] flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#063B66]">About Page Content</h3>
                      <p className="text-[11px] text-slate-400">Edit the About page headline, company story and mission/vision statements</p>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className={labelClass}>About Page Headline *</label>
                      <input {...register('aboutTitle')} placeholder="Delivering Excellence Across Oceans & Skies" className={inputClass} />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className={labelClass}>About Intro Paragraph</label>
                      <textarea {...register('aboutIntro')} rows={2} placeholder="OBREMS GLOBAL LOGISTICS provides reliable shipping solutions..." className={`${inputClass} resize-none`} />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className={labelClass}>Full About Text</label>
                      <textarea {...register('aboutText')} rows={3} placeholder="OBREMS GLOBAL LOGISTICS is a leading international shipping..." className={`${inputClass} resize-none`} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Mission Statement</label>
                      <textarea {...register('aboutMission')} rows={3} placeholder="To deliver dependable, transparent global logistics services..." className={`${inputClass} resize-none`} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Vision Statement</label>
                      <textarea {...register('aboutVision')} rows={3} placeholder="To become the most reliable freight forwarding brand..." className={`${inputClass} resize-none`} />
                    </div>
                  </div>
                </div>

                {/* Services & Contact Content */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#063B66]/10 text-[#063B66] flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#063B66]">Services & Contact Page Copy</h3>
                      <p className="text-[11px] text-slate-400">Headlines and descriptions for the Services and Contact pages</p>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className={labelClass}>Services Page Title</label>
                      <input {...register('servicesTitle')} placeholder="Expert Shipping Solutions" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Contact Page Title</label>
                      <input {...register('contactTitle')} placeholder="Get in Touch With Our Team" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Services Page Description</label>
                      <textarea {...register('servicesDescription')} rows={2} placeholder="Air freight, sea cargo, customs clearance..." className={`${inputClass} resize-none`} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Contact Page Description</label>
                      <textarea {...register('contactDescription')} rows={2} placeholder="Questions about freight and customs support?..." className={`${inputClass} resize-none`} />
                    </div>
                  </div>
                </div>

                {/* Footer Content */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#063B66]/10 text-[#063B66] flex items-center justify-center">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#063B66]">Footer Content</h3>
                      <p className="text-[11px] text-slate-400">The footer description and copyright notice shown site-wide</p>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-1 gap-5">
                    <div className="space-y-1.5">
                      <label className={labelClass}>Footer Description</label>
                      <textarea {...register('footerDescription')} rows={2} placeholder="Reliable international shipping and freight forwarding..." className={`${inputClass} resize-none`} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Copyright Text</label>
                      <input {...register('footerCopyright')} placeholder="© 2026 OBREMS GLOBAL LOGISTICS. All Rights Reserved." className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Footer Tagline (short description)</label>
                      <input {...register('footerText')} placeholder="Reliable international shipping from the UK and China to Ghana." className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Social Media */}
            {activeSection === 'social' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#063B66]">Social Media</h3>
                    <p className="text-[11px] text-slate-400">Your social media profile links for footer &amp; correspondence</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { key: 'facebookUrl', label: 'Facebook URL' },
                    { key: 'instagramUrl', label: 'Instagram URL' },
                    { key: 'linkedinUrl', label: 'LinkedIn URL' },
                    { key: 'twitterUrl', label: 'Twitter / X URL' },
                    { key: 'tiktokUrl', label: 'TikTok URL' },
                    { key: 'snapchatUrl', label: 'Snapchat URL' },
                  ].map((s) => (
                    <div key={s.key} className="space-y-1.5">
                      <label className={labelClass}>{s.label}</label>
                      <input {...register(s.key)} placeholder="https://..." className={inputClass} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#063B66]">Notifications</h3>
                    <p className="text-[11px] text-slate-400">Email notification preferences</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { key: 'notifyInvoicePaid', label: 'Invoice Payment Received', desc: 'Get an instant notification when an invoice is marked paid' },
                    { key: 'notifyNewQuote', label: 'New Quote Request', desc: 'Get an email when a customer submits a quote request' },
                    { key: 'notifyShipmentUpdate', label: 'Shipment Status Updates', desc: 'Receive updates when shipment statuses change' },
                  ].map((n) => (
                    <label key={n.key} className="flex items-start gap-4 p-4 rounded-xl bg-[#F4F7FA] border border-slate-200 cursor-pointer hover:border-[#0B63CE] transition-colors">
                      <input type="checkbox" {...register(n.key)} className="mt-0.5 w-4 h-4 accent-[#0B63CE]" />
                      <div>
                        <p className="text-xs font-bold text-[#063B66]">{n.label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{n.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Security */}
            {activeSection === 'security' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#063B66]">Security</h3>
                    <p className="text-[11px] text-slate-400">Admin account and password management</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>Current Password</label>
                    <input type="password" {...register('currentPassword')} placeholder="Enter current password" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>New Password</label>
                    <input type="password" {...register('newPassword')} placeholder="Enter new password" className={inputClass} />
                  </div>
                </div>
              </div>
            )}

            {/* Currency Rates Settings Section */}
            {activeSection === 'currencyRates' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden animate-in fade-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#063B66]">Currency Conversion Rates</h3>
                      <p className="text-[11px] text-slate-400">Configure global conversion rates used for invoices, receipts and quotes across Chinese Yuan, GH Cedis, US Dollars and British Pounds.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchLiveRates}
                    disabled={fetchingRates}
                    className="flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto"
                  >
                    {fetchingRates ? 'Fetching Live Rates…' : 'Fetch Live Rates'}
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  {ratesMessage && (
                    <div className={`p-3 rounded-lg text-xs font-bold ${ratesMessage.includes('Error') ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
                      {ratesMessage}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        GBP (£) to GHS (GH₵) * 
                        <span className="ml-1.5 text-[9px] font-bold text-[#0B63CE] bg-[#0B63CE]/10 px-1.5 py-0.5 rounded-md normal-case font-sans tracking-normal">Current: {currentRates.GBP_GHS}</span>
                      </label>
                      <input type="number" step="any" {...register('GBP_GHS')} className={inputClass} placeholder="e.g. 15.20" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        GBP (£) to CNY (¥) * 
                        <span className="ml-1.5 text-[9px] font-bold text-[#0B63CE] bg-[#0B63CE]/10 px-1.5 py-0.5 rounded-md normal-case font-sans tracking-normal">Current: {currentRates.GBP_CNY}</span>
                      </label>
                      <input type="number" step="any" {...register('GBP_CNY')} className={inputClass} placeholder="e.g. 9.10" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        GBP (£) to USD ($) * 
                        <span className="ml-1.5 text-[9px] font-bold text-[#0B63CE] bg-[#0B63CE]/10 px-1.5 py-0.5 rounded-md normal-case font-sans tracking-normal">Current: {currentRates.GBP_USD}</span>
                      </label>
                      <input type="number" step="any" {...register('GBP_USD')} className={inputClass} placeholder="e.g. 1.27" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        GBP (£) to EUR (€) *
                        <span className="ml-1.5 text-[9px] font-bold text-[#0B63CE] bg-[#0B63CE]/10 px-1.5 py-0.5 rounded-md normal-case font-sans tracking-normal">Current: {currentRates.GBP_EUR}</span>
                      </label>
                      <input type="number" step="any" {...register('GBP_EUR')} className={inputClass} placeholder="e.g. 1.17" />
                    </div>

                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        GHS (GH₵) to CNY (¥) * 
                        <span className="ml-1.5 text-[9px] font-bold text-[#0B63CE] bg-[#0B63CE]/10 px-1.5 py-0.5 rounded-md normal-case font-sans tracking-normal">Current: {currentRates.GHS_CNY}</span>
                      </label>
                      <input type="number" step="any" {...register('GHS_CNY')} className={inputClass} placeholder="e.g. 0.60" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        GHS (GH₵) to USD ($) * 
                        <span className="ml-1.5 text-[9px] font-bold text-[#0B63CE] bg-[#0B63CE]/10 px-1.5 py-0.5 rounded-md normal-case font-sans tracking-normal">Current: {currentRates.GHS_USD}</span>
                      </label>
                      <input type="number" step="any" {...register('GHS_USD')} className={inputClass} placeholder="e.g. 0.084" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        CNY (¥) to GHS (GH₵) * 
                        <span className="ml-1.5 text-[9px] font-bold text-[#0B63CE] bg-[#0B63CE]/10 px-1.5 py-0.5 rounded-md normal-case font-sans tracking-normal">Current: {currentRates.CNY_GHS}</span>
                      </label>
                      <input type="number" step="any" {...register('CNY_GHS')} className={inputClass} placeholder="e.g. 1.67" />
                    </div>

                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        CNY (¥) to GBP (£) * 
                        <span className="ml-1.5 text-[9px] font-bold text-[#0B63CE] bg-[#0B63CE]/10 px-1.5 py-0.5 rounded-md normal-case font-sans tracking-normal">Current: {currentRates.CNY_GBP}</span>
                      </label>
                      <input type="number" step="any" {...register('CNY_GBP')} className={inputClass} placeholder="e.g. 0.11" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        USD ($) to GHS (GH₵) * 
                        <span className="ml-1.5 text-[9px] font-bold text-[#0B63CE] bg-[#0B63CE]/10 px-1.5 py-0.5 rounded-md normal-case font-sans tracking-normal">Current: {currentRates.USD_GHS}</span>
                      </label>
                      <input type="number" step="any" {...register('USD_GHS')} className={inputClass} placeholder="e.g. 11.90" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        USD ($) to GBP (£) * 
                        <span className="ml-1.5 text-[9px] font-bold text-[#0B63CE] bg-[#0B63CE]/10 px-1.5 py-0.5 rounded-md normal-case font-sans tracking-normal">Current: {currentRates.USD_GBP}</span>
                      </label>
                      <input type="number" step="any" {...register('USD_GBP')} className={inputClass} placeholder="e.g. 0.79" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        EUR (€) to GBP (£) *
                        <span className="ml-1.5 text-[9px] font-bold text-[#0B63CE] bg-[#0B63CE]/10 px-1.5 py-0.5 rounded-md normal-case font-sans tracking-normal">Current: {currentRates.EUR_GBP}</span>
                      </label>
                      <input type="number" step="any" {...register('EUR_GBP')} className={inputClass} placeholder="e.g. 0.85" />
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">Last Update Status</p>
                    <p className="text-xs text-slate-500 font-medium">Conversion rates are stored securely and updated in real-time when saving. Last updated: <span className="font-bold text-[#063B66]">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button (always visible) */}
            <div className="flex items-center justify-end gap-3 py-2">
              <button type="button" onClick={() => reset()} className="px-4 py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors bg-white shadow-2xs">
                Reset Changes
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0B63CE] hover:bg-[#0952AD] text-white rounded-lg text-xs font-extrabold transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                Save All Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
