import { z } from 'zod';

// Helper pour transformer les chaînes vides en null
const emptyStringToNull = (schema: z.ZodTypeAny) =>
  z.preprocess((val) => (val === '' || val === undefined ? null : val), schema);

// Helper spécifique pour SIREN (9 chiffres) - transforme les valeurs invalides en null
const sirenSchema = z.preprocess(
  (val) => {
    if (val === '' || val === undefined || val === null) return null;
    if (typeof val === 'string' && /^\d{9}$/.test(val)) return val;
    return val; // Laisse passer pour afficher l'erreur de validation
  },
  z.string()
    .length(9, 'Le SIREN doit contenir exactement 9 chiffres')
    .regex(/^\d{9}$/, 'Le SIREN doit contenir uniquement des chiffres')
    .nullable()
    .optional()
);

// Helper spécifique pour SIRET (14 chiffres) - transforme les valeurs invalides en null
const siretSchema = z.preprocess(
  (val) => {
    if (val === '' || val === undefined || val === null) return null;
    if (typeof val === 'string' && /^\d{14}$/.test(val)) return val;
    return val; // Laisse passer pour afficher l'erreur de validation
  },
  z.string()
    .length(14, 'Le SIRET doit contenir exactement 14 chiffres')
    .regex(/^\d{14}$/, 'Le SIRET doit contenir uniquement des chiffres')
    .nullable()
    .optional()
);

export const SubmitTiersForApprovalSchema = z.object({
  source: z.enum(['etl', 'manual', 'api'], {
    invalid_type_error: 'La source doit être etl, manual ou api',
  }).optional().default('manual'),
  externalReference: z.string({
    invalid_type_error: 'La référence externe doit être du texte',
  }).nullable().optional(),
  submissionComment: z.string({
    invalid_type_error: 'Le commentaire de soumission doit être du texte',
  }).nullable().optional(),
  submittedBy: z.string({
    invalid_type_error: 'L\'auteur de la soumission doit être du texte',
  }).nullable().optional(),
  // Données du tiers
  typeTiers: z.string().nullable().optional(),
  siren: sirenSchema,
  siret: siretSchema,
  raisonSociale: z.string().nullable().optional(),
  nomCommercial: z.string().nullable().optional(),
  formeJuridique: z.string().nullable().optional(),
  typeEntreprise: z.string().nullable().optional(),
  capitalSocial: z.string().nullable().optional(),
  nomPrenom: z.string().nullable().optional(),
  villeRegistre: z.string().nullable().optional(),
  dateImmatriculation: z.string().nullable().optional(),
  codeTvaIntracom: z.string().nullable().optional(),
  regimeTva: z.string().nullable().optional(),
  paysIso: z.string()
    .length(2, 'Le code pays ISO doit contenir exactement 2 caractères')
    .nullable()
    .optional(),
  natureAdresse: z.string().nullable().optional(),
  adresseLigne1: z.string().nullable().optional(),
  adresseLigne2: z.string().nullable().optional(),
  adresseLigne3: z.string().nullable().optional(),
  cedex: z.string().nullable().optional(),
  codePostal: z.string().nullable().optional(),
  ville: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  emailFacturation: z.string()
    .email('L\'email de facturation doit être une adresse email valide')
    .nullable()
    .optional(),
  iban: z.string().nullable().optional(),
  bic: z.string().nullable().optional(),
  modePaiement: z.string().nullable().optional(),
  delaiPaiementJours: z.number()
    .int('Le délai de paiement doit être un nombre entier')
    .nullable()
    .optional(),
  refCommandeObligatoire: z.boolean().nullable().optional(),
  actif: z.boolean().default(true),
});

export const ApproveTiersSchema = z.object({
  reviewedBy: z.string({
    required_error: 'Le nom du valideur est obligatoire',
    invalid_type_error: 'Le nom du valideur doit être du texte',
  }),
  reviewComment: z.string({
    invalid_type_error: 'Le commentaire doit être du texte',
  }).nullable().optional(),
  // Données modifiées du tiers (optionnelles - si non fournies, on utilise les données originales)
  modifiedData: z.object({
    typeTiers: emptyStringToNull(z.string().nullable().optional()),
    siren: sirenSchema,
    // siret: siretSchema,
    raisonSociale: emptyStringToNull(z.string().nullable().optional()),
    nomCommercial: emptyStringToNull(z.string().nullable().optional()),
    formeJuridique: emptyStringToNull(z.string().nullable().optional()),
    typeEntreprise: emptyStringToNull(z.string().nullable().optional()),
    capitalSocial: emptyStringToNull(z.string().nullable().optional()),
    nomPrenom: emptyStringToNull(z.string().nullable().optional()),
    villeRegistre: emptyStringToNull(z.string().nullable().optional()),
    dateImmatriculation: emptyStringToNull(z.string().nullable().optional()),
    codeTvaIntracom: emptyStringToNull(z.string().nullable().optional()),
    regimeTva: emptyStringToNull(z.string().nullable().optional()),
    paysIso: emptyStringToNull(
      z.string()
        .length(2, 'Le code pays ISO doit contenir exactement 2 caractères')
        .nullable()
        .optional()
    ),
    natureAdresse: emptyStringToNull(z.string().nullable().optional()),
    adresseLigne1: emptyStringToNull(z.string().nullable().optional()),
    adresseLigne2: emptyStringToNull(z.string().nullable().optional()),
    adresseLigne3: emptyStringToNull(z.string().nullable().optional()),
    cedex: emptyStringToNull(z.string().nullable().optional()),
    codePostal: emptyStringToNull(z.string().nullable().optional()),
    ville: emptyStringToNull(z.string().nullable().optional()),
    region: emptyStringToNull(z.string().nullable().optional()),
    emailFacturation: emptyStringToNull(
      z.string()
        .email('L\'email de facturation doit être une adresse email valide')
        .nullable()
        .optional()
    ),
    iban: emptyStringToNull(z.string().nullable().optional()),
    bic: emptyStringToNull(z.string().nullable().optional()),
    modePaiement: emptyStringToNull(z.string().nullable().optional()),
    delaiPaiementJours: z.preprocess(
      (val) => (val === '' || val === undefined || val === null ? null : val),
      z.number().int('Le délai de paiement doit être un nombre entier').nullable().optional()
    ),
    refCommandeObligatoire: z.boolean().nullable().optional(),
    actif: z.boolean().nullable().optional(),
  }).nullable().optional(),
  // Attributs personnalisés globaux
  globalAttributes: z.record(z.string().nullable()).nullable().optional(),
});

export const RejectTiersSchema = z.object({
  reviewedBy: z.string({
    required_error: 'Le nom du valideur est obligatoire',
    invalid_type_error: 'Le nom du valideur doit être du texte',
  }),
  reviewComment: z.string({
    required_error: 'Un commentaire de rejet est obligatoire',
    invalid_type_error: 'Le commentaire doit être du texte',
  }).min(10, 'Le commentaire de rejet doit contenir au moins 10 caractères'),
});

export const BulkSubmitTiersSchema = z.object({
  tiers: z.array(SubmitTiersForApprovalSchema),
  source: z.enum(['etl', 'api'], {
    required_error: 'La source est obligatoire pour un import en masse',
  }),
  submittedBy: z.string({
    invalid_type_error: 'L\'auteur de la soumission doit être du texte',
  }).nullable().optional(),
});

export type SubmitTiersForApprovalDto = z.infer<typeof SubmitTiersForApprovalSchema>;
export type ApproveTiersDto = z.infer<typeof ApproveTiersSchema>;
export type RejectTiersDto = z.infer<typeof RejectTiersSchema>;
export type BulkSubmitTiersDto = z.infer<typeof BulkSubmitTiersSchema>;
