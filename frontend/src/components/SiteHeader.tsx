import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Plane, Ship, Package, ShieldCheck, FileText, Warehouse } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function SiteHeader() {
  const { settings } = useSiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 0) {
        setIsVisible(true);
        return;
      }

      setIsVisible(currentScrollY < lastScrollY);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const servicesList = [
    { title: 'UK → Ghana (Air Freight)', desc: 'Express air transport from London to Accra', href: '/services', icon: Plane },
    { title: 'China → Ghana (Sea Freight)', desc: 'Cost-effective ocean container shipping from China', href: '/services', icon: Ship },
    { title: 'Ghana → UK (Air Freight)', desc: 'Priority air freight dispatch from Ghana to UK', href: '/services', icon: Plane },
  ];

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services', hasDropdown: true },
    { label: 'Get a Quote', href: '/quote' },
    { label: 'Track Shipment', href: '/tracking' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Main Navigation Header */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img src="/ogllogo-removebg-preview.png" alt="OBREMS Global Logistics" className="h-14 w-14 sm:h-16 sm:w-16 object-contain transition-transform group-hover:scale-105" />
          <span className="max-w-[150px] text-sm sm:text-base font-extrabold leading-tight tracking-tight text-[#063B66]">OBREMS GLOBAL LOGISTICS</span>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-[#172B3A]">
          {navLinks.map((link) => {
            if (link.hasDropdown) {
              return (
                <div
                  key={link.label}
                  className="relative group py-2"
                  onMouseEnter={() => setServicesDropdownOpen(true)}
                  onMouseLeave={() => setServicesDropdownOpen(false)}
                >
                  <button
                    className={`flex items-center gap-1 hover:text-[#0B63CE] transition-colors ${
                      isActive('/services') ? 'text-[#0B63CE] font-bold' : ''
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-[#0B63CE] transition-transform duration-200" />
                  </button>

                  {/* Dropdown Menu */}
                  {servicesDropdownOpen && (
                    <div className="absolute top-full left-0 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {servicesList.map((srv) => {
                        const IconComp = srv.icon;
                        return (
                          <Link
                            key={srv.title}
                            to={srv.href}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F4F7FA] transition-colors group/item"
                          >
                            <IconComp className="w-4 h-4 text-[#063B66] shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-[#172B3A] group-hover/item:text-[#0B63CE]">
                                {srv.title}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                {srv.desc}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.label}
                to={link.href}
                className={`hover:text-[#0B63CE] transition-colors py-2 ${
                  isActive(link.href) ? 'text-[#0B63CE] font-bold' : ''
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Button */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/quote"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-[#0B63CE] text-white text-sm font-semibold hover:bg-[#063B66] transition-colors shadow-sm"
          >
            Get a Quote
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-700 hover:text-[#063B66] hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-4 pb-6 space-y-3 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-semibold ${
                isActive(link.href)
                  ? 'bg-[#063B66] text-white'
                  : 'text-[#172B3A] hover:bg-slate-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/quote"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-3 rounded-lg bg-[#0B63CE] text-white font-semibold text-sm shadow-sm"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

