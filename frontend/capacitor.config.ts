import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sankhya.confercheck',
  appName: 'ConferCheck',
  webDir: 'dist',
  server: {
    // Em desenvolvimento, usar o IP da máquina para live reload
    // url: 'http://192.168.0.84:5173',
    // cleartext: true,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
