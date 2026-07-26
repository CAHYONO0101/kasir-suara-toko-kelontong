export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  unit: string; // pcs, kg, bungkus, botol, galon, renteng, dus, liter
  aliases?: string[]; // Alternative spoken names e.g., ["sedap", "sedaap", "mie sedap"]
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
  note?: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  timestamp: string; // ISO date string
  items: {
    productId: string;
    productName: string;
    unit: string;
    sellPrice: number;
    buyPrice: number;
    quantity: number;
    subtotal: number;
  }[];
  totalAmount: number;
  totalCost: number;
  profit: number;
  paymentMethod: 'cash' | 'qris' | 'transfer';
  paidAmount: number;
  changeAmount: number;
  cashierName: string;
  tokoName: string;
}

export interface VoiceParseResult {
  rawTranscript: string;
  parsedItems: {
    spokenQuery: string;
    quantity: number;
    matchedProduct?: Product;
    confidence: number;
    suggestions: Product[];
  }[];
}

export interface CashierSettings {
  tokoName: string;
  tokoAddress: string;
  tokoPhone: string;
  cashierName: string;
  requirePin: boolean;
  pinCode: string;
  speakFeedback: boolean;
  fontSizeLarge: boolean;
  autoBackup: boolean;
  qrisNmr: string;
}
