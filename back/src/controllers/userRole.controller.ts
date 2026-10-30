import { Request, Response } from 'express';
import { UserRoleService } from '../services/userRole.service';
import { UserRole as UserRoleEnum } from '../types/roles';

export class UserRoleController {
  private userRoleService = new UserRoleService();

  /**
   * Liste tous les utilisateurs avec leurs rôles
   */
  getAllUserRoles = async (_req: Request, res: Response) => {
    try {
      const userRoles = await this.userRoleService.getAllUserRoles();
      res.json(userRoles);
    } catch (error) {
      console.error('Erreur lors de la récupération des rôles:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de récupérer les rôles utilisateurs',
      });
    }
  };

  /**
   * Récupère le rôle d'un utilisateur spécifique
   */
  getUserRole = async (req: Request, res: Response) => {
    try {
      const { email } = req.params;
      if (!email) {
        return res.status(400).json({
          error: 'Données invalides',
          message: 'L\'email est requis',
        });
      }
      const role = await this.userRoleService.getUserRole(email);
      res.json({ email, role });
    } catch (error) {
      console.error('Erreur lors de la récupération du rôle:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de récupérer le rôle de l\'utilisateur',
      });
    }
  };

  /**
   * Définit le rôle d'un utilisateur
   */
  setUserRole = async (req: Request, res: Response) => {
    try {
      const { email, role } = req.body;

      if (!email || !role) {
        return res.status(400).json({
          error: 'Données invalides',
          message: 'L\'email et le rôle sont requis',
        });
      }

      if (!Object.values(UserRoleEnum).includes(role)) {
        return res.status(400).json({
          error: 'Rôle invalide',
          message: `Le rôle doit être l'un des suivants: ${Object.values(UserRoleEnum).join(', ')}`,
        });
      }

      const userRole = await this.userRoleService.setUserRole(email, role);
      res.json(userRole);
    } catch (error) {
      console.error('Erreur lors de la définition du rôle:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de définir le rôle de l\'utilisateur',
      });
    }
  };

  /**
   * Désactive un utilisateur
   */
  deactivateUser = async (req: Request, res: Response) => {
    try {
      const { email } = req.params;
      if (!email) {
        return res.status(400).json({
          error: 'Données invalides',
          message: 'L\'email est requis',
        });
      }
      await this.userRoleService.deactivateUser(email);
      res.json({ message: 'Utilisateur désactivé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la désactivation:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de désactiver l\'utilisateur',
      });
    }
  };

  /**
   * Active un utilisateur
   */
  activateUser = async (req: Request, res: Response) => {
    try {
      const { email } = req.params;
      if (!email) {
        return res.status(400).json({
          error: 'Données invalides',
          message: 'L\'email est requis',
        });
      }
      await this.userRoleService.activateUser(email);
      res.json({ message: 'Utilisateur activé avec succès' });
    } catch (error) {
      console.error('Erreur lors de l\'activation:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible d\'activer l\'utilisateur',
      });
    }
  };
}
