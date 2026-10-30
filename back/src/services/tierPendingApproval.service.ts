import { AppDataSource } from '../config/database';
import { In } from 'typeorm';
import { TiersPendingApproval } from '../entities/tierPendingApproval';
import { Tiers } from '../entities/tiers';
import { TierGlobalAttributeValue } from '../entities/tierGlobalAttributeValue';
import { CustomAttribute } from '../entities/customAttribute';
import {
  SubmitTiersForApprovalDto,
  ApproveTiersDto,
  RejectTiersDto,
  BulkSubmitTiersDto,
  ApprovalStatus,
  PorteeChamp,
} from '../dto';
import { randomUUID } from 'crypto';
import { BusinessError } from '../middleware/errorHandler';

export class TierPendingApprovalService {
  private pendingRepository = AppDataSource.getRepository(TiersPendingApproval);
  private tiersRepository = AppDataSource.getRepository(Tiers);
  private tierGlobalAttributeValueRepository = AppDataSource.getRepository(TierGlobalAttributeValue);
  private customAttributeRepository = AppDataSource.getRepository(CustomAttribute);

  async findAll(status?: string): Promise<TiersPendingApproval[]> {
    const query = this.pendingRepository
      .createQueryBuilder('pending')
      .where('pending.flDeleted = :flDeleted', { flDeleted: false });

    if (status) {
      query.andWhere('pending.status = :status', { status });
    }

    query.orderBy('pending.dateCreation', 'DESC');

    return query.getMany();
  }

  async findById(uuid: string): Promise<TiersPendingApproval | null> {
    return this.pendingRepository.findOne({
      where: { uuid, flDeleted: false },
    });
  }

  async submitForApproval(data: SubmitTiersForApprovalDto): Promise<TiersPendingApproval> {
    const uuid = randomUUID();

    // Détecter les doublons potentiels
    const potentialDuplicates = await this.detectDuplicates(data);

    const pendingData: any = {
      uuid,
      status: ApprovalStatus.PENDING,
      source: data.source || 'manual',
      actif: data.actif ?? true,
    };

    // Ajouter seulement les propriétés non-null et non-undefined
    if (data.externalReference !== undefined && data.externalReference !== null) pendingData.externalReference = data.externalReference;
    if (data.submittedBy !== undefined && data.submittedBy !== null) pendingData.submittedBy = data.submittedBy;
    if (data.submissionComment !== undefined && data.submissionComment !== null) pendingData.submissionComment = data.submissionComment;
    if (potentialDuplicates.length > 0) pendingData.potentialDuplicates = potentialDuplicates;

    // Données du tiers
    if (data.typeTiers !== undefined && data.typeTiers !== null) pendingData.typeTiers = data.typeTiers;
    if (data.siren !== undefined && data.siren !== null) pendingData.siren = data.siren;
    if (data.siret !== undefined && data.siret !== null) pendingData.siret = data.siret;
    if (data.raisonSociale !== undefined && data.raisonSociale !== null) pendingData.raisonSociale = data.raisonSociale;
    if (data.nomCommercial !== undefined && data.nomCommercial !== null) pendingData.nomCommercial = data.nomCommercial;
    if (data.formeJuridique !== undefined && data.formeJuridique !== null) pendingData.formeJuridique = data.formeJuridique;
    if (data.typeEntreprise !== undefined && data.typeEntreprise !== null) pendingData.typeEntreprise = data.typeEntreprise;
    if (data.capitalSocial !== undefined && data.capitalSocial !== null) pendingData.capitalSocial = data.capitalSocial;
    if (data.nomPrenom !== undefined && data.nomPrenom !== null) pendingData.nomPrenom = data.nomPrenom;
    if (data.villeRegistre !== undefined && data.villeRegistre !== null) pendingData.villeRegistre = data.villeRegistre;
    if (data.dateImmatriculation !== undefined && data.dateImmatriculation !== null) pendingData.dateImmatriculation = data.dateImmatriculation;
    if (data.codeTvaIntracom !== undefined && data.codeTvaIntracom !== null) pendingData.codeTvaIntracom = data.codeTvaIntracom;
    if (data.regimeTva !== undefined && data.regimeTva !== null) pendingData.regimeTva = data.regimeTva;
    if (data.paysIso !== undefined && data.paysIso !== null) pendingData.paysIso = data.paysIso;
    if (data.natureAdresse !== undefined && data.natureAdresse !== null) pendingData.natureAdresse = data.natureAdresse;
    if (data.adresseLigne1 !== undefined && data.adresseLigne1 !== null) pendingData.adresseLigne1 = data.adresseLigne1;
    if (data.adresseLigne2 !== undefined && data.adresseLigne2 !== null) pendingData.adresseLigne2 = data.adresseLigne2;
    if (data.adresseLigne3 !== undefined && data.adresseLigne3 !== null) pendingData.adresseLigne3 = data.adresseLigne3;
    if (data.cedex !== undefined && data.cedex !== null) pendingData.cedex = data.cedex;
    if (data.codePostal !== undefined && data.codePostal !== null) pendingData.codePostal = data.codePostal;
    if (data.ville !== undefined && data.ville !== null) pendingData.ville = data.ville;
    if (data.region !== undefined && data.region !== null) pendingData.region = data.region;
    if (data.emailFacturation !== undefined && data.emailFacturation !== null) pendingData.emailFacturation = data.emailFacturation;
    if (data.iban !== undefined && data.iban !== null) pendingData.iban = data.iban;
    if (data.bic !== undefined && data.bic !== null) pendingData.bic = data.bic;
    if (data.modePaiement !== undefined && data.modePaiement !== null) pendingData.modePaiement = data.modePaiement;
    if (data.delaiPaiementJours !== undefined && data.delaiPaiementJours !== null) pendingData.delaiPaiementJours = data.delaiPaiementJours;
    if (data.refCommandeObligatoire !== undefined && data.refCommandeObligatoire !== null) pendingData.refCommandeObligatoire = data.refCommandeObligatoire;

    const pending = this.pendingRepository.create(pendingData);

    const savedPending = await this.pendingRepository.save(pending);
    return (Array.isArray(savedPending) ? savedPending[0] : savedPending) as TiersPendingApproval;
  }

  async bulkSubmit(data: BulkSubmitTiersDto): Promise<{
    submitted: number;
    errors: Array<{ index: number; error: string }>;
  }> {
    const results = {
      submitted: 0,
      errors: [] as Array<{ index: number; error: string }>,
    };

    for (let i = 0; i < data.tiers.length; i++) {
      try {
        const tier = data.tiers[i];
        if (!tier) continue;

        const tierData = {
          ...tier,
          source: data.source,
          submittedBy: data.submittedBy,
          actif: tier.actif ?? true,
        };
        await this.submitForApproval(tierData);
        results.submitted++;
      } catch (error: any) {
        results.errors.push({
          index: i,
          error: error.message || 'Erreur inconnue',
        });
      }
    }

    return results;
  }

  async approve(uuid: string, data: ApproveTiersDto): Promise<Tiers> {
    const pending = await this.findById(uuid);

    if (!pending) {
      throw new BusinessError('Tiers en attente introuvable', 404);
    }

    if (pending.status !== ApprovalStatus.PENDING) {
      throw new BusinessError('Ce tiers a déjà été traité', 400);
    }

    // Utiliser les données modifiées si fournies, sinon utiliser les données originales du pending
    const tierData = data.modifiedData || {};
    const finalSiren = tierData.siren ?? pending.siren;
    const finalSiret = tierData.siret ?? pending.siret;

    // VÉRIFICATION ANTI-DOUBLON : Chercher un tiers existant avec le même SIREN ou SIRET
    let existingTier: Tiers | null = null;

    if (finalSiren) {
      existingTier = await this.tiersRepository.findOne({
        where: { siren: finalSiren, flDeleted: false },
      });
    }

    if (!existingTier && finalSiret) {
      existingTier = await this.tiersRepository.findOne({
        where: { siret: finalSiret, flDeleted: false },
      });
    }

    // Si un tiers existe déjà, lever une erreur pour éviter le doublon
    if (existingTier) {
      throw new BusinessError(
        `Un tiers existe déjà avec ce ${finalSiren ? 'SIREN' : 'SIRET'} : ${existingTier.raisonSociale} (UUID: ${existingTier.uuid})`,
        409
      );
    }

    // Créer le tiers dans la table principale
    const newTiersData: any = {
      uuid: randomUUID(),
      actif: tierData.actif ?? pending.actif,
    };

    // Ajouter les propriétés non-null et non-undefined
    const val = (key: string) => (tierData as any)[key] ?? (pending as any)[key];

    if (val('typeTiers') !== undefined && val('typeTiers') !== null) newTiersData.typeTiers = val('typeTiers');
    if (finalSiren !== undefined && finalSiren !== null) newTiersData.siren = finalSiren;
    if (finalSiret !== undefined && finalSiret !== null) newTiersData.siret = finalSiret;
    if (val('raisonSociale') !== undefined && val('raisonSociale') !== null) newTiersData.raisonSociale = val('raisonSociale');
    if (val('nomCommercial') !== undefined && val('nomCommercial') !== null) newTiersData.nomCommercial = val('nomCommercial');
    if (val('formeJuridique') !== undefined && val('formeJuridique') !== null) newTiersData.formeJuridique = val('formeJuridique');
    if (val('typeEntreprise') !== undefined && val('typeEntreprise') !== null) newTiersData.typeEntreprise = val('typeEntreprise');
    if (val('capitalSocial') !== undefined && val('capitalSocial') !== null) newTiersData.capitalSocial = val('capitalSocial');
    if (val('nomPrenom') !== undefined && val('nomPrenom') !== null) newTiersData.nomPrenom = val('nomPrenom');
    if (val('villeRegistre') !== undefined && val('villeRegistre') !== null) newTiersData.villeRegistre = val('villeRegistre');
    if (val('dateImmatriculation') !== undefined && val('dateImmatriculation') !== null) newTiersData.dateImmatriculation = val('dateImmatriculation');
    if (val('codeTvaIntracom') !== undefined && val('codeTvaIntracom') !== null) newTiersData.codeTvaIntracom = val('codeTvaIntracom');
    if (val('regimeTva') !== undefined && val('regimeTva') !== null) newTiersData.regimeTva = val('regimeTva');
    if (val('paysIso') !== undefined && val('paysIso') !== null) newTiersData.paysIso = val('paysIso');
    if (val('natureAdresse') !== undefined && val('natureAdresse') !== null) newTiersData.natureAdresse = val('natureAdresse');
    if (val('adresseLigne1') !== undefined && val('adresseLigne1') !== null) newTiersData.adresseLigne1 = val('adresseLigne1');
    if (val('adresseLigne2') !== undefined && val('adresseLigne2') !== null) newTiersData.adresseLigne2 = val('adresseLigne2');
    if (val('adresseLigne3') !== undefined && val('adresseLigne3') !== null) newTiersData.adresseLigne3 = val('adresseLigne3');
    if (val('cedex') !== undefined && val('cedex') !== null) newTiersData.cedex = val('cedex');
    if (val('codePostal') !== undefined && val('codePostal') !== null) newTiersData.codePostal = val('codePostal');
    if (val('ville') !== undefined && val('ville') !== null) newTiersData.ville = val('ville');
    if (val('region') !== undefined && val('region') !== null) newTiersData.region = val('region');
    if (val('emailFacturation') !== undefined && val('emailFacturation') !== null) newTiersData.emailFacturation = val('emailFacturation');
    if (val('iban') !== undefined && val('iban') !== null) newTiersData.iban = val('iban');
    if (val('bic') !== undefined && val('bic') !== null) newTiersData.bic = val('bic');
    if (val('modePaiement') !== undefined && val('modePaiement') !== null) newTiersData.modePaiement = val('modePaiement');
    if (val('delaiPaiementJours') !== undefined && val('delaiPaiementJours') !== null) newTiersData.delaiPaiementJours = val('delaiPaiementJours');
    if (val('refCommandeObligatoire') !== undefined && val('refCommandeObligatoire') !== null) newTiersData.refCommandeObligatoire = val('refCommandeObligatoire');

    const tiers = this.tiersRepository.create(newTiersData);

    const savedTiersArray = await this.tiersRepository.save(tiers);
    const savedTiers = (Array.isArray(savedTiersArray) ? savedTiersArray[0] : savedTiersArray) as Tiers;

    // Sauvegarder les attributs personnalisés globaux si fournis
    if (data.globalAttributes && Object.keys(data.globalAttributes).length > 0) {
      const attributeUuids = Object.keys(data.globalAttributes);

      // Charger tous les attributs en une seule requête
      const attributes = await this.customAttributeRepository.find({
        where: {
          uuid: In(attributeUuids),
          portee: PorteeChamp.GLOBAL,
          flDeleted: false,
        },
      });

      const attributeMap = new Map(attributes.map(attr => [attr.uuid, attr]));
      const globalAttributeValues = [];

      for (const [attributeUuid, valeur] of Object.entries(data.globalAttributes)) {
        const attribute = attributeMap.get(attributeUuid);
        if (attribute && valeur !== null && valeur !== undefined && valeur !== '') {
          const globalAttributeValue = this.tierGlobalAttributeValueRepository.create({
            tiersUuid: savedTiers.uuid,
            attributeUuid: attribute.uuid,
            valeur: valeur as string,
          });
          globalAttributeValues.push(globalAttributeValue);
        }
      }

      if (globalAttributeValues.length > 0) {
        await this.tierGlobalAttributeValueRepository.save(globalAttributeValues);
      }
    }

    // Mettre à jour le statut du pending
    pending.status = ApprovalStatus.APPROVED;
    pending.reviewedBy = data.reviewedBy;
    pending.reviewedAt = new Date();
    if (data.reviewComment !== undefined && data.reviewComment !== null) {
      pending.reviewComment = data.reviewComment;
    }
    pending.approvedTiersUuid = savedTiers.uuid;

    await this.pendingRepository.save(pending);

    return savedTiers;
  }

  async reject(uuid: string, data: RejectTiersDto): Promise<TiersPendingApproval> {
    const pending = await this.findById(uuid);

    if (!pending) {
      throw new BusinessError('Tiers en attente introuvable', 404);
    }

    if (pending.status !== ApprovalStatus.PENDING) {
      throw new BusinessError('Ce tiers a déjà été traité', 400);
    }

    pending.status = ApprovalStatus.REJECTED;
    pending.reviewedBy = data.reviewedBy;
    pending.reviewedAt = new Date();
    if (data.reviewComment !== undefined && data.reviewComment !== null) {
      pending.reviewComment = data.reviewComment;
    }

    const saved = await this.pendingRepository.save(pending);
    return (Array.isArray(saved) ? saved[0] : saved) as TiersPendingApproval;
  }

  async delete(uuid: string): Promise<void> {
    const pending = await this.pendingRepository.findOne({ where: { uuid } });

    if (!pending) {
      throw new BusinessError('Tiers en attente introuvable', 404);
    }

    if (pending.flDeleted) {
      throw new BusinessError('Ce tiers en attente a déjà été supprimé', 400);
    }

    // Suppression logique
    pending.flDeleted = true;
    await this.pendingRepository.save(pending);
  }

  async getStatistics(): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  }> {
    const [pending, approved, rejected, total] = await Promise.all([
      this.pendingRepository.count({
        where: { status: ApprovalStatus.PENDING, flDeleted: false },
      }),
      this.pendingRepository.count({
        where: { status: ApprovalStatus.APPROVED, flDeleted: false },
      }),
      this.pendingRepository.count({
        where: { status: ApprovalStatus.REJECTED, flDeleted: false },
      }),
      this.pendingRepository.count({ where: { flDeleted: false } }),
    ]);

    return { pending, approved, rejected, total };
  }

  private async detectDuplicates(
    data: SubmitTiersForApprovalDto
  ): Promise<Array<{ uuid: string; raisonSociale?: string; siren?: string; matchScore: number }>> {
    const duplicates: Array<{
      uuid: string;
      raisonSociale?: string;
      siren?: string;
      matchScore: number;
    }> = [];

    // Recherche par SIREN (correspondance exacte = score 100)
    if (data.siren) {
      const bySiren = await this.tiersRepository.find({
        where: { siren: data.siren, flDeleted: false },
        take: 5,
      });

      bySiren.forEach((tier) => {
        const duplicate: any = {
          uuid: tier.uuid,
          matchScore: 100,
        };
        if (tier.raisonSociale !== undefined && tier.raisonSociale !== null) {
          duplicate.raisonSociale = tier.raisonSociale;
        }
        if (tier.siren !== undefined && tier.siren !== null) {
          duplicate.siren = tier.siren;
        }
        duplicates.push(duplicate);
      });
    }

    // Recherche par SIRET (correspondance exacte = score 100)
    if (data.siret && duplicates.length === 0) {
      const bySiret = await this.tiersRepository.find({
        where: { siret: data.siret, flDeleted: false },
        take: 5,
      });

      bySiret.forEach((tier) => {
        if (!duplicates.some((d) => d.uuid === tier.uuid)) {
          const duplicate: any = {
            uuid: tier.uuid,
            matchScore: 100,
          };
          if (tier.raisonSociale !== undefined && tier.raisonSociale !== null) {
            duplicate.raisonSociale = tier.raisonSociale;
          }
          if (tier.siren !== undefined && tier.siren !== null) {
            duplicate.siren = tier.siren;
          }
          duplicates.push(duplicate);
        }
      });
    }

    // Recherche par raison sociale (correspondance partielle = score 70)
    if (data.raisonSociale && duplicates.length < 5) {
      const byRaisonSociale = await this.tiersRepository
        .createQueryBuilder('tier')
        .where('tier.flDeleted = :flDeleted', { flDeleted: false })
        .andWhere('LOWER(tier.raisonSociale) LIKE LOWER(:raisonSociale)', {
          raisonSociale: `%${data.raisonSociale}%`,
        })
        .take(5 - duplicates.length)
        .getMany();

      byRaisonSociale.forEach((tier) => {
        if (!duplicates.some((d) => d.uuid === tier.uuid)) {
          const duplicate: any = {
            uuid: tier.uuid,
            matchScore: 70,
          };
          if (tier.raisonSociale !== undefined && tier.raisonSociale !== null) {
            duplicate.raisonSociale = tier.raisonSociale;
          }
          if (tier.siren !== undefined && tier.siren !== null) {
            duplicate.siren = tier.siren;
          }
          duplicates.push(duplicate);
        }
      });
    }

    return duplicates;
  }
}
