import React, { useState } from 'react';
import { Lock, Store, KeyRound, AlertCircle } from 'lucide-react';
import { CashierSettings } from '../types';

interface PinLoginModalProps {
  isOpen: boolean;
  settings: CashierSettings;
  onUnlock: () => void;
}

export const PinLoginModal: React.FC<PinLoginModalProps> = ({
  isOpen,
  settings,
  onUnlock
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleKeyClick = (digit: string) => {
    if (pinInput.length < 4) {
      const updated = pinInput + digit;
      setPinInput(updated);
      setErrorMsg(false);

      if (updated.length === 4) {
        if (updated === (settings.pinCode || '1234')) {
          setPinInput('');
          onUnlock();
        } else {
          setErrorMsg(true);
          setTimeout(() => {
            setPinInput('');
          }, 800);
        }
      }
    }
  };

  const handleDelete = () => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMsg(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border-2 border-gray-200 rounded-3xl w-full max-w-md p-6 shadow-2xl text-center space-y-6 text-gray-900">
        
        {/* Store Logo Icon */}
        <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white font-black flex items-center justify-center mx-auto shadow-md">
          <Store className="w-12 h-12" />
        </div>

        <div>
          <h1 className="text-3xl font-black uppercase text-gray-900 tracking-wider">
            {settings.tokoName || 'TOKO BERKAH JAYA'}
          </h1>
          <p className="text-xs text-blue-600 font-extrabold mt-1 uppercase tracking-wider">
            MASUKKAN PIN KASIR 4 DIGIT
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex items-center justify-center gap-4 py-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                pinInput.length > idx
                  ? 'bg-blue-600 border-blue-600 scale-125 shadow-xs'
                  : 'bg-gray-100 border-gray-300'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <div className="text-red-600 font-black text-sm animate-bounce">
            PIN SALAH! SILAKAN COBA LAGI.
          </div>
        )}

        {/* Giant Numeric Numpad (Min 80dp touch target) */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyClick(digit)}
              className="min-h-[70px] sm:min-h-[80px] py-4 bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 hover:border-blue-600 text-gray-900 rounded-2xl font-black text-3xl shadow-xs transition-all cursor-pointer active:scale-90"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleDelete}
            className="min-h-[70px] sm:min-h-[80px] py-4 bg-gray-100 hover:bg-red-50 hover:text-red-600 border-2 border-gray-300 text-gray-900 rounded-2xl font-black text-sm flex items-center justify-center transition-all cursor-pointer active:scale-90"
          >
            HAPUS
          </button>
          <button
            onClick={() => handleKeyClick('0')}
            className="min-h-[70px] sm:min-h-[80px] py-4 bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 hover:border-blue-600 text-gray-900 rounded-2xl font-black text-3xl shadow-xs transition-all cursor-pointer active:scale-90"
          >
            0
          </button>
          <button
            onClick={() => {
              // Direct unlock fallback if default PIN 1234
              handleKeyClick('1');
              handleKeyClick('2');
              handleKeyClick('3');
              handleKeyClick('4');
            }}
            className="min-h-[70px] sm:min-h-[80px] py-4 bg-gray-100 text-blue-600 hover:bg-gray-200 border-2 border-gray-300 rounded-2xl font-black text-xs flex items-center justify-center transition-all cursor-pointer"
            title="PIN Default: 1234"
          >
            DEF (1234)
          </button>
        </div>

        <p className="text-[11px] text-gray-500 font-medium pt-2">
          PIN Standar Bawaan: <strong className="text-gray-800 font-mono">1234</strong>
        </p>

      </div>
    </div>
  );
};
