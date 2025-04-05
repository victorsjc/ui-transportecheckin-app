// Configuração para diferentes ambientes

// Base URL para requisições API
export const getApiBaseUrl = () => {
  // No ambiente de desenvolvimento local
  if (import.meta.env.DEV) {
    return 'https://transportecheckin-services.vercel.app';
  }
  
  // No ambiente de produção (Vercel)
  return 'https://transportecheckin-services.vercel.app';  // URLs relativas funcionam no mesmo domínio
};

// Ambiente
export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;