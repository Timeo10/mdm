import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TiersSociete } from './tiersSociete';
import { Rib } from './rib';

@Entity('societe')
export class Societe {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column({ name: 'code', type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({ name: 'raison_sociale', type: 'varchar', length: 255 })
  raisonSociale!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'actif', type: 'boolean', default: true })
  actif!: boolean;

  @Column({ name: 'siren', type: 'varchar', length: 9, nullable: true })
  siren?: string;

  @Column({ name: 'siret', type: 'varchar', length: 14, nullable: true })
  siret?: string;

  @Column({ name: 'forme_juridique', type: 'varchar', length: 50, nullable: true })
  formeJuridique?: string;

  @Column({ name: 'lbl_capital_social', type: 'varchar', length: 250, nullable: true })
  lblCapitalSocial?: string;

  // Adresse
  @Column({ name: 'adresse_rue', type: 'varchar', length: 255, nullable: true })
  adresseRue?: string;

  @Column({ name: 'adresse_complement', type: 'varchar', length: 255, nullable: true })
  adresseComplement?: string;

  @Column({ name: 'code_postal', type: 'varchar', length: 10, nullable: true })
  codePostal?: string;

  @Column({ name: 'ville', type: 'varchar', length: 255, nullable: true })
  ville?: string;

  @Column({ name: 'pays', type: 'varchar', length: 100, nullable: true })
  pays?: string;

  // TVA
  @Column({ name: 'regime_tva', type: 'varchar', length: 50, nullable: true })
  regimeTva?: string;

  @Column({ name: 'identifiant_tva', type: 'varchar', length: 20, nullable: true })
  identifiantTva?: string;

  // Contact
  @Column({ name: 'email_contact', type: 'varchar', length: 255, nullable: true })
  emailContact?: string;

  @Column({ name: 'fl_deleted', type: 'boolean', default: false })
  flDeleted!: boolean;

  @Column({ name: 'dossier_sftp_pa', type: 'varchar', length: 255, nullable: true })
  dossierSftpPa?: string;

  @Column({ name: 'format_export_pa', type: 'varchar', length: 10, nullable: true })
  formatExportPa?: 'ZIP' | 'XML';


  @CreateDateColumn({ name: 'date_creation' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj' })
  dateMaj!: Date;

  @OneToMany(() => TiersSociete, (tiersSociete) => tiersSociete.societe)
  tiersSocietes?: TiersSociete[];

  @OneToMany(() => Rib, (rib) => rib.societe)
  ribs?: Rib[];
}
