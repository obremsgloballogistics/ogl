export const localImages = {
  heroMain: '/images/hero-main.jpg',
  heroSlide2: '/images/hero-slide-2.jpg',
  heroSlide3: '/images/hero-slide-3.jpg',
  heroSlide4: '/images/hero-slide-4.jpg',
  freightWarehouse: '/images/freight-warehouse.jpg',
  mission: '/images/mission.jpg',
  city: '/images/city.jpg',
  tracking: '/images/tracking.jpg',
  ukLandmark: '/images/uk-landmark.jpg',
  chinaLandmark: '/images/china-landmark.jpg',
  aircraft: '/images/aircraft.jpg',
  airport: '/images/airport.jpg',
  serviceAir: '/images/service-air.jpg',
  serviceSea: '/images/service-sea.jpg',
  blogCargo: '/images/blog-cargo.jpg',
  blogDelivery: '/images/blog-delivery.jpg',
  testimonialLinda: '/images/testimonial-linda.jpg',
  testimonialMichael: '/images/testimonial-michael.jpg',
  heroMedia: '/images/hero-media.jpg',
} as const;

const localImageMap: Record<string, string> = {
  '1601584115197': localImages.heroMain,
  '358319': localImages.heroSlide2,
  '1554646': localImages.heroSlide3,
  '4391470': localImages.heroSlide4,
  '1578575437130': localImages.freightWarehouse,
  '1521791136064': localImages.mission,
  '1477959858617': localImages.city,
  '1586528116311': localImages.tracking,
  '1513635269975': localImages.ukLandmark,
  '1508804185872': localImages.chinaLandmark,
  '46148': localImages.aircraft,
  '1545569341': localImages.airport,
  '1494526585095': localImages.serviceAir,
  '1500530855697': localImages.serviceSea,
  '1511919884226': localImages.blogCargo,
  '1525527489415': localImages.blogDelivery,
  '1544005313': localImages.testimonialLinda,
  '1502767089025': localImages.testimonialMichael,
  '1516685018646': localImages.heroMedia,
  '1454165804606': localImages.blogCargo,
  '1529070538774': localImages.blogDelivery,
};

export function localizeImage(url: string | undefined, fallback: string) {
  if (!url) return fallback;
  const match = Object.entries(localImageMap).find(([remoteId]) => url.includes(remoteId));
  return match ? match[1] : url;
}
