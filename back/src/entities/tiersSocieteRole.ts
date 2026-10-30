import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tiers } from './tiers';
import { Societe } from './societe';
import { TiersRole } from './tiersRole';

@Entity('tiers_societe_role')
@Index('idx_tiers_societe_role_unique', ['tiersUuid', 'societeUuid', 'roleUuid'], { unique: true, where: 'fl_deleted = false' })
export class TiersSocieteRole {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  // Référence au tiers
  @Column({ name: 'tiers_uuid', type: 'uuid' })
  tiersUuid!: string;

  @ManyToOne(() => Tiers)
  @JoinColumn({ name: 'tiers_uuid' })
  tiers?: Tiers;

  // Référence à la société
  @Column({ name: 'societe_uuid', type: 'uuid' })
  societeUuid!: string;

  @ManyToOne(() => Societe)
  @JoinColumn({ name: 'societe_uuid' })
  societe?: Societe;

  // Référence au rôle
  @Column({ name: 'role_uuid', type: 'uuid' })
  roleUuid!: string;

  @ManyToOne(() => TiersRole)
  @JoinColumn({ name: 'role_uuid' })
  role?: TiersRole;

  // Commentaire optionnel
  @Column({ name: 'commentaire', type: 'text', nullable: true })
  commentaire?: string;

  // Code de routage ADV entrant
  // @Column({ name: 'code_routage_adv_entrant', type: 'varchar', length: 50, nullable: true })
  // codeRoutageAdvEntrant?: string;

  @CreateDateColumn({ name: 'date_creation', type: 'timestamp' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj', type: 'timestamp' })
  dateMaj!: Date;

  @Column({ name: 'fl_deleted', type: 'boolean', default: false })
  flDeleted!: boolean;
}
