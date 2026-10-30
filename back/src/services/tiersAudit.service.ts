import { AppDataSource } from '../config/database';
import { TiersAuditLog, TiersAuditAction } from '../entities/tiersAuditLog';
import { Request } from 'express';
import { createHash } from 'crypto';

export interface AuditContext {
  userEmail?: string;
  userName?: string;
  userRole?: string;
  ipAddress?: string;
}

// Configuration RGPD pour Application Professionnelle Interne
const AUDIT_RETENTION_DAYS = 365 * 5; // 5 ans par défaut pour usage professionnel (ajustable : 3-10 ans selon besoins légaux)
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'apiKey',
  'secret',
  'nomPrenom', // Données personnelles des tiers (non collaborateurs)
  'emailFacturation',
  // Ajoutez d'autres champs sensibles selon vos besoins
];

export interface CreateAuditLogDto {
  tiersUuid: string;
  action: TiersAuditAction;
  entityType?: string;
  entityUuid?: string;
  changes?: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  description?: string;
  context?: AuditContext;
}

export class TiersAuditService {
  private auditRepository = AppDataSource.getRepository(TiersAuditLog);

  /**
   * Hash SHA-256 pour pseudonymisation (RGPD)
   */
  private hashSHA256(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Anonymise une adresse IP (RGPD)
   * Exemple: 192.168.1.123 -> 192.168.1.0
   */
  private anonymizeIP(ip: string): string {
    if (!ip) return '';

    // IPv4
    if (ip.includes('.')) {
      const parts = ip.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
      }
    }

    // IPv6
    if (ip.includes(':')) {
      const parts = ip.split(':');
      if (parts.length >= 4) {
        return `${parts.slice(0, 4).join(':')}::`;
      }
    }

    return ip;
  }

  /**
   * Filtre les champs sensibles d'un objet (RGPD)
   */
  private filterSensitiveData(data: Record<string, any>): Record<string, any> {
    const filtered: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      // Exclure les champs sensibles
      if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        filtered[key] = '[FILTERED]';
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Filtrage récursif pour les objets imbriqués
        filtered[key] = this.filterSensitiveData(value);
      } else {
        filtered[key] = value;
      }
    }

    return filtered;
  }

  /**
   * Calcule la date de rétention selon la politique RGPD
   */
  private calculateRetentionDate(): Date {
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() + AUDIT_RETENTION_DAYS);
    return retentionDate;
  }

  /**
   * Extrait le contexte d'audit depuis une requête Express
   */
  extractContextFromRequest(req: Request): AuditContext {
    const userEmail = (req as any).user?.email;
    const userName = (req as any).user?.name || (req as any).user?.username;
    const userRole = (req as any).user?.role;
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip;

    return {
      userEmail,
      userName,
      userRole,
      ipAddress,
    };
  }

  /**
   * Crée une entrée d'audit conforme RGPD
   */
  async createAuditLog(data: CreateAuditLogDto): Promise<TiersAuditLog> {
    // Filtrer les données sensibles
    const filteredOldValues = data.oldValues ? this.filterSensitiveData(data.oldValues) : undefined;
    const filteredNewValues = data.newValues ? this.filterSensitiveData(data.newValues) : undefined;
    const filteredChanges = data.changes ? this.filterSensitiveData(data.changes) : undefined;

    // Pseudonymisation de l'utilisateur
    const userId = data.context?.userEmail
      ? this.hashSHA256(data.context.userEmail)
      : undefined;

    const userEmailHash = data.context?.userEmail
      ? this.hashSHA256(data.context.userEmail)
      : undefined;

    // Anonymisation de l'IP
    const ipAddressAnonymized = data.context?.ipAddress
      ? this.anonymizeIP(data.context.ipAddress)
      : undefined;

    const auditLog = this.auditRepository.create({
      tiersUuid: data.tiersUuid,
      action: data.action,
      entityType: data.entityType,
      entityUuid: data.entityUuid,

      // Données utilisateur pseudonymisées (RGPD)
      userId,
      userEmailHash,
      userRole: data.context?.userRole,

      // Données utilisateur non-pseudonymisées (usage professionnel interne)
      userName: data.context?.userName,
      userEmail: data.context?.userEmail,

      // IP anonymisée (RGPD)
      ipAddressAnonymized,

      // Données filtrées (RGPD)
      changes: filteredChanges,
      oldValues: filteredOldValues,
      newValues: filteredNewValues,
      description: data.description,

      // Métadonnées RGPD
      retentionUntil: this.calculateRetentionDate(),
      isAnonymized: false,
    });

    return this.auditRepository.save(auditLog);
  }

  /**
   * Récupère l'historique d'audit pour un tiers
   */
  async getAuditLogsByTiers(
    tiersUuid: string,
    options?: {
      limit?: number;
      offset?: number;
      action?: TiersAuditAction;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ logs: TiersAuditLog[]; total: number }> {
    const query = this.auditRepository
      .createQueryBuilder('audit')
      .where('audit.tiersUuid = :tiersUuid', { tiersUuid });

    if (options?.action) {
      query.andWhere('audit.action = :action', { action: options.action });
    }

    if (options?.startDate) {
      query.andWhere('audit.dateAction >= :startDate', {
        startDate: options.startDate,
      });
    }

    if (options?.endDate) {
      query.andWhere('audit.dateAction <= :endDate', {
        endDate: options.endDate,
      });
    }

    query.orderBy('audit.dateAction', 'DESC');

    const total = await query.getCount();

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }

    const logs = await query.getMany();

    return { logs, total };
  }

  /**
   * Compare deux objets et retourne les différences
   */
  getChanges(
    oldObject: Record<string, any>,
    newObject: Record<string, any>
  ): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};

    // Vérifier les propriétés modifiées ou ajoutées
    for (const key in newObject) {
      if (oldObject[key] !== newObject[key]) {
        changes[key] = {
          old: oldObject[key],
          new: newObject[key],
        };
      }
    }

    // Vérifier les propriétés supprimées
    for (const key in oldObject) {
      if (!(key in newObject)) {
        changes[key] = {
          old: oldObject[key],
          new: undefined,
        };
      }
    }

    return changes;
  }

  /**
   * Génère une description lisible de l'action
   */
  generateDescription(
    action: TiersAuditAction,
    entityType?: string,
    changes?: Record<string, any>
  ): string {
    const descriptions: Record<TiersAuditAction, string> = {
      [TiersAuditAction.CREATE]: 'Création du tiers',
      [TiersAuditAction.UPDATE]: 'Mise à jour du tiers',
      [TiersAuditAction.DELETE]: 'Suppression du tiers',
      [TiersAuditAction.ATTACH_SOCIETE]: `Attachement à une société`,
      [TiersAuditAction.DETACH_SOCIETE]: `Détachement d'une société`,
      [TiersAuditAction.UPDATE_TIERS_SOCIETE]: 'Mise à jour de la relation tiers-société',
      [TiersAuditAction.UPDATE_CUSTOM_ATTRIBUTE]: `Mise à jour d'un attribut personnalisé`,
      [TiersAuditAction.UPDATE_GLOBAL_ATTRIBUTE]: `Mise à jour d'un attribut global`,
      [TiersAuditAction.ASSIGN_ROLE]: `Attribution d'un rôle`,
      [TiersAuditAction.REMOVE_ROLE]: `Retrait d'un rôle`,
      [TiersAuditAction.CREATE_CONTACT]: `Création d'un contact`,
      [TiersAuditAction.UPDATE_CONTACT]: `Mise à jour d'un contact`,
      [TiersAuditAction.DELETE_CONTACT]: `Suppression d'un contact`,
    };

    let description = descriptions[action] || action;

    if (changes && Object.keys(changes).length > 0) {
      const changedFields = Object.keys(changes).join(', ');
      description += ` - Champs modifiés: ${changedFields}`;
    }

    return description;
  }

  /**
   * Supprime les logs expirés selon la politique de rétention RGPD
   */
  async cleanExpiredAuditLogs(): Promise<number> {
    const result = await this.auditRepository
      .createQueryBuilder()
      .delete()
      .where('retention_until IS NOT NULL')
      .andWhere('retention_until < NOW()')
      .andWhere('is_anonymized = FALSE')
      .execute();

    return result.affected || 0;
  }

  /**
   * Anonymise une entrée d'audit (RGPD - Droit à l'oubli)
   */
  async anonymizeAuditLog(auditLogUuid: string): Promise<void> {
    await this.auditRepository.update(auditLogUuid, {
      userId: 'ANONYMIZED',
      userEmailHash: undefined,
      userRole: undefined,
      ipAddressAnonymized: undefined,
      oldValues: undefined,
      newValues: undefined,
      changes: undefined,
      isAnonymized: true,
      anonymizedAt: new Date(),
    });
  }

  /**
   * Anonymise tous les logs d'un utilisateur spécifique (RGPD - Droit à l'oubli)
   */
  async anonymizeUserAuditLogs(userEmail: string): Promise<number> {
    const userEmailHash = this.hashSHA256(userEmail);

    const result = await this.auditRepository
      .createQueryBuilder()
      .update()
      .set({
        userId: 'ANONYMIZED',
        userEmailHash: undefined,
        userRole: undefined,
        ipAddressAnonymized: undefined,
        oldValues: undefined,
        newValues: undefined,
        changes: undefined,
        isAnonymized: true,
        anonymizedAt: new Date(),
      })
      .where('user_email_hash = :userEmailHash', { userEmailHash })
      .andWhere('is_anonymized = FALSE')
      .execute();

    return result.affected || 0;
  }

  /**
   * Exporte les logs d'audit d'un utilisateur (RGPD - Droit à la portabilité)
   */
  async exportUserAuditLogs(userEmail: string): Promise<TiersAuditLog[]> {
    const userEmailHash = this.hashSHA256(userEmail);

    return this.auditRepository.find({
      where: {
        userEmailHash,
        isAnonymized: false,
      },
      order: {
        dateAction: 'DESC',
      },
    });
  }

  /**
   * Compte les logs non anonymisés pour statistiques RGPD
   */
  async countNonAnonymizedLogs(): Promise<number> {
    return this.auditRepository.count({
      where: {
        isAnonymized: false,
      },
    });
  }

  /**
   * Compte les logs expirés à supprimer
   */
  async countExpiredLogs(): Promise<number> {
    const now = new Date();
    const query = this.auditRepository
      .createQueryBuilder('audit')
      .where('audit.retentionUntil IS NOT NULL')
      .andWhere('audit.retentionUntil < :now', { now })
      .andWhere('audit.isAnonymized = FALSE');

    return query.getCount();
  }
}
