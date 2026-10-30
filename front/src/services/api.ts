import axiosInstance from '../config/axios';
import { AxiosRequestConfig } from 'axios';

interface FetchOptions extends Omit<AxiosRequestConfig, 'data'> {
  body?: string;
  silentErrors?: boolean;
}

export async function fetchApi<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  const { body, ...axiosOptions } = options || {};

  const config: AxiosRequestConfig = {
    url: endpoint,
    ...axiosOptions,
  };

  // Convertir body (fetch) en data (axios)
  if (body) {
    config.data = JSON.parse(body);
  }

  const response = await axiosInstance(config);

  return response.data;
}

export default axiosInstance;
