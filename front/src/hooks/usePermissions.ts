import { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider';
import { Permission, hasPermission, hasAllPermissions, hasAnyPermission, isReadOnly, UserRole } from '../types/permissions';

/**
 * Hook pour vérifier les permissions de l'utilisateur connecté
 */
export function usePermissions() {
  const auth = useContext(AuthContext);

  const userRole = (auth?.user?.role as UserRole) || UserRole.READONLY;

  return {
    /**
     * Rôle de l'utilisateur
     */
    role: userRole,

    /**
     * Vérifie si l'utilisateur a une permission spécifique
     */
    can: (permission: Permission): boolean => {
      return hasPermission(userRole, permission);
    },

    /**
     * Vérifie si l'utilisateur a toutes les permissions requises
     */
    canAll: (permissions: Permission[]): boolean => {
      return hasAllPermissions(userRole, permissions);
    },

    /**
     * Vérifie si l'utilisateur a au moins une des permissions requises
     */
    canAny: (permissions: Permission[]): boolean => {
      return hasAnyPermission(userRole, permissions);
    },

    /**
     * Vérifie si l'utilisateur est en mode lecture seule
     */
    isReadOnly: (): boolean => {
      return isReadOnly(userRole);
    },

    /**
     * Vérifie si l'utilisateur est administrateur
     */
    isAdmin: (): boolean => {
      return userRole === UserRole.ADMIN;
    },

    /**
     * Vérifie si l'utilisateur est gestionnaire ou plus
     */
    isManagerOrAbove: (): boolean => {
      return userRole === UserRole.ADMIN || userRole === UserRole.MANAGER;
    },
  };
}
