import { AppDataSource } from '../config/database';
import { UserRole } from '../entities/userRole';
import { UserRole as UserRoleEnum } from '../types/roles';
import { v4 as uuidv4 } from 'uuid';

export class UserRoleService {
  private userRoleRepository = AppDataSource.getRepository(UserRole);

  /**
   * Récupère le rôle d'un utilisateur par son email
   */
  async getUserRole(email: string): Promise<UserRoleEnum> {
    const userRole = await this.userRoleRepository.findOne({
      where: { email: email.toLowerCase(), actif: true },
    });

    // Si pas de rôle trouvé, retourner READONLY par défaut
    return userRole ? userRole.role : UserRoleEnum.READONLY;
  }

  /**
   * Définit le rôle d'un utilisateur
   */
  async setUserRole(email: string, role: UserRoleEnum): Promise<UserRole> {
    let userRole = await this.userRoleRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (userRole) {
      // Mettre à jour le rôle existant
      userRole.role = role;
      userRole.actif = true;
    } else {
      // Créer un nouveau rôle
      userRole = this.userRoleRepository.create({
        uuid: uuidv4(),
        email: email.toLowerCase(),
        role,
        actif: true,
      });
    }

    return await this.userRoleRepository.save(userRole);
  }

  /**
   * Liste tous les utilisateurs avec leurs rôles
   */
  async getAllUserRoles(): Promise<UserRole[]> {
    return await this.userRoleRepository.find({
      where: { actif: true },
      order: { email: 'ASC' },
    });
  }

  /**
   * Désactive un utilisateur
   */
  async deactivateUser(email: string): Promise<void> {
    await this.userRoleRepository.update(
      { email: email.toLowerCase() },
      { actif: false },
    );
  }

  /**
   * Active un utilisateur
   */
  async activateUser(email: string): Promise<void> {
    await this.userRoleRepository.update(
      { email: email.toLowerCase() },
      { actif: true },
    );
  }
}
