import { useEffect, useSyncExternalStore } from 'react';
import api from '../services/api';
import { localImages, localizeImage } from '../utils/localImages';

const DEFAULT_SETTINGS = {
  companyName: 'OBREMS GLOBAL LOGISTICS',
  heroHeadline: 'Expert Shipping Services You Can Trust',
  heroSubtitle: 'From the UK and China to Ghana by Air, Sea & Air.',
  logoUrl: '',
  heroImageUrl: localImages.heroMain,
  heroImageUrl2: localImages.heroSlide2,
  heroImageUrl3: localImages.heroSlide3,
  heroImageUrl4: localImages.heroSlide4,
  ctaBannerImageUrl: localImages.freightWarehouse,
  contactHeroImageUrl: localImages.freightWarehouse,
  contactAccraOfficeImageUrl: '/office/accra-office.jpg',
  contactKumasiOfficeImageUrl: '/office/kumasi-office.jpg',
  aboutHeroImageUrl: localImages.freightWarehouse,
  missionImageUrl: localImages.mission,
  visionImageUrl: localImages.city,
  aboutCtaImageUrl: localImages.heroSlide4,
  quoteHeroImageUrl: localImages.heroSlide3,
  trackHeroImageUrl: localImages.tracking,
  contactPhone: '+44 7460 554358',
  contactWhatsApp: '+44 7460 554358',
  contactEmail: 'info@obremsgloballogistics.com',
  officeUk: '123 Logistics Way, London, UK',
  officeGhana: 'Accra, Greater Accra Region, Ghana',
  businessHours: 'Mon - Fri, 08:00 - 18:00',
  footerText: 'Reliable international shipping and freight forwarding from the UK and China to Ghana.',
  tiktokUrl: 'https://www.tiktok.com/obremsglobal',
  snapchatUrl: 'https://www.snapchat.com/obremsglobal',
  facebookUrl: 'https://facebook.com/obremsglobal',
  instagramUrl: 'https://instagram.com/obremsglobal',
  linkedinUrl: 'https://linkedin.com/company/obremsglobal',
  twitterUrl: 'https://x.com/obremsglobal',
  youtubeUrl: 'https://youtube.com/obremsglobal',
  seoTitle: 'OBREMS GLOBAL LOGISTICS | UK & China to Ghana Shipping',
  seoDescription: 'Reliable international shipping and freight forwarding from the UK and China to Ghana.',
  homepageHero: {
    headline: 'Expert Shipping Services You Can Trust',
    subtitle: 'RELIABLE. FAST. GLOBAL.',
    description: 'UK → Ghana, Ghana → UK and China → Ghana freight solutions with secure tracking and customs support.',
    buttonText: 'Track Shipment',
    buttonLink: '/tracking',
    secondaryButtonText: 'Get a Quote',
    secondaryButtonLink: '/quote',
    imageUrl: localImages.heroMain,
    secondaryImageUrl: localImages.heroSlide2,
    trustText: 'Trusted by businesses and families across Ghana and the UK.',
    stats: [],
  },
  about: {
    title: 'Delivering Excellence Across Oceans & Skies',
    description: 'OBREMS GLOBAL LOGISTICS provides reliable shipping solutions from the UK and China to Ghana.',
    ctaText: 'Ready to ship with OBREMS?',
    buttonText: 'Get a Quote',
  },
  contact: {
    title: 'Get in Touch With Our Team',
    description: 'Questions about freight and customs support? We are ready to help.',
  },
  footer: {
    description: 'Reliable international shipping and freight forwarding from the UK and China to Ghana.',
    copyright: '© 2026 OBREMS GLOBAL LOGISTICS. All Rights Reserved.',
    navigation: [{ label: 'Home', url: '/' }, { label: 'About', url: '/about' }, { label: 'Services', url: '/services' }, { label: 'Tracking', url: '/tracking' }, { label: 'Quote', url: '/quote' }, { label: 'Contact', url: '/contact' }],
  },
  seo: {
    metaTitle: 'OBREMS GLOBAL LOGISTICS | UK & China to Ghana Shipping',
    metaDescription: 'Reliable international shipping and freight forwarding from the UK and China to Ghana.',
  },
  footerCollapsible: false,
  officeLocations: [],
  contactMethods: [],
  advertBanner: { enabled: false, title: '', text: '', imageUrl: '', buttonText: '', buttonUrl: '' },
};

function normalizeSettings(data: any = {}) {
  const settings = {
    ...DEFAULT_SETTINGS,
    ...data,
    footerCollapsible: data.footerCollapsible ?? false,
    homepageHero: { ...DEFAULT_SETTINGS.homepageHero, ...(data.homepageHero || {}) },
    about: { ...DEFAULT_SETTINGS.about, ...(data.about || {}) },
    contact: { ...DEFAULT_SETTINGS.contact, ...(data.contact || {}) },
    footer: { ...DEFAULT_SETTINGS.footer, ...(data.footer || {}) },
    seo: { ...DEFAULT_SETTINGS.seo, ...(data.seo || {}) },
    advertBanner: { ...DEFAULT_SETTINGS.advertBanner, ...(data.advertBanner || {}) },
    officeLocations: Array.isArray(data.officeLocations) ? data.officeLocations : DEFAULT_SETTINGS.officeLocations,
    contactMethods: Array.isArray(data.contactMethods) ? data.contactMethods : DEFAULT_SETTINGS.contactMethods,
  };

  const imageSettings = settings as Record<string, any>;
  const defaultImageSettings = DEFAULT_SETTINGS as Record<string, any>;
  for (const field of ['heroImageUrl', 'heroImageUrl2', 'heroImageUrl3', 'heroImageUrl4', 'ctaBannerImageUrl', 'contactHeroImageUrl', 'aboutHeroImageUrl', 'missionImageUrl', 'visionImageUrl', 'aboutCtaImageUrl', 'quoteHeroImageUrl', 'trackHeroImageUrl']) {
    imageSettings[field] = localizeImage(imageSettings[field], defaultImageSettings[field]);
  }
  settings.contactAccraOfficeImageUrl = '/office/accra-office.jpg';
  settings.contactKumasiOfficeImageUrl = '/office/kumasi-office.jpg';
  settings.homepageHero.imageUrl = localizeImage(settings.homepageHero.imageUrl, localImages.heroMain);
  settings.homepageHero.secondaryImageUrl = localizeImage(settings.homepageHero.secondaryImageUrl, localImages.heroSlide2);

  const version = data.contentVersion || data.updatedAt;
  if (version) {
    const imageFields = [
      'logoUrl', 'faviconUrl', 'heroImageUrl', 'heroImageUrl2', 'heroImageUrl3', 'heroImageUrl4',
      'ctaBannerImageUrl', 'contactHeroImageUrl', 'contactAccraOfficeImageUrl',
      'contactKumasiOfficeImageUrl', 'aboutHeroImageUrl', 'missionImageUrl', 'visionImageUrl',
      'aboutCtaImageUrl', 'quoteHeroImageUrl', 'trackHeroImageUrl',
    ];
    for (const field of imageFields) {
      const value = settings[field];
      if (typeof value === 'string' && value && !value.includes('contentVersion=')) {
        settings[field] = `${value}${value.includes('?') ? '&' : '?'}contentVersion=${encodeURIComponent(version)}`;
      }
    }
    for (const field of ['imageUrl', 'secondaryImageUrl']) {
      const value = settings.homepageHero[field];
      if (typeof value === 'string' && value && !value.includes('contentVersion=')) {
        settings.homepageHero[field] = `${value}${value.includes('?') ? '&' : '?'}contentVersion=${encodeURIComponent(version)}`;
      }
    }
    if (settings.advertBanner.imageUrl && !settings.advertBanner.imageUrl.includes('contentVersion=')) {
      settings.advertBanner.imageUrl = `${settings.advertBanner.imageUrl}${settings.advertBanner.imageUrl.includes('?') ? '&' : '?'}contentVersion=${encodeURIComponent(version)}`;
    }
  }
  return settings;
}

let settingsSnapshot = normalizeSettings();
let settingsLoaded = false;
let settingsRequest: Promise<any> | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function refreshSiteSettings() {
  settingsRequest = api
    .get('/settings', { headers: { 'Cache-Control': 'no-cache' } })
    .then((response) => {
      if (response.data?.data) settingsSnapshot = normalizeSettings(response.data.data);
      settingsLoaded = true;
      notify();
      return settingsSnapshot;
    })
    .catch((error) => {
      settingsLoaded = true;
      notify();
      throw error;
    })
    .finally(() => {
      settingsRequest = null;
    });
  return settingsRequest;
}

export function useSiteSettings() {
  const settings = useSyncExternalStore(subscribe, () => settingsSnapshot, () => settingsSnapshot);

  useEffect(() => {
    if (!settingsLoaded && !settingsRequest) refreshSiteSettings().catch(() => {});
  }, []);

  return { settings, loading: !settingsLoaded };
}

