import { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, Download, CheckCircle2, Maximize2, X } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AdminAnalyticsPage() {
  const [toastMessage, setToastMessage] = useState('');
  const [expandedChart, setExpandedChart] = useState<'volume' | 'route' | null>(null);

  const volumeData = [
    { month: 'May', shipments: 180, delivered: 154 },
    { month: 'Jun', shipments: 210, delivered: 181 },
    { month: 'Jul', shipments: 248, delivered: 222 },
    { month: 'Aug', shipments: 286, delivered: 251 },
  ];
  const routeData = [
    { name: 'UK → Ghana Air', value: 58, color: '#0B63CE' },
    { name: 'China → Ghana Sea', value: 34, color: '#063B66' },
    { name: 'Ghana Door Delivery', value: 8, color: '#16A34A' },
    { name: 'USA → Ghana Air', value: 4, color: '#EAB308' },
    { name: 'Dubai → Ghana Air', value: 3, color: '#F97316' },
    { name: 'Other routes', value: 2, color: '#94A3B8' },
  ];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#063B66] text-white px-5 py-3 rounded-lg shadow-xl border border-white/20 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#063B66]/10 flex items-center justify-center text-[#063B66]">
            <BarChart3 className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#063B66]">Analytics & Business Performance</h1>
            <p className="text-xs text-slate-500 mt-0.5">Track shipment volume, revenue trends, flight vs sea modal split, and customer growth metrics</p>
          </div>
        </div>

        <button
          onClick={() => triggerToast('Exporting analytics CSV report...')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B63CE] hover:bg-[#0952AD] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics PDF</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">August Freight Tonnage</span>
          <p className="text-2xl font-extrabold text-[#063B66] mt-2">18.4 Tons</p>
          <span className="text-[11px] font-bold text-emerald-600">↑ 14% vs last month</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Sea Container Volume</span>
          <p className="text-2xl font-extrabold text-[#063B66] mt-2">92 CBM</p>
          <span className="text-[11px] font-bold text-emerald-600">↑ 22% vs last month</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">On-Time Delivery Rate</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">98.6%</p>
          <span className="text-[11px] text-slate-400">Target: 95.0%</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Active Client Accounts</span>
          <p className="text-2xl font-extrabold text-[#0B63CE] mt-2">1,248</p>
          <span className="text-[11px] font-bold text-emerald-600">↑ 84 new this month</span>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-[#063B66]">Corridor Freight Distribution</h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>UK → Ghana (Air Freight)</span>
                <span>58%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#0B63CE] rounded-full" style={{ width: '58%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>China → Ghana (Sea Cargo)</span>
                <span>34%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#063B66] rounded-full" style={{ width: '34%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Ghana Door Delivery Dispatch</span>
                <span>8%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '8%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-[#063B66]">Monthly Revenue Growth</h3>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span>August 2026 (MTD):</span>
              <strong className="text-slate-900">£142,500.00</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span>July 2026:</span>
              <strong className="text-slate-900">£128,100.00</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span>June 2026:</span>
              <strong className="text-slate-900">£115,400.00</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between"><div><h3 className="font-bold text-sm text-[#063B66]">Shipment Volume</h3><p className="mt-1 text-xs text-slate-500">Monthly shipments compared with delivered consignments</p></div><button onClick={() => setExpandedChart('volume')} title="View shipment volume chart large" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-[#0B63CE]"><Maximize2 className="h-4 w-4" /></button></div>
          <div className="mt-4 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={volumeData}><CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Bar dataKey="shipments" fill="#0B63CE" radius={[4, 4, 0, 0]} /><Bar dataKey="delivered" fill="#16A34A" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between"><div><h3 className="font-bold text-sm text-[#063B66]">Route Distribution</h3><p className="mt-1 text-xs text-slate-500">Share of active freight by route and service mode</p></div><button onClick={() => setExpandedChart('route')} title="View route chart large" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-[#0B63CE]"><Maximize2 className="h-4 w-4" /></button></div>
          <div className="mt-4 h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={routeData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={88} label>{routeData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
        </div>
      </div>

      {expandedChart && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="text-lg font-extrabold text-[#063B66]">{expandedChart === 'volume' ? 'Shipment Volume Detail' : 'Route Distribution Detail'}</h2><p className="mt-1 text-sm text-slate-500">Expanded operational view with comparative values and labels.</p></div><button onClick={() => setExpandedChart(null)} title="Close expanded chart" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-6 h-[28rem]">{expandedChart === 'volume' ? <ResponsiveContainer width="100%" height="100%"><BarChart data={volumeData}><CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Bar dataKey="shipments" fill="#0B63CE" name="All shipments" /><Bar dataKey="delivered" fill="#16A34A" name="Delivered" /></BarChart></ResponsiveContainer> : <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={routeData} dataKey="value" nameKey="name" innerRadius={90} outerRadius={145} label>{routeData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>}</div></div></div>}
    </div>
  );
}
