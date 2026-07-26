import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Barcode, Check } from 'lucide-react';
import { Product } from '../types';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onScanBarcode: (barcode: string) => void;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  onScanBarcode
}) => {
  const [manualBarcode, setManualBarcode] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setManualBarcode('');
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError('Kamera tidak tersedia atau izin ditolak. Silakan ketik barcode di bawah.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualBarcode.trim()) return;
    onScanBarcode(manualBarcode.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border-2 border-gray-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-gray-900">
        
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-8 h-8" />
            <h2 className="text-2xl font-black uppercase tracking-wider">
              SCAN BARCODE KAMERA
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center font-bold text-xl cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          {/* Camera Viewport */}
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-video border-2 border-gray-300 flex items-center justify-center">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {/* Scanner Target Guide Line */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-3/4 h-24 border-2 border-green-500 rounded-lg bg-green-500/10 flex items-center justify-center relative">
                    <div className="w-full h-0.5 bg-red-500 animate-pulse"></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-gray-400 space-y-2">
                <Camera className="w-12 h-12 mx-auto text-blue-500 animate-bounce" />
                <p className="text-sm font-medium">{cameraError || 'Membuka kamera...'}</p>
              </div>
            )}
          </div>

          {/* Preset Sample Barcodes for Quick Testing */}
          <div>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
              Contoh Barcode Barang di Toko (Klik untuk Test):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
              {products.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onScanBarcode(p.barcode);
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg border border-gray-300 text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  {p.name.split(' ')[0]} ({p.barcode.slice(-4)})
                </button>
              ))}
            </div>
          </div>

          {/* Manual Barcode Input Form */}
          <form onSubmit={handleManualSubmit} className="space-y-2 pt-2 border-t border-gray-200">
            <label className="text-xs font-black text-blue-600 uppercase tracking-wider block">
              ATAU KETIK NOMOR BARCODE MANUAL:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Contoh: 899999900001"
                className="flex-1 bg-gray-50 border-2 border-gray-300 focus:border-blue-600 rounded-xl px-4 py-3 text-gray-900 text-lg font-mono font-bold outline-hidden"
              />
              <button
                type="submit"
                disabled={!manualBarcode.trim()}
                className="px-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-base rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Check className="w-5 h-5" />
                <span>CARI</span>
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};
