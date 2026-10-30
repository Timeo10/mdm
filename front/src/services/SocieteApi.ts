import { fetchApi } from './api';
import { Societe, CreateSocieteDto } from '../types';

export const SocieteApi = {
  getAll: (includeInactive?: boolean) => {
    const params = new URLSearchParams();
    if (includeInactive !== undefined) {
      params.append('includeInactive', includeInactive.toString());
    }
    const url = `/societes${params.toString() ? `?${params.toString()}` : ''}`;
    return fetchApi<Societe[]>(url);
  },

  getById: (uuid: string) => fetchApi<Societe>(`/societes/${uuid}`),

  create: (data: CreateSocieteDto) =>
    fetchApi<Societe>('/societes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (uuid: string, data: Partial<CreateSocieteDto>) =>
    fetchApi<Societe>(`/societes/${uuid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (uuid: string) =>
    fetchApi<void>(`/societes/${uuid}`, {
      method: 'DELETE',
    }),
};

export default SocieteApi;
