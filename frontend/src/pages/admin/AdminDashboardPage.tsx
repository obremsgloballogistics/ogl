import { useEffect, useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  Server,
  HardDrive,
  Mail,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../../services/api';

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    api
      .get('/analytics')
      .then((response) => {
        if (response.data?.data) {
          setAnalytics(response.data.data);
        }
      })
      .catch(() => {
        // Fallback demo data
      });
  }, []);

  const summary = [
    {
      title: 'Total Shipments',
      value: analytics?.totalShipments || '1,248',
      trend: '18.6%',
      isUp: true,
      icon: Package,
      iconBg: 'bg-slate-100 text-slate-600',
    },
    {
      title: 'In Transit',
      value: analytics?.inTransit || '286',
      trend: '12.4%',
      isUp: true,
      icon: Truck,
      iconBg: 'bg-slate-100 text-slate-600',
    },
    {
      title: 'Delivered',
      value: analytics?.delivered || '892',
      trend: '22.7%',
      isUp: true,
      icon: CheckCircle2,
      iconBg: 'bg-slate-100 text-slate-600',
    },
    {
      title: 'Pending',
      value: analytics?.pending || '70',
      trend: '5.3%',
      isUp: false,
      icon: Clock,
      iconBg: 'bg-slate-100 text-slate-600',
    },
    {
      title: 'Total Customers',
      value: analytics?.totalCustomers || '654',
      trend: '15.8%',
      isUp: true,
      icon: Users,
      iconBg: 'bg-slate-100 text-slate-600',
    },
    {
      title: 'Pending Quotes',
      value: analytics?.pendingQuotes || '12',
      trend: '14.3%',
      isUp: false,
      icon: FileText,
      iconBg: 'bg-slate-100 text-slate-600',
    },
    {
      title: 'Revenue (This Month)',
      value: analytics?.revenue || '$86,540',
      trend: '23.1%',
      isUp: true,
      icon: DollarSign,
      iconBg: 'bg-slate-100 text-slate-600',
    },
  ];

  const shipmentsTrend = analytics?.shipmentsOverTime || [
    { name: 'Dec 2025', value: 60 },
    { name: 'Jan 2026', value: 120 },
    { name: 'Feb 2026', value: 140 },
    { name: 'Mar 2026', value: 175 },
    { name: 'Apr 2026', value: 135 },
    { name: 'May 2026', value: 210 },
  ];

  const shipmentsByRoute = [
    { name: 'UK → Ghana (Air)', value: 48, color: '#0B63CE' },
    { name: 'China → Ghana (Sea & Air)', value: 42, color: '#16A34A' },
    { name: 'Other Routes', value: 10, color: '#EAB308' },
  ];

  const shipmentsByMethod = [
    { name: 'Air Freight', value: 60, color: '#0B63CE' },
    { name: 'Sea & Air Freight', value: 35, color: '#16A34A' },
    { name: 'Other', value: 5, color: '#EAB308' },
  ];

  const shipmentStatus = [
    { name: 'Delivered', value: 71.5, color: '#16A34A' },
    { name: 'In Transit', value: 22.9, color: '#0B63CE' },
    { name: 'Pending', value: 5.6, color: '#EAB308' },
  ];

  const recentShipments = [
    { tracking: 'OGL88452310UK', customer: 'John Mensah', route: 'UK → Ghana (Air)', status: 'In Transit', updated: 'May 11, 2026 10:30 AM', statusColor: 'bg-white text-slate-700 border border-slate-200' },
    { tracking: 'OGL99823412CN', customer: 'Ama Boateng', route: 'China → Ghana (Sea & Air)', status: 'Arrived in Ghana', updated: 'May 11, 2026 09:15 AM', statusColor: 'bg-white text-slate-700 border border-slate-200' },
    { tracking: 'OGL33781205UK', customer: 'Kofi Agyeman', route: 'UK → Ghana (Air)', status: 'Out for Delivery', updated: 'May 11, 2026 08:45 AM', statusColor: 'bg-white text-slate-700 border border-slate-200' },
    { tracking: 'OGL77261890CN', customer: 'Akosua Adjei', route: 'China → Ghana (Sea & Air)', status: 'Customs Clearance', updated: 'May 10, 2026 03:20 PM', statusColor: 'bg-white text-slate-700 border border-slate-200' },
    { tracking: 'OGL55134720GH', customer: 'Yaw Addo', route: 'UK → Ghana (Air)', status: 'Delivered', updated: 'May 10, 2026 11:40 AM', statusColor: 'bg-white text-slate-700 border border-slate-200' },
  ];

  const recentQuotes = [
    { id: 'Q-2026-00125', customer: 'Emmanuel Asante', route: 'UK → Ghana (Air)', status: 'Pending', received: 'May 11, 2026', statusColor: 'bg-white text-slate-700 border border-slate-200' },
    { id: 'Q-2026-00124', customer: 'Josephine Owusu', route: 'China → Ghana (Sea & Air)', status: 'Reviewed', received: 'May 10, 2026', statusColor: 'bg-white text-slate-700 border border-slate-200' },
    { id: 'Q-2026-00123', customer: 'Daniel Tetteh', route: 'UK → Ghana (Air)', status: 'Quoted', received: 'May 10, 2026', statusColor: 'bg-white text-slate-700 border border-slate-200' },
    { id: 'Q-2026-00122', customer: 'Linda Ofori', route: 'China → Ghana (Sea & Air)', status: 'Pending', received: 'May 9, 2026', statusColor: 'bg-white text-slate-700 border border-slate-200' },
    { id: 'Q-2026-00121', customer: 'Prince Kwarteng', route: 'UK → Ghana (Air)', status: 'Accepted', received: 'May 9, 2026', statusColor: 'bg-white text-slate-700 border border-slate-200' },
  ];

  const topCustomers = [
    { name: 'John Mensah', shipments: 18, spent: '$24,650' },
    { name: 'Ama Boateng', shipments: 15, spent: '$18,450' },
    { name: 'Kofi Agyeman', shipments: 12, spent: '$15,230' },
    { name: 'Akosua Adjei', shipments: 10, spent: '$11,870' },
    { name: 'Yaw Addo', shipments: 9, spent: '$9,560' },
  ];

  const topRoutes = [
    { route: 'UK → Ghana (Air)', shipments: 598, max: 600 },
    { route: 'China → Ghana (Sea & Air)', shipments: 524, max: 600 },
    { route: 'USA → Ghana (Air)', shipments: 76, max: 600 },
    { route: 'Dubai → Ghana (Air)', shipments: 30, max: 600 },
    { route: 'Other Routes', shipments: 20, max: 600 },
  ];

  const systemOverview = [
    { label: 'Database', status: 'Online', icon: Database },
    { label: 'API Server', status: 'Online', icon: Server },
    { label: 'Storage', status: 'Online', icon: HardDrive },
    { label: 'Email Service', status: 'Online', icon: Mail },
    { label: 'Backup Status', status: 'Completed (May 11, 2026 02:00 AM)', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* HEADER WELCOME & DATE FILTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#063B66]">Dashboard</h2>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, John! Here's what's happening with your logistics operations.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs font-semibold text-slate-700">
          <span>May 5, 2026 - May 11, 2026</span>
          <Calendar className="w-4 h-4 text-[#0B63CE] shrink-0" />
        </div>
      </div>

      {/* 7 KPI METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {summary.map((card) => {
          const IconComp = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight leading-tight">
                  {card.title}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}>
                  <IconComp className="w-4 h-4" />
                </div>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-[#063B66]">{card.value}</p>
                <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold">
                  {card.isUp ? (
                    <span className="text-slate-500 flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>{card.trend}</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-0.5">
                      <ArrowDownRight className="w-3 h-3" />
                      <span>{card.trend}</span>
                    </span>
                  )}
                  <span className="text-slate-400 font-normal">from last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4 CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Line Chart: Shipments Over Time */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#063B66]">Shipments Over Time</h4>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={shipmentsTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#0B63CE" strokeWidth={3} dot={{ r: 4, fill: '#0B63CE' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Shipments by Route */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#063B66]">Shipments by Route</h4>
          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={shipmentsByRoute} dataKey="value" innerRadius={42} outerRadius={68} paddingAngle={3}>
                  {shipmentsByRoute.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-[11px] pt-1 border-t border-slate-100">
            {shipmentsByRoute.map((r) => (
              <div key={r.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                  <span>{r.name}</span>
                </span>
                <span className="font-bold text-[#063B66]">{r.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart: Shipments by Method */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#063B66]">Shipments by Method</h4>
          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={shipmentsByMethod} dataKey="value" innerRadius={42} outerRadius={68} paddingAngle={3}>
                  {shipmentsByMethod.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-[11px] pt-1 border-t border-slate-100">
            {shipmentsByMethod.map((m) => (
              <div key={m.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                  <span>{m.name}</span>
                </span>
                <span className="font-bold text-[#063B66]">{m.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart: Shipment Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#063B66]">Shipment Status</h4>
          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={shipmentStatus} dataKey="value" innerRadius={42} outerRadius={68} paddingAngle={3}>
                  {shipmentStatus.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-[11px] pt-1 border-t border-slate-100">
            {shipmentStatus.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span>{s.name}</span>
                </span>
                <span className="font-bold text-[#063B66]">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MIDDLE DATA TABLES (RECENT SHIPMENTS & QUOTE REQUESTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Table 1: Recent Shipments */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#063B66]">Recent Shipments</h3>
            <button className="text-xs font-bold text-[#0B63CE] hover:underline">View All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Tracking Number</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Route</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Last Update</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentShipments.map((row) => (
                  <tr key={row.tracking} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#063B66]">{row.tracking}</td>
                    <td className="py-3 px-3 font-medium">{row.customer}</td>
                    <td className="py-3 px-3 text-slate-500">{row.route}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{row.updated}</td>
                    <td className="py-3 px-3 text-right">
                      <button className="text-[#0B63CE] font-bold hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Recent Quote Requests */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#063B66]">Recent Quote Requests</h3>
            <button className="text-xs font-bold text-[#0B63CE] hover:underline">View All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Quote ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Route</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#063B66]">{q.id}</td>
                    <td className="py-3 px-3 font-medium">{q.customer}</td>
                    <td className="py-3 px-3 text-slate-500">{q.route}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${q.statusColor}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400 font-mono text-[11px]">{q.received}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BOTTOM GRID (TOP CUSTOMERS, TOP ROUTES, SYSTEM OVERVIEW, STORAGE USAGE) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Top Customers */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#063B66]">Top Customers</h4>
            <button className="text-xs font-bold text-[#0B63CE] hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {topCustomers.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#063B66] text-white flex items-center justify-center font-bold text-[10px]">
                    {c.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-[#063B66]">{c.name}</p>
                    <p className="text-[10px] text-slate-400">{c.shipments} shipments</p>
                  </div>
                </div>
                <span className="font-extrabold text-slate-800">{c.spent}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Routes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#063B66]">Top Routes</h4>
            <button className="text-xs font-bold text-[#0B63CE] hover:underline">View All</button>
          </div>
          <div className="space-y-3.5 pt-1">
            {topRoutes.map((r) => (
              <div key={r.route} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{r.route}</span>
                  <span className="font-bold text-[#063B66]">{r.shipments}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0B63CE] h-full rounded-full"
                    style={{ width: `${(r.shipments / r.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#063B66]">System Overview</h4>
          <div className="space-y-2.5 pt-1">
            {systemOverview.map((item) => {
              const IconComp = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <IconComp className="w-4 h-4 text-[#0B63CE]" />
                    <span className="font-semibold text-slate-700">{item.label}</span>
                  </div>
                  <span className="font-bold text-emerald-600 text-[11px]">{item.status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Storage Usage Gauge */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#063B66]">Storage Usage</h4>

          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  stroke="#E2E8F0"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  stroke="#0B63CE"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="326.72"
                  strokeDashoffset={326.72 * (1 - 0.62)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-[#063B66]">62%</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Used</span>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-600 mt-3">124 GB / 200 GB</p>
          </div>
        </div>
      </div>
    </div>
  );
}

