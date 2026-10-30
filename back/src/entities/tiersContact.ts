import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Tiers } from './tiers';
import { Societe } from './societe';

@Entity('tiers_contact')
@Index(['tiersUuid'])
@Index(['flDeleted'])
export class TiersContact {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column({ name: 'tiers_uuid', type: 'uuid' })
  tiersUuid!: string;

  @Column({ name: 'nom', type: 'varchar', length: 255 })
  nom!: string;

  @Column({ name: 'prenom', type: 'varchar', length: 255, nullable: true })
  prenom?: string;

  @Column({ name: 'titre', type: 'varchar', length: 255, nullable: true })
  titre?: string;

  @Column({ name: 'telephone_fixe', type: 'varchar', length: 30, nullable: true })
  telephoneFixe?: string;

  @Column({ name: 'portable', type: 'varchar', length: 30, nullable: true })
  portable?: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ name: 'actif', type: 'boolean', default: true })
  actif!: boolean;

  @Column({ name: 'fl_deleted', type: 'boolean', default: false })
  flDeleted!: boolean;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj' })
  dateMaj!: Date;

  @ManyToOne(() => Tiers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tiers_uuid' })
  tiers?: Tiers;

  @ManyToMany(() => Societe)
  @JoinTable({
    name: 'tiers_contact_societe',
    joinColumn: { name: 'contact_uuid', referencedColumnName: 'uuid' },
    inverseJoinColumn: { name: 'societe_uuid', referencedColumnName: 'uuid' },
  })
  societes?: Societe[];
}
