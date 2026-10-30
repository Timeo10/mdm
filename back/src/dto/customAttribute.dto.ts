import { z } from 'zod';
import { TypeChamp, PorteeChamp } from '../types';

export const CreateCustomAttributeSchema = z.object({
  code: z.string({
    required_error: 'Le code est obligatoire',
    invalid_type_error: 'Le code doit être du texte',
  })
    .min(1, 'Le code est obligatoire')
    .max(100, 'Le code ne doit pas dépasser 100 caractères'),
  libelle: z.string({
    required_error: 'Le libellé est obligatoire',
    invalid_type_error: 'Le libellé doit être du texte',
  })
    .min(1, 'Le libellé est obligatoire')
    .max(255, 'Le libellé ne doit pas dépasser 255 caractères'),
  description: z.string({
    invalid_type_error: 'La description doit être du texte',
  }).nullable().optional(),
  typeChamp: z.nativeEnum(TypeChamp, {
    required_error: 'Le type de champ est obligatoire',
    invalid_type_error: 'Le type de champ sélectionné n\'est pas valide',
  }),
  portee: z.nativeEnum(PorteeChamp, {
    required_error: 'La portée est obligatoire',
    invalid_type_error: 'La portée sélectionnée n\'est pas valide',
  }),
  societeUuids: z.array(
    z.string({
      invalid_type_error: 'Les UUIDs de société doivent être du texte',
    }).uuid('Chaque UUID de société doit être un UUID valide')
  ).optional(),
  obligatoire: z.boolean({
    invalid_type_error: 'Le champ obligatoire doit être vrai ou faux',
  }).default(false),
  ordreAffichage: z.number({
    invalid_type_error: 'L\'ordre d\'affichage doit être un nombre',
  })
    .int('L\'ordre d\'affichage doit être un nombre entier')
    .default(0),
  optionsListe: z.array(
    z.string({
      invalid_type_error: 'Les options de liste doivent être du texte',
    })
  ).nullable().optional(),
  valeurParDefaut: z.string({
    invalid_type_error: 'La valeur par défaut doit être du texte',
  }).nullable().optional(),
  actif: z.boolean({
    invalid_type_error: 'Le statut actif doit être vrai ou faux',
  }).default(true),
});

export const UpdateCustomAttributeSchema = CreateCustomAttributeSchema.partial();

export type CreateCustomAttributeDto = z.infer<typeof CreateCustomAttributeSchema>;
export type UpdateCustomAttributeDto = z.infer<typeof UpdateCustomAttributeSchema>;
