import { z } from 'zod';

export const CreateTiersContactSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  prenom: z.string().optional().nullable(),
  titre: z.string().optional().nullable(),
  telephoneFixe: z.string().optional().nullable(),
  portable: z.string().optional().nullable(),
  email: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().email("L'email doit être une adresse email valide").optional().nullable()
  ),
  societeUuids: z.array(z.string().uuid()).optional().nullable(),
});

export const UpdateTiersContactSchema = CreateTiersContactSchema.partial().extend({
  actif: z.boolean().optional(),
});

export type CreateTiersContactDto = z.infer<typeof CreateTiersContactSchema>;
export type UpdateTiersContactDto = z.infer<typeof UpdateTiersContactSchema>;
