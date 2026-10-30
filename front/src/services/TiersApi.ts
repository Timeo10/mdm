import { fetchApi } from './api';
import {
  Tiers,
  TiersWithSocietes,
  CreateTiersDto,
  AttachTiersToSocieteDto,
  TiersAuditHistoryResponse,
  TiersAuditAction,
  PaginatedResponse,
} from '../types';

export const TiersApi = {
  getAll: (options?: {
    page?: number;
    limit?: number;
    search?: string;
    includeInactive?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.search) params.append('search', options.search);
    if (options?.includeInactive) params.append('includeInactive', 'true');

    const queryString = params.toString();
    return fetchApi<PaginatedResponse<Tiers>>(
      `/tiers${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: (uuid: string) => fetchApi<Tiers>(`/tiers/${uuid}`),

  getWithSocietes: (uuid: string) =>
    fetchApi<TiersWithSocietes>(`/tiers/${uuid}/societes`),

  create: (data: CreateTiersDto, options?: { silentErrors?: boolean }) =>
    fetchApi<Tiers>('/tiers', {
      method: 'POST',
      body: JSON.stringify(data),
      silentErrors: options?.silentErrors,
    }),

  update: (uuid: string, data: Partial<CreateTiersDto>) =>
    fetchApi<Tiers>(`/tiers/${uuid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (uuid: string) =>
    fetchApi<void>(`/tiers/${uuid}`, {
      method: 'DELETE',
    }),

  attachToSociete: (data: AttachTiersToSocieteDto, options?: { silentErrors?: boolean }) =>
    fetchApi('/tiers/societes', {
      method: 'POST',
      body: JSON.stringify(data),
      silentErrors: options?.silentErrors,
    }),

  detachFromSociete: (tiersSocieteUuid: string) =>
    fetchApi<void>(`/tiers/societes/${tiersSocieteUuid}`, {
      method: 'DELETE',
    }),

  updateTiersSociete: (tiersSocieteUuid: string, data: AttachTiersToSocieteDto) =>
    fetchApi(`/tiers/societes/${tiersSocieteUuid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateCustomAttribute: (
    tiersSocieteUuid: string,
    attributeUuid: string,
    valeur: string | null
  ) =>
    fetchApi(`/tiers/societes/${tiersSocieteUuid}/attributes/${attributeUuid}`, {
      method: 'PUT',
      body: JSON.stringify({ valeur }),
    }),

  searchSimilar: (criteria: {
    siren?: string;
    siret?: string;
    raisonSociale?: string;
  }) => {
    const params = new URLSearchParams();
    if (criteria.siren) params.append('siren', criteria.siren);
    if (criteria.siret) params.append('siret', criteria.siret);
    if (criteria.raisonSociale) params.append('raisonSociale', criteria.raisonSociale);

    return fetchApi<Tiers[]>(`/tiers/search/similar?${params.toString()}`);
  },

  getAuditHistory: (
    uuid: string,
    options?: {
      limit?: number;
      offset?: number;
      action?: TiersAuditAction;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.action) params.append('action', options.action);
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    return fetchApi<TiersAuditHistoryResponse>(
      `/tiers/${uuid}/audit?${params.toString()}`
    );
  },
};
