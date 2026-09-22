import { useState } from 'react';
import {
  FileCheck,
  Plus,
  Search,
  Download,
  Eye,
  Trash2,
  CheckCircle2,
  X,
  FileText,
  Upload,
  Calendar,
  Lock
} from 'lucide-react';

interface DocItem {
  id: string;
  docNumber: string;
  title: string;
  category: 'Air Waybill' | 'Bill of Lading' | 'Customs Form' | 'Packing List';
  shipmentCode: string;
  fileSize: string;
  uploadDate: string;
  status: 'Verified' | 'Pending Review' | 'Archived';
}

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<DocItem[]>([
    {
      id: 'DOC-1',
      docNumber: 'AWB-90123-UK',
      title: 'Air Waybill Manifest - Flight BA078',
      category: 'Air Waybill',
      shipmentCode: 'OGL245678912UK',
      fileSize: '1.4 MB',
      uploadDate: '2026-08-10',
      status: 'Verified',
    },
    {
      id: 'DOC-2',
      docNumber: 'BOL-88219-CN',
      title: 'Ocean Bill of Lading (CMA CGM Vessel)',
      category: 'Bill of Lading',
      shipmentCode: 'OGL99823412CN',
      fileSize: '3.2 MB',
      uploadDate: '2026-08-08',
      status: 'Verified',
    },
    {
      id: 'DOC-3',
      docNumber: 'CUST-C2-401',
      title: 'GRA Customs Duty Assessment & Exemption Form',
      category: 'Customs Form',
      shipmentCode: 'OGL88371920GH',
      fileSize: '850 KB',
      uploadDate: '2026-08-11',
      status: 'Pending Review',
    },
    {
      id: 'DOC-4',
      docNumber: 'PACK-00219-UK',
      title: 'Sender Itemized Packing List & Commercial Invoice',
      category: 'Packing List',
      shipmentCode: 'OGL33410928UK',
      fileSize: '2.1 MB',
      uploadDate: '2026-08-09',
      status: 'Verified',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Air Waybill' | 'Bill of Lading' | 'Customs Form' | 'Packing List'>('Air Waybill');
  const [shipmentCode, setShipmentCode] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filteredDocs = docs.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.shipmentCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || d.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newDoc: DocItem = {
      id: `DOC-${Date.now()}`,
      docNumber: `DOC-${Math.floor(10000 + Math.random() * 90000)}`,
      title,
      category,
      shipmentCode: shipmentCode.toUpperCase() || 'OGL-GENERIC',
      fileSize: '1.8 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Verified',
    };

    setDocs([newDoc, ...docs]);
    setShowModal(false);
    setTitle('');
    setShipmentCode('');
    triggerToast(`Document ${newDoc.docNumber} uploaded successfully!`);
  };

  const handleDelete = (id: string) => {
    setDocs(docs.filter((d) => d.id !== id));
    triggerToast('Document deleted.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#063B66] text-white px-5 py-3 rounded-lg shadow-xl border border-white/20 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#063B66]/10 flex items-center justify-center text-[#063B66]">
            <FileCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#063B66]">Documents & Certificates</h1>
            <p className="text-xs text-slate-500 mt-0.5">Secure cloud repository for Air Waybills, Customs Forms, and Bills of Lading</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B63CE] hover:bg-[#0952AD] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search document title, AWB #, or shipment..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Air Waybill', 'Bill of Lading', 'Customs Form', 'Packing List'].map((tab) => (
            <button
              key={tab}
              onClick={() => setCategoryFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                categoryFilter === tab
                  ? 'bg-[#063B66] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-white text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Doc # / Ref</th>
                <th className="px-6 py-3.5">Document Title</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Shipment Code</th>
                <th className="px-6 py-3.5">Size & Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No documents found.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#063B66]">{doc.docNumber}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#0B63CE] shrink-0" />
                        <span>{doc.title}</span>
                      </p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{doc.category}</td>
                    <td className="px-6 py-4 font-mono text-slate-600">{doc.shipmentCode}</td>
                    <td className="px-6 py-4 text-slate-500">
                      <span>{doc.fileSize}</span> • <span className="text-[11px] font-mono">{doc.uploadDate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => triggerToast(`Downloading ${doc.docNumber}...`)}
                          className="p-1.5 text-slate-400 hover:text-[#0B63CE] hover:bg-slate-100 rounded-md transition-colors"
                          title="Download Document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
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

      {/* UPLOAD MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#063B66] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Upload Shipping Document</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AWB Air Waybill BA-078"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Category</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                >
                  <option value="Air Waybill">Air Waybill</option>
                  <option value="Bill of Lading">Bill of Lading</option>
                  <option value="Customs Form">Customs Form</option>
                  <option value="Packing List">Packing List</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Associated Shipment Tracking Code</label>
                <input
                  type="text"
                  value={shipmentCode}
                  onChange={(e) => setShipmentCode(e.target.value)}
                  placeholder="OGL245678912UK"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                />
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 cursor-pointer hover:bg-slate-100/80 transition-colors">
                <Upload className="w-8 h-8 text-[#0B63CE] mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-xs">Click to browse file (PDF, PNG, JPG)</p>
                <p className="text-[11px] text-slate-400 mt-1">Maximum file size: 10 MB</p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0B63CE] hover:bg-[#0952AD] text-white font-bold shadow-sm"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
