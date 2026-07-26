import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, X, Play, RefreshCw, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessTranscript: (transcript: string) => void;
  products: Product[];
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onProcessTranscript,
  products
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Tombol pintasan perintah suara cepat untuk kasir
  const PRESET_EXAMPLES = [
    'Dua minyak goreng',
    'Satu gula pasir',
    'Tiga mie sedap',
    'Satu aqua galon',
    'Dua minyak goreng, satu gula pasir, tiga mie sedap, satu kopi kapal api',
    'Setengah kg telur',
    'Dua indomie goreng dan satu susu frisian flag',
    'Satu gas melon dan dua tegar'
  ];

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setErrorMessage(null);
      return;
    }

    // Auto start speech recognition when opened
    startListening();

    return () => {
      stopListening();
    };
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('Browser tidak mendukung Web Speech API bawaan. Silakan gunakan tombol contoh ucapan di bawah.');
      setIsListening(false);
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID'; // Indonesian speech model
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // ignore transient silent timeouts
        } else if (event.error === 'not-allowed') {
          setErrorMessage('Izin mikrofon ditolak. Klik tombol contoh ucapan di bawah.');
          setIsListening(false);
        } else {
          setErrorMessage(`Masalah suara (${event.error}). Klik contoh ucapan di bawah.`);
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error('Failed to init speech:', err);
      setErrorMessage('Gagal memulai mikrofon. Silakan gunakan tombol contoh ucapan.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleConfirmTranscript = (textToSubmit?: string) => {
    const text = textToSubmit || transcript;
    if (!text.trim()) return;
    stopListening();
    onProcessTranscript(text);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border-2 border-gray-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl text-gray-900">
        
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-black">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider">
                TRANSAKSI SUARA (VOICE)
              </h2>
              <p className="text-xs text-blue-100 font-medium">
                Ucapkan nama barang & jumlahnya dalam Bahasa Indonesia / Jawa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center font-bold text-2xl transition-colors cursor-pointer"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Visualizer & Mic Button */}
          <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-2xl border-2 border-gray-200 p-6 relative overflow-hidden">
            
            {/* Pulsing Audio Rings */}
            {isListening && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 rounded-full bg-blue-500/20 animate-ping opacity-75"></div>
                <div className="w-64 h-64 rounded-full bg-blue-500/10 animate-pulse"></div>
              </div>
            )}

            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all shadow-md relative z-10 cursor-pointer ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white scale-110 shadow-red-600/50 animate-bounce'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/40'
              }`}
            >
              {isListening ? (
                <>
                  <Mic className="w-12 h-12 mb-1 animate-pulse" />
                  <span className="text-xs font-black tracking-widest uppercase">Mendengar...</span>
                </>
              ) : (
                <>
                  <MicOff className="w-12 h-12 mb-1" />
                  <span className="text-xs font-black tracking-widest uppercase">Klik Bicara</span>
                </>
              )}
            </button>

            {/* Instruction Banner */}
            <p className="text-gray-700 text-center font-bold text-base mt-4">
              {isListening ? (
                <span className="text-green-600 font-extrabold flex items-center justify-center gap-2 text-lg">
                  <Volume2 className="w-5 h-5 animate-pulse" />
                  Mendengarkan... Silakan Bicara!
                </span>
              ) : (
                <span className="text-gray-500">Tekan tombol mikrofon untuk mulai bicara</span>
              )}
            </p>

            {errorMessage && (
              <div className="mt-3 px-4 py-2 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Transcript Box with Giant Typography */}
          <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
            <div className="text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Hasil Suara Kasir:</span>
              {transcript && (
                <button
                  onClick={() => setTranscript('')}
                  className="text-gray-500 hover:text-red-600 text-xs underline cursor-pointer"
                >
                  Bersihkan
                </button>
              )}
            </div>

            <div className="min-h-[90px] max-h-[140px] overflow-y-auto bg-white p-4 rounded-xl border-2 border-gray-200 text-gray-900 font-extrabold text-2xl md:text-3xl leading-snug break-words">
              {transcript ? (
                <span>"{transcript}"</span>
              ) : (
                <span className="text-gray-400 italic text-xl font-normal">
                  Contoh: "Dua minyak goreng, satu gula pasir, tiga mie sedap"
                </span>
              )}
            </div>
          </div>

          {/* Preset Buttons for Easy Instant Testing */}
          <div>
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Contoh Suara Ibu-Ibu Pasar (Klik untuk Langsung Coba):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
              {PRESET_EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => handleConfirmTranscript(ex)}
                  className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-left rounded-xl border-2 border-gray-200 text-gray-900 text-sm font-bold flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <span className="truncate group-hover:text-blue-600">"{ex}"</span>
                  <Play className="w-4 h-4 text-blue-600 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Process Button (Min 80px Touch Target) */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onClose}
              className="min-h-[80px] flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-xl rounded-2xl border-2 border-gray-300 transition-colors cursor-pointer flex items-center justify-center active:scale-95"
            >
              BATAL
            </button>
            <button
              disabled={!transcript.trim()}
              onClick={() => handleConfirmTranscript()}
              className={`min-h-[80px] flex-2 py-4 text-white font-black text-xl rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                transcript.trim()
                  ? 'bg-blue-600 hover:bg-blue-500 border-2 border-blue-700 shadow-blue-500/30'
                  : 'bg-gray-300 text-gray-500 border-2 border-gray-300 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-7 h-7" />
              <span>PROSES KE KERANJANG</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
