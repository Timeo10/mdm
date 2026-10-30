import { fetchApi } from './api';
import { TiersContact, CreateTiersContactDto } from '../types';

export const TiersContactApi = {
  getByTiers: (tiersUuid: string) =>
    fetchApi<TiersContact[]>(`/tiers/${tiersUuid}/contacts`),

  create: (tiersUuid: string, data: CreateTiersContactDto) =>
    fetchApi<TiersContact>(`/tiers/${tiersUuid}/contacts`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (contactUuid: string, data: Partial<CreateTiersContactDto> & { actif?: boolean }) =>
    fetchApi<TiersContact>(`/tiers/contacts/${contactUuid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (contactUuid: string) =>
    fetchApi<void>(`/tiers/contacts/${contactUuid}`, {
      method: 'DELETE',
    }),
};
