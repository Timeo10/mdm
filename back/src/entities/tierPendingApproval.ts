import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ImportSource {
  ETL = 'etl',
  MANUAL = 'manual',
  API = 'api',
}

@Entity('tiers_pending_approval')
@Index(['status'])
export class TiersPendingApproval {
  @PrimaryColumn({ type: 'uuid' })
  uuid!: string;

  // Source de l'import
  @Column({
    type: 'varchar',
    length: 50,
    default: ImportSource.MANUAL,
  })
  source!: string;

  // Référence externe (pour ETL)
  @Column({ name: 'external_reference', type: 'varchar', length: 255, nullable: true })
  externalReference?: string;

  // Statut d'approbation
  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: ApprovalStatus.PENDING,
  })
  status!: string;

  // Données du tiers
  @Column({ name: 'type_tiers', type: 'varchar', length: 255, nullable: true })
  typeTiers?: string;

  @Column({ name: 'siren', type: 'varchar', length: 9, nullable: true })
  siren?: string;

  @Column({ name: 'siret', type: 'varchar', length: 14, nullable: true })
  siret?: string;

  @Column({ name: 'raison_sociale', type: 'varchar', length: 255, nullable: true })
  raisonSociale?: string;

  @Column({ name: 'nom_commercial', type: 'varchar', length: 255, nullable: true })
  nomCommercial?: string;

  @Column({ name: 'forme_juridique', type: 'varchar', length: 255, nullable: true })
  formeJuridique?: string;

  @Column({ name: 'type_entreprise', type: 'varchar', length: 255, nullable: true })
  typeEntreprise?: string;

  @Column({ name: 'capital_social', type: 'varchar', length: 255, nullable: true })
  capitalSocial?: string;

  @Column({ name: 'nom_prenom', type: 'varchar', length: 255, nullable: true })
  nomPrenom?: string;

  @Column({ name: 'ville_registre', type: 'varchar', length: 255, nullable: true })
  villeRegistre?: string;

  @Column({ name: 'date_immatriculation', type: 'varchar', length: 10, nullable: true })
  dateImmatriculation?: string;

  @Column({ name: 'code_tva_intracom', type: 'varchar', length: 20, nullable: true })
  codeTvaIntracom?: string;

  @Column({ name: 'regime_tva', type: 'varchar', length: 100, nullable: true })
  regimeTva?: string;

  @Column({ name: 'pays_iso', type: 'varchar', length: 2, nullable: true })
  paysIso?: string;

  @Column({ name: 'nature_adresse', type: 'varchar', length: 255, nullable: true })
  natureAdresse?: string;

  @Column({ name: 'adresse_ligne1', type: 'varchar', length: 255, nullable: true })
  adresseLigne1?: string;

  @Column({ name: 'adresse_ligne2', type: 'varchar', length: 255, nullable: true })
  adresseLigne2?: string;

  @Column({ name: 'adresse_ligne3', type: 'varchar', length: 255, nullable: true })
  adresseLigne3?: string;

  @Column({ name: 'cedex', type: 'varchar', length: 10, nullable: true })
  cedex?: string;

  @Column({ name: 'code_postal', type: 'varchar', length: 10, nullable: true })
  codePostal?: string;

  @Column({ name: 'ville', type: 'varchar', length: 255, nullable: true })
  ville?: string;

  @Column({ name: 'region', type: 'varchar', length: 255, nullable: true })
  region?: string;

  @Column({ name: 'email_facturation', type: 'varchar', length: 255, nullable: true })
  emailFacturation?: string;

  @Column({ name: 'iban', type: 'varchar', length: 34, nullable: true })
  iban?: string;

  @Column({ name: 'bic', type: 'varchar', length: 11, nullable: true })
  bic?: string;

  @Column({ name: 'mode_paiement', type: 'varchar', length: 100, nullable: true })
  modePaiement?: string;

  @Column({ name: 'delai_paiement_jours', type: 'integer', nullable: true })
  delaiPaiementJours?: number;

  @Column({ name: 'ref_commande_obligatoire', type: 'boolean', default: false })
  refCommandeObligatoire?: boolean;

  @Column({ name: 'actif', type: 'boolean', default: true })
  actif!: boolean;

  // Workflow
  @Column({ name: 'submitted_by', type: 'varchar', length: 255, nullable: true })
  submittedBy?: string;

  @Column({ name: 'reviewed_by', type: 'varchar', length: 255, nullable: true })
  reviewedBy?: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @Column({ name: 'review_comment', type: 'text', nullable: true })
  reviewComment?: string;

  @Column({ name: 'submission_comment', type: 'text', nullable: true })
  submissionComment?: string;

  // UUID du tiers créé après approbation
  @Column({ name: 'approvedTierUuid', type: 'uuid', nullable: true })
  approvedTierUuid?: string;

  // Détection de doublons potentiels
  @Column({ name: 'potential_duplicates', type: 'jsonb', nullable: true })
  potentialDuplicates?: {
    uuid: string;
    raisonSociale?: string;
    siren?: string;
    matchScore: number;
  }[];

  @CreateDateColumn({ name: 'date_creation', type: 'timestamp' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj', type: 'timestamp' })
  dateMaj!: Date;

  
  @Column({name: 'fl_deleted', type: 'boolean', default: false })
  flDeleted!: boolean;
}
