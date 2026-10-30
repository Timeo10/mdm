import { AppDataSource } from '../config/database';
import { In } from 'typeorm';
import { Tiers } from '../entities/tiers';
import { TiersSociete } from '../entities/tiersSociete';
import { CustomAttributeValue } from '../entities/customAttributeValue';
import { TierGlobalAttributeValue } from '../entities/tierGlobalAttributeValue';
import { CustomAttribute } from '../entities/customAttribute';
import { CreateTiersDto, UpdateTiersDto, AttachTiersToSocieteDto, PorteeChamp } from '../dto';
import { randomUUID } from 'crypto';
import { BusinessError } from '../middleware/errorHandler';
import { TiersAuditService, AuditContext } from './tiersAudit.service';
import { TiersAuditAction } from '../entities/tiersAuditLog';

export class TiersService {
  private tiersRepository = AppDataSource.getRepository(Tiers);
  private tiersSocieteRepository = AppDataSource.getRepository(TiersSociete);
  private attributeValueRepository = AppDataSource.getRepository(CustomAttributeValue);
  private tierGlobalAttributeValueRepository = AppDataSource.getRepository(TierGlobalAttributeValue);
  private customAttributeRepository = AppDataSource.getRepository(CustomAttribute);
  private auditService = new TiersAuditService();

  private validateTiersCountryRules(data: {
    paysIso?: string | null | undefined;
    siret?: string | null | undefined;
    codeTvaIntracom?: string | null | undefined;
  }) {
    const paysIso = data.paysIso?.trim();
    const siret = data.siret?.trim();
    const codeTvaIntracom = data.codeTvaIntracom?.trim();

    if (!paysIso) {
      throw new BusinessError('Le code pays est obligatoire', 400);
    }

    if (paysIso.toUpperCase() === 'FR') {
      if (!siret) {
        throw new BusinessError('Le SIRET est obligatoire pour un tiers en France', 400);
      }
      return;
    }

    if (!codeTvaIntracom) {
      throw new BusinessError('Le code TVA intracommunautaire est obligatoire hors France', 400);
    }
  }

  private getTiersBusinessKeys(
    data: {
      paysIso?: string | null | undefined;
      siret?: string | null | undefined;
      siren?: string | null | undefined;
      codeTvaIntracom?: string | null | undefined;
    },
    options: { includeFallbackKeys?: boolean } = {}
  ): Array<{ field: 'siret' | 'siren' | 'codeTvaIntracom'; value: string }> {
    const { includeFallbackKeys = true } = options;
    const paysIso = data.paysIso?.trim().toUpperCase();

    if (paysIso === 'FR') {
      const keys: Array<{ field: 'siret' | 'siren'; value: string }> = [
        { field: 'siret', value: data.siret?.replace(/\D/g, '') || '' },
      ];

      if (includeFallbackKeys) {
        keys.push({ field: 'siren', value: data.siren?.replace(/\D/g, '') || '' });
      }

      return keys.filter((key) => key.value);
    }

    const key: { field: 'codeTvaIntracom'; value: string } = {
      field: 'codeTvaIntracom',
      value: data.codeTvaIntracom?.trim() || '',
    };

    return key.value ? [key] : [];
  }

  private async findByBusinessKey(
    data: {
      paysIso?: string | null | undefined;
      siret?: string | null | undefined;
      siren?: string | null | undefined;
      codeTvaIntracom?: string | null | undefined;
    },
    excludeUuid?: string,
    options: { includeFallbackKeys?: boolean } = {}
  ): Promise<Tiers | null> {
    const keys = this.getTiersBusinessKeys(data, options);
    if (keys.length === 0) {
      return null;
    }

    for (const key of keys) {
      const query = this.tiersRepository
        .createQueryBuilder('tiers')
        .where('tiers.flDeleted = :flDeleted', { flDeleted: false });

      if (key.field === 'siret' || key.field === 'siren') {
        query.andWhere(`regexp_replace(COALESCE(tiers.${key.field}, ''), '\\D', '', 'g') = :value`, {
          value: key.value,
        });
      } else {
        query.andWhere(`LOWER(TRIM(COALESCE(tiers.${key.field}, ''))) = LOWER(TRIM(:value))`, {
          value: key.value,
        });
      }

      if (excludeUuid) {
        query.andWhere('tiers.uuid != :excludeUuid', { excludeUuid });
      }

      const tiers = await query.getOne();
      if (tiers) {
        return tiers;
      }
    }

    return null;
  }

  private applyDefaultTypeTiers<T extends { typeTiers?: string | null | undefined }>(data: T): T {
    if (data.typeTiers?.trim()) {
      return { ...data, typeTiers: data.typeTiers.trim() };
    }

    return { ...data, typeTiers: 'Fournisseur' };
  }

  private async generateCodeTiersMdm(): Promise<string> {
    try {
      const [result] = await this.tiersRepository.query(
        "SELECT 'MDM' || nextval('tiers_code_tiers_mdm_seq') AS code"
      );
      if (result?.code) {
        return result.code;
      }
    } catch {
      // Fallback utile tant que le script SQL d'ajout de sequence n'a pas ete execute.
    }

    const result = await this.tiersRepository
      .createQueryBuilder('tiers')
      .select(
        "COALESCE(MAX(CAST(SUBSTRING(tiers.code_tiers_mdm FROM 4) AS integer)), 0) + 1",
        'next'
      )
      .where("tiers.code_tiers_mdm ~ '^MDM[0-9]+$'")
      .getRawOne<{ next: string | number }>();

    return `MDM${Number(result?.next || 1)}`;
  }

  async findAll(
    options: {
      includeInactive?: boolean;
      page?: number;
      limit?: number;
      search?: string | undefined;
    } = {}
  ): Promise<{ data: Tiers[]; total: number; page: number; limit: number; totalPages: number }> {
    const { includeInactive = false, page = 1, limit = 10, search } = options;

    const query = this.tiersRepository
      .createQueryBuilder('tiers')
      .where('tiers.flDeleted = :flDeleted', { flDeleted: false });

    if (!includeInactive) {
      query.andWhere('tiers.actif = :actif', { actif: true });
    }

    if (search) {
      query.andWhere(
        '(LOWER(tiers.codeTiersMdm) LIKE LOWER(:search) OR LOWER(tiers.siren) LIKE LOWER(:search) OR LOWER(tiers.siret) LIKE LOWER(:search) OR LOWER(tiers.raisonSociale) LIKE LOWER(:search) OR LOWER(tiers.typeTiers) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    const total = await query.getCount();
    const totalPages = Math.ceil(total / limit);

    const data = await query
      .orderBy('tiers.raisonSociale', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit, totalPages };
  }

  async findById(uuid: string): Promise<Tiers | null> {
    return this.tiersRepository.findOne({
      where: { uuid, flDeleted: false },
    });
  }

  async findBySiren(siren: string): Promise<Tiers | null> {
    return this.tiersRepository.findOne({ where: { siren, flDeleted: false } });
  }

  async findWithSocietes(uuid: string) {
    const tiers = await this.tiersRepository.findOne({ where: { uuid, flDeleted: false } });
    if (!tiers) {
      return null;
    }

    const tiersSocietes = await this.tiersSocieteRepository.find({
      where: { tiersUuid: uuid, flDeleted: false },
      relations: ['societe', 'attributeValues', 'attributeValues.attribute'],
    });

    // Récupérer les attributs globaux du tiers
    const globalAttributeValues = await this.tierGlobalAttributeValueRepository.find({
      where: { tiersUuid: uuid },
      relations: ['attribute'],
    });

    const globalAttributes = globalAttributeValues.reduce(
      (acc, valeur) => {
        if (valeur.attribute) {
          acc[valeur.attribute.code] = valeur.valeur || null;
        }
        return acc;
      },
      {} as Record<string, string | null>
    );

    return {
      ...tiers,
      globalAttributes,
      societes: tiersSocietes.map((ts) => ({
        uuid: ts.uuid,
        societe: ts.societe,
        codeTiersErp: ts.codeTiersErp,
        actif: ts.actif,
        fraisGeneraux: ts.fraisGeneraux,
        fraisMetier: ts.fraisMetier,
        customAttributes: ts.attributeValues?.reduce(
          (acc, valeur) => {
            if (valeur.attribute) {
              acc[valeur.attribute.code] = valeur.valeur || null;
            }
            return acc;
          },
          {} as Record<string, string | null>
        ),
      })),
    };
  }

  async create(data: CreateTiersDto, auditContext?: AuditContext): Promise<Tiers> {
    data = this.applyDefaultTypeTiers(data);
    this.validateTiersCountryRules(data);

    const existingTiers = await this.findByBusinessKey(data);
    if (existingTiers) {
      return this.update(existingTiers.uuid, data, auditContext, { skipDuplicateCheck: true });
    }

    const tiers = this.tiersRepository.create({
      uuid: randomUUID(),
      codeTiersMdm: await this.generateCodeTiersMdm(),
      actif: data.actif ?? true,
      ...(data.typeTiers !== undefined && data.typeTiers !== null && { typeTiers: data.typeTiers }),
      ...(data.siren !== undefined && data.siren !== null && { siren: data.siren }),
      ...(data.siret !== undefined && data.siret !== null && { siret: data.siret }),
      ...(data.raisonSociale !== undefined && data.raisonSociale !== null && { raisonSociale: data.raisonSociale }),
      ...(data.nomCommercial !== undefined && data.nomCommercial !== null && { nomCommercial: data.nomCommercial }),
      ...(data.formeJuridique !== undefined && data.formeJuridique !== null && { formeJuridique: data.formeJuridique }),
      ...(data.typeEntreprise !== undefined && data.typeEntreprise !== null && { typeEntreprise: data.typeEntreprise }),
      ...(data.capitalSocial !== undefined && data.capitalSocial !== null && { capitalSocial: data.capitalSocial }),
      ...(data.nomPrenom !== undefined && data.nomPrenom !== null && { nomPrenom: data.nomPrenom }),
      ...(data.villeRegistre !== undefined && data.villeRegistre !== null && { villeRegistre: data.villeRegistre }),
      ...(data.dateImmatriculation !== undefined && data.dateImmatriculation !== null && { dateImmatriculation: data.dateImmatriculation }),
      ...(data.codeTvaIntracom !== undefined && data.codeTvaIntracom !== null && { codeTvaIntracom: data.codeTvaIntracom }),
      ...(data.regimeTva !== undefined && data.regimeTva !== null && { regimeTva: data.regimeTva }),
      ...(data.paysIso !== undefined && data.paysIso !== null && { paysIso: data.paysIso }),
      ...(data.natureAdresse !== undefined && data.natureAdresse !== null && { natureAdresse: data.natureAdresse }),
      ...(data.adresseLigne1 !== undefined && data.adresseLigne1 !== null && { adresseLigne1: data.adresseLigne1 }),
      ...(data.adresseLigne2 !== undefined && data.adresseLigne2 !== null && { adresseLigne2: data.adresseLigne2 }),
      ...(data.adresseLigne3 !== undefined && data.adresseLigne3 !== null && { adresseLigne3: data.adresseLigne3 }),
      ...(data.cedex !== undefined && data.cedex !== null && { cedex: data.cedex }),
      ...(data.codePostal !== undefined && data.codePostal !== null && { codePostal: data.codePostal }),
      ...(data.ville !== undefined && data.ville !== null && { ville: data.ville }),
      ...(data.region !== undefined && data.region !== null && { region: data.region }),
      ...(data.emailFacturation !== undefined && data.emailFacturation !== null && { emailFacturation: data.emailFacturation }),
      ...(data.iban !== undefined && data.iban !== null && { iban: data.iban }),
      ...(data.bic !== undefined && data.bic !== null && { bic: data.bic }),
      ...(data.modePaiement !== undefined && data.modePaiement !== null && { modePaiement: data.modePaiement }),
      ...(data.delaiPaiementJours !== undefined && data.delaiPaiementJours !== null && { delaiPaiementJours: data.delaiPaiementJours }),
      ...(data.refCommandeObligatoire !== undefined && data.refCommandeObligatoire !== null && { refCommandeObligatoire: data.refCommandeObligatoire }),
    });

    const savedTiers = await this.tiersRepository.save(tiers);

    // Audit: Création du tiers
    await this.auditService.createAuditLog({
      tiersUuid: savedTiers.uuid,
      action: TiersAuditAction.CREATE,
      entityType: 'tiers',
      entityUuid: savedTiers.uuid,
      newValues: data as any,
      description: this.auditService.generateDescription(TiersAuditAction.CREATE),
      ...(auditContext && { context: auditContext }),
    });

    // Enregistrer les attributs globaux - optimisé pour éviter N+1
    if (data.globalAttributes) {
      const attributeCodes = Object.keys(data.globalAttributes);
      const attributes = await this.customAttributeRepository.find({
        where: {
          code: In(attributeCodes),
          portee: PorteeChamp.GLOBAL,
          flDeleted: false,
        },
      });

      const attributeMap = new Map(attributes.map(attr => [attr.code, attr]));
      const globalAttributeValues = [];

      for (const [code, valeur] of Object.entries(data.globalAttributes)) {
        const attribute = attributeMap.get(code);
        if (attribute) {
          const globalAttributeValue = this.tierGlobalAttributeValueRepository.create({
            tiersUuid: savedTiers.uuid,
            attributeUuid: attribute.uuid,
            ...(valeur && valeur !== null && { valeur }),
          });
          globalAttributeValues.push(globalAttributeValue);
        }
      }

      if (globalAttributeValues.length > 0) {
        await this.tierGlobalAttributeValueRepository.save(globalAttributeValues);
      }
    }

    return savedTiers;
  }

  async update(
    uuid: string,
    data: UpdateTiersDto,
    auditContext?: AuditContext,
    options: { skipDuplicateCheck?: boolean } = {}
  ): Promise<Tiers> {
    const tiers = await this.findById(uuid);
    if (!tiers) {
      throw new BusinessError('Tiers introuvable', 404);
    }

    const finalBusinessData = {
      paysIso: data.paysIso ?? tiers.paysIso,
      siret: data.siret ?? tiers.siret,
      siren: data.siren ?? tiers.siren,
      codeTvaIntracom: data.codeTvaIntracom ?? tiers.codeTvaIntracom,
    };

    this.validateTiersCountryRules(finalBusinessData);

    if (!options.skipDuplicateCheck) {
      const duplicateTiers = await this.findByBusinessKey(finalBusinessData, uuid, {
        includeFallbackKeys: false,
      });
      if (duplicateTiers) {
      throw new BusinessError('Un tiers existe dÃ©jÃ  avec cette clÃ© de mise Ã  jour', 409);
      }
    }

    // Sauvegarder les anciennes valeurs pour l'audit
    const oldValues = { ...tiers };

    // Appliquer les modifications
    Object.assign(tiers, data);
    const savedTiers = await this.tiersRepository.save(tiers);

    // Audit: Mise à jour du tiers - ne tracer que les champs modifiés
    // Comparer uniquement les champs présents dans data
    const changedOldValues: Record<string, any> = {};
    const changedNewValues: Record<string, any> = {};
    const changes: Record<string, { old: any; new: any }> = {};

    for (const key in data) {
      const oldValue = (oldValues as any)[key];
      const newValue = (savedTiers as any)[key];

      // Vérifier si la valeur a réellement changé
      if (oldValue !== newValue) {
        changedOldValues[key] = oldValue;
        changedNewValues[key] = newValue;
        changes[key] = {
          old: oldValue,
          new: newValue,
        };
      }
    }

    if (Object.keys(changes).length > 0) {
      await this.auditService.createAuditLog({
        tiersUuid: uuid,
        action: TiersAuditAction.UPDATE,
        entityType: 'tiers',
        entityUuid: uuid,
        oldValues: changedOldValues,
        newValues: changedNewValues,
        changes,
        description: this.auditService.generateDescription(TiersAuditAction.UPDATE, 'tiers', changes),
        ...(auditContext && { context: auditContext }),
      });
    }

    // Mettre à jour les attributs globaux si fournis - optimisé pour éviter N+1
    if (data.globalAttributes) {
      const attributeCodes = Object.keys(data.globalAttributes);

      // Charger tous les attributs en une seule requête
      const attributes = await this.customAttributeRepository.find({
        where: {
          code: In(attributeCodes),
          portee: PorteeChamp.GLOBAL,
          flDeleted: false,
        },
      });

      const attributeMap = new Map(attributes.map(attr => [attr.code, attr]));
      const attributeUuids = attributes.map(attr => attr.uuid);

      // Charger toutes les valeurs existantes en une seule requête
      const existingValues = await this.tierGlobalAttributeValueRepository.find({
        where: {
          tiersUuid: uuid,
          attributeUuid: In(attributeUuids),
        },
      });

      const existingValuesMap = new Map(
        existingValues.map(val => [val.attributeUuid, val])
      );

      const valuesToSave = [];

      for (const [code, valeur] of Object.entries(data.globalAttributes)) {
        const attribute = attributeMap.get(code);
        if (attribute) {
          const existingValue = existingValuesMap.get(attribute.uuid);

          if (existingValue) {
            // Mettre à jour la valeur existante
            if (valeur !== null && valeur !== undefined) {
              existingValue.valeur = valeur;
            }
            valuesToSave.push(existingValue);
          } else {
            // Créer une nouvelle valeur
            const newValue = this.tierGlobalAttributeValueRepository.create({
              tiersUuid: uuid,
              attributeUuid: attribute.uuid,
              ...(valeur && valeur !== null && { valeur }),
            });
            valuesToSave.push(newValue);
          }
        }
      }

      if (valuesToSave.length > 0) {
        await this.tierGlobalAttributeValueRepository.save(valuesToSave);
      }
    }

    return savedTiers;
  }

  async delete(uuid: string, auditContext?: AuditContext): Promise<void> {
    const tiers = await this.tiersRepository.findOne({
      where: { uuid },
    });

    if (!tiers) {
      throw new BusinessError('Tiers introuvable', 404);
    }

    if (tiers.flDeleted) {
      throw new BusinessError('Ce tiers a déjà été supprimé', 400);
    }

    // Sauvegarder les valeurs avant suppression pour l'audit
    const oldValues = { ...tiers };

    // Suppression logique
    tiers.flDeleted = true;
    await this.tiersRepository.save(tiers);

    // Audit: Suppression du tiers
    await this.auditService.createAuditLog({
      tiersUuid: uuid,
      action: TiersAuditAction.DELETE,
      entityType: 'tiers',
      entityUuid: uuid,
      oldValues: oldValues as any,
      description: this.auditService.generateDescription(TiersAuditAction.DELETE),
      ...(auditContext && { context: auditContext }),
    });
  }

  async attachToSociete(data: AttachTiersToSocieteDto, auditContext?: AuditContext): Promise<TiersSociete> {
    const existing = await this.tiersSocieteRepository.findOne({
      where: {
        tiersUuid: data.tiersUuid,
        societeUuid: data.societeUuid,
        flDeleted: false,
      },
    });

    if (existing) {
      throw new BusinessError('Ce tiers est déjà attaché à cette société', 409);
    }

    const tiersSociete = this.tiersSocieteRepository.create({
      tiersUuid: data.tiersUuid,
      societeUuid: data.societeUuid,
      actif: data.actif ?? true,
      fraisGeneraux: data.fraisGeneraux ?? false,
      fraisMetier: data.fraisMetier ?? false,
      ...(data.codeTiersErp !== undefined && data.codeTiersErp !== null && { codeTiersErp: data.codeTiersErp }),
      ...(data.codeAdressagePa !== undefined && data.codeAdressagePa !== null && { codeAdressagePa: data.codeAdressagePa }),
      ...(data.codeRoutageAdvEntrant !== undefined && data.codeRoutageAdvEntrant !== null && { codeRoutageAdvEntrant: data.codeRoutageAdvEntrant }),
    });

    const saved = await this.tiersSocieteRepository.save(tiersSociete);

    // Audit: Attachement à une société
    await this.auditService.createAuditLog({
      tiersUuid: data.tiersUuid,
      action: TiersAuditAction.ATTACH_SOCIETE,
      entityType: 'tiersSociete',
      entityUuid: saved.uuid,
      newValues: data as any,
      description: this.auditService.generateDescription(TiersAuditAction.ATTACH_SOCIETE),
      ...(auditContext && { context: auditContext }),
    });

    // Enregistrer les attributs personnalisés - optimisé pour éviter N+1
    if (data.customAttributes) {
      const attributeCodes = Object.keys(data.customAttributes);
      const attributes = await this.customAttributeRepository.find({
        where: {
          code: In(attributeCodes),
          flDeleted: false,
        },
      });

      const attributeMap = new Map(attributes.map(attr => [attr.code, attr]));
      const attributeValues = [];

      for (const [code, valeur] of Object.entries(data.customAttributes)) {
        const attribute = attributeMap.get(code);
        if (attribute) {
          const attributeValue = this.attributeValueRepository.create({
            tiersSocieteUuid: saved.uuid,
            attributeUuid: attribute.uuid,
            ...(valeur && valeur !== null && { valeur }),
          });
          attributeValues.push(attributeValue);
        }
      }

      if (attributeValues.length > 0) {
        await this.attributeValueRepository.save(attributeValues);
      }
    }

    return saved;
  }

  async detachFromSociete(tierSocieteUuid: string, auditContext?: AuditContext): Promise<void> {
    const tiersSociete = await this.tiersSocieteRepository.findOne({
      where: { uuid: tierSocieteUuid },
    });

    if (!tiersSociete) {
      throw new BusinessError('Liaison tiers-société introuvable', 404);
    }

    if (tiersSociete.flDeleted) {
      throw new BusinessError('Cette liaison tiers-société a déjà été supprimée', 400);
    }

    // Sauvegarder les valeurs avant suppression pour l'audit
    const oldValues = { ...tiersSociete };

    // Suppression logique
    tiersSociete.flDeleted = true;
    await this.tiersSocieteRepository.save(tiersSociete);

    // Audit: Détachement d'une société
    await this.auditService.createAuditLog({
      tiersUuid: tiersSociete.tiersUuid,
      action: TiersAuditAction.DETACH_SOCIETE,
      entityType: 'tiersSociete',
      entityUuid: tierSocieteUuid,
      oldValues: oldValues as any,
      description: this.auditService.generateDescription(TiersAuditAction.DETACH_SOCIETE),
      ...(auditContext && { context: auditContext }),
    });
  }

  async updateTiersSociete(tierSocieteUuid: string, data: AttachTiersToSocieteDto, auditContext?: AuditContext): Promise<TiersSociete> {
    const tiersSociete = await this.tiersSocieteRepository.findOne({
      where: { uuid: tierSocieteUuid, flDeleted: false },
    });

    if (!tiersSociete) {
      throw new BusinessError('Liaison tiers-société introuvable', 404);
    }

    // Sauvegarder les anciennes valeurs pour l'audit
    const oldValues = { ...tiersSociete };

    // Mettre à jour les champs de base
    if (data.codeTiersErp !== undefined && data.codeTiersErp !== null) {
      tiersSociete.codeTiersErp = data.codeTiersErp;
    }
    if (data.actif !== undefined && data.actif !== null) {
      tiersSociete.actif = data.actif;
    }
    if (data.fraisGeneraux !== undefined) {
      tiersSociete.fraisGeneraux = data.fraisGeneraux;
    }
    if (data.fraisMetier !== undefined) {
      tiersSociete.fraisMetier = data.fraisMetier;
    }
    if (data.codeAdressagePa !== undefined && data.codeAdressagePa !== null) {
      tiersSociete.codeAdressagePa = data.codeAdressagePa;
    }
    if (data.codeRoutageAdvEntrant !== undefined && data.codeRoutageAdvEntrant !== null) {
      tiersSociete.codeRoutageAdvEntrant = data.codeRoutageAdvEntrant;
    }

    const savedTiersSociete = await this.tiersSocieteRepository.save(tiersSociete);

    // Audit: Mise à jour de la relation tiers-société - ne tracer que les champs modifiés
    // Comparer uniquement les champs présents dans data
    const changedOldValues: Record<string, any> = {};
    const changedNewValues: Record<string, any> = {};
    const changes: Record<string, { old: any; new: any }> = {};

    for (const key in data) {
      const oldValue = (oldValues as any)[key];
      const newValue = (savedTiersSociete as any)[key];

      // Vérifier si la valeur a réellement changé
      if (oldValue !== newValue) {
        changedOldValues[key] = oldValue;
        changedNewValues[key] = newValue;
        changes[key] = {
          old: oldValue,
          new: newValue,
        };
      }
    }

    if (Object.keys(changes).length > 0) {
      await this.auditService.createAuditLog({
        tiersUuid: tiersSociete.tiersUuid,
        action: TiersAuditAction.UPDATE_TIERS_SOCIETE,
        entityType: 'tiersSociete',
        entityUuid: tierSocieteUuid,
        oldValues: changedOldValues,
        newValues: changedNewValues,
        changes,
        description: this.auditService.generateDescription(TiersAuditAction.UPDATE_TIERS_SOCIETE, 'tiersSociete', changes),
        ...(auditContext && { context: auditContext }),
      });
    }

    // Mettre à jour les attributs personnalisés si fournis - optimisé pour éviter N+1
    if (data.customAttributes) {
      const attributeCodes = Object.keys(data.customAttributes);

      // Charger tous les attributs en une seule requête
      const attributes = await this.customAttributeRepository.find({
        where: {
          code: In(attributeCodes),
          flDeleted: false,
        },
      });

      const attributeMap = new Map(attributes.map(attr => [attr.code, attr]));
      const attributeUuids = attributes.map(attr => attr.uuid);

      // Charger toutes les valeurs existantes en une seule requête
      const existingValues = await this.attributeValueRepository.find({
        where: {
          tiersSocieteUuid: tierSocieteUuid,
          attributeUuid: In(attributeUuids),
        },
      });

      const existingValuesMap = new Map(
        existingValues.map(val => [val.attributeUuid, val])
      );

      const valuesToSave = [];

      for (const [code, valeur] of Object.entries(data.customAttributes)) {
        const attribute = attributeMap.get(code);
        if (attribute) {
          const existingValue = existingValuesMap.get(attribute.uuid);

          if (existingValue) {
            // Mettre à jour la valeur existante
            if (valeur !== null && valeur !== undefined) {
              existingValue.valeur = valeur;
            }
            valuesToSave.push(existingValue);
          } else {
            // Créer une nouvelle valeur
            const newValue = this.attributeValueRepository.create({
              tiersSocieteUuid: tierSocieteUuid,
              attributeUuid: attribute.uuid,
              ...(valeur && valeur !== null && { valeur }),
            });
            valuesToSave.push(newValue);
          }
        }
      }

      if (valuesToSave.length > 0) {
        await this.attributeValueRepository.save(valuesToSave);
      }
    }

    return savedTiersSociete;
  }

  async updateCustomAttribute(
    tierSocieteUuid: string,
    attributeUuid: string,
    valeur: string | null
  ): Promise<CustomAttributeValue> {
    let attributeValue = await this.attributeValueRepository.findOne({
      where: {
        tiersSocieteUuid: tierSocieteUuid,
        attributeUuid,
      },
    });

    if (attributeValue) {
      Object.assign(attributeValue, { valeur: valeur ?? undefined });
    } else {
      attributeValue = this.attributeValueRepository.create({
        tiersSocieteUuid: tierSocieteUuid,
        attributeUuid,
        ...(valeur !== null && valeur !== undefined && { valeur }),
      });
    }

    return this.attributeValueRepository.save(attributeValue);
  }

  async searchSimilar(criteria: {
    siren?: string;
    siret?: string;
    raisonSociale?: string;
  }): Promise<Tiers[]> {
    const queryBuilder = this.tiersRepository.createQueryBuilder('tier');
    queryBuilder.where('tier.flDeleted = :flDeleted', { flDeleted: false });

    const conditions: string[] = [];

    if (criteria.siren) {
      conditions.push('tier.siren = :siren');
    }

    if (criteria.siret) {
      conditions.push('tier.siret = :siret');
    }

    if (criteria.raisonSociale) {
      conditions.push('LOWER(tier.raisonSociale) LIKE LOWER(:raisonSociale)');
    }

    if (conditions.length > 0) {
      queryBuilder.andWhere(`(${conditions.join(' OR ')})`, {
        siren: criteria.siren,
        siret: criteria.siret,
        raisonSociale: criteria.raisonSociale ? `%${criteria.raisonSociale}%` : undefined,
      });
    }

    queryBuilder.orderBy('tier.raisonSociale', 'ASC');
    queryBuilder.limit(10);

    return queryBuilder.getMany();
  }
}
