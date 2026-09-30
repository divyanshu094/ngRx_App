import { Capacitor } from '@capacitor/core';

export const environment = {
  production: true,
  // apiUrl:'http://localhost:3000/api/'
  apiUrl: Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
    ? 'http://10.0.2.2:3000/api/'
    : 'https://shopping-node-backend.onrender.com/api/'
};
