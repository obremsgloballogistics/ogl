import { useState } from 'react';
import { NavLink, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Activity,
  Users,
  FileText,
  Receipt,
  FileCheck,
  Package,
  MapPin,
  MessageSquare,
  Star,
  HelpCircle,
  Newspaper,
  Image as ImageIcon,
  UserCheck,
  Bell,
  BarChart3,
  ShieldCheck,
  Settings,
  Search,
  Plus,
  Menu,
  X,
  Calendar,
  LogOut,
  QrCode,
  Smartphone,
  Camera
  ,Send
} from 'lucide-react';
import { useEffect } from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminShipmentsPage from '../pages/admin/AdminShipmentsPage';
import AdminCustomersPage from '../pages/admin/AdminCustomersPage';
import AdminQuotesPage from '../pages/admin/AdminQuotesPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import AdminInvoicesPage from '../pages/admin/AdminInvoicesPage';
import AdminTrackingEventsPage from '../pages/admin/AdminTrackingEventsPage';
import AdminDocumentsPage from '../pages/admin/AdminDocumentsPage';
import AdminServicesPage from '../pages/admin/AdminServicesPage';
import AdminRoutesPage from '../pages/admin/AdminRoutesPage';
import AdminMessagesPage from '../pages/admin/AdminMessagesPage';
import AdminTestimonialsPage from '../pages/admin/AdminTestimonialsPage';
import AdminFaqsPage from '../pages/admin/AdminFaqsPage';
import AdminBlogPage from '../pages/admin/AdminBlogPage';
import AdminMediaPage from '../pages/admin/AdminMediaPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminNotificationsPage from '../pages/admin/AdminNotificationsPage';
import AdminBroadcastPage from '../pages/admin/AdminBroadcastPage';
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage';
import AdminAuditPage from '../pages/admin/AdminAuditPage';
import AdminQrScannerPage from '../pages/admin/AdminQrScannerPage';
import AdminComingSoonPage from '../pages/admin/AdminComingSoonPage';
import AdminShippingPresetsPage from '../pages/admin/AdminShippingPresetsPage';
import { AdminCard } from '../components/admin/AdminUI';

const ACCESS_DENIED_MESSAGE = 'You do not have permission to access this section.';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { settings } = useSiteSettings();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('obrems_user') || 'null');
  const token = localStorage.getItem('obrems_token');
  const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'User';
  const userInitials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join('') || 'U';
  const hasAccess = (section?: string) => {
    if (currentUser?.role === 'Super Admin' || !section) return true;
    const permissions = currentUser?.permissions || [];
    if (permissions.includes(section) || permissions.includes('content')) return true;
    if (section === 'content') return permissions.some((permission: string) => permission.startsWith('content'));
    return false;
  };

  useEffect(() => {
    if (settings) {
      if (settings.seoTitle) document.title = settings.seoTitle + ' | Admin';
    }
  }, [settings]);

  const navItems = [
    { to: '.', label: 'Dashboard', icon: LayoutDashboard, exact: true, section: 'dashboard' },
    { to: 'shipments', label: 'Shipments', icon: Truck, section: 'shipments' },
    { to: 'qr-scanner', label: 'QR & SMS Hub', icon: QrCode, badge: 'NEW', section: 'qrCode' },
    { to: 'customers', label: 'Customers', icon: Users, section: 'customers' },
    { to: 'quotes', label: 'Quotes', icon: FileText, badge: '12', section: 'quotes' },
    { to: 'invoices', label: 'Invoices', icon: Receipt, section: 'invoices' },
    { to: 'services', label: 'Services & Routes', icon: Package, section: 'contentServices' },
    { to: 'shipping-presets', label: 'Shipping Presets', icon: FileCheck, section: 'contentServices' },
    { to: 'messages', label: 'Messages', icon: MessageSquare, badge: '5', section: 'messages' },
    { to: 'broadcasts', label: 'Broadcasts', icon: Send, section: 'messages', adminOnly: true },
    { to: 'blog', label: 'Blog', icon: Newspaper, section: 'contentBlog' },
    { to: 'faqs', label: 'FAQs', icon: HelpCircle, section: 'contentFaqs' },
    { to: 'testimonials', label: 'Testimonials', icon: Star, section: 'contentTestimonials' },
    { to: 'media', label: 'Assets', icon: ImageIcon, section: 'assets' },
    { to: 'audit', label: 'Activity Log', icon: Activity, section: 'activityLog' },
    { to: 'users', label: 'Users & Roles', icon: UserCheck, section: 'users' },
    { to: 'settings', label: 'System Settings', icon: Settings, section: 'settings' },
  ];

  const navGroups = [
    { label: 'Overview', items: navItems.filter((item) => item.to === '.') },
    { label: 'Operations', items: navItems.filter((item) => ['shipments', 'qr-scanner', 'customers', 'quotes', 'invoices'].includes(item.to)) },
    { label: 'Content', items: navItems.filter((item) => ['services', 'shipping-presets', 'blog', 'faqs', 'testimonials', 'media'].includes(item.to)) },
    { label: 'System', items: navItems.filter((item) => ['messages', 'broadcasts', 'audit', 'users', 'settings'].includes(item.to)) },
  ];

  const sectionForPath = (path: string) => {
    const route = path.replace(/^\/admin\/?/, '').split('/')[0];
    const routeSections: Record<string, string> = {
      '': 'dashboard',
      shipments: 'shipments',
      'qr-scanner': 'qrCode',
      'tracking-events': 'shipments',
      customers: 'customers',
      quotes: 'quotes',
      invoices: 'invoices',
      documents: 'shipments',
      services: 'contentServices',
      'shipping-presets': 'contentServices',
      routes: 'contentServices',
      messages: 'messages',
      broadcasts: 'messages',
      testimonials: 'contentTestimonials',
      faqs: 'contentFaqs',
      blog: 'contentBlog',
      media: 'assets',
      users: 'users',
      notifications: 'messages',
      analytics: 'analytics',
      audit: 'activityLog',
      settings: 'settings',
    };
    return routeSections[route];
  };
  const activeSection = sectionForPath(location.pathname);

  if (!token || !currentUser) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;

  return (
    <div className="admin-shell min-h-screen text-[#172B3A] font-sans antialiased flex">
      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#063B66] text-white flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto scrollbar-none">
          {/* Logo Header */}
          <div className="p-5 pb-4 flex items-center justify-between border-b border-white/10">
            <Link to="/" className="flex items-center gap-3">
              <img src="/ogllogo-removebg-preview.png" alt="OBREMS Global Logistics" className="h-16 w-16 object-contain" />
              <span className="max-w-[130px] text-sm font-extrabold leading-tight tracking-tight text-white">OBREMS GLOBAL LOGISTICS</span>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-300 hover:text-white rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-4 space-y-5 flex-1" aria-label="Admin navigation">
            {navGroups.map((group) => {
              const visibleItems = group.items.filter((item) => hasAccess(item.section) && (!item.adminOnly || ['Super Admin', 'Admin'].includes(currentUser?.role)));
              if (!visibleItems.length) return null;
              return (
                <div key={group.label}>
                  <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400/80 select-none">{group.label}</p>
                  <div className="space-y-0.5">
                    {visibleItems.map((item) => {
                      const IconComp = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.exact}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center justify-between border-l-2 px-3 py-2.5 text-xs font-medium rounded-r-md transition-all duration-150 ${
                              isActive
                                ? 'border-sky-300 bg-sky-400/[0.14] text-white font-semibold'
                                : 'border-transparent text-slate-300/80 hover:border-sky-400/40 hover:bg-white/[0.07] hover:text-white'
                            }`
                          }
                        >
                          <span className="flex items-center gap-3">
                            <IconComp
                              className={`w-4 h-4 shrink-0 transition-colors`}
                              aria-hidden="true"
                            />
                            {item.label}
                          </span>
                          {item.badge && <span className="text-[10px] font-bold bg-sky-500/20 text-sky-200 px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Bottom Quick Action Buttons */}
          {(hasAccess('shipments') || hasAccess('quotes')) && (
            <div className="p-4 border-t border-white/10 space-y-2 bg-[#042845]">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Quick Actions
              </span>
              {hasAccess('shipments') && (
                <Link
                  to="shipments"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0B63CE] hover:bg-[#0952AD] text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Shipment</span>
                </Link>
              )}

              {hasAccess('quotes') && (
                <Link
                  to="quotes"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Get a Quote Request</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* MAIN ADMIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP NAVBAR */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-[#0B63CE] hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-xl font-bold text-[#063B66] tracking-tight">Dashboard</h1>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search anything... (Ctrl + K)"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Top Right Profile & Actions */}
          <div className="flex items-center gap-4">
            <button aria-label="Notifications" className="relative p-2 text-slate-400 hover:text-[#0B63CE] hover:bg-blue-50 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                8
              </span>
            </button>

            <button aria-label="Messages" className="p-2 text-slate-400 hover:text-[#0B63CE] hover:bg-blue-50 rounded-lg transition-colors">
              <MessageSquare className="w-5 h-5" />
            </button>

            <div className="h-6 w-px bg-slate-200" />

            {/* Admin User Profile */}
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-[#063B66] text-white flex items-center justify-center font-bold text-xs shadow-sm border border-slate-200">
                {userInitials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#063B66] leading-snug tracking-tight">{userName}</p>
                <p className="text-[10px] font-semibold text-[#0B63CE]/70">{currentUser?.role || 'Staff'}</p>
                <p className="text-[9px] text-slate-400 truncate max-w-[150px]">{currentUser?.email || ''}</p>
              </div>
            </div>

            <Link
              to="/admin/login"
              title="Log out"
              aria-label="Log out"
              onClick={() => {
                localStorage.removeItem('obrems_token');
                localStorage.removeItem('obrems_user');
              }}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* MAIN BODY DASHBOARD ROUTES */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeSection && !hasAccess(activeSection) ? (
            <div className="min-h-[420px] flex items-center justify-center">
              <AdminCard className="max-w-md text-center">
                <ShieldCheck className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-[#063B66]">Access restricted</h2>
                <p className="text-sm text-slate-500 mt-2">{ACCESS_DENIED_MESSAGE}</p>
              </AdminCard>
            </div>
          ) : <Routes>
            <Route path="/" element={<AdminDashboardPage />} />
            <Route path="shipments" element={<AdminShipmentsPage />} />
            <Route path="qr-scanner" element={<AdminQrScannerPage />} />
            <Route path="tracking-events" element={<AdminTrackingEventsPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="quotes" element={<AdminQuotesPage />} />
            <Route path="invoices" element={<AdminInvoicesPage />} />
            <Route path="documents" element={<AdminDocumentsPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="shipping-presets" element={<AdminShippingPresetsPage />} />
            <Route path="routes" element={<AdminRoutesPage />} />
            <Route path="messages" element={<AdminMessagesPage />} />
            <Route path="broadcasts" element={['Super Admin', 'Admin'].includes(currentUser?.role) ? <AdminBroadcastPage /> : <Navigate to="/admin" replace />} />
            <Route path="testimonials" element={<AdminTestimonialsPage />} />
            <Route path="faqs" element={<AdminFaqsPage />} />
            <Route path="blog" element={<AdminBlogPage />} />
            <Route path="media" element={<AdminMediaPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="audit" element={<AdminAuditPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="*" element={<AdminComingSoonPage />} />
          </Routes>}
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 pb-safe">
          <div className="flex items-center justify-between px-2 h-16 max-w-md mx-auto">
            <NavLink to="." end className={({ isActive }) => `flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${isActive ? 'text-[#0B63CE]' : 'text-slate-500 hover:text-slate-900'}`}>
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Home</span>
            </NavLink>
            
            <NavLink to="shipments" className={({ isActive }) => `flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${isActive ? 'text-[#0B63CE]' : 'text-slate-500 hover:text-slate-900'}`}>
              <Truck className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Shipments</span>
            </NavLink>
            
            {hasAccess('qrCode') ? (
              <div className="relative -top-5 flex flex-col items-center justify-center w-16">
                <NavLink to="qr-scanner" className={({ isActive }) => `flex items-center justify-center w-14 h-14 rounded-full shadow-lg border-4 border-slate-50 transition-transform hover:scale-105 active:scale-95 ${isActive ? 'bg-[#063B66] text-white shadow-[#063B66]/30' : 'bg-[#0B63CE] text-white'}`}>
                  <Camera className="w-6 h-6 stroke-[2]" />
                </NavLink>
              </div>
            ) : <div className="w-16" />}
            
            <NavLink to="customers" className={({ isActive }) => `flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${isActive ? 'text-[#0B63CE]' : 'text-slate-500 hover:text-slate-900'}`}>
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Customers</span>
            </NavLink>
            
            <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center justify-center w-16 h-full gap-1 text-slate-500 hover:text-slate-900 transition-colors">
              <Menu className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

