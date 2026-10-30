import { fetchApi } from './api';
import { UserRole } from '../types/permissions';

export interface UserRoleData {
  uuid: string;
  email: string;
  role: UserRole;
  actif: boolean;
  dateCreation: string;
  dateMaj: string;
}

export const UserRoleApi = {
  /**
   * Récupère tous les utilisateurs avec leurs rôles
   */
  getAllUserRoles: () => fetchApi<UserRoleData[]>('/user-roles'),

  /**
   * Récupère le rôle d'un utilisateur spécifique
   */
  getUserRole: (email: string) =>
    fetchApi<{ email: string; role: UserRole }>(`/user-roles/${encodeURIComponent(email)}`),

  /**
   * Définit le rôle d'un utilisateur
   */
  setUserRole: (email: string, role: UserRole) =>
    fetchApi<UserRoleData>('/user-roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    }),

  /**
   * Désactive un utilisateur
   */
  deactivateUser: (email: string) =>
    fetchApi<{ message: string }>(`/user-roles/${encodeURIComponent(email)}/deactivate`, {
      method: 'PUT',
    }),

  /**
   * Active un utilisateur
   */
  activateUser: (email: string) =>
    fetchApi<{ message: string }>(`/user-roles/${encodeURIComponent(email)}/activate`, {
      method: 'PUT',
    }),
};
