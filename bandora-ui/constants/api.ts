// Production: Railway deployment
// Override with EXPO_PUBLIC_API_BASE env var in EAS build if needed
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? 'https://bandora-production.up.railway.app';
