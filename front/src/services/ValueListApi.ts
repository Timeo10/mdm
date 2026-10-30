import { fetchApi } from './api';
import { ValueList, CreateValueListDto } from '../types';

export const ValueListApi = {
  getAll: (includeInactive?: boolean) => {
    const params = new URLSearchParams();
    if (includeInactive !== undefined) {
      params.append('includeInactive', includeInactive.toString());
    }
    const url = `/value-lists${params.toString() ? `?${params.toString()}` : ''}`;
    return fetchApi<ValueList[]>(url);
  },

  getById: (uuid: string) => fetchApi<ValueList>(`/value-lists/${uuid}`),

  getByCode: (code: string) => fetchApi<ValueList>(`/value-lists/by-code/${code}`),

  create: (data: CreateValueListDto) =>
    fetchApi<ValueList>('/value-lists', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (uuid: string, data: Partial<CreateValueListDto>) =>
    fetchApi<ValueList>(`/value-lists/${uuid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (uuid: string) =>
    fetchApi<void>(`/value-lists/${uuid}`, {
      method: 'DELETE',
    }),
};

export default ValueListApi;
