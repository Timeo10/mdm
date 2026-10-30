-- ADV-MDM - Initialisation d'une base PostgreSQL vide
-- Structure issue des entites actuelles du backend au 29/10/2026.
-- PostgreSQL 13+ (gen_random_uuid natif). Se connecter a la base cible existante.
-- Executer avec un compte autorise a creer le schema mdm et ses objets.
-- Exemple : psql -h HOTE -U UTILISATEUR -d BASE_PROD -v ON_ERROR_STOP=1 -f init-production.sql
-- Le script refuse un schema mdm contenant deja des tables ou des sequences.
-- Aucune donnee de recette, societe ou compte administrateur n'est copie.
-- Les deux roles metier CLIENT et FOURNISSEUR sont initialises pour les imports.
-- Les horodatages date_maj sont mis a jour par TypeORM, sans trigger SQL.

BEGIN;
SET LOCAL lock_timeout = '10s';

CREATE SCHEMA IF NOT EXISTS mdm;
SET LOCAL search_path = mdm, public;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
             WHERE n.nspname = 'mdm' AND c.relkind IN ('r', 'p', 'v', 'm', 'S', 'f')) THEN
    RAISE EXCEPTION 'Le schema mdm contient deja des objets. Utiliser un script de migration pour une base existante.';
  END IF;
END $$;

-- Types enumeres
CREATE TYPE "mdm"."custom_attribute_type_champ_enum" AS ENUM('texte', 'nombre', 'date', 'booleen', 'liste', 'email', 'telephone', 'url');
CREATE TYPE "mdm"."custom_attribute_portee_enum" AS ENUM('global', 'societe');

-- Tables (les cles etrangeres sont ajoutees apres toutes les creations)
-- Les references vers tiers.uuid utilisent character(36), comme la cle primaire.
-- La longueur est explicite pour eviter le character(1) implicite de PostgreSQL.

-- mdm.value_list
CREATE TABLE "mdm"."value_list" (
    "uuid" uuid NOT NULL DEFAULT gen_random_uuid(),
    "code" character varying(50) NOT NULL,
    "libelle" character varying(255) NOT NULL,
    "description" text,
    "actif" boolean NOT NULL DEFAULT true,
    "fl_deleted" boolean NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP NOT NULL DEFAULT now(),
    "date_maj" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "UQ_96d05a7624464b642e9fb715509" UNIQUE ("code"),
    CONSTRAINT "PK_93986e2b51b0b47dfebf452d3ec" PRIMARY KEY ("uuid")
);

-- mdm.value_list_item
CREATE TABLE "mdm"."value_list_item" (
    "uuid" uuid NOT NULL DEFAULT gen_random_uuid(),
    "value_list_uuid" uuid NOT NULL,
    "code" character varying(50) NOT NULL,
    "libelle" character varying(255) NOT NULL,
    "ordre" integer NOT NULL DEFAULT '0',
    "actif" boolean NOT NULL DEFAULT true,
    "fl_deleted" boolean NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP NOT NULL DEFAULT now(),
    "date_maj" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_c1fdeccea64982fd3f5037aa3ca" PRIMARY KEY ("uuid")
);

-- mdm.user_roles
CREATE TABLE "mdm"."user_roles" (
    "uuid" character(36) NOT NULL,
    "email" character varying(255) NOT NULL,
    "role" character varying(50) NOT NULL DEFAULT 'READONLY',
    "actif" boolean NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP NOT NULL DEFAULT now(),
    "date_maj" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "UQ_fb8c5b62ab5a7a949b36664e19a" UNIQUE ("email"),
    CONSTRAINT "PK_d60df0e0fc8413e406f54da4df8" PRIMARY KEY ("uuid")
);

-- mdm.tiers
CREATE TABLE "mdm"."tiers" (
    "uuid" character(36) NOT NULL,
    "type_tiers" character varying(255),
    "code_tiers_mdm" character varying(50),
    "actif" boolean,
    "siren" character varying(9),
    "siret" character varying(14),
    "raison_sociale" character varying(255),
    "nom_commercial" character varying(255),
    "forme_juridique" character varying(255),
    "type_entreprise" character varying(255),
    "code_naf" character varying(10),
    "capital_social" character varying(255),
    "nom_prenom" character varying(255),
    "ville_registre" character varying(255),
    "date_immatriculation" character varying(10),
    "code_tva_intracom" character varying(50),
    "regime_tva" character varying(255),
    "pays_iso" character(2),
    "preuve_statut_tva" character varying(255),
    "est_groupement" boolean,
    "nature_adresse" character varying(255),
    "adresse_ligne1" character varying(255),
    "adresse_ligne2" character varying(255),
    "adresse_ligne3" character varying(255),
    "cedex" character varying(10),
    "code_postal" character varying(10),
    "ville" character varying(255),
    "region" character varying(255),
    "geocodage" text,
    "langue_facture" character varying(10),
    "devise_facture" character varying(10),
    "format_facture" character varying(50),
    "source_validation_e_facturation" character varying(255),
    "email_facturation" character varying(255),
    "nom_contact_vendeur" character varying(255),
    "prenom_contact_vendeur" character varying(255),
    "fonction_contact_vendeur" character varying(255),
    "email_contact_vendeur" character varying(255),
    "telephone_contact_vendeur" character varying(30),
    "iban" character varying(34),
    "bic" character varying(11),
    "mode_paiement" character varying(50),
    "delai_paiement_jours" integer,
    "ref_commande_obligatoire" boolean,
    "date_creation" TIMESTAMP NOT NULL DEFAULT now(),
    "date_maj" TIMESTAMP NOT NULL DEFAULT now(),
    "fl_deleted" boolean DEFAULT false,
    CONSTRAINT "PK_db943a1def1a0b5a9d55b559786" PRIMARY KEY ("uuid")
);

-- mdm.custom_attribute
CREATE TABLE "mdm"."custom_attribute" (
    "uuid" uuid NOT NULL DEFAULT gen_random_uuid(),
    "code" character varying(100) NOT NULL,
    "libelle" character varying(255) NOT NULL,
    "description" text,
    "type_champ" "mdm"."custom_attribute_type_champ_enum" NOT NULL DEFAULT 'texte',
    "portee" "mdm"."custom_attribute_portee_enum" NOT NULL DEFAULT 'global',
    "obligatoire" boolean NOT NULL DEFAULT false,
    "ordre_affichage" integer NOT NULL DEFAULT '0',
    "options_liste" json,
    "valeur_par_defaut" text,
    "actif" boolean NOT NULL DEFAULT true,
    "fl_deleted" boolean NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP NOT NULL DEFAULT now(),
    "date_maj" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "UQ_7b2ee08abd48d4c3969789abb4c" UNIQUE ("code"),
    CONSTRAINT "PK_0f0691693fe140164301ad19acf" PRIMARY KEY ("uuid")
);

-- mdm.custom_attribute_value
CREATE TABLE "mdm"."custom_attribute_value" (
    "uuid" uuid NOT NULL DEFAULT gen_random_uuid(),
    "tiers_societe_uuid" uuid NOT NULL,
    "attribute_uuid" uuid NOT NULL,
    "valeur" text,
    "date_creation" TIMESTAMP NOT NULL DEFAULT now(),
    "date_maj" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_1a2f5dae88e29f12e1cca85a351" PRIMARY KEY ("uuid")
);

-- mdm.tiers_etablissement_adressage_code
CREATE TABLE "mdm"."tiers_etablissement_adressage_code" (
    "uuid" uuid NOT NULL DEFAULT gen_random_uuid(),
    "etablissement_uuid" uuid NOT NULL,
    "code_adressage_pa" character varying(255) NOT NULL,
    "actif" boolean NOT NULL DEFAULT true,
    "fl_deleted" boolean NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP NOT NULL DEFAULT now(),
    "date_maj" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_9dcae3d2a6d045038c5e3c6f286" PRIMARY KEY ("uuid")
);

-- mdm.tiers_etablissement
CREATE TABLE "mdm"."tiers_etablissement" (
    "uuid" uuid NOT NULL,
    "tiers_uuid" character(36) NOT NULL,
    "siret" character varying(14),
    "nom_etablissement" character varying(255),
    "principal" boolean NOT NULL DEFAULT false,
    "adresse_ligne1" character varying(255),
    "adresse_ligne2" character varying(255),
    "adresse_ligne3" character varying(255),
    "code_postal" character varying(10),
    "ville" character varying(255),
    "pays_iso" character(2),
    "actif" boolean NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP NOT NULL DEFAULT now(),
    "date_maj" TIMESTAMP NOT NULL DEFAULT now(),
    "fl_deleted" boolean NOT NULL DEFAULT false,
    CONSTRAINT "PK_8123861f17e36183302e64b1fc2" PRIMARY KEY ("uuid")
);

-- mdm.tiers_role
CREATE TABLE "mdm"."tiers_role" (
    "uuid" uuid NOT NULL,
    "code" character varying(50) NOT NULL,
    "libelle" character varying(255) NOT NULL,
    "description" text,
    "couleur" character varying(7),
    "ordre_affichage" integer NOT NULL DEFAULT '0',
    "actif" boolean NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP NOT NULL DEFAULT now(),
    "date_maj" TIMESTAMP NOT NULL DEFAULT now(),
    "fl_deleted" boolean NOT NULL DEFAULT false,
    CONSTRAINT "UQ_047e7ea901368666631e3cdc4b3" UNIQUE ("code"),
    CONSTRAINT "PK_8698261abc7ac7f6eb9b414db01" PRIMARY KEY ("uuid")
);

-- mdm.tiers_societe_erp_code
CREATE TABLE "mdm"."tiers_societe_erp_code" (
    "uuid" uuid NOT NULL DEFAULT gen_random_uuid(),
    "tiers_societe_uuid" uuid NOT NULL,
    "etablissement_uuid" uuid NOT NULL,
    "role_uuid" uuid NOT NULL,
    "erp" character varying(50) NOT NULL,
    "code_tiers_erp" character varying(255) NOT NULL,
    "actif" boolean NOT NULL DEFAULT true,
    "fl_deleted" boolean NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP NOT NULL DEFAULT now(),
    "date_maj" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_c1f2c952a8afa4a59187ab3774e" PRIMARY KEY ("uuid")
);

-- mdm.tiers_societe
CREATE TABLE "mdm"."tiers_societe" (
    "uuid" uuid NOT NULL DEFAULT gen_random_uuid(),
    "tiers_uuid" character(36) NOT NULL,
    "societe_uuid" uuid NOT NULL,
    "code_tiers_erp" character varying(255),
    "frais_generaux" boolean NOT NULL DEFAULT false,
    "frais_metier" boolean NOT NULL DEFAULT false,
    "categorie_fournisseur" character varying(50),
    "code_routage_adv_entrant" character varying(50),
    "dossier_routage_pa" character varying(255),
    "format_routage_pa" character varying(255),
    "choix_routage_pa" character varying(50),
    "actif" boolean NOT NULL DEFAULT true,
    "fl_deleted" boolean NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP NOT NULL DEFAULT now(),
    "date_maj" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_02515e8c346c8e16ac946ea2a2b" PRIMARY KEY ("uuid")
);

-- mdm.rib
CREATE TABLE "mdm"."rib" (
    "uuid" uuid NOT NULL DEFAULT gen_random_uuid(),
    "societe_uuid" uuid NOT NULL,
    "type_iban_code" character varying(50) NOT NULL,
    "iban" character varying(34) NOT NULL,
    "bic" character varying(11),
    "titulaire" character varying(255) NOT NULL,
    "banque" character varying(255),
    "actif" boolean NOT NULL DEFAULT true,
    "fl_deleted" boolean NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP NOT NULL DEFAULT now(),
    "date_maj" TIMESTAMP NOT NULL DEFAULT now(),
    "ics" character varying(255),
    CONSTRAINT "PK_f8a9991d81bb0b4d7a48af5f148" PRIMARY KEY ("uuid")
);

-- mdm.societe
CREATE TABLE "mdm"."societe" (
    "uuid" uuid NOT NULL DEFAULT gen_random_uuid(),
    "code" character varying(50) NOT NULL,
    "raison_sociale" character varying(255) NOT NULL,
    "description" text,
    "actif" boolean NOT NULL DEFAULT true,
    "siren" character varying(9),
    "siret" character varying(14),
    "forme_juridique" character varying(50),
    "erp" character varying(50),
    "lbl_capital_social" character varying(250),
    "adresse_rue" character varying(255),
    "adresse_complement" character varying(255),
    "code_postal" character varying(10),
    "ville" character varying(255),
    "pays" character varying(100),
    "regime_tva" character varying(50),
    "identifiant_tva" character varying(20),
    "email_contact" character varying(255),
    "fl_deleted" boolean NOT NULL DEFAULT false,
    "dossier_sftp_pa" character varying(255),
    "format_export_pa" character varying(10),
    "dossier_repertoire_frais_generaux_pa" character varying(255),
    "format_frais_generaux_pa" character varying(10),
    "date_creation" TIMESTAMP NOT NULL DEFAULT now(),
    "date_maj" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "UQ_13b98f645409dc39173a942d6a7" UNIQUE ("code"),
    CONSTRAINT "PK_c38b8d653e3b625896a611debc0" PRIMARY KEY ("uuid")
);

-- mdm.tiers_societe_role
CREATE TABLE "mdm"."tiers_societe_role" (
    "uuid" uuid NOT NULL DEFAULT gen_random_uuid(),
    "tiers_uuid" character(36) NOT NULL,
    "societe_uuid" uuid NOT NULL,
    "role_uuid" uuid NOT NULL,
    "commentaire" text,
    "date_creation" TIMESTAMP NOT NULL DEFAULT now(),
    "date_maj" TIMESTAMP NOT NULL DEFAULT now(),
    "fl_deleted" boolean NOT NULL DEFAULT false,
    CONSTRAINT "PK_a0b851f3cf8068a1ded155ae850" PRIMARY KEY ("uuid")
);

-- mdm.tiers_contact
CREATE TABLE "mdm"."tiers_contact" (
    "uuid" uuid NOT NULL DEFAULT gen_random_uuid(),
    "tiers_uuid" character(36) NOT NULL,
    "nom" character varying(255) NOT NULL,
    "prenom" character varying(255),
    "titre" character varying(255),
    "telephone_fixe" character varying(30),
    "portable" character varying(30),
    "email" character varying(255),
    "actif" boolean NOT NULL DEFAULT true,
    "fl_deleted" boolean NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP NOT NULL DEFAULT now(),
    "date_maj" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_72d985a658cb6ecb80c1731b54b" PRIMARY KEY ("uuid")
);

-- mdm.tiers_pending_approval
CREATE TABLE "mdm"."tiers_pending_approval" (
    "uuid" uuid NOT NULL,
    "source" character varying(50) NOT NULL DEFAULT 'manual',
    "external_reference" character varying(255),
    "status" character varying(20) NOT NULL DEFAULT 'pending',
    "type_tiers" character varying(255),
    "siren" character varying(9),
    "siret" character varying(14),
    "raison_sociale" character varying(255),
    "nom_commercial" character varying(255),
    "forme_juridique" character varying(255),
    "type_entreprise" character varying(255),
    "capital_social" character varying(255),
    "nom_prenom" character varying(255),
    "ville_registre" character varying(255),
    "date_immatriculation" character varying(10),
    "code_tva_intracom" character varying(20),
    "regime_tva" character varying(100),
    "pays_iso" character varying(2),
    "nature_adresse" character varying(255),
    "adresse_ligne1" character varying(255),
    "adresse_ligne2" character varying(255),
    "adresse_ligne3" character varying(255),
    "cedex" character varying(10),
    "code_postal" character varying(10),
    "ville" character varying(255),
    "region" character varying(255),
    "email_facturation" character varying(255),
    "iban" character varying(34),
    "bic" character varying(11),
    "mode_paiement" character varying(100),
    "delai_paiement_jours" integer,
    "ref_commande_obligatoire" boolean NOT NULL DEFAULT false,
    "actif" boolean NOT NULL DEFAULT true,
    "submitted_by" character varying(255),
    "reviewed_by" character varying(255),
    "reviewed_at" TIMESTAMP,
    "review_comment" text,
    "submission_comment" text,
    "approvedTierUuid" uuid,
    "potential_duplicates" jsonb,
    "date_creation" TIMESTAMP NOT NULL DEFAULT now(),
    "date_maj" TIMESTAMP NOT NULL DEFAULT now(),
    "fl_deleted" boolean NOT NULL DEFAULT false,
    CONSTRAINT "PK_2cb3bd0d36ab8b83135b9413b27" PRIMARY KEY ("uuid")
);

-- mdm.tiers_audit_log
CREATE TABLE "mdm"."tiers_audit_log" (
    "uuid" uuid NOT NULL DEFAULT gen_random_uuid(),
    "tiers_uuid" uuid NOT NULL,
    "action" character varying(50) NOT NULL,
    "entity_type" character varying(50),
    "entity_uuid" uuid,
    "user_id" character varying(255),
    "user_email_hash" character varying(64),
    "user_role" character varying(100),
    "user_name" character varying(255),
    "user_email" character varying(255),
    "ip_address_anonymized" character varying(45),
    "changes" jsonb,
    "old_values" jsonb,
    "new_values" jsonb,
    "description" text,
    "date_action" TIMESTAMP NOT NULL DEFAULT now(),
    "retention_until" TIMESTAMP,
    "is_anonymized" boolean NOT NULL DEFAULT false,
    "anonymized_at" TIMESTAMP,
    CONSTRAINT "PK_3027f031019f897054b56fc8698" PRIMARY KEY ("uuid")
);

-- mdm.tiers_global_attribute_value
CREATE TABLE "mdm"."tiers_global_attribute_value" (
    "uuid" uuid NOT NULL DEFAULT gen_random_uuid(),
    "tiers_uuid" character(36) NOT NULL,
    "attribute_uuid" uuid NOT NULL,
    "valeur" text,
    "date_creation" TIMESTAMP NOT NULL DEFAULT now(),
    "date_maj" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_804cf80cd7bc732903b23f638f0" PRIMARY KEY ("uuid")
);

-- mdm.custom_attribute_societe
CREATE TABLE "mdm"."custom_attribute_societe" (
    "attribute_uuid" uuid NOT NULL,
    "societe_uuid" uuid NOT NULL,
    CONSTRAINT "PK_70d6373c6e70e523c8d40ba1a8b" PRIMARY KEY ("attribute_uuid", "societe_uuid")
);

-- mdm.tiers_contact_societe
CREATE TABLE "mdm"."tiers_contact_societe" (
    "contact_uuid" uuid NOT NULL,
    "societe_uuid" uuid NOT NULL,
    CONSTRAINT "PK_59b837370b79b9c36f489f0d027" PRIMARY KEY ("contact_uuid", "societe_uuid")
);

-- Index
CREATE INDEX "IDX_fb8c5b62ab5a7a949b36664e19" ON "mdm"."user_roles" ("email") ;
CREATE INDEX "IDX_0475850442d60bd704c5804155" ON "mdm"."user_roles" ("role") ;
CREATE UNIQUE INDEX "idx_tiers_code_tiers_mdm" ON "mdm"."tiers" ("code_tiers_mdm") WHERE code_tiers_mdm IS NOT NULL;
CREATE INDEX "IDX_9cdbab392d4883d6e935d459ef" ON "mdm"."tiers" ("raison_sociale") ;
CREATE INDEX "IDX_c8be09e3cb30df4a939de3a475" ON "mdm"."tiers" ("siret") ;
CREATE INDEX "IDX_f2506f697a54c40d4b14bccb16" ON "mdm"."tiers" ("siren") ;
CREATE INDEX "IDX_ea5cee7b6e1ea31dba21214783" ON "mdm"."custom_attribute" ("portee") ;
CREATE INDEX "IDX_c38846560d58dedabff5db2fb4" ON "mdm"."custom_attribute" ("fl_deleted") ;
CREATE INDEX "IDX_057a2135db26e378b9ad637ded" ON "mdm"."custom_attribute" ("actif") ;
CREATE INDEX "IDX_0f8f7c8ef75bf0f44c5a824365" ON "mdm"."custom_attribute" ("ordre_affichage") ;
CREATE INDEX "IDX_508cd41c991047208ae0f35d6d" ON "mdm"."custom_attribute_value" ("tiers_societe_uuid", "attribute_uuid") ;
CREATE UNIQUE INDEX "idx_tiers_etablissement_adressage_code_unique" ON "mdm"."tiers_etablissement_adressage_code" ("etablissement_uuid", "code_adressage_pa") WHERE fl_deleted = false;
CREATE INDEX "IDX_64d18a540435c7b03017e81865" ON "mdm"."tiers_etablissement_adressage_code" ("etablissement_uuid") ;
CREATE UNIQUE INDEX "IDX_bbfecf0a7e390c49c5e9682243" ON "mdm"."tiers_etablissement" ("siret") WHERE fl_deleted = false;
CREATE INDEX "IDX_2b4b13826de1f5a2df2dd88724" ON "mdm"."tiers_etablissement" ("tiers_uuid") ;
CREATE INDEX "idx_tiers_role_ordre" ON "mdm"."tiers_role" ("ordre_affichage") WHERE fl_deleted = false;
CREATE INDEX "idx_tiers_role_actif" ON "mdm"."tiers_role" ("actif") WHERE fl_deleted = false;
CREATE INDEX "idx_tiers_role_code" ON "mdm"."tiers_role" ("code") ;
CREATE UNIQUE INDEX "idx_tiers_societe_erp_code_unique" ON "mdm"."tiers_societe_erp_code" ("tiers_societe_uuid", "etablissement_uuid", "role_uuid", "erp") WHERE fl_deleted = false;
CREATE INDEX "IDX_270faa6185cf45745bb9a25633" ON "mdm"."tiers_societe_erp_code" ("role_uuid") ;
CREATE INDEX "IDX_cf4953c930d12fdee13d8552fa" ON "mdm"."tiers_societe_erp_code" ("etablissement_uuid") ;
CREATE INDEX "IDX_5555af86d02981f714acfa0037" ON "mdm"."tiers_societe_erp_code" ("tiers_societe_uuid") ;
CREATE INDEX "IDX_efe1dee2f09c1fc1149cbcf9a5" ON "mdm"."tiers_societe" ("fl_deleted") ;
CREATE INDEX "IDX_a6cec2ea53a6369070e25f6a2c" ON "mdm"."tiers_societe" ("tiers_uuid", "societe_uuid") ;
CREATE INDEX "IDX_1f5663bac1bae29e582e947af9" ON "mdm"."tiers_societe" ("societe_uuid") ;
CREATE INDEX "IDX_62909bb4522ca813c218141e9f" ON "mdm"."tiers_societe" ("tiers_uuid") ;
CREATE UNIQUE INDEX "idx_tiers_societe_role_unique" ON "mdm"."tiers_societe_role" ("tiers_uuid", "societe_uuid", "role_uuid") WHERE fl_deleted = false;
CREATE INDEX "IDX_37958cd288cdd7c782f9241c18" ON "mdm"."tiers_contact" ("fl_deleted") ;
CREATE INDEX "IDX_01c429e5e0f3712345ffad4d52" ON "mdm"."tiers_contact" ("tiers_uuid") ;
CREATE INDEX "IDX_98552727b691adf55e122aaaa0" ON "mdm"."tiers_pending_approval" ("status") ;
CREATE INDEX "IDX_83acbfb016b5b9e41700738fad" ON "mdm"."tiers_audit_log" ("is_anonymized", "anonymized_at") ;
CREATE INDEX "IDX_e8603a20c143b69381115c214e" ON "mdm"."tiers_audit_log" ("retention_until") ;
CREATE INDEX "IDX_9c33173ad8e1a8a0bd1f253b45" ON "mdm"."tiers_audit_log" ("date_action") ;
CREATE INDEX "IDX_cf7d75bd35b774f75fcced433d" ON "mdm"."tiers_audit_log" ("action") ;
CREATE INDEX "IDX_74d6d7c9d1a54f6a876b1832f4" ON "mdm"."tiers_audit_log" ("tiers_uuid") ;
CREATE INDEX "IDX_9f5ee48b919e06a5c885f378b0" ON "mdm"."tiers_global_attribute_value" ("tiers_uuid", "attribute_uuid") ;
CREATE INDEX "IDX_e4f9ef0b3b32b9ce011ca7f9af" ON "mdm"."custom_attribute_societe" ("attribute_uuid") ;
CREATE INDEX "IDX_28ffab4c559a98350b538ef5f5" ON "mdm"."custom_attribute_societe" ("societe_uuid") ;
CREATE INDEX "IDX_a91fa174db752aca3061fcfe72" ON "mdm"."tiers_contact_societe" ("contact_uuid") ;
CREATE INDEX "IDX_6def822af7d3ecf697e811a259" ON "mdm"."tiers_contact_societe" ("societe_uuid") ;

-- Cles etrangeres
ALTER TABLE "mdm"."value_list_item" ADD CONSTRAINT "FK_a9c10db7cd253c10db5da992867" FOREIGN KEY ("value_list_uuid") REFERENCES "mdm"."value_list"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "mdm"."custom_attribute_value" ADD CONSTRAINT "FK_d4e6e3602fe5b1b4cd840ae4e4a" FOREIGN KEY ("tiers_societe_uuid") REFERENCES "mdm"."tiers_societe"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "mdm"."custom_attribute_value" ADD CONSTRAINT "FK_4036ef386bd73a13af769b3dcff" FOREIGN KEY ("attribute_uuid") REFERENCES "mdm"."custom_attribute"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "mdm"."tiers_etablissement_adressage_code" ADD CONSTRAINT "FK_64d18a540435c7b03017e818653" FOREIGN KEY ("etablissement_uuid") REFERENCES "mdm"."tiers_etablissement"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "mdm"."tiers_etablissement" ADD CONSTRAINT "FK_2b4b13826de1f5a2df2dd887242" FOREIGN KEY ("tiers_uuid") REFERENCES "mdm"."tiers"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "mdm"."tiers_societe_erp_code" ADD CONSTRAINT "FK_5555af86d02981f714acfa00371" FOREIGN KEY ("tiers_societe_uuid") REFERENCES "mdm"."tiers_societe"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "mdm"."tiers_societe_erp_code" ADD CONSTRAINT "FK_cf4953c930d12fdee13d8552fa9" FOREIGN KEY ("etablissement_uuid") REFERENCES "mdm"."tiers_etablissement"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "mdm"."tiers_societe_erp_code" ADD CONSTRAINT "FK_270faa6185cf45745bb9a256330" FOREIGN KEY ("role_uuid") REFERENCES "mdm"."tiers_role"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "mdm"."tiers_societe" ADD CONSTRAINT "FK_62909bb4522ca813c218141e9f7" FOREIGN KEY ("tiers_uuid") REFERENCES "mdm"."tiers"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "mdm"."tiers_societe" ADD CONSTRAINT "FK_1f5663bac1bae29e582e947af94" FOREIGN KEY ("societe_uuid") REFERENCES "mdm"."societe"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "mdm"."rib" ADD CONSTRAINT "FK_6803a612355b3a4c7d36502537d" FOREIGN KEY ("societe_uuid") REFERENCES "mdm"."societe"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "mdm"."tiers_societe_role" ADD CONSTRAINT "FK_1c814daa021b4b39342938724c8" FOREIGN KEY ("tiers_uuid") REFERENCES "mdm"."tiers"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "mdm"."tiers_societe_role" ADD CONSTRAINT "FK_d25ebb322ae1e99060e6f3623d6" FOREIGN KEY ("societe_uuid") REFERENCES "mdm"."societe"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "mdm"."tiers_societe_role" ADD CONSTRAINT "FK_5c877a63c9d6c16402797f13484" FOREIGN KEY ("role_uuid") REFERENCES "mdm"."tiers_role"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "mdm"."tiers_contact" ADD CONSTRAINT "FK_01c429e5e0f3712345ffad4d52d" FOREIGN KEY ("tiers_uuid") REFERENCES "mdm"."tiers"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "mdm"."tiers_global_attribute_value" ADD CONSTRAINT "FK_1d3703f1f9c1594ac3a0eb3ff3e" FOREIGN KEY ("tiers_uuid") REFERENCES "mdm"."tiers"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "mdm"."tiers_global_attribute_value" ADD CONSTRAINT "FK_f85b2796733e47916157b9a0b85" FOREIGN KEY ("attribute_uuid") REFERENCES "mdm"."custom_attribute"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "mdm"."custom_attribute_societe" ADD CONSTRAINT "FK_e4f9ef0b3b32b9ce011ca7f9afc" FOREIGN KEY ("attribute_uuid") REFERENCES "mdm"."custom_attribute"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdm"."custom_attribute_societe" ADD CONSTRAINT "FK_28ffab4c559a98350b538ef5f51" FOREIGN KEY ("societe_uuid") REFERENCES "mdm"."societe"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdm"."tiers_contact_societe" ADD CONSTRAINT "FK_a91fa174db752aca3061fcfe723" FOREIGN KEY ("contact_uuid") REFERENCES "mdm"."tiers_contact"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mdm"."tiers_contact_societe" ADD CONSTRAINT "FK_6def822af7d3ecf697e811a2592" FOREIGN KEY ("societe_uuid") REFERENCES "mdm"."societe"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- Numerotation automatique des tiers : MDM1, MDM2, ...
CREATE SEQUENCE mdm.tiers_code_tiers_mdm_seq AS bigint START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE mdm.tiers_code_tiers_mdm_seq OWNED BY mdm.tiers.code_tiers_mdm;
ALTER TABLE mdm.tiers ALTER COLUMN code_tiers_mdm SET DEFAULT ('MDM' || nextval('mdm.tiers_code_tiers_mdm_seq'::regclass));

-- Roles necessaires a l'import CSV
INSERT INTO mdm.tiers_role (uuid, code, libelle, couleur, ordre_affichage, actif, fl_deleted)
VALUES
  (gen_random_uuid(), 'CLIENT', 'Client', '#2196F3', 1, true, false),
  (gen_random_uuid(), 'FOURNISSEUR', 'Fournisseur', '#F44336', 2, true, false);

COMMIT;

-- Creation du premier administrateur : remplacer l'email puis executer separement.
-- INSERT INTO mdm.user_roles (uuid, email, role, actif)
-- VALUES (gen_random_uuid()::text, 'prenom.nom@entreprise.fr', 'ADMIN', true);

-- Les societes et listes de valeurs propres a la production restent a configurer dans l'application.
