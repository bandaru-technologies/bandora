// EXPO_PUBLIC_API_BASE is injected at build time by EAS (see eas.json env section)
// Falls back to Railway for Expo Go sessions; override via .env.local for local dev
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? 'https://bandora-production.up.railway.app';
