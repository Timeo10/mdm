import { z } from 'zod';

const normalizeRequiredText = (value: unknown) =>
  typeof value === 'string' ? value.trim() : value;

const validateTiersCountryRules = (data: {
  paysIso?: string | null | undefined;
  siret?: string | null | undefined;
  codeTvaIntracom?: string | null | undefined;
}, ctx: z.RefinementCtx) => {
  const paysIso = normalizeRequiredText(data.paysIso) as string | undefined | null;
  const siret = normalizeRequiredText(data.siret) as string | undefined | null;
  const codeTvaIntracom = normalizeRequiredText(data.codeTvaIntracom) as string | undefined | null;

  if (!paysIso) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['paysIso'],
      message: 'Le code pays est obligatoire',
    });
    return;
  }

  if (paysIso.toUpperCase() === 'FR') {
    if (!siret) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['siret'],
        message: 'Le SIRET est obligatoire pour un tiers en France',
      });
    }
  } else if (!codeTvaIntracom) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['codeTvaIntracom'],
      message: 'Le code TVA intracommunautaire est obligatoire hors France',
    });
  }
};

const TiersBaseSchema = z.object({
  typeTiers: z.string().optional().nullable(),
  siren: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string()
      .length(9, 'Le SIREN doit contenir exactement 9 chiffres')
      .regex(/^\d{9}$/, 'Le SIREN doit contenir uniquement des chiffres')
      .optional().nullable()
  ),
  siret: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string()
      .length(14, 'Le SIRET doit contenir exactement 14 chiffres')
      .regex(/^\d{14}$/, 'Le SIRET doit contenir uniquement des chiffres')
      .optional().nullable()
  ),
  raisonSociale: z.string().optional().nullable(),
  nomCommercial: z.string().optional().nullable(),
  formeJuridique: z.string().optional().nullable(),
  typeEntreprise: z.string().optional().nullable(),
  capitalSocial: z.string().optional().nullable(),
  nomPrenom: z.string().optional().nullable(),
  villeRegistre: z.string().optional().nullable(),
  dateImmatriculation: z.string().optional().nullable(),
  codeTvaIntracom: z.string().optional().nullable(),
  regimeTva: z.string().optional().nullable(),
  paysIso: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string()
      .length(2, 'Le code pays ISO doit contenir exactement 2 caractères')
      .optional().nullable()
  ),
  natureAdresse: z.string().optional().nullable(),
  adresseLigne1: z.string().optional().nullable(),
  adresseLigne2: z.string().optional().nullable(),
  adresseLigne3: z.string().optional().nullable(),
  cedex: z.string().optional().nullable(),
  codePostal: z.string().optional().nullable(),
  ville: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  emailFacturation: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string()
      .email('L\'email de facturation doit être une adresse email valide')
      .optional().nullable()
  ),
  iban: z.string().optional().nullable(),
  bic: z.string().optional().nullable(),
  modePaiement: z.string().optional().nullable(),
  delaiPaiementJours: z.number().int('Le délai de paiement doit être un nombre entier').optional().nullable(),
  refCommandeObligatoire: z.boolean().optional().nullable(),
  actif: z.boolean().default(true),
  globalAttributes: z
    .record(z.string(), z.string().nullable())
    .optional().nullable(),
});

export const CreateTiersSchema = TiersBaseSchema.superRefine(validateTiersCountryRules);

export const UpdateTiersSchema = TiersBaseSchema.partial();

export const AttachTiersToSocieteSchema = z.object({
  tiersUuid: z.string({
    required_error: 'L\'UUID du tiers est obligatoire',
    invalid_type_error: 'L\'UUID du tiers doit être du texte',
  })
    .uuid('L\'UUID du tiers doit être un UUID valide'),
  societeUuid: z.string({
    required_error: 'L\'UUID de la société est obligatoire',
    invalid_type_error: 'L\'UUID de la société doit être du texte',
  })
    .uuid('L\'UUID de la société doit être un UUID valide'),
  codeTiersErp: z.string({
    invalid_type_error: 'Le code tiers ERP doit être du texte',
  }).optional().nullable(),
  fraisGeneraux: z.boolean({
    invalid_type_error: 'Le champ frais généraux doit être vrai ou faux',
  }).default(false),
  fraisMetier: z.boolean({
    invalid_type_error: 'Le champ frais métier doit être vrai ou faux',
  }).default(false),
  codeAdressagePa: z.string({
    invalid_type_error: 'Le code d\'adressage PA doit être du texte',
  }).optional().nullable(),
  codeRoutageAdvEntrant: z.string({
    invalid_type_error: 'Le code de routage ADV entrant doit être du texte',
  })
    .max(50, 'Le code de routage ADV entrant ne doit pas dépasser 50 caractères')
    .optional().nullable(),
  actif: z.boolean({
    invalid_type_error: 'Le statut actif doit être vrai ou faux',
  }).default(true),
  customAttributes: z
    .record(z.string(), z.string().nullable())
    .optional().nullable(),
});

export type CreateTiersDto = z.infer<typeof CreateTiersSchema>;
export type UpdateTiersDto = z.infer<typeof UpdateTiersSchema>;
export type AttachTiersToSocieteDto = z.infer<typeof AttachTiersToSocieteSchema>;
