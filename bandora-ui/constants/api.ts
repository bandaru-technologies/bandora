// EXPO_PUBLIC_API_BASE is injected at build time by EAS (see eas.json env section)
// Falls back to Railway for Expo Go sessions; override via .env.local for local dev
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? 'https://lv-production.up.railway.app';
