import { useState, useEffect } from 'react';
import { ShieldCheck, Search, Clock, RefreshCw, Filter, FileText } from 'lucide-react';
import api from '../../services/api';

interface AuditLog {
  _id: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceFilter, setResourceFilter] = useState('All');

  const fetchLogs = () => {
    setLoading(true);
    api.get('/audit')
      .then((res) => {
        if (res.data?.data) {
          setLogs(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch audit logs', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      (l.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.ipAddress || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesResource =
      resourceFilter === 'All' || (l.resource || '').toLowerCase() === resourceFilter.toLowerCase();

    return matchesSearch && matchesResource;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-[1200px] mx-auto">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#063B66]/10 flex items-center justify-center text-[#063B66]">
            <ShieldCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#063B66]">Security &amp; Audit Logs</h1>
            <p className="text-xs text-slate-500 mt-0.5">Immutable record of administrative actions, invoice events, and billing mutations</p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search logs by operator, action, invoice details or IP..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Invoice', 'Settings', 'Shipment', 'Customer'].map((res) => (
            <button
              key={res}
              onClick={() => setResourceFilter(res)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                resourceFilter === res
                  ? 'bg-[#063B66] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#F4F7FA] text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Operator</th>
                <th className="px-6 py-3.5">Action Executed</th>
                <th className="px-6 py-3.5">Resource</th>
                <th className="px-6 py-3.5">Audit Details</th>
                <th className="px-6 py-3.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500 text-[11px]">
                      {new Date(log.createdAt).toLocaleString('en-GB', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{log.userName || 'Administrator'}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{log.userRole || 'Admin'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-[#0B63CE] bg-blue-50/80 border border-blue-100 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-600 font-bold">
                      {log.resource || 'System'}
                    </td>
                    <td className="px-6 py-4 text-slate-700 max-w-sm font-medium">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
