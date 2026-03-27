// Production: Railway deployment
// Override with EXPO_PUBLIC_API_BASE env var in EAS build if needed
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? 'http://192.168.1.8:8080';
