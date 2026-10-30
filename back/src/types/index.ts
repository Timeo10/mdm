export enum TypeChamp {
  TEXTE = 'texte',
  NOMBRE = 'nombre',
  DATE = 'date',
  BOOLEEN = 'booleen',
  LISTE = 'liste',
  EMAIL = 'email',
  TELEPHONE = 'telephone',
  URL = 'url',
}

export enum PorteeChamp {
  GLOBAL = 'global',
  SOCIETE = 'societe',
}

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

export interface Societe {
  uuid: string;
  code: string;
  nom: string;
  description?: string;
  actif: boolean;
  siren?: string;
  siret?: string;
  dateCreation: string;
  dateMaj: string;
}

export interface CustomAttribute {
  uuid: string;
  code: string;
  libelle: string;
  description?: string;
  typeChamp: TypeChamp;
  portee: PorteeChamp;
  obligatoire: boolean;
  ordreAffichage: number;
  optionsListe?: string[];
  valeurParDefaut?: string;
  actif: boolean;
  dateCreation: string;
  dateMaj: string;
  societes?: Societe[];
}

export interface Tiers {
  uuid: string;
  typeTiers?: string;
  codeTiersMdm?: string;
  siren?: string;
  siret?: string;
  raisonSociale?: string;
  nomCommercial?: string;
  formeJuridique?: string;
  typeEntreprise?: string;
  capitalSocial?: string;
  nomPrenom?: string;
  villeRegistre?: string;
  dateImmatriculation?: string;
  codeTvaIntracom?: string;
  regimeTva?: string;
  paysIso?: string;
  natureAdresse?: string;
  adresseLigne1?: string;
  adresseLigne2?: string;
  adresseLigne3?: string;
  cedex?: string;
  codePostal?: string;
  ville?: string;
  region?: string;
  emailFacturation?: string;
  iban?: string;
  bic?: string;
  modePaiement?: string;
  delaiPaiementJours?: number;
  refCommandeObligatoire?: boolean;
  actif?: boolean;
  dateCreation?: string;
  dateMaj?: string;
}

export interface TiersSociete {
  uuid: string;
  societe?: Societe;
  codeTiersErp?: string;
  actif: boolean;
  customAttributes?: Record<string, string | null>;
}

export interface TiersWithSocietes extends Tiers {
  societes: TiersSociete[];
  globalAttributes?: Record<string, string | null>;
}

export interface TierPendingApproval extends Partial<Tiers> {
  uuid: string;
  source: ImportSource;
  externalReference?: string;
  status: ApprovalStatus;
  submittedBy?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
  submissionComment?: string;
  approvedTiersUuid?: string;
  potentialDuplicates?: Array<{
    uuid: string;
    raisonSociale?: string;
    siren?: string;
    matchScore: number;
  }>;
  dateCreation: string;
  dateMaj: string;
}

export interface ApprovalStatistics {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface TiersRole {
  uuid: string;
  code: string;
  libelle: string;
  description?: string;
  couleur?: string;
  actif: boolean;
  dateCreation: string;
  dateMaj: string;
}

export interface TiersSocieteRole {
  uuid: string;
  tiersUuid: string;
  societeUuid: string;
  roleUuid: string;
  commentaire?: string;
  dateCreation: string;
  dateMaj: string;
}
