import { z } from "zod";

export const CreateSocieteSchema = z.object({
  code: z
    .string({
      required_error: "Le code est obligatoire",
      invalid_type_error: "Le code doit être du texte",
    })
    .min(1, "Le code est obligatoire")
    .max(50, "Le code ne doit pas dépasser 50 caractères"),
  raisonSociale: z
    .string({
      required_error: "La raison sociale est obligatoire",
      invalid_type_error: "La raison sociale doit être du texte",
    })
    .min(1, "La raison sociale est obligatoire")
    .max(255, "La raison sociale ne doit pas dépasser 255 caractères"),
  description: z
    .string({
      invalid_type_error: "La description doit être du texte",
    })
    .nullable()
    .optional(),
  actif: z
    .boolean({
      invalid_type_error: "Le statut actif doit être vrai ou faux",
    })
    .default(true),
  siren: z
    .string({
      invalid_type_error: "Le SIREN doit être du texte",
    })
    .length(9, "Le SIREN doit contenir exactement 0 chiffres")
    .regex(/^\d{9}$/, "Le SIREN doit contenir uniquement des chiffres")
    .optional()
    .nullable(),
  siret: z
    .string({
      invalid_type_error: "Le SIRET doit être du texte",
    })
    .length(14, "Le SIRET doit contenir exactement 14 chiffres")
    .regex(/^\d{14}$/, "Le SIRET doit contenir uniquement des chiffres")
    .optional()
    .nullable(),
  formeJuridique: z
    .string({
      invalid_type_error: "La forme juridique doit être du texte",
    })
    .max(50, "La forme juridique ne doit pas dépasser 50 caractères")
    .optional()
    .nullable(),
  lblCapitalSocial: z
    .string({
      invalid_type_error: "Le capital social doit être du texte",
    })
    .max(250, "Le capital social ne doit pas dépasser 250 caractères")
    .optional()
    .nullable(),
  // Adresse
  adresseRue: z
    .string({
      invalid_type_error: "L'adresse doit être du texte",
    })
    .max(255, "L'adresse ne doit pas dépasser 255 caractères")
    .optional()
    .nullable(),
  adresseComplement: z
    .string({
      invalid_type_error: "Le complément d'adresse doit être du texte",
    })
    .max(255, "Le complément d'adresse ne doit pas dépasser 255 caractères")
    .optional()
    .nullable(),
  codePostal: z
    .string({
      invalid_type_error: "Le code postal doit être du texte",
    })
    .max(10, "Le code postal ne doit pas dépasser 10 caractères")
    .optional()
    .nullable(),
  ville: z
    .string({
      invalid_type_error: "La ville doit être du texte",
    })
    .max(255, "La ville ne doit pas dépasser 255 caractères")
    .optional()
    .nullable(),
  pays: z
    .string({
      invalid_type_error: "Le pays doit être du texte",
    })
    .max(100, "Le pays ne doit pas dépasser 100 caractères")
    .optional()
    .nullable(),
  // TVA
  regimeTva: z
    .string({
      invalid_type_error: "Le régime TVA doit être du texte",
    })
    .max(50, "Le régime TVA ne doit pas dépasser 50 caractères")
    .optional()
    .nullable(),
  identifiantTva: z
    .string({
      invalid_type_error: "L'identifiant TVA doit être du texte",
    })
    .max(20, "L'identifiant TVA ne doit pas dépasser 20 caractères")
    .optional()
    .nullable(),
  // Contact
  emailContact: z.preprocess(
    (val) => (val === "" ? null : val),
    z
      .string({
        invalid_type_error: "L'email de contact doit être du texte",
      })
      .email("L'email de contact n'est pas valide")
      .max(255, "L'email de contact ne doit pas dépasser 255 caractères")
      .nullable()
      .optional(),
  ),
  dossierSftpPa: z.preprocess(
    (val) => (val === "" ? null : val),
    z
      .string({
        invalid_type_error: "Le dossier SFTP PA doit être du texte",
      })
      .max(255, "Le dossier SFTP PA ne doit pas dépasser 255 caractères")
      .nullable()
      .optional(),
  ),

  formatExportPa: z.preprocess(
    (val) => (val === "" ? null : val),
    z
      .enum(["ZIP", "XML"], {
        invalid_type_error: "Le format export PA doit être ZIP ou XML",
      })
      .nullable()
      .optional(),
  ),
});

export const UpdateSocieteSchema = CreateSocieteSchema.partial();

export type CreateSocieteDto = z.infer<typeof CreateSocieteSchema>;
export type UpdateSocieteDto = z.infer<typeof UpdateSocieteSchema>;
