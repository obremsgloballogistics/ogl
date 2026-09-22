import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Edit,
  Eye,
  FileText,
  Send,
  UserCheck,
  Bell,
  BarChart3,
  ShieldCheck,
  Image as ImageIcon,
  HelpCircle,
  Star,
  Newspaper,
  MapPin,
  Package,
  Receipt,
  FileCheck,
  Activity,
  X
} from 'lucide-react';

interface MockItem {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  date: string;
  meta: string;
}

export default function AdminComingSoonPage() {
  const location = useLocation();
  const segment = location.pathname.split('/').pop() || 'overview';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form states for adding content dynamically
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newMeta, setNewMeta] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Module configuration based on segment
  const getModuleConfig = () => {
    switch (segment) {
      case 'invoices':
        return {
          title: 'Invoices & Financials',
          icon: Receipt,
          addLabel: 'Generate Invoice',
          mockItems: [
            { id: 'INV-2026-881', title: 'Invoice #881 - Kweku Annan', subtitle: 'UK Air Cargo Express (45kg)', status: 'Paid', date: '2026-08-10', meta: '£450.00' },
            { id: 'INV-2026-882', title: 'Invoice #882 - Grace Bediako', subtitle: 'China Sea Shipping (2.5 CBM)', status: 'Pending', date: '2026-08-11', meta: '$680.00' },
            { id: 'INV-2026-883', title: 'Invoice #883 - Kwame Osei', subtitle: 'Door-to-Door Delivery Ghana', status: 'Overdue', date: '2026-08-01', meta: 'GHS 1,200.00' },
          ]
        };
      case 'tracking-events':
        return {
          title: 'Tracking Scan Events',
          icon: Activity,
          addLabel: 'Add Scan Event',
          mockItems: [
            { id: 'TRK-EV-01', title: 'Departed London Heathrow Hub', subtitle: 'Package OGL245678912UK scanned at gate B4', status: 'Completed', date: '2026-08-11 14:30', meta: 'Operator: J. Mensah' },
            { id: 'TRK-EV-02', title: 'Customs Clearance in Progress', subtitle: 'Kotoka Int Airport Terminal 3', status: 'In Progress', date: '2026-08-11 16:45', meta: 'Officer ID: GH-902' },
            { id: 'TRK-EV-03', title: 'Consignment Loaded on Container', subtitle: 'Port of Guangzhou Terminal 12', status: 'Completed', date: '2026-08-09 09:15', meta: 'Vessel: CMA CGM' },
          ]
        };
      case 'documents':
        return {
          title: 'Shipping Documents',
          icon: FileCheck,
          addLabel: 'Upload Document',
          mockItems: [
            { id: 'DOC-901', title: 'Air Waybill (AWB-90123)', subtitle: 'K. Annan - Electronics shipment', status: 'Verified', date: '2026-08-10', meta: 'PDF (1.2 MB)' },
            { id: 'DOC-902', title: 'Customs Declaration Form C2', subtitle: 'Commercial goods cargo clearance', status: 'Pending Approval', date: '2026-08-11', meta: 'PDF (3.4 MB)' },
            { id: 'DOC-903', title: 'Packing List & Bill of Lading', subtitle: 'Container #OGL-CN-904', status: 'Verified', date: '2026-08-08', meta: 'PDF (2.1 MB)' },
          ]
        };
      case 'services':
        return {
          title: 'Service Rate Manager',
          icon: Package,
          addLabel: 'Add New Service Tier',
          mockItems: [
            { id: 'SRV-01', title: 'UK Air Freight - Express', subtitle: '£7.50 / kg (Est. 3-5 Business Days)', status: 'Active', date: '2026-01-01', meta: 'Origin: UK' },
            { id: 'SRV-02', title: 'China Sea Shipping - LCL Container', subtitle: '$180 / CBM (Est. 30-40 Days)', status: 'Active', date: '2026-01-01', meta: 'Origin: China' },
            { id: 'SRV-03', title: 'Ghana Nationwide Door Delivery', subtitle: 'Tiered delivery rate across Accra/Kumasi', status: 'Active', date: '2026-01-01', meta: 'Coverage: National' },
          ]
        };
      case 'routes':
        return {
          title: 'Shipping Routes & Hubs',
          icon: MapPin,
          addLabel: 'Add Route Corridor',
          mockItems: [
            { id: 'RT-01', title: 'London LHR → Accra ACC Air Corridor', subtitle: 'Frequency: 3 Flights Weekly (Tue/Thu/Sat)', status: 'Operational', date: 'Daily', meta: 'Transit: 3-5 Days' },
            { id: 'RT-02', title: 'Guangzhou Port → Tema Port Sea Corridor', subtitle: 'Frequency: Weekly Vessel Departure', status: 'Operational', date: 'Weekly', meta: 'Transit: 35 Days' },
          ]
        };
      case 'messages':
        return {
          title: 'Contact Form Inquiries',
          icon: FileText,
          addLabel: 'Compose Broadcast',
          mockItems: [
            { id: 'MSG-101', title: 'Inquiry regarding 500kg commercial air freight rate', subtitle: 'From: Yaw Acheampong (yaw@techgh.com)', status: 'Unread', date: '2026-08-11', meta: 'High Priority' },
            { id: 'MSG-102', title: 'Tracking update query for package #OGL9982UK', subtitle: 'From: Abena Serwaa (abena@gmail.com)', status: 'Replied', date: '2026-08-10', meta: 'Resolved' },
          ]
        };
      case 'testimonials':
        return {
          title: 'Customer Reviews Moderation',
          icon: Star,
          addLabel: 'Add Manual Testimonial',
          mockItems: [
            { id: 'REV-01', title: '"Fastest delivery from London to Accra! Packaging was intact."', subtitle: 'By: Dr. Emmanuel Frimpong', status: 'Published', date: '5 Stars', meta: 'Verified Buyer' },
            { id: 'REV-02', title: '"Great ocean freight rates from Ningbo. Very helpful staff."', subtitle: 'By: Sister Beatrice Logistics', status: 'Pending Review', date: '5 Stars', meta: 'Container Client' },
          ]
        };
      case 'users':
        return {
          title: 'Users & Staff Roles',
          icon: UserCheck,
          addLabel: 'Add Staff Member',
          mockItems: [
            { id: 'USR-01', title: 'John Mensah', subtitle: 'Super Administrator - john@obrems.com', status: 'Active', date: 'Joined Jan 2025', meta: 'Full Access' },
            { id: 'USR-02', title: 'Akosua Mensah', subtitle: 'UK Warehouse Manager - akosua@obrems.co.uk', status: 'Active', date: 'Joined Feb 2025', meta: 'Dispatch Role' },
            { id: 'USR-03', title: 'Kofi Owusu', subtitle: 'Ghana Customs Agent - kofi@obrems.com.gh', status: 'Active', date: 'Joined Mar 2025', meta: 'Clearance Role' },
          ]
        };
      case 'analytics':
        return {
          title: 'Performance & Growth Analytics',
          icon: BarChart3,
          addLabel: 'Export Analytics Report',
          mockItems: [
            { id: 'RPT-01', title: 'Monthly Tonnage Delivered (August 2026)', subtitle: '14.2 Tons Air Freight / 85 CBM Ocean Shipping', status: 'Calculated', date: 'Aug 2026', meta: '+18% YoY' },
            { id: 'RPT-02', title: 'On-Time Delivery Success Rate', subtitle: '98.4% of packages delivered within estimated window', status: 'Target Met', date: 'Aug 2026', meta: 'Benchmark: 95%' },
          ]
        };
      default:
        return {
          title: segment.toUpperCase().replace('-', ' ') + ' Management',
          icon: ShieldCheck,
          addLabel: `Add New ${segment}`,
          mockItems: [
            { id: 'ITEM-01', title: `Sample ${segment} Record #1`, subtitle: 'System generated operational record', status: 'Active', date: '2026-08-11', meta: 'System Standard' },
            { id: 'ITEM-02', title: `Sample ${segment} Record #2`, subtitle: 'System generated operational record', status: 'Active', date: '2026-08-10', meta: 'System Standard' },
          ]
        };
    }
  };

  const moduleConfig = getModuleConfig();
  const IconComp = moduleConfig.icon;

  const [items, setItems] = useState<MockItem[]>(moduleConfig.mockItems);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || item.status.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: MockItem = {
      id: `NEW-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTitle,
      subtitle: newSubtitle || 'Added via admin panel',
      status: 'Active',
      date: new Date().toISOString().split('T')[0],
      meta: newMeta || 'User Created'
    };

    setItems([newItem, ...items]);
    setShowAddModal(false);
    setNewTitle('');
    setNewSubtitle('');
    setNewMeta('');
    triggerToast(`Successfully added new record: ${newItem.title}`);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(i => i.id !== id));
    triggerToast(`Record ${id} removed.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#063B66] text-white px-5 py-3 rounded-lg shadow-xl border border-white/20 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#063B66]/10 flex items-center justify-center text-[#063B66]">
            <IconComp className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#063B66]">{moduleConfig.title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage and control {segment.replace('-', ' ')} records in real-time</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => triggerToast('Exporting data CSV report...')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B63CE] hover:bg-[#0952AD] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{moduleConfig.addLabel}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${segment}...`}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Active', 'Paid', 'Pending', 'Verified'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                activeFilter === filter
                  ? 'bg-[#063B66] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-white text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">ID / Reference</th>
                <th className="px-6 py-3.5">Title & Details</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Date / Time</th>
                <th className="px-6 py-3.5">Info / Meta</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#063B66]">{item.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{item.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'Paid' || item.status === 'Verified' || item.status === 'Active' || item.status === 'Completed' || item.status === 'Published' || item.status === 'Operational'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'Pending' || item.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{item.date}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{item.meta}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => triggerToast(`Viewing details for ${item.id}`)}
                          className="p-1.5 text-slate-400 hover:text-[#0B63CE] hover:bg-slate-100 rounded-md transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => triggerToast(`Editing ${item.id}`)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE RECORD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#063B66] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">{moduleConfig.addLabel}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title / Name *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. London Airport Customs Clearance"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Description</label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="e.g. Express air freight documentation"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">MetaData / Amount / Tag</label>
                <input
                  type="text"
                  value={newMeta}
                  onChange={(e) => setNewMeta(e.target.value)}
                  placeholder="e.g. £150.00 or High Priority"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0B63CE] hover:bg-[#0952AD] text-white text-xs font-bold shadow-sm"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

