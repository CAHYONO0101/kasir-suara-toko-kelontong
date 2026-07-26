import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, AlertTriangle, Award, ArrowUpRight } from 'lucide-react';
import { Transaction, Product } from '../types';
import { formatRupiah } from '../utils/bluetoothPrinter';

interface DashboardAnalyticsProps {
  transactions: Transaction[];
  products: Product[];
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  transactions,
  products
}) => {
  const todayStr = new Date().toDateString();

  // Metrics calculation
  const todayTransactions = useMemo(() => {
    return transactions.filter(t => new Date(t.timestamp).toDateString() === todayStr);
  }, [transactions, todayStr]);

  const todayRevenue = useMemo(() => {
    return todayTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  }, [todayTransactions]);

  const todayProfit = useMemo(() => {
    return todayTransactions.reduce((sum, t) => sum + t.profit, 0);
  }, [todayTransactions]);

  // Low stock products (< 10)
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stock < 10).sort((a, b) => a.stock - b.stock);
  }, [products]);

  // Top selling products
  const topSellingProducts = useMemo(() => {
    const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};

    transactions.forEach(tx => {
      tx.items.forEach(item => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        }
        productSalesMap[item.productId].qty += item.quantity;
        productSalesMap[item.productId].revenue += item.subtotal;
      });
    });

    return Object.values(productSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [transactions]);

  // Daily revenue for last 7 days chart
  const last7DaysChartData = useMemo(() => {
    const days: { dateLabel: string; revenue: number; profit: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toDateString();
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

      const dayTxs = transactions.filter(t => new Date(t.timestamp).toDateString() === dStr);
      const rev = dayTxs.reduce((sum, t) => sum + t.totalAmount, 0);
      const prof = dayTxs.reduce((sum, t) => sum + t.profit, 0);

      days.push({
        dateLabel: dayName,
        revenue: rev,
        profit: prof
      });
    }

    return days;
  }, [transactions]);

  const maxChartRevenue = Math.max(...last7DaysChartData.map(d => d.revenue), 100000);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-6 text-gray-900">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm">
        <h1 className="text-3xl font-black uppercase tracking-wider text-gray-900 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <span>DASHBOARD ANALITIK & LAPORAN</span>
        </h1>
        <p className="text-sm text-gray-600 font-bold mt-1">
          Ringkasan omset harian, estimasi keuntungan bersih, barang terlaris, dan peringatan stok
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Omset Hari Ini */}
        <div className="bg-white p-5 rounded-3xl border-2 border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
              OMSET HARI INI
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-green-600 font-mono mt-2">
            {formatRupiah(todayRevenue)}
          </div>
          <p className="text-xs text-gray-500 font-bold mt-1">
            {todayTransactions.length} Transaksi Selesai
          </p>
        </div>

        {/* Keuntungan Harian */}
        <div className="bg-white p-5 rounded-3xl border-2 border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-gray-700 uppercase tracking-widest">
              KEUNTUNGAN BERSIH
            </span>
            <div className="p-2 bg-gray-100 text-gray-700 rounded-xl border border-gray-300">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-blue-600 font-mono mt-2">
            {formatRupiah(todayProfit)}
          </div>
          <p className="text-xs text-gray-500 font-bold mt-1">
            Selisih Harga Jual - Modal
          </p>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white p-5 rounded-3xl border-2 border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
              JUMLAH TRANSAKSI
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-gray-900 font-mono mt-2">
            {todayTransactions.length}
          </div>
          <p className="text-xs text-gray-500 font-bold mt-1">
            Pelanggan Hari Ini
          </p>
        </div>

        {/* Stok Hampir Habis */}
        <div className="bg-white p-5 rounded-3xl border-2 border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-red-600 uppercase tracking-widest">
              STOK CRITICAL
            </span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-red-600 font-mono mt-2">
            {lowStockProducts.length}
          </div>
          <p className="text-xs text-gray-500 font-bold mt-1">
            Barang Stok &lt; 10
          </p>
        </div>

      </div>

      {/* Interactive Sales Chart (Last 7 Days) */}
      <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm space-y-4">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <span>GRAFIK PENJUALAN 7 HARI TERAKHIR</span>
        </h2>

        <div className="h-64 flex items-end justify-between gap-2 pt-8 pb-2 px-2 border-b-2 border-gray-200">
          {last7DaysChartData.map((d, idx) => {
            const heightPercent = Math.max(10, Math.min(100, (d.revenue / maxChartRevenue) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {/* Bar Value Tooltip */}
                <span className="text-[10px] font-mono font-bold text-blue-600 opacity-80 group-hover:opacity-100 transition-opacity">
                  {d.revenue > 0 ? `${Math.round(d.revenue / 1000)}k` : '0'}
                </span>

                {/* Bar Container */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[48px] bg-blue-600 rounded-t-xl group-hover:bg-blue-500 transition-all shadow-xs"
                ></div>

                {/* Date Label */}
                <span className="text-xs font-bold text-gray-600 text-center">
                  {d.dateLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Split: Top Selling & Low Stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            <span>BARANG TERLARIS (TOP SALES)</span>
          </h2>

          <div className="space-y-3">
            {topSellingProducts.length === 0 ? (
              <p className="text-gray-400 italic text-sm py-4 text-center">Belum ada data transaksi penjualan.</p>
            ) : (
              topSellingProducts.map((p, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-base shadow-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-lg font-black text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500 font-bold">Terjual: {p.qty} item</div>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xl font-black text-green-600">
                    {formatRupiah(p.revenue)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Warning List */}
        <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xl font-black text-red-600 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            <span>BARANG PERLU RE-ORDER (STOK HAMPIR HABIS)</span>
          </h2>

          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {lowStockProducts.length === 0 ? (
              <p className="text-green-600 font-bold text-sm py-4 text-center">
                Semua stok aman (&gt; 10 unit).
              </p>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-200 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-black text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">Kategori: {p.category}</div>
                  </div>

                  <div className="text-right">
                    <span className="px-3 py-1 bg-red-100 text-red-700 font-mono text-xl font-black rounded-xl border border-red-300">
                      Sisa: {p.stock} {p.unit}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
