import { Transaction } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount).replace('Rp', 'Rp ');
}

export function generateReceiptHtml(tx: Transaction): string {
  const dateFormatted = new Date(tx.timestamp).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const itemsHtml = tx.items.map(item => `
    <tr>
      <td style="padding: 3px 0; font-size: 14px;" colspan="2"><b>${item.productName}</b></td>
    </tr>
    <tr>
      <td style="padding-bottom: 6px; font-size: 13px; color: #444;">${item.quantity} ${item.unit} x ${formatRupiah(item.sellPrice)}</td>
      <td style="padding-bottom: 6px; font-size: 14px; text-align: right; font-weight: bold;">${formatRupiah(item.subtotal)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Struk Transaksi - ${tx.invoiceNumber}</title>
      <style>
        @page { size: 58mm auto; margin: 0; }
        body {
          font-family: 'Courier New', Courier, monospace, sans-serif;
          width: 58mm;
          margin: 0 auto;
          padding: 10px;
          color: #000;
          background: #fff;
          font-size: 13px;
        }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
        .toko-name { font-size: 18px; font-weight: bold; text-transform: uppercase; }
        .inv-info { font-size: 12px; margin-top: 4px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        .total-row { display: flex; justify-content: space-between; font-size: 15px; font-weight: bold; margin: 4px 0; }
        .grand-total { font-size: 18px; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 6px 0; margin: 8px 0; }
        .footer { text-align: center; margin-top: 12px; font-size: 12px; border-top: 1px dashed #000; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="toko-name">${tx.tokoName || 'TOKO KELONTONG BERKAH'}</div>
        <div class="inv-info">No: ${tx.invoiceNumber}</div>
        <div class="inv-info">${dateFormatted}</div>
        <div class="inv-info">Kasir: ${tx.cashierName}</div>
      </div>

      <table class="items-table">
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="divider"></div>

      <div class="total-row">
        <span>METODE BAYAR:</span>
        <span style="text-transform: uppercase;">${tx.paymentMethod}</span>
      </div>
      
      <div class="total-row grand-total">
        <span>TOTAL:</span>
        <span>${formatRupiah(tx.totalAmount)}</span>
      </div>

      <div class="total-row">
        <span>BAYAR:</span>
        <span>${formatRupiah(tx.paidAmount)}</span>
      </div>

      <div class="total-row">
        <span>KEMBALIAN:</span>
        <span>${formatRupiah(tx.changeAmount)}</span>
      </div>

      <div class="footer">
        <p style="margin: 2px 0; font-weight: bold;">MATUR NUWUN / TERIMA KASIH</p>
        <p style="margin: 2px 0;">Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
        <p style="margin: 6px 0 0 0; font-size: 10px;">~ Kasir Suara Toko Kelontong ~</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generates raw ESC/POS binary data for 58mm Bluetooth thermal printers
 */
export function generateEscPosBuffer(tx: Transaction): Uint8Array {
  const encoder = new TextEncoder();
  const dateFormatted = new Date(tx.timestamp).toLocaleString('id-ID', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  const ESC = 0x1b;
  const GS = 0x1d;

  const commands: number[] = [
    ESC, 0x40, // Initialize printer
    ESC, 0x61, 0x01, // Center align
    ESC, 0x21, 0x30, // Double height & double width
  ];

  // Header Toko
  const tokoName = (tx.tokoName || 'TOKO BERKAH JAYA').toUpperCase() + '\n';
  commands.push(...Array.from(encoder.encode(tokoName)));

  // Normal font & Center align
  commands.push(ESC, 0x21, 0x00);
  const invHeader = `No: ${tx.invoiceNumber}\nTgl: ${dateFormatted}\nKasir: ${tx.cashierName}\n--------------------------------\n`;
  commands.push(...Array.from(encoder.encode(invHeader)));

  // Left align for items
  commands.push(ESC, 0x61, 0x00);

  tx.items.forEach(item => {
    const itemTitle = `${item.productName}\n`;
    const itemDetail = `${item.quantity} ${item.unit} x ${formatRupiah(item.sellPrice)}`;
    const itemSubtotal = formatRupiah(item.subtotal);
    
    // Pad right for price alignment (32 cols standard for 58mm)
    const spacesNeeded = Math.max(1, 32 - itemDetail.length - itemSubtotal.length);
    const detailRow = itemDetail + ' '.repeat(spacesNeeded) + itemSubtotal + '\n';

    commands.push(...Array.from(encoder.encode(itemTitle)));
    commands.push(...Array.from(encoder.encode(detailRow)));
  });

  commands.push(...Array.from(encoder.encode('--------------------------------\n')));

  // Totals
  const totalStr = `TOTAL    : ${formatRupiah(tx.totalAmount)}\n`;
  const paidStr  = `BAYAR    : ${formatRupiah(tx.paidAmount)}\n`;
  const changeStr= `KEMBALI  : ${formatRupiah(tx.changeAmount)}\n`;

  commands.push(ESC, 0x45, 0x01); // Bold on
  commands.push(...Array.from(encoder.encode(totalStr)));
  commands.push(ESC, 0x45, 0x00); // Bold off
  commands.push(...Array.from(encoder.encode(paidStr)));
  commands.push(...Array.from(encoder.encode(changeStr)));

  commands.push(...Array.from(encoder.encode('--------------------------------\n')));

  // Footer Center
  commands.push(ESC, 0x61, 0x01);
  commands.push(...Array.from(encoder.encode('MATUR NUWUN / TERIMA KASIH\n')));
  commands.push(...Array.from(encoder.encode('Semoga Berkah & Laris Manis\n\n\n\n')));

  // Cut paper command (if supported) or feed
  commands.push(GS, 0x56, 0x42, 0x00);

  return new Uint8Array(commands);
}

/**
 * Connects directly to Bluetooth thermal printer via Web Bluetooth API
 */
export async function printViaBluetooth(tx: Transaction): Promise<{ success: boolean; message: string }> {
  if (!('bluetooth' in navigator)) {
    return {
      success: false,
      message: 'Web Bluetooth API tidak didukung browser ini. Silakan gunakan tombol Cetak Struk Standar.'
    };
  }

  try {
    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', // Standard Printer Service
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
        '00001101-0000-1000-8000-00805f9b34fb', // Serial Port Profile
        '49535343-fe7d-4ae5-8fa9-9fafd205e455'
      ]
    });

    if (!device) {
      return { success: false, message: 'Perangkat Bluetooth tidak dipilih.' };
    }

    const server = await device.gatt.connect();
    const services = await server.getPrimaryServices();
    
    let targetCharacteristic: any = null;

    for (const service of services) {
      const characteristics = await service.getCharacteristics();
      for (const char of characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          targetCharacteristic = char;
          break;
        }
      }
      if (targetCharacteristic) break;
    }

    if (!targetCharacteristic) {
      server.disconnect();
      return { success: false, message: 'Karakteristik Bluetooth printer tidak ditemukan.' };
    }

    const escPosData = generateEscPosBuffer(tx);
    // Send in 20-byte chunks for Bluetooth BLE MTU limits
    const chunkSize = 20;
    for (let i = 0; i < escPosData.length; i += chunkSize) {
      const chunk = escPosData.slice(i, i + chunkSize);
      await targetCharacteristic.writeValue(chunk);
    }

    server.disconnect();
    return { success: true, message: 'Struk berhasil dikirim ke Printer Bluetooth!' };
  } catch (err: any) {
    console.error('Bluetooth error:', err);
    return {
      success: false,
      message: err?.message || 'Gagal terhubung ke printer Bluetooth.'
    };
  }
}

/**
 * Triggers standard browser print
 */
export function printReceipt(tx: Transaction) {
  const html = generateReceiptHtml(tx);
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}
