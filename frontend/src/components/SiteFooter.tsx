import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Send, ChevronUp } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function SiteFooter() {
  const { settings, loading } = useSiteSettings();
  const [isExpanded, setIsExpanded] = useState(true);

  // Once settings load, set default: collapsed if footerCollapsible is on
  useEffect(() => {
    if (!loading) {
      setIsExpanded(!settings?.footerCollapsible);
    }
  }, [loading, settings?.footerCollapsible]);

  const phone = settings?.contactPhone || '+44 7460 554358';
  const email = settings?.contactEmail || 'info@obremsgloballogistics.com';
  const officeUk = settings?.officeUk || '123 Logistics Way, London, UK';
  const officeGhana = settings?.officeGhana || 'Accra, Greater Accra Region, Ghana';

  const showFooterContent = isExpanded;


  return (
    <footer className="bg-[#063B66] text-white">

      {/* Pull-Up Arrow Tab — always visible at top of footer */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse footer' : 'Expand footer'}
          className="group -mt-0 flex flex-col items-center gap-0.5 px-8 py-2 bg-[#0B63CE] hover:bg-[#063B66] border-t-0 rounded-b-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <ChevronUp
            className={`w-5 h-5 text-white/80 group-hover:text-white transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
          <span className="text-[10px] font-bold tracking-widest text-white/70 group-hover:text-white uppercase">
            {isExpanded ? 'Close' : 'Sitemap'}
          </span>
        </button>
      </div>

      {/* Main Footer Container */}
      {showFooterContent && (
        <div className="container mx-auto px-4 py-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-5 border-b border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Brand & Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <img src="/ogllogo-removebg-preview.png" alt="OBREMS Global Logistics" className="h-28 w-28 object-contain" />
              <span className="max-w-[180px] text-lg font-extrabold leading-tight tracking-tight text-white">OBREMS GLOBAL LOGISTICS</span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              Reliable international shipping and freight forwarding from the UK and China to Ghana. Fast air freight, economical sea cargo, and secure door-to-door delivery.
            </p>

            {/* Social Icons — only shown when URL is set */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {settings?.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#0B63CE] transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-pink-600 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.linkedinUrl && (
                <a href={settings.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#0A66C2] transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {settings?.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noreferrer" aria-label="X / Twitter"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-black transition-colors">
                  <span className="text-sm font-bold leading-none" aria-hidden="true">X</span>
                </a>
              )}
              {settings?.tiktokUrl && (
                <a href={settings.tiktokUrl} target="_blank" rel="noreferrer" aria-label="TikTok"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-black transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.33-6.32V9.05a8.16 8.16 0 0 0 4.92 1.62V7.22a4.84 4.84 0 0 1-1-.53z"/>
                  </svg>
                </a>
              )}
              {settings?.snapchatUrl && (
                <a href={settings.snapchatUrl.startsWith('http') ? settings.snapchatUrl : `https://www.snapchat.com/add/${settings.snapchatUrl.replace(/^@/, '').replace(/^.*\//, '')}`} target="_blank" rel="noreferrer" aria-label="Snapchat"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#FFFC00] hover:text-[#172B3A]">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-2.441-.689-3.294-1.288-.6-.42-1.123-.78-1.723-.884-.314-.059-.613-.074-.913-.074-.508 0-.913.06-1.273.135-.225.043-.403.074-.538.074h-.03c-.285 0-.479-.134-.555-.405-.06-.193-.105-.374-.134-.553-.044-.195-.105-.479-.164-.57-1.873-.283-2.906-.702-3.146-1.271-.03-.076-.045-.15-.045-.225-.015-.239.165-.465.42-.509 3.265-.539 4.731-3.878 4.791-4.014l.015-.015c.181-.344.21-.644.12-.868-.194-.45-.883-.675-1.333-.81-.135-.044-.255-.09-.344-.119-.823-.329-1.228-.719-1.213-1.168 0-.359.284-.689.734-.838.15-.061.327-.09.509-.09.12 0 .299.016.464.104.374.181.733.285 1.033.301.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847 1.583-3.545 4.94-3.821 5.93-3.821z" />
                  </svg>
                </a>
              )}
              {(settings?.contactWhatsApp || phone) && (
                <a href={`https://wa.me/${(settings?.contactWhatsApp || phone).replace(/[^0-9]/g, '')}`}
                  target="_blank" rel="noreferrer" aria-label="WhatsApp"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 2c-5.457 0-9.898 4.442-9.898 9.899 0 1.743.453 3.442 1.312 4.939l-1.395 5.1 5.222-1.369c1.442.787 3.067 1.229 4.759 1.229 5.456 0 9.898-4.442 9.898-9.899 0-5.457-4.442-9.899-9.898-9.899zm5.836 14.156c-.244.688-1.222 1.258-2.008 1.406-.538.101-1.241.182-3.606-.794-3.027-1.252-4.98-4.328-5.131-4.529-.151-.201-1.233-1.641-1.233-3.131 0-1.49.776-2.222 1.052-2.524.276-.302.602-.378.804-.378.201 0 .403.002.579.011.187.009.438-.071.687.527.252.602.855 2.086.929 2.237.075.151.126.327.025.527-.101.201-.151.327-.302.503-.151.176-.318.393-.454.527-.151.151-.309.314-.133.616.176.302.781 1.291 1.677 2.089 1.152 1.027 2.126 1.346 2.428 1.497.302.151.478.126.654-.075.176-.201.754-.879.955-1.181.201-.302.403-.252.678-.151.276.101 1.758.829 2.06.98.302.151.503.226.578.352.075.126.075.734-.169 1.422z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/tracking" className="hover:text-white transition-colors">Tracking</Link></li>
              <li><Link to="/quote" className="hover:text-white transition-colors">Get a Quote</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Our Services */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">Our Services</h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li><Link to="/services" className="hover:text-white transition-colors">Air Freight (UK → Ghana)</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Air Freight (Ghana → UK)</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Sea Freight (China → Ghana)</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Door-to-Door Courier Delivery</Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">Contact Us</h4>
            <div className="space-y-3 text-sm text-slate-300">
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="flex items-center gap-2.5 text-white hover:text-slate-100 transition-colors">
                <Phone className="w-4 h-4 text-[#0B63CE] shrink-0" />
                <span className="font-semibold">{phone}</span>
              </a>
              <a href={`mailto:${email}`} className="flex items-center gap-2.5 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-[#0B63CE] shrink-0" />
                <span className="truncate">{email}</span>
              </a>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#0B63CE] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Ghana (Accra Hub)</p>
                  <a href="tel:+233246472761" className="text-xs font-mono font-bold text-white hover:text-slate-100 hover:underline block mt-0.5">+233 24 647 2761</a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#0B63CE] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Ghana (Kumasi Hub)</p>
                  <a href="tel:+233547181769" className="text-xs font-mono font-bold text-white hover:text-slate-100 hover:underline block mt-0.5">+233 54 718 1769</a>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Newsletter</h5>
              <p className="text-xs text-slate-300">Subscribe to get updates on our services and offers.</p>
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 pt-1">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 text-xs bg-white/10 border border-white/20 rounded-md text-white placeholder-slate-400 focus:outline-none focus:border-[#0B63CE]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B63CE] hover:bg-[#0B63CE]/90 text-white rounded-md text-xs font-semibold transition-colors shrink-0"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Copyright Bar */}
      <div className="border-t border-white/10 bg-[#042845] py-5">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} OBREMS GLOBAL LOGISTICS. All Rights Reserved.</p>
          
          {settings?.footerCollapsible && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-[#0B63CE] text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>{isExpanded ? 'Hide Sitemap' : 'Explore Sitemap & Contact'}</span>
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

