import { AppDataSource } from '../config/database';
import { TiersSocieteRole } from '../entities/tiersSocieteRole';
import { TiersRole } from '../entities/tiersRole';
import { Tiers } from '../entities/tiers';
import { Societe } from '../entities/societe';
import {
  AssignRoleToTiersDto,
  UpdateTiersRoleAssignmentDto,
  BulkAssignRolesDto,
} from '../dto';
import { randomUUID } from 'crypto';
import { BusinessError } from '../middleware/errorHandler';
import { TiersAuditService, AuditContext } from './tiersAudit.service';
import { TiersAuditAction } from '../entities/tiersAuditLog';

export class TiersSocieteRoleService {
  private tiersSocieteRoleRepository = AppDataSource.getRepository(TiersSocieteRole);
  private tiersRoleRepository = AppDataSource.getRepository(TiersRole);
  private tierRepository = AppDataSource.getRepository(Tiers);
  private societeRepository = AppDataSource.getRepository(Societe);
  private auditService = new TiersAuditService();

  async findAll(): Promise<TiersSocieteRole[]> {
    return this.tiersSocieteRoleRepository.find({
      where: { flDeleted: false },
      relations: ['tiers', 'societe', 'role'],
      order: { dateCreation: 'DESC' },
    });
  }

  async findByTier(tiersUuid: string): Promise<TiersSocieteRole[]> {
    return this.tiersSocieteRoleRepository.find({
      where: { tiersUuid, flDeleted: false },
      relations: ['societe', 'role'],
      order: { dateCreation: 'DESC' },
    });
  }

  async findBySociete(societeUuid: string): Promise<TiersSocieteRole[]> {
    return this.tiersSocieteRoleRepository.find({
      where: { societeUuid, flDeleted: false },
      relations: ['tiers', 'role'],
      order: { dateCreation: 'DESC' },
    });
  }

  async findByTierAndSociete(tiersUuid: string, societeUuid: string): Promise<TiersSocieteRole[]> {
    return this.tiersSocieteRoleRepository.find({
      where: { tiersUuid, societeUuid, flDeleted: false },
      relations: ['role'],
      order: { dateCreation: 'DESC' },
    });
  }

  async findById(uuid: string): Promise<TiersSocieteRole | null> {
    return this.tiersSocieteRoleRepository.findOne({
      where: { uuid, flDeleted: false },
      relations: ['tiers', 'societe', 'role'],
    });
  }

  async assignRole(data: AssignRoleToTiersDto, auditContext?: AuditContext): Promise<TiersSocieteRole> {
    // Vérifier que le tiers existe
    const tier = await this.tierRepository.findOne({
      where: { uuid: data.tiersUuid, flDeleted: false },
    });

    if (!tier) {
      throw new BusinessError('Tiers introuvable', 404);
    }

    // Vérifier que la société existe
    const societe = await this.societeRepository.findOne({
      where: { uuid: data.societeUuid, flDeleted: false },
    });

    if (!societe) {
      throw new BusinessError('Société introuvable', 404);
    }

    // Vérifier que le rôle existe
    const role = await this.tiersRoleRepository.findOne({
      where: { uuid: data.roleUuid, flDeleted: false, actif: true },
    });

    if (!role) {
      throw new BusinessError('Rôle introuvable ou inactif', 404);
    }

    // Vérifier qu'il n'existe pas déjà
    const existing = await this.tiersSocieteRoleRepository.findOne({
      where: {
        tiersUuid: data.tiersUuid,
        societeUuid: data.societeUuid,
        roleUuid: data.roleUuid,
        flDeleted: false,
      },
    });

    if (existing) {
      throw new BusinessError('Ce rôle est déjà assigné à ce tiers pour cette société', 409);
    }

    const roleData: any = {
      uuid: randomUUID(),
      tiersUuid: data.tiersUuid,
      societeUuid: data.societeUuid,
      roleUuid: data.roleUuid,
    };

    if (data.commentaire !== undefined && data.commentaire !== null) {
      roleData.commentaire = data.commentaire;
    }

    if (data.codeRoutageAdvEntrant !== undefined && data.codeRoutageAdvEntrant !== null) {
      roleData.codeRoutageAdvEntrant = data.codeRoutageAdvEntrant;
    }

    const tiersSocieteRole = this.tiersSocieteRoleRepository.create(roleData);

    const savedRoleArray = await this.tiersSocieteRoleRepository.save(tiersSocieteRole);
    const savedRole = (Array.isArray(savedRoleArray) ? savedRoleArray[0] : savedRoleArray) as TiersSocieteRole;

    // Créer l'entrée d'audit
    await this.auditService.createAuditLog({
      tiersUuid: data.tiersUuid,
      action: TiersAuditAction.ASSIGN_ROLE,
      entityType: 'TiersSocieteRole',
      entityUuid: savedRole.uuid,
      description: `Attribution du rôle "${role.libelle}" pour la société "${societe.raisonSociale}"`,
      newValues: {
        roleCode: role.code,
        roleLibelle: role.libelle,
        societeCode: societe.code,
        societeRaisonSociale: societe.raisonSociale,
        commentaire: data.commentaire,
        codeRoutageAdvEntrant: data.codeRoutageAdvEntrant,
      },
      context: auditContext,
    });

    return savedRole;
  }

  async bulkAssignRoles(data: BulkAssignRolesDto): Promise<{
    assigned: number;
    errors: Array<{ roleUuid: string; error: string }>;
  }> {
    const results = {
      assigned: 0,
      errors: [] as Array<{ roleUuid: string; error: string }>,
    };

    for (const roleUuid of data.roleUuids) {
      try {
        await this.assignRole({
          tiersUuid: data.tiersUuid,
          societeUuid: data.societeUuid,
          roleUuid,
        });
        results.assigned++;
      } catch (error: any) {
        results.errors.push({
          roleUuid,
          error: error.message || 'Erreur inconnue',
        });
      }
    }

    return results;
  }

  async update(uuid: string, data: UpdateTiersRoleAssignmentDto): Promise<TiersSocieteRole> {
    const tiersSocieteRole = await this.findById(uuid);

    if (!tiersSocieteRole) {
      throw new BusinessError('Association introuvable', 404);
    }

    Object.assign(tiersSocieteRole, {
      commentaire: data.commentaire ?? tiersSocieteRole.commentaire,
      codeRoutageAdvEntrant: data.codeRoutageAdvEntrant ?? tiersSocieteRole.codeRoutageAdvEntrant,
    });

    return this.tiersSocieteRoleRepository.save(tiersSocieteRole);
  }

  async delete(uuid: string, auditContext?: AuditContext): Promise<void> {
    const tiersSocieteRole = await this.findById(uuid);

    if (!tiersSocieteRole) {
      throw new BusinessError('Association introuvable', 404);
    }

    // Récupérer les informations pour l'audit avant la suppression
    const role = tiersSocieteRole.role;
    const societe = tiersSocieteRole.societe;

    // Suppression logique
    tiersSocieteRole.flDeleted = true;
    await this.tiersSocieteRoleRepository.save(tiersSocieteRole);

    // Créer l'entrée d'audit
    await this.auditService.createAuditLog({
      tiersUuid: tiersSocieteRole.tiersUuid,
      action: TiersAuditAction.REMOVE_ROLE,
      entityType: 'TiersSocieteRole',
      entityUuid: uuid,
      description: `Retrait du rôle "${role?.libelle || 'inconnu'}" pour la société "${societe?.raisonSociale || 'inconnue'}"`,
      oldValues: {
        roleCode: role?.code,
        roleLibelle: role?.libelle,
        societeCode: societe?.code,
        societeRaisonSociale: societe?.raisonSociale,
        commentaire: tiersSocieteRole.commentaire,
        codeRoutageAdvEntrant: tiersSocieteRole.codeRoutageAdvEntrant,
      },
      context: auditContext,
    });
  }

  async deleteByTierAndSocieteAndRole(
    tiersUuid: string,
    societeUuid: string,
    roleUuid: string,
    auditContext?: AuditContext
  ): Promise<void> {
    const tiersSocieteRole = await this.tiersSocieteRoleRepository.findOne({
      where: {
        tiersUuid,
        societeUuid,
        roleUuid,
        flDeleted: false,
      },
      relations: ['role', 'societe'],
    });

    if (!tiersSocieteRole) {
      throw new BusinessError('Association introuvable', 404);
    }

    // Récupérer les informations pour l'audit avant la suppression
    const role = tiersSocieteRole.role;
    const societe = tiersSocieteRole.societe;

    tiersSocieteRole.flDeleted = true;
    await this.tiersSocieteRoleRepository.save(tiersSocieteRole);

    // Créer l'entrée d'audit
    await this.auditService.createAuditLog({
      tiersUuid,
      action: TiersAuditAction.REMOVE_ROLE,
      entityType: 'TiersSocieteRole',
      entityUuid: tiersSocieteRole.uuid,
      description: `Retrait du rôle "${role?.libelle || 'inconnu'}" pour la société "${societe?.raisonSociale || 'inconnue'}"`,
      oldValues: {
        roleCode: role?.code,
        roleLibelle: role?.libelle,
        societeCode: societe?.code,
        societeRaisonSociale: societe?.raisonSociale,
        commentaire: tiersSocieteRole.commentaire,
        codeRoutageAdvEntrant: tiersSocieteRole.codeRoutageAdvEntrant,
      },
      context: auditContext,
    });
  }

  async getRolesByTierGroupedBySociete(tiersUuid: string): Promise<
    Array<{
      societe: Societe;
      roles: Array<{ role: TiersRole; assignment: TiersSocieteRole }>;
    }>
  > {
    const assignments = await this.tiersSocieteRoleRepository.find({
      where: { tiersUuid, flDeleted: false },
      relations: ['societe', 'role'],
      order: { dateCreation: 'DESC' },
    });

    const grouped = new Map<
      string,
      {
        societe: Societe;
        roles: Array<{ role: TiersRole; assignment: TiersSocieteRole }>;
      }
    >();

    for (const assignment of assignments) {
      if (!assignment.societe || !assignment.role) continue;

      if (!grouped.has(assignment.societeUuid)) {
        grouped.set(assignment.societeUuid, {
          societe: assignment.societe,
          roles: [],
        });
      }

      grouped.get(assignment.societeUuid)!.roles.push({
        role: assignment.role,
        assignment,
      });
    }

    return Array.from(grouped.values());
  }
}
