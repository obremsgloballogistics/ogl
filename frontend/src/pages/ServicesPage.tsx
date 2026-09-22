import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plane, Ship, Clock, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import SectionHeading from '../components/SectionHeading';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { localImages, localizeImage } from '../utils/localImages';

export default function ServicesPage() {
  const { settings } = useSiteSettings();
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    api
      .get('/services')
      .then((response) => {
        setServices(response.data?.data || []);
      })
      .catch(() => setServices([]));
  }, []);

  return (
    <main className="bg-[#F4F7FA] min-h-screen py-12 text-[#172B3A]">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        <SectionHeading
          label="FREIGHT & LOGISTICS SERVICES"
          title={settings.servicesPage?.title || 'Expert Shipping Solutions'}
          description={settings.servicesPage?.description || 'Comprehensive air freight, sea cargo, customs clearance, and door-to-door logistics connecting the UK and China to Ghana.'}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
            <div
              key={service._id}
              className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 min-h-[420px] flex flex-col justify-between group"
            >
              {service.imageUrl && <img src={localizeImage(service.imageUrl, service.title?.toLowerCase().includes('sea') ? localImages.serviceSea : localImages.serviceAir)} alt={service.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/55 to-slate-900/10 pointer-events-none" />

              {/* Top header */}
              <div className="relative z-10 p-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{service.title}</h3>
                </div>
                <span className="text-sky-400 text-xs font-bold uppercase tracking-wider bg-black/40 px-3 py-1 rounded-full shrink-0">
                  {service.badge}
                </span>
              </div>

              {/* Bottom details */}
              <div className="relative z-10 p-6 space-y-4">
                <p className="text-slate-300 text-xs leading-relaxed">{service.description}</p>

                <div className="space-y-2">
                  {(service.features || []).map((feature: string) => (
                    <div key={feature} className="flex items-start gap-2 text-xs text-white font-medium">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    {service.transitTime}
                  </span>
                  <Link
                    to="/quote"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#063B66] hover:bg-[#0B63CE] text-white text-xs font-semibold transition-colors"
                  >
                    <span>Get Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
