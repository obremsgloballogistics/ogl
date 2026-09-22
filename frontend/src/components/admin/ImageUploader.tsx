import { useRef, useState } from "react";
import { Upload, Link as LinkIcon, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import api from "../../services/api";

interface ImageUploaderProps {
  label: string;
  fieldName: string;
  currentUrl: string;
  onChange: (url: string) => void;
  hint?: string;
}

export default function ImageUploader({ label, fieldName, currentUrl, onChange, hint }: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [urlInput, setUrlInput] = useState(currentUrl || "");

  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    onChange(val);
    setError("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/settings/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data?.url;
      if (url) {
        setUrlInput(url);
        onChange(url);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const clearImage = () => {
    setUrlInput("");
    onChange("");
    setError("");
  };

  return (
    <div className="space-y-2">
      <label htmlFor={fieldName} className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{label}</label>
      <div className="flex gap-3">
        <div 
          className="shrink-0 w-20 h-20 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center"
          style={{
            backgroundColor: urlInput ? 'transparent' : '#f8fafc'
          }}
        >
          {urlInput ? (
            <img
              src={urlInput}
              alt={label}
              className="w-full h-full object-contain p-1"
              onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-slate-300">
              <LinkIcon className="w-5 h-5" />
              <span className="text-[9px]">No image</span>
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <input
              id={fieldName}
              type="text"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://your-domain.com/image.jpg or upload below"
              className="flex-1 px-3 py-2 bg-[#F4F7FA] border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:bg-white transition-colors"
            />
            {urlInput && (
              <button type="button" onClick={clearImage} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Clear image">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#063B66] hover:bg-[#0B63CE] text-white text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? "Uploading…" : "Upload File"}
            </button>
            {success && <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Uploaded!</span>}
            {error && <span className="flex items-center gap-1 text-rose-600 text-xs font-semibold"><AlertCircle className="w-3.5 h-3.5" /> {error}</span>}
          </div>
          {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleFileUpload} className="hidden" />
    </div>
  );
}
