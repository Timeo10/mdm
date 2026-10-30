import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Tiers } from './tiers';
import { Societe } from './societe';
import { CustomAttributeValue } from './customAttributeValue';

@Entity('tiers_societe')
@Index(['tiersUuid'])
@Index(['societeUuid'])
@Index(['tiersUuid', 'societeUuid'])
@Index(['flDeleted'])
export class TiersSociete {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column({ name: 'tiers_uuid', type: 'uuid' })
  tiersUuid!: string;

  @Column({ name: 'societe_uuid', type: 'uuid' })
  societeUuid!: string;

  @Column({ name: 'code_tiers_erp', type: 'varchar', length: 255, nullable: true })
  codeTiersErp?: string;

  @Column({ name: 'frais_generaux', type: 'boolean', default: false })
  fraisGeneraux!: boolean;

  @Column({ name: 'frais_metier', type: 'boolean', default: false })
  fraisMetier!: boolean;

  @Column({ name: 'code_adressage_pa', type: 'varchar', length: 255, nullable: true })
  codeAdressagePa?: string;

  @Column({ name: 'code_routage_adv_entrant', type: 'varchar', length: 50, nullable: true })
  codeRoutageAdvEntrant?: string;

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

  @ManyToOne(() => Societe, (societe) => societe.tiersSocietes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'societe_uuid' })
  societe?: Societe;

  @OneToMany(() => CustomAttributeValue, (valeur) => valeur.tiersSociete)
  attributeValues?: CustomAttributeValue[];
}
