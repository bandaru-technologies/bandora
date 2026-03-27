// In production builds, set EXPO_PUBLIC_API_BASE in your EAS environment variables.
// For local dev, falls back to your LAN IP.
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? 'http://192.168.1.8:8080';
