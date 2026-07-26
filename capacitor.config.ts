import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.warungberkah.kasir',
  appName: 'Kasir Toko Kelontong',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
