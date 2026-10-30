import { z } from "zod";

// Validation IBAN simplifiée (peut être améliorée avec une bibliothèque dédiée)
const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;

// Validation BIC/SWIFT
const bicRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

export const CreateRibSchema = z.object({
  societeUuid: z
    .string({
      required_error: "La société est obligatoire",
      invalid_type_error: "L'UUID de la société doit être du texte",
    })
    .uuid("L'UUID de la société doit être valide"),
  typeIbanCode: z
    .string({
      required_error: "Le type d'IBAN est obligatoire",
      invalid_type_error: "Le code du type d'IBAN doit être du texte",
    })
    .min(1, "Le type d'IBAN est obligatoire")
    .max(50, "Le code du type d'IBAN ne doit pas dépasser 50 caractères"),
  iban: z
    .string({
      required_error: "L'IBAN est obligatoire",
      invalid_type_error: "L'IBAN doit être du texte",
    })
    .min(15, "L'IBAN doit contenir au moins 15 caractères")
    .max(34, "L'IBAN ne doit pas dépasser 34 caractères")
    .regex(ibanRegex, "Le format de l'IBAN est invalide")
    .transform((val) => val.replace(/\s/g, "").toUpperCase()),
  bic: z
    .string({
      invalid_type_error: "Le BIC doit être du texte",
    })
    .regex(bicRegex, "Le format du BIC est invalide")
    .transform((val) => val.toUpperCase())
    .optional()
    .nullable(),
  titulaire: z
    .string({
      required_error: "Le titulaire est obligatoire",
      invalid_type_error: "Le titulaire doit être du texte",
    })
    .min(1, "Le titulaire est obligatoire")
    .max(255, "Le titulaire ne doit pas dépasser 255 caractères"),
  banque: z
    .string({
      invalid_type_error: "La banque doit être du texte",
    })
    .max(255, "La banque ne doit pas dépasser 255 caractères")
    .optional()
    .nullable(),
  actif: z
    .boolean({
      invalid_type_error: "Le statut actif doit être vrai ou faux",
    })
    .default(true),
  ics: z.preprocess(
    (val) => (val === "" ? null : val),
    z
      .string({
        invalid_type_error: "L'ICS doit être du texte",
      })
      .max(255, "L'ICS ne doit pas dépasser 255 caractères")
      .nullable()
      .optional(),
  ),
});

export const UpdateRibSchema = CreateRibSchema.partial().omit({
  societeUuid: true,
});

export type CreateRibDto = z.infer<typeof CreateRibSchema>;
export type UpdateRibDto = z.infer<typeof UpdateRibSchema>;
