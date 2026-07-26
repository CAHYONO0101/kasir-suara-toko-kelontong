import React from 'react';
import { HelpCircle, CheckCircle2, X } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah } from '../utils/bluetoothPrinter';

interface DisambiguationModalProps {
  isOpen: boolean;
  spokenQuery: string;
  quantity: number;
  suggestions: Product[];
  onSelectProduct: (product: Product, quantity: number) => void;
  onCancel: () => void;
}

export const DisambiguationModal: React.FC<DisambiguationModalProps> = ({
  isOpen,
  spokenQuery,
  quantity,
  suggestions,
  onSelectProduct,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border-2 border-gray-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl text-gray-900">
        
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-black">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider">
                APAKAH MAKSUD ANDA?
              </h2>
              <p className="text-xs font-bold text-blue-100">
                Pilih barang yang sesuai ucapan kasir
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-10 h-10 rounded-xl bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center font-bold text-xl cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          {/* Query Summary */}
          <div className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-200 text-center">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block mb-1">
              Ucapan Suara Kasir:
            </span>
            <div className="text-2xl md:text-3xl font-black text-gray-900">
              "{quantity} {spokenQuery}"
            </div>
          </div>

          {/* Suggestions Cards List with HUGE touch area */}
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {suggestions.map((prod) => (
              <button
                key={prod.id}
                onClick={() => onSelectProduct(prod, quantity)}
                className="w-full text-left bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-blue-600 p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer group active:scale-98 min-h-[80px]"
              >
                <div className="flex-1 pr-3">
                  <div className="text-xl md:text-2xl font-black text-gray-900 group-hover:text-blue-600">
                    {prod.name}
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-bold border border-gray-300">
                      {prod.category}
                    </span>
                    <span>Stok: <strong className="text-green-600">{prod.stock} {prod.unit}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-green-600 font-mono">
                    {formatRupiah(prod.sellPrice)}
                  </div>
                  <div className="text-xs font-bold text-gray-500 uppercase">
                    per {prod.unit}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Cancel button */}
          <button
            onClick={onCancel}
            className="w-full min-h-[80px] py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-xl rounded-2xl border-2 border-gray-300 transition-colors cursor-pointer mt-2 active:scale-95 flex items-center justify-center"
          >
            LEWATI / BATALKAN
          </button>

        </div>

      </div>
    </div>
  );
};
