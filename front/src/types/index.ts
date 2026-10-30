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

export interface TiersAuditLog {
  uuid: string;
  tiersUuid: string;
  action: TiersAuditAction;
  entityType?: string;
  entityUuid?: string;
  userEmail?: string;
  userName?: string;
  changes?: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  description?: string;
  ipAddress?: string;
  dateAction: string;
}

export interface TiersAuditHistoryResponse {
  logs: TiersAuditLog[];
  total: number;
}

export interface Societe {
  uuid: string;
  code: string;
  raisonSociale: string;
  description?: string;
  actif: boolean;
  siren?: string;
  siret?: string;
  formeJuridique?: string;
  lblCapitalSocial?: string;
  adresseRue?: string;
  adresseComplement?: string;
  codePostal?: string;
  ville?: string;
  pays?: string;
  regimeTva?: string;
  identifiantTva?: string;
  emailContact?: string;
  dossierSftpPa?: string;
  formatExportPa?: 'ZIP' | 'XML';
  dateCreation: string;
  dateMaj: string;
}

export interface CreateSocieteDto {
  code: string;
  raisonSociale: string;
  description?: string;
  actif?: boolean;
  siren?: string | null;
  siret?: string | null;
  formeJuridique?: string | null;
  lblCapitalSocial?: string | null;
  adresseRue?: string | null;
  adresseComplement?: string | null;
  codePostal?: string | null;
  ville?: string | null;
  pays?: string | null;
  regimeTva?: string | null;
  identifiantTva?: string | null;
  emailContact?: string | null;
  dossierSftpPa?: string | null;
  formatExportPa?: 'ZIP' | 'XML' | null;
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

export interface CreateCustomAttributeDto {
  code: string;
  libelle: string;
  description?: string | null;
  typeChamp: TypeChamp;
  portee: PorteeChamp;
  societeUuids?: string[];
  obligatoire?: boolean;
  ordreAffichage?: number;
  optionsListe?: string[] | null;
  valeurParDefaut?: string | null;
  actif?: boolean;
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
  fraisGeneraux: boolean;
  fraisMetier: boolean;
  codeAdressagePa?: string;
  codeRoutageAdvEntrant?: string;
  actif: boolean;
  customAttributes?: Record<string, string | null>;
}

export interface TiersContact {
  uuid: string;
  tiersUuid: string;
  nom: string;
  prenom?: string;
  titre?: string;
  telephoneFixe?: string;
  portable?: string;
  email?: string;
  actif: boolean;
  societes?: Societe[];
  dateCreation?: string;
  dateMaj?: string;
}

export interface CreateTiersContactDto {
  nom: string;
  prenom?: string | null;
  titre?: string | null;
  telephoneFixe?: string | null;
  portable?: string | null;
  email?: string | null;
  societeUuids?: string[] | null;
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

export interface SubmitTiersForApprovalDto extends Partial<Tiers> {
  source?: 'etl' | 'manual' | 'api';
  externalReference?: string | null;
  submissionComment?: string | null;
  submittedBy?: string | null;
}

export interface ApproveTiersDto {
  reviewedBy: string;
  reviewComment?: string | null;
  modifiedData?: Partial<Tiers> | null;
  globalAttributes?: Record<string, string | null> | null;
}

export interface RejectTiersDto {
  reviewedBy: string;
  reviewComment: string;
}

export interface CreateTiersDto extends Partial<Tiers> {
  typeTiers?: string;
  siren?: string;
  siret?: string;
  raisonSociale?: string;
}

export interface AttachTiersToSocieteDto {
  tiersUuid: string;
  societeUuid: string;
  codeTiersErp?: string;
  fraisGeneraux?: boolean;
  fraisMetier?: boolean;
  codeAdressagePa?: string;
  codeRoutageAdvEntrant?: string;
  actif?: boolean;
  customAttributes?: Record<string, string | null>;
}

export interface ValueListItem {
  uuid?: string;
  code: string;
  libelle: string;
  ordre: number;
  actif: boolean;
}

export interface ValueList {
  uuid: string;
  code: string;
  libelle: string;
  description?: string;
  actif: boolean;
  dateCreation: string;
  dateMaj: string;
  items?: ValueListItem[];
}

export interface CreateValueListDto {
  code: string;
  libelle: string;
  description?: string;
  actif?: boolean;
  items?: ValueListItem[];
}

export interface Rib {
  uuid: string;
  societeUuid: string;
  typeIbanCode: string;
  iban: string;
  bic?: string;
  titulaire: string;
  banque?: string;
  ics?: string;
  actif: boolean;
  dateCreation: string;
  dateMaj: string;
  societe?: Societe;
}

export interface CreateRibDto {
  societeUuid: string;
  typeIbanCode: string;
  iban: string;
  bic?: string | null;
  titulaire: string;
  banque?: string | null;
  ics?: string | null;
  actif?: boolean;
}

export interface UpdateRibDto {
  typeIbanCode?: string;
  iban?: string;
  bic?: string | null;
  titulaire?: string;
  banque?: string | null;
   ics?: string | null;
  actif?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
