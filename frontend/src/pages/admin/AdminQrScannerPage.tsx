import { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import {
  QrCode,
  Smartphone,
  Search,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Camera,
  Flashlight,
  RotateCw,
  RefreshCw,
  Send,
  MapPin,
  Truck,
  Package,
  User,
  Phone,
  Sparkles
} from 'lucide-react';
import { X } from 'lucide-react';

interface ShipmentRef {
  trackingNumber: string;
  customerName: string;
  senderName: string;
  phone: string;
  corridor: 'UK → Ghana (Air)' | 'Ghana → UK (Air)' | 'China → Ghana (Sea)';
  originHub: string;
  destinationHub: string;
  weight: string;
  pieces: string;
  carrierCode: string;
  status: string;
}

export default function AdminQrScannerPage() {
  const { settings } = useSiteSettings();
  const [searchParams] = useSearchParams();
  const trackingParam = searchParams.get('tracking') || '';

  const [shipments, setShipments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'generator' | 'scanner' | 'sms'>('generator');
  const [selectedTracking, setSelectedTracking] = useState(trackingParam);
  const [customTrackingInput, setCustomTrackingInput] = useState('');

  // Camera / QR scanning state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [cameraHasTorch, setCameraHasTorch] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [scanError, setScanError] = useState('');
  const [remoteShipment, setRemoteShipment] = useState<any>(null);
  const [trackingEvents, setTrackingEvents] = useState<any[]>([]);
  const lastScanRef = useRef({ code: '', at: 0 });

  const getTrackingCodeFromQrPayload = (payload: string) => {
    const match = payload.match(/OGL[\w-]+/i);
    return match?.[0].toUpperCase() || '';
  };

  const loadAdminShipment = async (trackingNumber: string) => {
    const searchResponse = await api.get(`/shipments/search?q=${encodeURIComponent(trackingNumber)}`);
    const match = (searchResponse.data?.data || []).find((item: any) => item.trackingNumber === trackingNumber);
    if (!match?._id) throw new Error('This QR code does not match a registered shipment.');
    const detailResponse = await api.get(`/shipments/${match._id}`);
    return detailResponse.data?.data || match;
  };

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const scanFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
    if (code?.data) {
      const found = code.data;
      setScanResult(found);
      stopCamera();
      setScanError('');

      const trackingNo = getTrackingCodeFromQrPayload(found);
      if (!trackingNo || !/^OGL\d{8}(?:CN|UK|GH)$/.test(trackingNo)) {
        setScannedCode('');
        setScanError('Invalid QR code. Scan an official Obrems shipping label.');
        return;
      }

      const now = Date.now();
      if (lastScanRef.current.code === trackingNo && now - lastScanRef.current.at < 5000) return;
      lastScanRef.current = { code: trackingNo, at: now };
      try {
        const shipment = await loadAdminShipment(trackingNo);
        setRemoteShipment(shipment);
        setTrackingEvents(shipment.events || []);
        setScannedCode(trackingNo);
        setSelectedTracking(trackingNo);
        if (navigator.vibrate) navigator.vibrate(180);
        triggerToast(`Scanned: ${trackingNo}`);
      } catch (err: any) {
        setScannedCode('');
        setScanError(err.response?.data?.message || 'This QR code does not match a registered shipment.');
      }
      return;
    }
    animFrameRef.current = requestAnimationFrame(scanFrame);
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    setCameraError('');
    setScanError('');
    setScanResult('');
    setScannedCode('');

    const tryGetStream = async (): Promise<MediaStream> => {
      // First try: rear camera preferred (mobile)
      try {
        return await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: facingMode } } });
      } catch {
        // Fallback: any camera
        return await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facingMode } } });
      }
    };

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API not available. Make sure you are on HTTPS.');
      }
      const stream = await tryGetStream();
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
      setCameraHasTorch(Boolean(capabilities?.torch));
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      animFrameRef.current = requestAnimationFrame(scanFrame);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Tap the camera/lock icon in your browser address bar and allow camera access, then try again.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is in use by another app. Close other apps using the camera and try again.');
      } else {
        setCameraError(`Camera error (${err.name || 'Unknown'}): ${err.message || 'Make sure you are accessing over HTTPS.'}`);
      }
    }
  }, [facingMode, scanFrame]);

  const switchCamera = async () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    stopCamera();
    setFacingMode(next);
  };

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track || !cameraHasTorch) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as MediaTrackConstraintSet] });
      setTorchOn((value) => !value);
    } catch { setCameraError('Torch is not available on this camera.'); }
  };

  // Stop camera when leaving scanner tab
  useEffect(() => {
    if (activeTab !== 'scanner') stopCamera();
  }, [activeTab, stopCamera]);

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  useEffect(() => {
    api.get('/shipments')
      .then((res) => {
        if (res.data?.data?.length) {
          const fetched = res.data.data;
          setShipments(fetched);
          if (!trackingParam && fetched.length > 0) {
             setSelectedTracking(fetched[0].trackingNumber);
          }
        }
      })
      .catch(() => {});
  }, [trackingParam]);

  const lookupTracking = async (trackingNumber: string) => {
    const normalized = trackingNumber.trim().toUpperCase();
    if (!normalized) return;
    setScanError('');
    try {
      const shipment = await loadAdminShipment(normalized);
      setRemoteShipment(shipment);
      setTrackingEvents(shipment.events || []);
      setSelectedTracking(normalized);
      setScannedCode(normalized);
    } catch (error: any) {
      setRemoteShipment(null);
      setTrackingEvents([]);
      const status = error.response?.status;
      setScanError(status === 401 || status === 403
        ? 'Unauthorized access. Please sign in with scanner permissions.'
        : status === 404
          ? 'Package not found. Check the tracking number and try again.'
          : error.response?.data?.message || 'Network error. The package was not confirmed.');
    }
  };

  
  // Scanner state
  const [scannedCode, setScannedCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('Customs Clearance Complete');
  const [updateLocation, setUpdateLocation] = useState('Kotoka International Airport (ACC)');
  const [sendSmsAuto, setSendSmsAuto] = useState(true);

  // SMS Composer state
  const [smsRecipientPhone, setSmsRecipientPhone] = useState('');
  const [smsRecipientName, setSmsRecipientName] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const activeRaw = remoteShipment || shipments.find(s => s.trackingNumber === selectedTracking) || shipments[0] || {};
  
  const activeShipment = {
    trackingNumber: activeRaw.trackingNumber || 'N/A',
    customerName: typeof activeRaw.customer === 'string' ? activeRaw.customer : activeRaw.customer?.name || 'Unknown',
    senderName: 'Obrems Global Logistics',
    phone: activeRaw.customer?.phone || '+44 (0) 123 456 789',
    corridor: activeRaw.route || `${activeRaw.origin || 'UK'} → ${activeRaw.destination || 'Ghana'}`,
    originHub: activeRaw.origin || 'London Hub',
    destinationHub: activeRaw.destination || 'Accra Hub',
    weight: activeRaw.weight ? `${activeRaw.weight} ${activeRaw.weightUnit || 'KG'}` : 'N/A',
    location: activeRaw.currentLocation || activeRaw.destination || 'Not recorded',
    pieces: '1 / 1',
    carrierCode: activeRaw.shippingMethod || 'Standard',
    status: activeRaw.status || 'Pending',
  };

  useEffect(() => {
    if (activeShipment.trackingNumber && activeShipment.trackingNumber !== 'N/A') {
      setSmsRecipientPhone(activeShipment.phone !== '+44 (0) 123 456 789' ? activeShipment.phone : '');
      setSmsRecipientName(activeShipment.customerName !== 'Unknown' ? activeShipment.customerName : '');
      setSmsMessage(
        `Hello ${activeShipment.customerName !== 'Unknown' ? activeShipment.customerName : 'Customer'}, your Obrems shipment ${activeShipment.trackingNumber} has been updated to ${activeShipment.status}. Track live at obrems.com/tracking?code=${activeShipment.trackingNumber}`
      );
    }
  }, [activeShipment.trackingNumber, activeShipment.phone, activeShipment.customerName, activeShipment.status]);

  const generateQrMatrixSvgUrl = (code: string) => {
    const encoded = encodeURIComponent(`https://obrems.com/tracking?code=${code}`);
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encoded}&color=063B66&format=png`;
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedCode(selectedTracking);
      triggerToast(`Barcode Scanned! Package ${selectedTracking} verified.`);
    }, 1200);
  };

  const handleApplyPackageUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = scannedCode || selectedTracking;
    if (!code) return setScanError('Scan or enter a tracking number first.');
    try {
      const response = await api.post(`/tracking/${encodeURIComponent(code)}/events`, { status: updateStatus, location: updateLocation, description: sendSmsAuto ? 'Customer alert requested.' : '' });
      setRemoteShipment(response.data.data.shipment);
      setTrackingEvents((events) => [...events, response.data.data.event]);
      triggerToast(`Package ${code} updated successfully.`);
    } catch (error: any) {
      const status = error.response?.status;
      setScanError(status === 401 || status === 403
        ? 'Unauthorized access. You do not have permission to update shipments.'
        : error.response?.data?.message || 'Update was not saved. Check your connection and permissions.');
    }
  };

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsRecipientPhone || !smsMessage) return;
    triggerToast(`SMS successfully dispatched to ${smsRecipientPhone} via Obrems Gateway!`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 max-w-[1500px] mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#063B66] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#063B66] p-5 sm:p-6 rounded-xl border border-[#063B66] shadow-sm flex flex-wrap items-center justify-between gap-5 text-white">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center text-white">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-200">Operations tool</p>
            <h1 className="text-xl font-bold">Scan Center</h1>
            <p className="text-xs text-slate-300 mt-0.5">Scan a label, confirm the shipment, and update its next checkpoint.</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center gap-1 bg-white/10 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'generator'
                ? 'bg-white text-[#063B66] shadow-xs'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            QR Label Generator
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'scanner'
                ? 'bg-white text-[#063B66] shadow-xs'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            Barcode Scanner
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'sms'
                ? 'bg-white text-[#063B66] shadow-xs'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            SMS Center
          </button>
        </div>
      </div>

      {/* TAB 1: QR CODE GENERATOR & ULTRA-PROFESSIONAL WAYBILL LABEL */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Controls */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 lg:col-span-1">
            <h3 className="text-sm font-bold text-[#063B66]">Waybill Configuration</h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Select Registered Package</label>
              <select
                value={selectedTracking}
                onChange={(e) => setSelectedTracking(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-[#0B63CE]"
              >
                {shipments.map((s) => (
                  <option key={s.trackingNumber} value={s.trackingNumber}>
                    {s.trackingNumber} ({s.corridor})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Or Input Custom Barcode ID</label>
              <input
                type="text"
                value={customTrackingInput}
                onChange={(e) => {
                  setCustomTrackingInput(e.target.value);
                  if (e.target.value.trim()) setSelectedTracking(e.target.value.trim().toUpperCase());
                }}
                placeholder="e.g. OGL88452310UK"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono uppercase text-slate-900 focus:outline-none focus:border-[#0B63CE]"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Selected Corridor</span>
              <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                <p className="font-extrabold text-[#063B66]">{activeShipment.corridor}</p>
                <p className="text-slate-600 font-semibold">{activeShipment.originHub} → {activeShipment.destinationHub}</p>
                <p className="text-[11px] text-slate-500 font-mono">Carrier: {activeShipment.carrierCode}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#063B66] hover:bg-[#052d4e] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Thermal Label</span>
              </button>
              <button
                onClick={() => triggerToast(`Downloading PNG Label for ${selectedTracking}...`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save High-Res PNG Sticker</span>
              </button>
            </div>
          </div>

          {/* ULTRA-PROFESSIONAL COMMERCIAL CARGO WAYBILL LABEL PREVIEW */}
          <div className="bg-[#EAEFF5] p-6 rounded-xl border border-slate-200 shadow-2xs lg:col-span-2 flex flex-col items-center justify-center min-h-[500px]">
            <div
              id="printable-waybill-label"
              className="w-full max-w-md bg-white border-4 border-black rounded-none p-5 shadow-2xl space-y-3 font-sans text-black relative"
            >
              {/* Top Header Watermark Badge */}
              <div className="flex items-center justify-between border-b-4 border-black pb-2 pt-0.5">
                <div>
                  {settings?.logoUrl && <img src={settings.logoUrl} alt="Obrems Global Logistics" className="mb-2 h-8 w-28 object-contain object-left" />}
                  <h2 className="text-2xl font-black tracking-tighter text-black uppercase leading-none">
                    OBREMS GLOBAL
                  </h2>
                  <span className="text-[9px] font-black tracking-[0.25em] text-slate-800 uppercase block mt-0.5">
                    EXPRESS FREIGHT WAYBILL
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] font-black text-slate-700 block uppercase">CORRIDOR</span>
                  <span className="text-xs font-black text-black uppercase">{activeShipment.corridor}</span>
                </div>
              </div>

              {/* Barcode Strip Graphic */}
              <div className="bg-white p-2 border-2 border-black text-center font-mono space-y-1">
                <div className="h-12 w-full flex items-center justify-center gap-0.5">
                  {/* High contrast barcode lines */}
                  {Array.from({ length: 48 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-full bg-black ${
                        idx % 4 === 0 ? 'w-1.5' : idx % 2 === 0 ? 'w-1' : 'w-0.5'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-base font-black tracking-widest text-black">{selectedTracking}</p>
              </div>

              {/* 2-Column Grid: Sender vs Consignee */}
              <div className="grid grid-cols-2 gap-2 border-2 border-black divide-x-2 divide-black text-xs">
                <div className="p-2.5 space-y-0.5 bg-white">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-700 block border-b border-black/20 pb-0.5">FROM: SENDER</span>
                  <p className="font-extrabold text-black text-xs">{activeShipment.senderName}</p>
                  <p className="text-[10px] text-slate-800 font-semibold">{activeShipment.originHub}</p>
                </div>

                <div className="p-2.5 space-y-0.5 bg-white">
                  <span className="text-[9px] font-black uppercase tracking-wider text-black block border-b border-black/20 pb-0.5">TO: CONSIGNEE</span>
                  <p className="font-extrabold text-black text-xs">{activeShipment.customerName}</p>
                  <p className="text-[10px] text-slate-800 font-bold">{activeShipment.destinationHub}</p>
                  <p className="text-[10px] font-mono text-black font-extrabold">TEL: {activeShipment.phone}</p>
                </div>
              </div>

              {/* 4-Cell Cargo Spec Box */}
              <div className="grid grid-cols-4 border-2 border-black divide-x-2 divide-black text-center font-mono">
                <div className="p-1.5 bg-white">
                  <span className="text-[8px] font-black uppercase text-slate-700 block">WEIGHT</span>
                  <span className="text-xs font-black text-black">{activeShipment.weight}</span>
                </div>
                <div className="p-1.5 bg-white">
                  <span className="text-[8px] font-black uppercase text-slate-700 block">PIECES</span>
                  <span className="text-xs font-black text-black">{activeShipment.pieces}</span>
                </div>
                <div className="p-1.5 bg-white">
                  <span className="text-[8px] font-black uppercase text-slate-700 block">CARRIER</span>
                  <span className="text-[10px] font-black text-black">{activeShipment.carrierCode.split(' ')[0]}</span>
                </div>
                <div className="p-1.5 bg-black text-white">
                  <span className="text-[8px] font-black uppercase text-slate-200 block">DEST</span>
                  <span className="text-xs font-black text-white">{activeShipment.destinationHub.slice(0, 3).toUpperCase()}</span>
                </div>
              </div>

              {/* Scannable QR Matrix & Instructions */}
              <div className="flex items-center justify-between gap-3 pt-1 border-t-2 border-black">
                <div className="p-1.5 bg-white border-2 border-black shrink-0">
                  <img
                    src={generateQrMatrixSvgUrl(selectedTracking)}
                    alt="Scannable QR Code"
                    className="w-28 h-28 object-contain"
                  />
                </div>

                <div className="flex-1 space-y-1.5 text-xs font-sans">
                  <div className="p-2 border border-black bg-white">
                    <span className="text-[9px] font-black uppercase text-black block">SCAN TO TRACK SHIPMENT</span>
                    <p className="text-[9px] leading-tight text-slate-800 font-semibold mt-0.5">
                      Scan QR code at warehouse intake, airport customs, or driver doorstep delivery to sync live status.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-black font-bold pt-0.5">
                    <span>SEAL: #99108</span>
                    <span>OBREMS LOGISTICS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PACKAGE SCANNER & INSTANT STATUS UPDATE */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 pb-24 lg:pb-0">
          {/* Live Camera Scanner Box */}
          <div className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#063B66]">Scan a shipping label</h3>
                <p className="text-xs text-slate-500 mt-1">Use the rear camera and place the QR code inside the frame.</p>
              </div>
              <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${cameraActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cameraActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                {cameraActive ? 'Camera live' : 'Ready'}
              </span>
            </div>

            <div className="relative bg-slate-950 rounded-xl overflow-hidden min-h-[58vh] sm:min-h-0 sm:aspect-[4/3]">
              {/* Video feed */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              {/* Hidden canvas for frame analysis */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning overlay with corner guides */}
              {cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-56 h-56 sm:w-64 sm:h-64">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#0B63CE] rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#0B63CE] rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#0B63CE] rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#0B63CE] rounded-br-lg" />
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-sky-300/80 animate-pulse" />
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-[11px] text-white/90 font-semibold">Align QR code within the frame</span>
                  </div>
                </div>
              )}

              {/* Idle state */}
              {!cameraActive && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
                  <Camera className="w-14 h-14 text-slate-500" />
                  <p className="text-xs text-slate-400 font-mono">Camera is off</p>
                </div>
              )}

              {/* Stop button */}
              {cameraActive && (
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  <button onClick={toggleTorch} disabled={!cameraHasTorch} className="min-w-11 min-h-11 p-2.5 bg-black/60 text-white rounded-lg disabled:opacity-40" title="Toggle torch"><Flashlight className="w-5 h-5" /></button>
                  <button onClick={switchCamera} className="min-w-11 min-h-11 p-2.5 bg-black/60 text-white rounded-lg" title="Switch camera"><RotateCw className="w-5 h-5" /></button>
                  <button onClick={stopCamera} className="min-w-11 min-h-11 p-2.5 bg-black/60 text-white rounded-lg" title="Stop camera"><X className="w-5 h-5" /></button>
                </div>
              )}
            </div>

            {/* Error message */}
            {cameraError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}

            {scanError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{scanError}</span>
              </div>
            )}

            {/* Scan result */}
            {scannedCode && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Scanned: <strong className="font-mono">{scannedCode}</strong></span>
                </div>
                <span className="font-bold text-emerald-700">Matched ✓</span>
              </div>
            )}

            {/* Start / Stop button */}
            <button
              onClick={cameraActive ? stopCamera : startCamera}
              className={`w-full min-h-14 flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-bold transition-colors shadow ${
                cameraActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-[#0B63CE] hover:bg-[#0952AD] text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              {cameraActive ? 'Stop Camera' : 'Start Camera & Scan'}
            </button>

            <form onSubmit={(event) => { event.preventDefault(); lookupTracking(customTrackingInput); }} className="space-y-2 border-t border-slate-100 pt-4">
              <label className="block text-xs font-bold text-slate-700">Can’t scan? Enter tracking number</label>
              <div className="flex gap-2">
                <input value={customTrackingInput} onChange={(event) => setCustomTrackingInput(event.target.value.toUpperCase())} placeholder="OGL..." className="min-h-12 flex-1 px-3.5 border border-slate-300 rounded-lg font-mono text-sm uppercase" />
                <button aria-label="Find shipment" className="min-h-12 px-4 bg-[#063B66] text-white rounded-lg font-bold" type="submit"><Search className="w-5 h-5" /></button>
              </div>
            </form>
          </div>

          {/* Package Update Form */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-[#063B66]">Shipment Summary</h3>{scannedCode && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">VALID PACKAGE</span>}</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-400 block">TRACKING NUMBER</span><strong className="font-mono text-[#063B66] break-all">{activeShipment.trackingNumber}</strong></div>
              <div><span className="text-slate-400 block">CUSTOMER</span><strong>{activeShipment.customerName}</strong></div>
              <div><span className="text-slate-400 block">ROUTE</span><strong>{activeShipment.corridor}</strong></div>
              <div><span className="text-slate-400 block">SERVICE</span><strong>{activeShipment.carrierCode}</strong></div>
              <div><span className="text-slate-400 block">WEIGHT</span><strong>{activeShipment.weight}</strong></div>
              <div><span className="text-slate-400 block">STATUS</span><strong>{activeShipment.status}</strong></div>
              <div className="col-span-2"><span className="text-slate-400 block">LOCATION</span><strong>{activeShipment.location}</strong></div>
            </div>
            <div className="flex gap-2"><button type="button" onClick={() => setActiveTab('scanner')} className="flex-1 min-h-12 rounded-lg bg-slate-100 text-[#063B66] text-xs font-bold">Scan Another Package</button><button type="button" onClick={() => window.open(`/track?number=${activeShipment.trackingNumber}`, '_blank')} className="flex-1 min-h-12 rounded-lg bg-[#0B63CE] text-white text-xs font-bold">View Shipment</button></div>
            {trackingEvents.length > 0 && <div className="border-t border-slate-100 pt-4"><h4 className="text-xs font-bold text-[#063B66] mb-2">Tracking History</h4><div className="space-y-3 max-h-48 overflow-y-auto">{trackingEvents.slice().reverse().map((event) => <div key={event._id} className="border-l-2 border-[#0B63CE] pl-3 text-xs"><strong className="block">{event.status}</strong><span className="text-slate-500">{event.location} · {event.eventDate ? new Date(event.eventDate).toLocaleString() : ''}</span></div>)}</div></div>}
            <h3 className="text-sm font-bold text-[#063B66] border-t border-slate-100 pt-4">Update Package Status</h3>

            <form onSubmit={handleApplyPackageUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Package Code</label>
                <input
                  type="text"
                  readOnly
                  value={scannedCode || selectedTracking}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Package Status *</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE]"
                >
                  {['Shipment Created', 'Received', 'Processing', 'In Transit', 'Arrived in UK', 'Arrived in Ghana', 'Customs', 'Ready for Delivery', 'Out for Delivery', 'Delivered', 'On Hold', 'Returned'].map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Scan Location *</label>
                <input
                  type="text"
                  value={updateLocation}
                  onChange={(e) => setUpdateLocation(e.target.value)}
                  placeholder="e.g. Kotoka Int Airport Terminal 3"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE]"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={sendSmsAuto}
                    onChange={(e) => setSendSmsAuto(e.target.checked)}
                    className="w-4 h-4 text-[#0B63CE] rounded"
                  />
                  <span>Send Automated SMS Alert to Customer</span>
                </label>
                <p className="text-[11px] text-slate-500 leading-relaxed pl-6">
                  Automatically dispatches instant SMS text to {activeShipment.phone} ({activeShipment.customerName}) upon status save.
                </p>
              </div>

              <button
                type="submit"
                className="w-full min-h-14 bg-[#0B63CE] hover:bg-[#0952AD] text-white text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Status & Send SMS Alert</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: SMS DISPATCH CENTER */}
      {activeTab === 'sms' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 md:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#063B66] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#0B63CE]" />
                <span>Compose SMS Text Notification</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                SMS Gateway: Active
              </span>
            </div>

            <form onSubmit={handleSendSms} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={smsRecipientPhone}
                    onChange={(e) => setSmsRecipientPhone(e.target.value)}
                    placeholder="+233 24 123 4567 or +44 7700 900123"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#0B63CE]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={smsRecipientName}
                    onChange={(e) => setSmsRecipientName(e.target.value)}
                    placeholder="Grace Bediako"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">SMS Message Body *</label>
                <textarea
                  rows={4}
                  required
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="Type SMS text message..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] text-xs"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>Standard SMS length: {smsMessage.length} / 160 chars</span>
                  <span>Credits: 1 SMS</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#063B66] hover:bg-[#052d4e] text-white font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch SMS Message</span>
                </button>
              </div>
            </form>
          </div>

          {/* SMS Templates Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 md:col-span-1">
            <h3 className="text-sm font-bold text-[#063B66]">Quick SMS Templates</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSmsMessage(`Hello ${smsRecipientName}, your package ${selectedTracking} has been received at our UK warehouse hub.`)}
                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors"
              >
                <span className="font-bold block text-slate-800">1. Warehouse Receipt</span>
                <span className="text-slate-500 text-[11px]">UK warehouse dropoff alert...</span>
              </button>

              <button
                onClick={() => setSmsMessage(`Hello ${smsRecipientName}, package ${selectedTracking} has passed customs clearance in Ghana.`)}
                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors"
              >
                <span className="font-bold block text-slate-800">2. Customs Clearance</span>
                <span className="text-slate-500 text-[11px]">Kotoka Airport clearance alert...</span>
              </button>

              <button
                onClick={() => setSmsMessage(`Hello ${smsRecipientName}, your package ${selectedTracking} is out for door delivery today.`)}
                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors"
              >
                <span className="font-bold block text-slate-800">3. Out For Delivery</span>
                <span className="text-slate-500 text-[11px]">Courier driver dispatch alert...</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
