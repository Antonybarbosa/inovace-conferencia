import axios, { AxiosInstance } from 'axios';

const TOKEN_KEY = 'conferencia_token';

export const httpClient: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 30000,
});

// Interceptor: injeta token em todas as requisições
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: trata erros de rede e autenticação
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Servidor offline / erro de rede
    if (!error.response) {
      const networkError = new Error('Servidor indisponível. Verifique se o backend está rodando.');
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }

    // Proxy retornou 502 (backend offline mas Vite rodando)
    if (error.response.status === 502) {
      const networkError = new Error('Servidor indisponível. Verifique se o backend está rodando.');
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }

    // Token expirado ou inválido
    if (error.response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);
