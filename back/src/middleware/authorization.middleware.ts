import { Request, Response, NextFunction } from 'express';
import { Permission, UserRole, hasPermission, hasAnyPermission } from '../types/roles';

/**
 * Interface pour les données utilisateur dans la requête
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
  };
}

/**
 * Middleware pour vérifier qu'une permission spécifique est accordée
 */
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        error: 'Non authentifié',
        message: 'Vous devez être connecté pour accéder à cette ressource',
      });
    }

    const userRole = authReq.user.role;

    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: `Vous n'avez pas la permission ${permission} requise pour cette action`,
        requiredPermission: permission,
        userRole: userRole,
      });
    }

    next();
  };
}

/**
 * Middleware pour vérifier qu'au moins une des permissions est accordée
 */
export function requireAnyPermission(permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        error: 'Non authentifié',
        message: 'Vous devez être connecté pour accéder à cette ressource',
      });
    }

    const userRole = authReq.user.role;

    if (!hasAnyPermission(userRole, permissions)) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: `Vous n'avez aucune des permissions requises pour cette action`,
        requiredPermissions: permissions,
        userRole: userRole,
      });
    }

    next();
  };
}

/**
 * Middleware pour vérifier qu'un rôle spécifique est accordé
 */
export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        error: 'Non authentifié',
        message: 'Vous devez être connecté pour accéder à cette ressource',
      });
    }

    if (authReq.user.role !== role) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: `Le rôle ${role} est requis pour cette action`,
        requiredRole: role,
        userRole: authReq.user.role,
      });
    }

    next();
  };
}

/**
 * Middleware pour vérifier qu'au moins un des rôles est accordé
 */
export function requireAnyRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        error: 'Non authentifié',
        message: 'Vous devez être connecté pour accéder à cette ressource',
      });
    }

    if (!roles.includes(authReq.user.role)) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: `Un des rôles suivants est requis : ${roles.join(', ')}`,
        requiredRoles: roles,
        userRole: authReq.user.role,
      });
    }

    next();
  };
}

/**
 * Middleware pour exclure certains rôles (utile pour readonly)
 */
export function excludeRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        error: 'Non authentifié',
        message: 'Vous devez être connecté pour accéder à cette ressource',
      });
    }

    if (authReq.user.role === role) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: `Le rôle ${role} n'est pas autorisé pour cette action`,
        excludedRole: role,
        userRole: authReq.user.role,
      });
    }

    next();
  };
}
