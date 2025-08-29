interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isProduction: boolean;
  baseUrl: string;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const isProduction = import.meta.env.PROD;
  
  // In production, these should be set as environment variables in Netlify
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://wntuvobvtdjtrlzrkghp.supabase.co";
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndudHV2b2J2dGRqdHJsenJrZ2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNjM0MjUsImV4cCI6MjA3MTgzOTQyNX0.__60JUWlEKzDVHEcfvbmIVi_pGvRdxfDCtmLha7aF1k";
  
  // Get base URL for sharing links
  const baseUrl = isProduction 
    ? window.location.origin 
    : 'http://localhost:8080';

  return {
    supabaseUrl,
    supabaseAnonKey,
    isProduction,
    baseUrl
  };
};

export const env = getEnvironmentConfig();
