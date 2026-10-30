import { Request, Response, NextFunction } from 'express';
import { UserRoleService } from '../services/userRole.service';
import { AuthenticatedRequest } from './authorization.middleware';

const userRoleService = new UserRoleService();

/**
 * Middleware pour enrichir la requête avec les informations utilisateur et leur rôle
 */
export async function enrichUserWithRole(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authReq = req as AuthenticatedRequest;

  if (authReq.isAuthenticated && authReq.isAuthenticated() && authReq.user) {
    const profile = authReq.user as any;
    const email =
      profile.email ||
      profile.nameID ||
      profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];

    if (email) {
      // Récupérer le rôle depuis la base de données
      const role = await userRoleService.getUserRole(email);

      // Enrichir l'objet user avec le rôle et les informations standardisées
      authReq.user = {
        id: profile.nameID || email,
        email,
        name:
          profile.displayName ||
          profile['http://schemas.microsoft.com/identity/claims/displayname'],
        role,
      };
    }
  }

  next();
}
