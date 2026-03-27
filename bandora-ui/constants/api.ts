// EXPO_PUBLIC_API_BASE is injected at build time by EAS (see eas.json env section)
// Falls back to local IP for `npx expo start` dev sessions
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? 'http://192.168.1.8:8080';
