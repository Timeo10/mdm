-- Script pour ajouter le premier administrateur
-- Remplacez 'VOTRE_EMAIL@example.com' par votre adresse email

-- Insérer ou mettre à jour le rôle de l'utilisateur
INSERT INTO user_roles (uuid, email, role, actif, date_creation, date_maj)
VALUES (
  gen_random_uuid()::text,
  'VOTRE_EMAIL@example.com',  -- ⬅️ REMPLACEZ PAR VOTRE EMAIL
  'ADMIN',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email)
DO UPDATE SET
  role = 'ADMIN',
  actif = true,
  date_maj = CURRENT_TIMESTAMP;

-- Vérifier que l'administrateur a bien été ajouté
SELECT
  email,
  role,
  actif,
  date_creation
FROM user_roles
WHERE role = 'ADMIN'
ORDER BY date_creation;
