import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum TiersAuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ATTACH_SOCIETE = 'ATTACH_SOCIETE',
  DETACH_SOCIETE = 'DETACH_SOCIETE',
  UPDATE_TIERS_SOCIETE = 'UPDATE_TIERS_SOCIETE',
  UPDATE_CUSTOM_ATTRIBUTE = 'UPDATE_CUSTOM_ATTRIBUTE',
  UPDATE_GLOBAL_ATTRIBUTE = 'UPDATE_GLOBAL_ATTRIBUTE',
  ASSIGN_ROLE = 'ASSIGN_ROLE',
  REMOVE_ROLE = 'REMOVE_ROLE',
  CREATE_CONTACT = 'CREATE_CONTACT',
  UPDATE_CONTACT = 'UPDATE_CONTACT',
  DELETE_CONTACT = 'DELETE_CONTACT',
}

/**
 * Entité de traçabilité des actions sur les tiers
 * Conforme RGPD avec pseudonymisation et gestion de la rétention
 */
@Entity('tiers_audit_log')
@Index(['tiersUuid'])
@Index(['action'])
@Index(['dateAction'])
@Index(['retentionUntil'])
@Index(['isAnonymized', 'anonymizedAt'])
export class TiersAuditLog {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column({ name: 'tiers_uuid', type: 'uuid' })
  tiersUuid!: string;

  @Column({
    name: 'action',
    type: 'varchar',
    length: 50,
    enum: TiersAuditAction,
  })
  action!: TiersAuditAction;

  @Column({ name: 'entity_type', type: 'varchar', length: 50, nullable: true })
  entityType?: string;

  @Column({ name: 'entity_uuid', type: 'uuid', nullable: true })
  entityUuid?: string;

  // Données utilisateur pseudonymisées (RGPD)
  @Column({ name: 'user_id', type: 'varchar', length: 255, nullable: true })
  userId?: string; // ID pseudonymisé

  @Column({ name: 'user_email_hash', type: 'varchar', length: 64, nullable: true })
  userEmailHash?: string; // Hash SHA-256 de l'email

  @Column({ name: 'user_role', type: 'varchar', length: 100, nullable: true })
  userRole?: string; // Rôle de l'utilisateur

  // Données utilisateur non-pseudonymisées (pour usage professionnel interne)
  @Column({ name: 'user_name', type: 'varchar', length: 255, nullable: true })
  userName?: string; // Nom complet de l'utilisateur

  @Column({ name: 'user_email', type: 'varchar', length: 255, nullable: true })
  userEmail?: string; // Email de l'utilisateur

  // Données techniques minimisées (RGPD)
  @Column({ name: 'ip_address_anonymized', type: 'varchar', length: 45, nullable: true })
  ipAddressAnonymized?: string; // IP anonymisée

  // Données d'audit (filtrées des informations sensibles)
  @Column({ name: 'changes', type: 'jsonb', nullable: true })
  changes?: Record<string, any>;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues?: Record<string, any>;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues?: Record<string, any>;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  // Métadonnées de conformité RGPD
  @CreateDateColumn({ name: 'date_action' })
  dateAction!: Date;

  @Column({ name: 'retention_until', type: 'timestamp', nullable: true })
  retentionUntil?: Date; // Date d'expiration pour suppression automatique

  @Column({ name: 'is_anonymized', type: 'boolean', default: false })
  isAnonymized!: boolean; // Indique si les données ont été anonymisées

  @Column({ name: 'anonymized_at', type: 'timestamp', nullable: true })
  anonymizedAt?: Date; // Date d'anonymisation
}
