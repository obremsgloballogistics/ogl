import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  Calendar,
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

interface CountEntry {
  _id: string;
  count: number;
}

interface MonthlyShipmentEntry {
  _id: { year: number; month: number };
  count: number;
}

interface PopulatedCustomer {
  name?: string;
  email?: string;
}

interface RecentShipment {
  _id: string;
  trackingNumber: string;
  customer: PopulatedCustomer | string | null;
  origin: string;
  destination: string;
  route: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface RecentQuote {
  _id: string;
  fullName?: string;
  email?: string;
  route?: string;
  status?: string;
  createdAt?: string;
}

interface TopCustomer {
  _id: string;
  name: string;
  email: string;
  shipmentCount: number;
}

interface DashboardAnalytics {
  totalShipments: number;
  totalCustomers: number;
  totalQuotes: number;
  pendingQuotes: number;
  monthlyShipments: MonthlyShipmentEntry[];
  byRoute: CountEntry[];
  topRoutes: CountEntry[];
  byMethod: CountEntry[];
  statusDistribution: CountEntry[];
  recentShipments: RecentShipment[];
  recentQuotes: RecentQuote[];
  topCustomers: TopCustomer[];
}

interface AnalyticsApiResponse {
  success: boolean;
  data: DashboardAnalytics;
}

interface ChartEntry {
  name: string;
  value: number;
  color: string;
}

const CHART_COLORS = ['#0B63CE', '#16A34A', '#EAB308', '#64748B', '#9333EA'];
const STATUS_COLORS = ['#16A34A', '#0B63CE', '#EAB308', '#64748B', '#9333EA'];

function formatStatus(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function getCustomerName(customer: RecentShipment['customer']) {
  if (!customer) return '—';
  if (typeof customer === 'string') return customer;
  return customer.name || customer.email || '—';
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('obrems_user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'Team';

  useEffect(() => {
    let isMounted = true;

    api
      .get<AnalyticsApiResponse>('/analytics')
      .then((response) => {
        if (isMounted) {
          setAnalytics(response.data.data);
          setError('');
        }
      })
      .catch((requestError: unknown) => {
        if (isMounted) {
          setError(
            axios.isAxiosError<{ message?: string }>(requestError)
              ? requestError.response?.data?.message || requestError.message
              : requestError instanceof Error
                ? requestError.message
                : 'Unable to load dashboard analytics.',
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const statusMap = (analytics?.statusDistribution || []).reduce((acc, item) => {
    const label = item._id.trim().toLowerCase().replace(/[_-]+/g, ' ');
    acc[label] = item.count;
    return acc;
  }, {} as Record<string, number>);

  const totalShipments = analytics?.totalShipments ?? 0;
  const deliveredCount = statusMap.delivered || 0;
  const inTransitCount = Object.entries(statusMap)
    .filter(([status]) => status.includes('transit'))
    .reduce((total, [, count]) => total + count, 0);
  const pendingCount = statusMap.pending || 0;

  const summary = [
    {
      title: 'Total Shipments',
      value: totalShipments,
      icon: Package,
      iconBg: 'bg-slate-100 text-slate-600',
    },
    {
      title: 'In Transit',
      value: inTransitCount,
      icon: Truck,
      iconBg: 'bg-slate-100 text-slate-600',
    },
    {
      title: 'Delivered',
      value: deliveredCount,
      icon: CheckCircle2,
      iconBg: 'bg-slate-100 text-slate-600',
    },
    {
      title: 'Pending',
      value: pendingCount,
      icon: Clock,
      iconBg: 'bg-slate-100 text-slate-600',
    },
    {
      title: 'Total Customers',
      value: analytics?.totalCustomers ?? 0,
      icon: Users,
      iconBg: 'bg-slate-100 text-slate-600',
    },
    {
      title: 'Total Quotes',
      value: analytics?.totalQuotes ?? 0,
      icon: FileText,
      iconBg: 'bg-slate-100 text-slate-600',
    },
    {
      title: 'Pending Quotes',
      value: analytics?.pendingQuotes ?? 0,
      icon: Clock,
      iconBg: 'bg-slate-100 text-slate-600',
    },
  ];

  const shipmentsTrend = (analytics?.monthlyShipments || []).map((item) => ({
    name: new Date(Date.UTC(item._id.year, item._id.month - 1, 1))
      .toLocaleDateString(undefined, { month: 'short', year: '2-digit', timeZone: 'UTC' }),
    value: item.count,
  }));

  const toChartEntries = (entries: CountEntry[], colors: string[]): ChartEntry[] =>
    entries.map((entry, index) => ({
      name: formatStatus(entry._id),
      value: entry.count,
      color: colors[index % colors.length],
    }));
  const shipmentsByRoute = toChartEntries(analytics?.byRoute || [], CHART_COLORS);
  const shipmentsByMethod = toChartEntries(analytics?.byMethod || [], CHART_COLORS);
  const shipmentStatus = toChartEntries(analytics?.statusDistribution || [], STATUS_COLORS);
  const totalRouteShipments = shipmentsByRoute.reduce((total, entry) => total + entry.value, 0);
  const recentShipments = analytics?.recentShipments || [];
  const recentQuotes = analytics?.recentQuotes || [];
  const topCustomers = analytics?.topCustomers || [];
  const topRoutes = analytics?.topRoutes || [];
  const todayLabel = new Date().toLocaleDateString(undefined, { dateStyle: 'medium' });

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
          <span>Dashboard data could not be loaded: {error}</span>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError('');
              setReloadKey((key) => key + 1);
            }}
            className="font-bold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* HEADER WELCOME & DATE FILTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#063B66]">Dashboard</h2>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, {userName}. Overview of your logistics operations.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs font-semibold text-slate-700">
          <span>{todayLabel}</span>
          <Calendar className="w-4 h-4 text-[#0B63CE] shrink-0" />
        </div>
      </div>

      {/* Live operational metrics */}
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
                <p className="text-2xl font-extrabold text-[#063B66]">
                  {loading ? '—' : analytics ? card.value.toLocaleString() : '—'}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {loading ? 'Loading live data' : 'Current total'}
                </p>
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
            {shipmentsTrend.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={shipmentsTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" name="Shipments" stroke="#0B63CE" strokeWidth={3} dot={{ r: 4, fill: '#0B63CE' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                {loading ? 'Loading shipment activity…' : 'No shipments recorded in the last 12 months.'}
              </div>
            )}
          </div>
        </div>

        {/* Donut Chart: Shipments by Route */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#063B66]">Shipments by Route</h4>
          <div className="h-44 relative flex items-center justify-center">
            {shipmentsByRoute.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={shipmentsByRoute} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} paddingAngle={3}>
                    {shipmentsByRoute.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <span className="text-sm text-slate-500">{loading ? 'Loading…' : 'No route data'}</span>}
          </div>
          <div className="space-y-1.5 text-[11px] pt-1 border-t border-slate-100">
            {shipmentsByRoute.map((r) => (
              <div key={r.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                  <span>{r.name}</span>
                </span>
                <span className="font-bold text-[#063B66]">
                  {r.value.toLocaleString()} ({totalRouteShipments ? Math.round((r.value / totalRouteShipments) * 100) : 0}%)
                </span>
              </div>
            ))}{!shipmentsByRoute.length && !loading && <p className="py-2 text-center text-slate-500">No shipment route data yet.</p>}
          </div>
        </div>

        {/* Donut Chart: Shipments by Method */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#063B66]">Shipments by Method</h4>
          <div className="h-44 relative flex items-center justify-center">
            {shipmentsByMethod.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={shipmentsByMethod} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} paddingAngle={3}>
                    {shipmentsByMethod.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <span className="text-sm text-slate-500">{loading ? 'Loading…' : 'No method data'}</span>}
          </div>
          <div className="space-y-1.5 text-[11px] pt-1 border-t border-slate-100">
            {shipmentsByMethod.map((m) => (
              <div key={m.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                  <span>{m.name}</span>
                </span>
                <span className="font-bold text-[#063B66]">{m.value.toLocaleString()}</span>
              </div>
            ))}{!shipmentsByMethod.length && !loading && <p className="py-2 text-center text-slate-500">No shipping method data yet.</p>}
          </div>
        </div>

        {/* Donut Chart: Shipment Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#063B66]">Shipment Status</h4>
          <div className="h-44 relative flex items-center justify-center">
            {shipmentStatus.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={shipmentStatus} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} paddingAngle={3}>
                    {shipmentStatus.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <span className="text-sm text-slate-500">{loading ? 'Loading…' : 'No status data'}</span>}
          </div>
          <div className="space-y-1.5 text-[11px] pt-1 border-t border-slate-100">
            {shipmentStatus.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span>{s.name}</span>
                </span>
                <span className="font-bold text-[#063B66]">{s.value.toLocaleString()}</span>
              </div>
            ))}{!shipmentStatus.length && !loading && <p className="py-2 text-center text-slate-500">No shipment status data yet.</p>}
          </div>
        </div>
      </div>

      {/* MIDDLE DATA TABLES (RECENT SHIPMENTS & QUOTE REQUESTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Table 1: Recent Shipments */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#063B66]">Recent Shipments</h3>
            <button onClick={() => navigate('../shipments')} className="text-xs font-bold text-[#0B63CE] hover:underline">View All</button>
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
                {recentShipments.length ? recentShipments.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#063B66]">{row.trackingNumber || '—'}</td>
                    <td className="py-3 px-3 font-medium">{getCustomerName(row.customer)}</td>
                    <td className="py-3 px-3 text-slate-500">{row.route || [row.origin, row.destination].filter(Boolean).join(' → ') || '—'}</td>
                    <td className="py-3 px-3">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                        {formatStatus(row.status)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{formatDate(row.updatedAt)}</td>
                    <td className="py-3 px-3 text-right">
                      <button onClick={() => navigate('../shipments')} className="text-[#0B63CE] font-bold hover:underline">View</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-8 px-3 text-center text-sm text-slate-500">
                      {loading ? 'Loading recent shipments…' : 'No shipment activity recorded yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Recent Quote Requests */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#063B66]">Recent Quote Requests</h3>
            <button onClick={() => navigate('../quotes')} className="text-xs font-bold text-[#0B63CE] hover:underline">View All</button>
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
                {recentQuotes.length ? recentQuotes.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#063B66]">{q._id}</td>
                    <td className="py-3 px-3 font-medium">{q.fullName || q.email || '—'}</td>
                    <td className="py-3 px-3 text-slate-500">{q.route || '—'}</td>
                    <td className="py-3 px-3">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                        {formatStatus(q.status || 'Unknown')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400 font-mono text-[11px]">{formatDate(q.createdAt)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-8 px-3 text-center text-sm text-slate-500">
                      {loading ? 'Loading recent quote requests…' : 'No quote requests have been submitted yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Additional database-backed breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#063B66]">Top Customers</h4>
            <button onClick={() => navigate('../customers')} className="text-xs font-bold text-[#0B63CE] hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {topCustomers.length ? topCustomers.map((customer) => (
              <div key={customer._id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#063B66] text-white flex items-center justify-center font-bold text-[10px]">
                    {customer.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-[#063B66]">{customer.name}</p>
                    <p className="text-[10px] text-slate-400">{customer.email}</p>
                  </div>
                </div>
                <span className="font-extrabold text-slate-800">{customer.shipmentCount.toLocaleString()} shipments</span>
              </div>
            )) : (
              <p className="text-sm text-slate-500 py-4 text-center">
                {loading ? 'Loading customer activity…' : 'No customer shipment activity yet.'}
              </p>
            )}
          </div>
        </div>

        {/* Top Routes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#063B66]">Top Routes</h4>
            <button onClick={() => navigate('../shipments')} className="text-xs font-bold text-[#0B63CE] hover:underline">View All</button>
          </div>
          <div className="space-y-3.5 pt-1">
            {topRoutes.length ? topRoutes.map((route) => (
              <div key={route._id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{route._id}</span>
                  <span className="font-bold text-[#063B66]">{route.count.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0B63CE] h-full rounded-full"
                    style={{ width: `${topRoutes[0]?.count ? (route.count / topRoutes[0].count) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500 py-4 text-center">
                {loading ? 'Loading route data…' : 'No route data available yet.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
