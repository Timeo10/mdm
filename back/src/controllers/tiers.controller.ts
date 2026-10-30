import { Request, Response } from 'express';
import { TiersService } from '../services/tiers.service';
import {
  CreateTiersSchema,
  UpdateTiersSchema,
  AttachTiersToSocieteSchema,
} from '../dto';
import { asyncHandler, BusinessError } from '../middleware/errorHandler';
import { TiersAuditService } from '../services/tiersAudit.service';

export class TiersController {
  private tiersService = new TiersService();
  private auditService = new TiersAuditService();

  findAll = asyncHandler(async (req: Request, res: Response) => {
    const includeInactive = req.query.includeInactive === 'true';
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const search = req.query.search as string | undefined;

    const result = await this.tiersService.findAll({
      includeInactive,
      page,
      limit,
      search,
    });
    res.json(result);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    const tiers = await this.tiersService.findById(uuid);

    if (!tiers) {
      throw new BusinessError('Tiers introuvable', 404);
    }

    res.json(tiers);
  });

  findWithSocietes = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    const tiers = await this.tiersService.findWithSocietes(uuid);

    if (!tiers) {
      throw new BusinessError('Tiers introuvable', 404);
    }

    res.json(tiers);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = CreateTiersSchema.parse(req.body);
    const auditContext = this.auditService.extractContextFromRequest(req);
    const tiers = await this.tiersService.create(data, auditContext);
    res.status(201).json(tiers);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    const data = UpdateTiersSchema.parse(req.body);
    const auditContext = this.auditService.extractContextFromRequest(req);
    const tiers = await this.tiersService.update(uuid, data, auditContext);
    res.json(tiers);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    const auditContext = this.auditService.extractContextFromRequest(req);
    await this.tiersService.delete(uuid, auditContext);
    res.status(204).send();
  });

  attachToSociete = asyncHandler(async (req: Request, res: Response) => {
    const data = AttachTiersToSocieteSchema.parse(req.body);
    const auditContext = this.auditService.extractContextFromRequest(req);
    const tiersSociete = await this.tiersService.attachToSociete(data, auditContext);
    res.status(201).json(tiersSociete);
  });

  detachFromSociete = asyncHandler(async (req: Request, res: Response) => {
    const { tierSocieteUuid } = req.params;
    if (!tierSocieteUuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    const auditContext = this.auditService.extractContextFromRequest(req);
    await this.tiersService.detachFromSociete(tierSocieteUuid, auditContext);
    res.status(204).send();
  });

  updateTiersSociete = asyncHandler(async (req: Request, res: Response) => {
    const { tierSocieteUuid } = req.params;
    if (!tierSocieteUuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    const data = AttachTiersToSocieteSchema.parse(req.body);
    const auditContext = this.auditService.extractContextFromRequest(req);
    const tiersSociete = await this.tiersService.updateTiersSociete(tierSocieteUuid, data, auditContext);
    res.json(tiersSociete);
  });

  updateCustomAttribute = asyncHandler(async (req: Request, res: Response) => {
    const { tierSocieteUuid, attributeUuid } = req.params;
    if (!tierSocieteUuid || !attributeUuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    const { valeur } = req.body;
    const attributeValue = await this.tiersService.updateCustomAttribute(
      tierSocieteUuid,
      attributeUuid,
      valeur
    );
    res.json(attributeValue);
  });

  searchSimilar = asyncHandler(async (req: Request, res: Response) => {
    const { siren, siret, raisonSociale } = req.query;

    if (!siren && !siret && !raisonSociale) {
      throw new BusinessError('Au moins un critère de recherche est requis', 400);
    }

    const criteria: {
      siren?: string;
      siret?: string;
      raisonSociale?: string;
    } = {};

    if (siren) criteria.siren = siren as string;
    if (siret) criteria.siret = siret as string;
    if (raisonSociale) criteria.raisonSociale = raisonSociale as string;

    const results = await this.tiersService.searchSimilar(criteria);

    res.json(results);
  });

  getAuditHistory = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const action = req.query.action as string | undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const result = await this.auditService.getAuditLogsByTiers(uuid, {
      limit,
      offset,
      action: action as any,
      startDate,
      endDate,
    });

    res.json(result);
  });
}
