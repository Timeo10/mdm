import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('tiers_role')
@Index('idx_tiers_role_code', ['code'])
@Index('idx_tiers_role_actif', ['actif'], { where: 'fl_deleted = false' })
@Index('idx_tiers_role_ordre', ['ordreAffichage'], { where: 'fl_deleted = false' })
export class TiersRole {
  @PrimaryColumn({ type: 'uuid' })
  uuid!: string;

  // Code unique du rôle (ex: CLIENT, FOURNISSEUR, PROSPECT, etc.)
  @Column({ name: 'code', type: 'varchar', length: 50, unique: true })
  code!: string;

  // Libellé du rôle
  @Column({ name: 'libelle', type: 'varchar', length: 255 })
  libelle!: string;

  // Description optionnelle
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  // Couleur pour l'affichage (format hexadécimal)
  @Column({ name: 'couleur', type: 'varchar', length: 7, nullable: true })
  couleur?: string;

  // Ordre d'affichage
  @Column({ name: 'ordre_affichage', type: 'integer', default: 0 })
  ordreAffichage!: number;

  // Actif/inactif
  @Column({ name: 'actif', type: 'boolean', default: true })
  actif!: boolean;

  @CreateDateColumn({ name: 'date_creation', type: 'timestamp' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj', type: 'timestamp' })
  dateMaj!: Date;

  @Column({ name: 'fl_deleted', type: 'boolean', default: false })
  flDeleted!: boolean;
}
