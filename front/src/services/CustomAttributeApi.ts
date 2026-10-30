import { fetchApi } from './api';
import { CustomAttribute, CreateCustomAttributeDto } from '../types';

export const CustomAttributeApi = {
  getAll: (societeUuid?: string) => {
    const params = societeUuid ? `?societeUuid=${societeUuid}` : '';
    return fetchApi<CustomAttribute[]>(`/custom-attributes${params}`);
  },

  getBySociete: (societeUuid: string) => {
    return fetchApi<CustomAttribute[]>(`/custom-attributes?societeUuid=${societeUuid}`);
  },

  getById: (uuid: string) =>
    fetchApi<CustomAttribute>(`/custom-attributes/${uuid}`),

  create: (data: CreateCustomAttributeDto) =>
    fetchApi<CustomAttribute>('/custom-attributes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (uuid: string, data: Partial<CreateCustomAttributeDto>) =>
    fetchApi<CustomAttribute>(`/custom-attributes/${uuid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (uuid: string) =>
    fetchApi<void>(`/custom-attributes/${uuid}`, {
      method: 'DELETE',
    }),
};
