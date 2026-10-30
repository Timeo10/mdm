import {
  Entity,
  PrimaryColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tiers')
@Index(['siren'])
@Index(['siret'])
@Index(['raisonSociale'])
export class Tiers {
  @PrimaryColumn('char', { length: 36 })
  uuid!: string;

  @Column({ name: 'type_tiers', type: 'varchar', length: 255, nullable: true })
  typeTiers?: string;

  @Index({ unique: true })
  @Column({ name: 'code_tiers_mdm', type: 'varchar', length: 50, nullable: true })
  codeTiersMdm?: string;

  @Column({ name: 'actif', type: 'boolean', nullable: true })
  actif?: boolean;

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

  @Column({ name: 'code_tva_intracom', type: 'varchar', length: 50, nullable: true })
  codeTvaIntracom?: string;

  @Column({ name: 'regime_tva', type: 'varchar', length: 255, nullable: true })
  regimeTva?: string;

  @Column({ name: 'pays_iso', type: 'char', length: 2, nullable: true })
  paysIso?: string;

  @Column({ name: 'preuve_statut_tva', type: 'varchar', length: 255, nullable: true })
  preuveStatutTva?: string;

  @Column({ name: 'est_groupement', type: 'boolean', nullable: true })
  estGroupement?: boolean;

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

  @Column({ name: 'geocodage', type: 'text', nullable: true })
  geocodage?: string;

  @Column({ name: 'langue_facture', type: 'varchar', length: 10, nullable: true })
  langueFacture?: string;

  @Column({ name: 'devise_facture', type: 'varchar', length: 10, nullable: true })
  deviseFacture?: string;

  @Column({ name: 'format_facture', type: 'varchar', length: 50, nullable: true })
  formatFacture?: string;


  @Column({ name: 'source_validation_e_facturation', type: 'varchar', length: 255, nullable: true })
  sourceValidationEFacturation?: string;

  @Column({ name: 'email_facturation', type: 'varchar', length: 255, nullable: true })
  emailFacturation?: string;

  @Column({ name: 'nom_contact_vendeur', type: 'varchar', length: 255, nullable: true })
  nomContactVendeur?: string;

  @Column({ name: 'prenom_contact_vendeur', type: 'varchar', length: 255, nullable: true })
  prenomContactVendeur?: string;

  @Column({ name: 'fonction_contact_vendeur', type: 'varchar', length: 255, nullable: true })
  fonctionContactVendeur?: string;

  @Column({ name: 'email_contact_vendeur', type: 'varchar', length: 255, nullable: true })
  emailContactVendeur?: string;

  @Column({ name: 'telephone_contact_vendeur', type: 'varchar', length: 30, nullable: true })
  telephoneContactVendeur?: string;


  @Column({ name: 'iban', type: 'varchar', length: 34, nullable: true })
  iban?: string;

  @Column({ name: 'bic', type: 'varchar', length: 11, nullable: true })
  bic?: string;

  @Column({ name: 'mode_paiement', type: 'varchar', length: 50, nullable: true })
  modePaiement?: string;

  @Column({ name: 'delai_paiement_jours', type: 'int', nullable: true })
  delaiPaiementJours?: number;

  @Column({ name: 'ref_commande_obligatoire', type: 'boolean', nullable: true })
  refCommandeObligatoire?: boolean;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj' })
  dateMaj!: Date;

  @Column({ name: 'fl_deleted', type: 'boolean', nullable: true, default: false })
  flDeleted?: boolean;
}
