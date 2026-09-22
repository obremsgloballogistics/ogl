import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function WebsiteLayout() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (settings) {
      if (settings.seoTitle) document.title = settings.seoTitle;
    }
  }, [settings]);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="pb-16">
        <Outlet />
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
