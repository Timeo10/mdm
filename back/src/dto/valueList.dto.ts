import { z } from 'zod';

export const ValueListItemSchema = z.object({
  uuid: z.string().uuid().optional(),
  code: z.string({
    required_error: 'Le code est obligatoire',
    invalid_type_error: 'Le code doit être du texte',
  })
    .min(1, 'Le code est obligatoire')
    .max(50, 'Le code ne doit pas dépasser 50 caractères'),
  libelle: z.string({
    required_error: 'Le libellé est obligatoire',
    invalid_type_error: 'Le libellé doit être du texte',
  })
    .min(1, 'Le libellé est obligatoire')
    .max(255, 'Le libellé ne doit pas dépasser 255 caractères'),
  ordre: z.number({
    invalid_type_error: 'L\'ordre doit être un nombre',
  }).int('L\'ordre doit être un nombre entier').default(0),
  actif: z.boolean({
    invalid_type_error: 'Le statut actif doit être vrai ou faux',
  }).default(true),
});

export const CreateValueListSchema = z.object({
  code: z.string({
    required_error: 'Le code est obligatoire',
    invalid_type_error: 'Le code doit être du texte',
  })
    .min(1, 'Le code est obligatoire')
    .max(50, 'Le code ne doit pas dépasser 50 caractères'),
  libelle: z.string({
    required_error: 'Le libellé est obligatoire',
    invalid_type_error: 'Le libellé doit être du texte',
  })
    .min(1, 'Le libellé est obligatoire')
    .max(255, 'Le libellé ne doit pas dépasser 255 caractères'),
  description: z.string({
    invalid_type_error: 'La description doit être du texte',
  }).optional(),
  actif: z.boolean({
    invalid_type_error: 'Le statut actif doit être vrai ou faux',
  }).default(true),
  items: z.array(ValueListItemSchema).optional(),
});

export const UpdateValueListSchema = CreateValueListSchema.partial().extend({
  items: z.array(ValueListItemSchema).optional(),
});

export type ValueListItemDto = z.infer<typeof ValueListItemSchema>;
export type CreateValueListDto = z.infer<typeof CreateValueListSchema>;
export type UpdateValueListDto = z.infer<typeof UpdateValueListSchema>;
