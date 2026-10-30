-- Script de création des tables pour ADV-MDM
-- Base de données PostgreSQL

-- Table societe
CREATE TABLE societe (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true NOT NULL,
    siren VARCHAR(9),
    siret VARCHAR(14),
    fl_deleted BOOLEAN DEFAULT false NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table tier_entreprise
CREATE TABLE tiers_entreprise (
    uuid CHAR(36) PRIMARY KEY,
    type_tiers VARCHAR(255),
    nom_affichage VARCHAR(255),
    empreinte_hash VARCHAR(255),
    erp_source VARCHAR(255),
    code_erp_source VARCHAR(255),
    actif BOOLEAN,
    niveau_confiance INT,
    siren VARCHAR(9),
    siret VARCHAR(14),
    raison_sociale VARCHAR(255),
    nom_commercial VARCHAR(255),
    forme_juridique VARCHAR(255),
    type_entreprise VARCHAR(255),
    capital_social VARCHAR(255),
    nom_prenom VARCHAR(255),
    nic VARCHAR(50),
    activite_principale VARCHAR(255),
    ville_registre VARCHAR(255),
    date_immatriculation DATE,
    code_tva_intracom VARCHAR(50),
    regime_tva VARCHAR(255),
    pays_iso CHAR(2),
    preuve_statut_tva VARCHAR(255),
    est_groupement BOOLEAN,
    nature_adresse VARCHAR(255),
    adresse_ligne1 VARCHAR(255),
    adresse_ligne2 VARCHAR(255),
    adresse_ligne3 VARCHAR(255),
    cedex VARCHAR(10),
    code_postal VARCHAR(10),
    ville VARCHAR(255),
    region VARCHAR(255),
    geocodage TEXT,
    langue_facture VARCHAR(10),
    devise_facture VARCHAR(10),
    mode_e_facturation VARCHAR(50),
    id_routage_ppf VARCHAR(255),
    format_facture VARCHAR(50),
    statut_ppf VARCHAR(50),
    date_derniere_validation_e_facturation TIMESTAMP,
    source_validation_e_facturation VARCHAR(255),
    email_facturation VARCHAR(255),
    telephone_key_record VARCHAR(30),
    site_web VARCHAR(255),
    virmt_identifiant_compte_paiement VARCHAR(255),
    virmt_nom_compte_paiement VARCHAR(255),
    virmt_identifiant_prestataire_paiement VARCHAR(255),
    prelvmt_identifiant_reference_mandat VARCHAR(255),
    prelvmt_identifiant_bancaire_creancier VARCHAR(255),
    prelvmt_identifiant_compte_debite_iban VARCHAR(255),
    contact_principal_contact_vendeur BOOLEAN,
    point_contact VARCHAR(255),
    nom_contact_vendeur VARCHAR(255),
    prenom_contact_vendeur VARCHAR(255),
    fonction_contact_vendeur VARCHAR(255),
    email_contact_vendeur VARCHAR(255),
    telephone_contact_vendeur VARCHAR(30),
    contact_principal_contact_e_fact_payeur_de_la_facture BOOLEAN,
    nom_contact_e_fact_payeur_de_la_facture VARCHAR(255),
    prenom_contact_e_fact_payeur_de_la_facture VARCHAR(255),
    fonction_contact_e_fact_payeur_de_la_facture VARCHAR(255),
    email_contact_e_fact_payeur_de_la_facture VARCHAR(255),
    telephone_contact_e_fact_payeur_de_la_facture VARCHAR(30),
    livre_a VARCHAR(255),
    iban VARCHAR(34),
    bic VARCHAR(11),
    mode_paiement VARCHAR(50),
    delai_paiement_jours INT,
    ref_commande_obligatoire BOOLEAN,
    date_creation TIMESTAMP,
    date_maj TIMESTAMP,
    conforme_code_tiers BOOLEAN,
    conforme_siren BOOLEAN,
    conforme_siret BOOLEAN,
    conforme_raison_sociale BOOLEAN,
    date_derniere_validation_tracabilite_audit TIMESTAMP,
    source_validation_tracabilite_audit VARCHAR(255),
    fl_deleted BOOLEAN DEFAULT false
);

CREATE INDEX idx_tier_entreprise_siren ON tier_entreprise(siren);
CREATE INDEX idx_tier_entreprise_siret ON tier_entreprise(siret);
CREATE INDEX idx_tier_entreprise_raison_sociale ON tier_entreprise(raison_sociale);
CREATE INDEX idx_tier_entreprise_nom_affichage ON tier_entreprise(nom_affichage);
CREATE INDEX idx_tier_entreprise_fl_deleted ON tier_entreprise(fl_deleted);
CREATE INDEX idx_tier_entreprise_actif ON tier_entreprise(actif);

-- Table tier_societe
CREATE TABLE tier_societe (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_uuid UUID NOT NULL,
    societe_uuid UUID NOT NULL,
    code_tiers_erp VARCHAR(255),
    actif BOOLEAN DEFAULT true NOT NULL,
    fl_deleted BOOLEAN DEFAULT false NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (tier_uuid) REFERENCES tier_entreprise(uuid) ON DELETE CASCADE,
    FOREIGN KEY (societe_uuid) REFERENCES societe(uuid) ON DELETE CASCADE
);

CREATE INDEX idx_tier_societe_tier_uuid ON tier_societe(tier_uuid);
CREATE INDEX idx_tier_societe_societe_uuid ON tier_societe(societe_uuid);
CREATE INDEX idx_tier_societe_tier_societe ON tier_societe(tier_uuid, societe_uuid);
CREATE INDEX idx_tier_societe_fl_deleted ON tier_societe(fl_deleted);

-- Table custom_attribute
CREATE TABLE custom_attribute (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    description TEXT,
    type_champ VARCHAR(20) DEFAULT 'texte' NOT NULL,
    portee VARCHAR(20) DEFAULT 'global' NOT NULL,
    obligatoire BOOLEAN DEFAULT false NOT NULL,
    ordre_affichage INT DEFAULT 0 NOT NULL,
    options_liste JSON,
    valeur_par_defaut TEXT,
    actif BOOLEAN DEFAULT true NOT NULL,
    fl_deleted BOOLEAN DEFAULT false NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CHECK (type_champ IN ('texte', 'nombre', 'date', 'booleen', 'liste', 'email', 'telephone', 'url')),
    CHECK (portee IN ('global', 'societe'))
);

CREATE INDEX idx_custom_attribute_ordre_affichage ON custom_attribute(ordre_affichage);
CREATE INDEX idx_custom_attribute_actif ON custom_attribute(actif);
CREATE INDEX idx_custom_attribute_fl_deleted ON custom_attribute(fl_deleted);
CREATE INDEX idx_custom_attribute_portee ON custom_attribute(portee);

-- Table custom_attribute_societe (many-to-many)
CREATE TABLE custom_attribute_societe (
    attribute_uuid UUID NOT NULL,
    societe_uuid UUID NOT NULL,
    PRIMARY KEY (attribute_uuid, societe_uuid),
    FOREIGN KEY (attribute_uuid) REFERENCES custom_attribute(uuid) ON DELETE CASCADE,
    FOREIGN KEY (societe_uuid) REFERENCES societe(uuid) ON DELETE CASCADE
);

-- Table custom_attribute_value
CREATE TABLE custom_attribute_value (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_societe_uuid UUID NOT NULL,
    attribute_uuid UUID NOT NULL,
    valeur TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (tier_societe_uuid) REFERENCES tier_societe(uuid) ON DELETE CASCADE,
    FOREIGN KEY (attribute_uuid) REFERENCES custom_attribute(uuid) ON DELETE CASCADE
);

CREATE INDEX idx_custom_attribute_value_tier_societe_attribute ON custom_attribute_value(tier_societe_uuid, attribute_uuid);

-- Table tiers_global_attribute_value
CREATE TABLE tiers_global_attribute_value (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tiers_uuid UUID NOT NULL,
    attribute_uuid UUID NOT NULL,
    valeur TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (tiers_uuid) REFERENCES tiers_entreprise(uuid) ON DELETE CASCADE,
    FOREIGN KEY (attribute_uuid) REFERENCES custom_attribute(uuid) ON DELETE CASCADE
);

CREATE INDEX idx_tiers_global_attribute_value_tiers_attribute ON tiers_global_attribute_value(tiers_uuid, attribute_uuid);

-- Table tier_pending_approval
CREATE TABLE tiers_pending_approval (
    uuid UUID PRIMARY KEY,
    source VARCHAR(50) DEFAULT 'manual' NOT NULL,
    external_reference VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    type_tiers VARCHAR(255),
    nom_affichage VARCHAR(255),
    siren VARCHAR(9),
    siret VARCHAR(14),
    raison_sociale VARCHAR(255),
    nom_commercial VARCHAR(255),
    forme_juridique VARCHAR(255),
    type_entreprise VARCHAR(255),
    capital_social VARCHAR(255),
    nom_prenom VARCHAR(255),
    nic VARCHAR(5),
    activite_principale VARCHAR(255),
    ville_registre VARCHAR(255),
    date_immatriculation VARCHAR(10),
    code_tva_intracom VARCHAR(20),
    regime_tva VARCHAR(100),
    pays_iso VARCHAR(2),
    nature_adresse VARCHAR(255),
    adresse_ligne1 VARCHAR(255),
    adresse_ligne2 VARCHAR(255),
    adresse_ligne3 VARCHAR(255),
    cedex VARCHAR(10),
    code_postal VARCHAR(10),
    ville VARCHAR(255),
    region VARCHAR(255),
    email_facturation VARCHAR(255),
    telephone_key_record VARCHAR(20),
    site_web VARCHAR(255),
    iban VARCHAR(34),
    bic VARCHAR(11),
    mode_paiement VARCHAR(100),
    delai_paiement_jours INTEGER,
    ref_commande_obligatoire BOOLEAN DEFAULT false,
    actif BOOLEAN DEFAULT true NOT NULL,
    submitted_by VARCHAR(255),
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    review_comment TEXT,
    submission_comment TEXT,
    "approvedTierUuid" UUID,
    potential_duplicates JSONB,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fl_deleted BOOLEAN DEFAULT false NOT NULL,
    CHECK (status IN ('pending', 'approved', 'rejected')),
    CHECK (source IN ('etl', 'manual', 'api'))
);

CREATE INDEX idx_tier_pending_approval_status ON tier_pending_approval(status);
CREATE INDEX idx_tier_pending_approval_fl_deleted ON tier_pending_approval(fl_deleted);
CREATE INDEX idx_tier_pending_approval_status_fl_deleted ON tier_pending_approval(status, fl_deleted);
CREATE INDEX idx_tier_pending_approval_date_creation ON tier_pending_approval(date_creation);

-- Table tiers_role
CREATE TABLE tiers_role (
    uuid UUID PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    description TEXT,
    couleur VARCHAR(7),
    ordre_affichage INTEGER DEFAULT 0 NOT NULL,
    actif BOOLEAN DEFAULT true NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fl_deleted BOOLEAN DEFAULT false NOT NULL
);

CREATE INDEX idx_tiers_role_code ON tiers_role(code);
CREATE INDEX idx_tiers_role_actif ON tiers_role(actif) WHERE fl_deleted = false;
CREATE INDEX idx_tiers_role_ordre ON tiers_role(ordre_affichage) WHERE fl_deleted = false;

-- Table tiers_societe_role
CREATE TABLE tiers_societe_role (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_uuid UUID NOT NULL,
    societe_uuid UUID NOT NULL,
    role_uuid UUID NOT NULL,
    commentaire TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_maj TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fl_deleted BOOLEAN DEFAULT false NOT NULL,
    FOREIGN KEY (tier_uuid) REFERENCES tier_entreprise(uuid),
    FOREIGN KEY (societe_uuid) REFERENCES societe(uuid),
    FOREIGN KEY (role_uuid) REFERENCES tiers_role(uuid)
);

CREATE UNIQUE INDEX idx_tiers_societe_role_unique ON tiers_societe_role(tier_uuid, societe_uuid, role_uuid) WHERE fl_deleted = false;
CREATE INDEX idx_tiers_societe_role_tier ON tiers_societe_role(tier_uuid) WHERE fl_deleted = false;
CREATE INDEX idx_tiers_societe_role_societe ON tiers_societe_role(societe_uuid) WHERE fl_deleted = false;
CREATE INDEX idx_tiers_societe_role_role ON tiers_societe_role(role_uuid) WHERE fl_deleted = false;

-- Note: Les dates de création (date_creation) et de mise à jour (date_maj)
-- sont maintenant gérées automatiquement par TypeORM via les décorateurs:
-- @CreateDateColumn pour date_creation
-- @UpdateDateColumn pour date_maj
-- Les triggers de base de données ne sont plus nécessaires.
