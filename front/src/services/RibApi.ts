import { fetchApi } from './api';
import { Rib, CreateRibDto, UpdateRibDto } from '../types';

export const RibApi = {
  getAll: (includeInactive?: boolean) => {
    const params = new URLSearchParams();
    if (includeInactive !== undefined) {
      params.append('includeInactive', includeInactive.toString());
    }
    const url = `/ribs${params.toString() ? `?${params.toString()}` : ''}`;
    return fetchApi<Rib[]>(url);
  },

  getBySociete: (societeUuid: string, includeInactive?: boolean) => {
    const params = new URLSearchParams();
    if (includeInactive !== undefined) {
      params.append('includeInactive', includeInactive.toString());
    }
    const url = `/ribs/societe/${societeUuid}${params.toString() ? `?${params.toString()}` : ''}`;
    return fetchApi<Rib[]>(url);
  },

  getById: (uuid: string) => fetchApi<Rib>(`/ribs/${uuid}`),

  create: (data: CreateRibDto) =>
    fetchApi<Rib>('/ribs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (uuid: string, data: UpdateRibDto) =>
    fetchApi<Rib>(`/ribs/${uuid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (uuid: string) =>
    fetchApi<void>(`/ribs/${uuid}`, {
      method: 'DELETE',
    }),
};

export default RibApi;
