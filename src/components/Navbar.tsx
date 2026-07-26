import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  History, 
  BarChart3, 
  Database, 
  Settings, 
  Lock, 
  Wifi, 
  WifiOff, 
  Store,
  UserCheck
} from 'lucide-react';
import { CashierSettings } from '../types';

interface NavbarProps {
  activeTab: 'kasir' | 'katalog' | 'riwayat' | 'laporan' | 'backup' | 'pengaturan';
  setActiveTab: (tab: 'kasir' | 'katalog' | 'riwayat' | 'laporan' | 'backup' | 'pengaturan') => void;
  settings: CashierSettings;
  onLockTerminal: () => void;
  cartCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onLockTerminal,
  cartCount
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="bg-white text-gray-900 shadow-sm border-b-2 border-gray-200 sticky top-0 z-40">
      {/* Top Bar with Store Name & Clock */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-md shrink-0">
            {settings.tokoName ? settings.tokoName.charAt(0).toUpperCase() : 'B'}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-wide uppercase flex items-center gap-2">
              {settings.tokoName || 'TOKO BERKAH JAYA'}
            </h1>
            <p className="text-sm font-semibold text-gray-500 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Kasir: <strong className="text-gray-900">{settings.cashierName}</strong></span>
              <span>•</span>
              <span className="text-blue-600 font-bold">Mode Pasar Ibu-Ibu</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Offline/Online Indicator */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border-2 ${
            isOnline ? 'bg-green-50 text-green-700 border-green-300' : 'bg-amber-50 text-amber-700 border-amber-300'
          }`}>
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-amber-500'}`} />
            <span>{isOnline ? 'Online Sync' : 'Mode Offline'}</span>
          </div>

          {/* Clock */}
          <div className="bg-gray-100 px-4 py-2 rounded-xl text-blue-600 font-mono text-sm font-bold border-2 border-gray-200">
            {currentTime}
          </div>

          {/* PIN Lock Button */}
          {settings.requirePin && (
            <button
              onClick={onLockTerminal}
              title="Kunci Terminal Kasir"
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl border-2 border-red-300 transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Kunci</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Touch Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-2 overflow-x-auto py-2">
        <nav className="flex space-x-2 min-w-max">
          <button
            onClick={() => setActiveTab('kasir')}
            className={`min-h-[64px] sm:min-h-[80px] px-6 py-3 rounded-2xl font-black text-lg flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'kasir'
                ? 'bg-blue-600 text-white shadow-md border-b-4 border-blue-800'
                : 'bg-gray-100 text-gray-900 font-extrabold hover:bg-gray-200 border-2 border-gray-300'
            }`}
          >
            <ShoppingCart className="w-7 h-7" />
            <span>KASIR (VOICE)</span>
            {cartCount > 0 && (
              <span className="ml-1 bg-amber-400 text-gray-950 text-sm font-black px-3 py-0.5 rounded-full border border-gray-900">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('katalog')}
            className={`min-h-[64px] sm:min-h-[80px] px-6 py-3 rounded-2xl font-black text-lg flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'katalog'
                ? 'bg-blue-600 text-white shadow-md border-b-4 border-blue-800'
                : 'bg-gray-100 text-gray-900 font-extrabold hover:bg-gray-200 border-2 border-gray-300'
            }`}
          >
            <Package className="w-7 h-7" />
            <span>BARANG</span>
          </button>

          <button
            onClick={() => setActiveTab('riwayat')}
            className={`min-h-[64px] sm:min-h-[80px] px-6 py-3 rounded-2xl font-black text-lg flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'riwayat'
                ? 'bg-blue-600 text-white shadow-md border-b-4 border-blue-800'
                : 'bg-gray-100 text-gray-900 font-extrabold hover:bg-gray-200 border-2 border-gray-300'
            }`}
          >
            <History className="w-7 h-7" />
            <span>RIWAYAT</span>
          </button>

          <button
            onClick={() => setActiveTab('laporan')}
            className={`min-h-[64px] sm:min-h-[80px] px-6 py-3 rounded-2xl font-black text-lg flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'laporan'
                ? 'bg-blue-600 text-white shadow-md border-b-4 border-blue-800'
                : 'bg-gray-100 text-gray-900 font-extrabold hover:bg-gray-200 border-2 border-gray-300'
            }`}
          >
            <BarChart3 className="w-7 h-7" />
            <span>LAPORAN</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`min-h-[64px] sm:min-h-[80px] px-6 py-3 rounded-2xl font-black text-lg flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-blue-600 text-white shadow-md border-b-4 border-blue-800'
                : 'bg-gray-100 text-gray-900 font-extrabold hover:bg-gray-200 border-2 border-gray-300'
            }`}
          >
            <Database className="w-7 h-7" />
            <span>BACKUP</span>
          </button>

          <button
            onClick={() => setActiveTab('pengaturan')}
            className={`min-h-[64px] sm:min-h-[80px] px-6 py-3 rounded-2xl font-black text-lg flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'pengaturan'
                ? 'bg-blue-600 text-white shadow-md border-b-4 border-blue-800'
                : 'bg-gray-100 text-gray-900 font-extrabold hover:bg-gray-200 border-2 border-gray-300'
            }`}
          >
            <Settings className="w-7 h-7" />
            <span>PENGATURAN</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
