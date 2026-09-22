import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Upload, Trash2, CheckCircle2, Copy } from 'lucide-react';
import api from '../../services/api';

interface MediaAsset {
  id: string;
  name: string;
  url: string;
  size: string;
  dimensions: string;
}

export default function AdminMediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaAsset[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    api.get('/media').then((response) => {
      setMediaItems((response.data?.data || []).map((item: any) => ({
        id: item._id,
        name: item.originalName || item.filename || item.label || 'Uploaded image',
        url: item.secureUrl || item.url,
        size: item.fileSize ? `${Math.round(item.fileSize / 1024)} KB` : 'Optimized',
        dimensions: item.width && item.height ? `${item.width} x ${item.height}` : 'Managed asset',
      })));
    }).catch(() => triggerToast('Failed to load media library.'));
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    triggerToast('Image URL copied to clipboard!');
  };

  const handleDelete = (id: string) => {
    api.delete(`/media/${id}`).then(() => {
      setMediaItems((current) => current.filter((item) => item.id !== id));
      triggerToast('Media file deleted.');
    }).catch(() => triggerToast('Failed to delete media file.'));
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('image', file);
      const upload = await api.post('/settings/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = upload.data?.url;
      if (!url) throw new Error('Upload did not return an image URL.');
      const saved = await api.post('/media', { filename: upload.data.imagePublicId, originalName: file.name, url, secureUrl: url, mimeType: upload.data.mimeType, fileSize: upload.data.fileSize, provider: 'local-optimized', isActive: true });
      const item = saved.data?.data;
      if (item) setMediaItems((current) => [{ id: item._id, name: item.originalName || file.name, url: item.secureUrl || item.url, size: `${Math.round((item.fileSize || file.size) / 1024)} KB`, dimensions: 'Optimized asset' }, ...current]);
      triggerToast('Image uploaded successfully.');
    } catch (error: any) {
      triggerToast(error?.response?.data?.message || 'Image upload failed.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
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
            <ImageIcon className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#063B66]">Media Library & Asset Manager</h1>
            <p className="text-xs text-slate-500 mt-0.5">Upload photos, website banners, and logistics promotional assets</p>
          </div>
        </div>

        <button
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B63CE] hover:bg-[#0952AD] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {mediaItems.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs group flex flex-col justify-between">
            <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
              <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-4 space-y-1">
              <p className="font-bold text-slate-800 text-xs truncate" title={item.name}>{item.name}</p>
              <p className="text-[11px] text-slate-400">{item.size} • {item.dimensions}</p>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-2">
                <button
                  onClick={() => handleCopyUrl(item.url)}
                  className="text-xs font-bold text-[#0B63CE] hover:text-[#063B66] flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy URL</span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
