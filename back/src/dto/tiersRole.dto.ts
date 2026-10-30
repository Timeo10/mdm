import { z } from 'zod';

export const CreateTiersRoleSchema = z.object({
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
  couleur: z.string({
    invalid_type_error: 'La couleur doit être du texte',
  }).optional(),
  actif: z.boolean({
    invalid_type_error: 'Le statut actif doit être vrai ou faux',
  }).default(true),
});

export const UpdateTiersRoleSchema = CreateTiersRoleSchema.partial();

export const AssignRoleToTiersSchema = z.object({
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
  roleUuid: z.string({
    required_error: 'L\'UUID du rôle est obligatoire',
    invalid_type_error: 'L\'UUID du rôle doit être du texte',
  })
    .uuid('L\'UUID du rôle doit être un UUID valide'),
  commentaire: z.string({
    invalid_type_error: 'Le commentaire doit être du texte',
  }).optional(),
  codeRoutageAdvEntrant: z.string({
    invalid_type_error: 'Le code de routage ADV entrant doit être du texte',
  })
    .max(50, 'Le code de routage ADV entrant ne doit pas dépasser 50 caractères')
    .optional(),
});

export const UpdateTiersRoleAssignmentSchema = z.object({
  commentaire: z.string({
    invalid_type_error: 'Le commentaire doit être du texte',
  }).optional(),
  codeRoutageAdvEntrant: z.string({
    invalid_type_error: 'Le code de routage ADV entrant doit être du texte',
  })
    .max(50, 'Le code de routage ADV entrant ne doit pas dépasser 50 caractères')
    .optional(),
});

export const BulkAssignRolesSchema = z.object({
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
  roleUuids: z.array(
    z.string({
      invalid_type_error: 'Les UUIDs de rôle doivent être du texte',
    }).uuid('Chaque UUID de rôle doit être un UUID valide')
  ),
});

export type CreateTiersRoleDto = z.infer<typeof CreateTiersRoleSchema>;
export type UpdateTiersRoleDto = z.infer<typeof UpdateTiersRoleSchema>;
export type AssignRoleToTiersDto = z.infer<typeof AssignRoleToTiersSchema>;
export type UpdateTiersRoleAssignmentDto = z.infer<typeof UpdateTiersRoleAssignmentSchema>;
export type BulkAssignRolesDto = z.infer<typeof BulkAssignRolesSchema>;
