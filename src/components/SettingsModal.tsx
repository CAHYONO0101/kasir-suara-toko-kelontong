import React, { useState } from 'react';
import { Settings, Save, Lock, Volume2, Store, UserCheck, Shield, Check } from 'lucide-react';
import { CashierSettings } from '../types';

interface SettingsModalProps {
  settings: CashierSettings;
  setSettings: React.Dispatch<React.SetStateAction<CashierSettings>>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  setSettings
}) => {
  const [formData, setFormData] = useState<CashierSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 space-y-6 text-gray-900">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            <span>PENGATURAN KASIR</span>
          </h1>
          <p className="text-sm text-gray-600 font-bold mt-1">
            Atur profil toko, nama kasir, PIN keamanan, dan suara konfirmasi
          </p>
        </div>

        {savedSuccess && (
          <div className="bg-green-600 text-white font-black px-4 py-2 rounded-2xl flex items-center gap-2 animate-bounce">
            <Check className="w-6 h-6" />
            <span>Tersimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm space-y-6">
        
        {/* Toko Profile */}
        <div className="space-y-4">
          <h2 className="text-xl font-black uppercase text-gray-900 flex items-center gap-2 border-b-2 border-gray-200 pb-2">
            <Store className="w-6 h-6 text-blue-600" />
            <span>PROFIL TOKO KELONTONG</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-extrabold text-gray-600 uppercase block mb-1">
                NAMA TOKO:
              </label>
              <input
                type="text"
                value={formData.tokoName}
                onChange={(e) => setFormData(p => ({ ...p, tokoName: e.target.value }))}
                required
                className="w-full bg-gray-50 border-2 border-gray-300 focus:border-blue-600 rounded-xl px-4 py-3 text-gray-900 text-lg font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-gray-600 uppercase block mb-1">
                NAMA KASIR UTAMA:
              </label>
              <input
                type="text"
                value={formData.cashierName}
                onChange={(e) => setFormData(p => ({ ...p, cashierName: e.target.value }))}
                required
                className="w-full bg-gray-50 border-2 border-gray-300 focus:border-blue-600 rounded-xl px-4 py-3 text-gray-900 text-lg font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-extrabold text-gray-600 uppercase block mb-1">
                ALAMAT TOKO:
              </label>
              <input
                type="text"
                value={formData.tokoAddress}
                onChange={(e) => setFormData(p => ({ ...p, tokoAddress: e.target.value }))}
                className="w-full bg-gray-50 border-2 border-gray-300 focus:border-blue-600 rounded-xl px-4 py-3 text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-gray-600 uppercase block mb-1">
                NO. TELEPON / WHATSAPP TOKO:
              </label>
              <input
                type="text"
                value={formData.tokoPhone}
                onChange={(e) => setFormData(p => ({ ...p, tokoPhone: e.target.value }))}
                className="w-full bg-gray-50 border-2 border-gray-300 focus:border-blue-600 rounded-xl px-4 py-3 text-gray-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Security PIN */}
        <div className="space-y-4 pt-2 border-t-2 border-gray-200">
          <h2 className="text-xl font-black uppercase text-gray-900 flex items-center gap-2 border-b-2 border-gray-200 pb-2">
            <Lock className="w-6 h-6 text-red-600" />
            <span>PIN KEAMANAN 4 DIGIT</span>
          </h2>

          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border-2 border-gray-200">
            <div>
              <span className="text-base font-extrabold text-gray-900 block">Aktifkan Kunci PIN 4 Digit</span>
              <span className="text-xs text-gray-500 font-bold">Meminta PIN saat terminal kasir terkunci/dibuka</span>
            </div>
            <input
              type="checkbox"
              checked={formData.requirePin}
              onChange={(e) => setFormData(p => ({ ...p, requirePin: e.target.checked }))}
              className="w-7 h-7 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {formData.requirePin && (
            <div>
              <label className="text-xs font-extrabold text-gray-600 uppercase block mb-1">
                KODE PIN 4 DIGIT:
              </label>
              <input
                type="password"
                maxLength={4}
                value={formData.pinCode}
                onChange={(e) => setFormData(p => ({ ...p, pinCode: e.target.value }))}
                className="w-36 bg-gray-50 border-2 border-gray-300 focus:border-blue-600 rounded-xl px-4 py-3 text-gray-900 font-mono text-2xl font-black text-center tracking-widest"
              />
            </div>
          )}
        </div>

        {/* Voice Feedback Settings */}
        <div className="space-y-4 pt-2 border-t-2 border-gray-200">
          <h2 className="text-xl font-black uppercase text-gray-900 flex items-center gap-2 border-b-2 border-gray-200 pb-2">
            <Volume2 className="w-6 h-6 text-blue-600" />
            <span>SUARA ASISTEN KASIR (SPEECH FEEDBACK)</span>
          </h2>

          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border-2 border-gray-200">
            <div>
              <span className="text-base font-extrabold text-gray-900 block">Suara Mengucapkan Barang & Total</span>
              <span className="text-xs text-gray-500 font-bold">Suara otomatis menyebutkan nama barang saat ditambahkan ke keranjang</span>
            </div>
            <input
              type="checkbox"
              checked={formData.speakFeedback}
              onChange={(e) => setFormData(p => ({ ...p, speakFeedback: e.target.checked }))}
              className="w-7 h-7 accent-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Save className="w-6 h-6" />
          <span>SIMPAN PENGATURAN</span>
        </button>

      </form>

    </div>
  );
};
