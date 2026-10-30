import api from './api';

export interface TiersRole {
  uuid: string;
  code: string;
  libelle: string;
  description?: string;
  couleur?: string;
  actif: boolean;
  dateCreation: string;
  dateMaj: string;
  flDeleted: boolean;
}

export interface CreateTiersRoleDto {
  code: string;
  libelle: string;
  description?: string;
  couleur?: string;
  actif?: boolean;
}

export interface UpdateTiersRoleDto {
  code?: string;
  libelle?: string;
  description?: string;
  couleur?: string;
  actif?: boolean;
}

export interface TiersSocieteRole {
  uuid: string;
  tiersUuid: string;
  societeUuid: string;
  roleUuid: string;
  commentaire?: string;
  codeRoutageAdvEntrant?: string;
  dateCreation: string;
  dateMaj: string;
  flDeleted: boolean;
  tier?: any;
  societe?: any;
  role?: TiersRole;
}

export interface AssignRoleToTierDto {
  tiersUuid: string;
  societeUuid: string;
  roleUuid: string;
  commentaire?: string;
  codeRoutageAdvEntrant?: string;
}

export interface BulkAssignRolesDto {
  tiersUuid: string;
  societeUuid: string;
  roleUuids: string[];
}

const TiersRoleApi = {
  // ========================================
  // CRUD des rôles (administration)
  // ========================================

  getAllRoles: async (includeInactive = false): Promise<TiersRole[]> => {
    const response = await api.get('/roles', {
      params: { includeInactive },
    });
    return response.data;
  },

  getRoleById: async (uuid: string): Promise<TiersRole> => {
    const response = await api.get(`/roles/${uuid}`);
    return response.data;
  },

  createRole: async (data: CreateTiersRoleDto): Promise<TiersRole> => {
    const response = await api.post('/roles', data);
    return response.data;
  },

  updateRole: async (uuid: string, data: UpdateTiersRoleDto): Promise<TiersRole> => {
    const response = await api.put(`/roles/${uuid}`, data);
    return response.data;
  },

  deleteRole: async (uuid: string): Promise<void> => {
    await api.delete(`/roles/${uuid}`);
  },

  reorderRoles: async (orderedUuids: string[]): Promise<void> => {
    await api.post('/roles/reorder', { orderedUuids });
  },

  // ========================================
  // Gestion des rôles assignés aux tiers
  // ========================================

  getTiersRoles: async (
    tiersUuid: string
  ): Promise<Array<{
    societe: any;
    roles: Array<{ role: TiersRole; assignment: TiersSocieteRole }>;
  }>> => {
    const response = await api.get(`/tiers/${tiersUuid}/roles`);
    return response.data;
  },

  getTiersRolesForSociete: async (
    tiersUuid: string,
    societeUuid: string
  ): Promise<TiersSocieteRole[]> => {
    const response = await api.get(`/tiers/${tiersUuid}/societes/${societeUuid}/roles`);
    return response.data;
  },

  assignRoleToTier: async (data: AssignRoleToTierDto): Promise<TiersSocieteRole> => {
    const response = await api.post('/tiers/roles', data);
    return response.data;
  },

  bulkAssignRoles: async (
    data: BulkAssignRolesDto
  ): Promise<{
    assigned: number;
    errors: Array<{ roleUuid: string; error: string }>;
  }> => {
    const response = await api.post('/tiers/roles/bulk', data);
    return response.data;
  },

  updateTiersSocieteRole: async (
    uuid: string,
    data: { commentaire?: string; codeRoutageAdvEntrant?: string }
  ): Promise<TiersSocieteRole> => {
    const response = await api.put(`/tiers/roles/${uuid}`, data);
    return response.data;
  },

  deleteTiersSocieteRole: async (uuid: string): Promise<void> => {
    await api.delete(`/tiers/roles/${uuid}`);
  },

  getSocieteTiersWithRoles: async (societeUuid: string): Promise<TiersSocieteRole[]> => {
    const response = await api.get(`/societes/${societeUuid}/tiers-roles`);
    return response.data;
  },
};

export default TiersRoleApi;
