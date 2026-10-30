/**
 * Énumération des rôles utilisateurs
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  READONLY = 'READONLY',
}

/**
 * Énumération des permissions
 */
export enum Permission {
  // Tiers
  TIERS_READ = 'TIERS_READ',
  TIERS_CREATE = 'TIERS_CREATE',
  TIERS_UPDATE = 'TIERS_UPDATE',
  TIERS_DELETE = 'TIERS_DELETE',

  // Sociétés
  SOCIETE_READ = 'SOCIETE_READ',
  SOCIETE_CREATE = 'SOCIETE_CREATE',
  SOCIETE_UPDATE = 'SOCIETE_UPDATE',
  SOCIETE_DELETE = 'SOCIETE_DELETE',

  // Relations Tiers-Société
  TIERS_SOCIETE_ATTACH = 'TIERS_SOCIETE_ATTACH',
  TIERS_SOCIETE_DETACH = 'TIERS_SOCIETE_DETACH',
  TIERS_SOCIETE_UPDATE = 'TIERS_SOCIETE_UPDATE',

  // Attributs personnalisés
  CUSTOM_ATTRIBUTE_READ = 'CUSTOM_ATTRIBUTE_READ',
  CUSTOM_ATTRIBUTE_CREATE = 'CUSTOM_ATTRIBUTE_CREATE',
  CUSTOM_ATTRIBUTE_UPDATE = 'CUSTOM_ATTRIBUTE_UPDATE',
  CUSTOM_ATTRIBUTE_DELETE = 'CUSTOM_ATTRIBUTE_DELETE',

  // Rôles
  ROLE_READ = 'ROLE_READ',
  ROLE_CREATE = 'ROLE_CREATE',
  ROLE_UPDATE = 'ROLE_UPDATE',
  ROLE_DELETE = 'ROLE_DELETE',

  // Audit
  AUDIT_READ = 'AUDIT_READ',
  AUDIT_EXPORT = 'AUDIT_EXPORT',

  // Approbations
  APPROVAL_READ = 'APPROVAL_READ',
  APPROVAL_APPROVE = 'APPROVAL_APPROVE',
  APPROVAL_REJECT = 'APPROVAL_REJECT',
}

/**
 * Mapping des rôles vers leurs permissions
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.TIERS_READ,
    Permission.TIERS_CREATE,
    Permission.TIERS_UPDATE,
    Permission.TIERS_DELETE,
    Permission.SOCIETE_READ,
    Permission.SOCIETE_CREATE,
    Permission.SOCIETE_UPDATE,
    Permission.SOCIETE_DELETE,
    Permission.TIERS_SOCIETE_ATTACH,
    Permission.TIERS_SOCIETE_DETACH,
    Permission.TIERS_SOCIETE_UPDATE,
    Permission.CUSTOM_ATTRIBUTE_READ,
    Permission.CUSTOM_ATTRIBUTE_CREATE,
    Permission.CUSTOM_ATTRIBUTE_UPDATE,
    Permission.CUSTOM_ATTRIBUTE_DELETE,
    Permission.ROLE_READ,
    Permission.ROLE_CREATE,
    Permission.ROLE_UPDATE,
    Permission.ROLE_DELETE,
    Permission.AUDIT_READ,
    Permission.AUDIT_EXPORT,
    Permission.APPROVAL_READ,
    Permission.APPROVAL_APPROVE,
    Permission.APPROVAL_REJECT,
  ],

  [UserRole.MANAGER]: [
    Permission.TIERS_READ,
    Permission.TIERS_CREATE,
    Permission.TIERS_UPDATE,
    Permission.SOCIETE_READ,
    Permission.SOCIETE_CREATE,
    Permission.SOCIETE_UPDATE,
    Permission.TIERS_SOCIETE_ATTACH,
    Permission.TIERS_SOCIETE_DETACH,
    Permission.TIERS_SOCIETE_UPDATE,
    Permission.CUSTOM_ATTRIBUTE_READ,
    Permission.CUSTOM_ATTRIBUTE_UPDATE,
    Permission.ROLE_READ,
    Permission.AUDIT_READ,
    Permission.APPROVAL_READ,
    Permission.APPROVAL_APPROVE,
    Permission.APPROVAL_REJECT,
  ],

  [UserRole.USER]: [
    Permission.TIERS_READ,
    Permission.TIERS_CREATE,
    Permission.TIERS_UPDATE,
    Permission.SOCIETE_READ,
    Permission.TIERS_SOCIETE_ATTACH,
    Permission.TIERS_SOCIETE_UPDATE,
    Permission.CUSTOM_ATTRIBUTE_READ,
    Permission.ROLE_READ,
    Permission.APPROVAL_READ,
  ],

  [UserRole.READONLY]: [
    Permission.TIERS_READ,
    Permission.SOCIETE_READ,
    Permission.CUSTOM_ATTRIBUTE_READ,
    Permission.ROLE_READ,
    Permission.APPROVAL_READ,
  ],
};

/**
 * Vérifie si un rôle possède une permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission);
}

/**
 * Vérifie si un rôle possède toutes les permissions requises
 */
export function hasAllPermissions(role: UserRole, requiredPermissions: Permission[]): boolean {
  return requiredPermissions.every(permission => hasPermission(role, permission));
}

/**
 * Vérifie si un rôle possède au moins une des permissions requises
 */
export function hasAnyPermission(role: UserRole, requiredPermissions: Permission[]): boolean {
  return requiredPermissions.some(permission => hasPermission(role, permission));
}

/**
 * Vérifie si le rôle est en mode lecture seule
 */
export function isReadOnly(role: UserRole): boolean {
  return role === UserRole.READONLY;
}
