import { Request, Response } from 'express';
import { TierPendingApprovalService } from '../services/tierPendingApproval.service';
import {
  SubmitTiersForApprovalSchema,
  ApproveTiersSchema,
  RejectTiersSchema,
  BulkSubmitTiersSchema,
} from '../dto';
import { asyncHandler, BusinessError } from '../middleware/errorHandler';

export class TierPendingApprovalController {
  private service = new TierPendingApprovalService();

  findAll = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;
    const pendingTiers = await this.service.findAll(status as string | undefined);
    res.json(pendingTiers);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }

    const pendingTier = await this.service.findById(uuid);

    if (!pendingTier) {
      throw new BusinessError('Tiers en attente introuvable', 404);
    }

    res.json(pendingTier);
  });

  submit = asyncHandler(async (req: Request, res: Response) => {
    const data = SubmitTiersForApprovalSchema.parse(req.body);
    const pendingTier = await this.service.submitForApproval(data);
    res.status(201).json(pendingTier);
  });

  bulkSubmit = asyncHandler(async (req: Request, res: Response) => {
    const data = BulkSubmitTiersSchema.parse(req.body);
    const result = await this.service.bulkSubmit(data);
    res.status(201).json(result);
  });

  approve = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }

    const data = ApproveTiersSchema.parse(req.body);
    const tiers = await this.service.approve(uuid, data);
    res.json(tiers);
  });

  reject = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }

    const data = RejectTiersSchema.parse(req.body);
    const pendingTier = await this.service.reject(uuid, data);
    res.json(pendingTier);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }

    await this.service.delete(uuid);
    res.status(204).send();
  });

  getStatistics = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await this.service.getStatistics();
    res.json(stats);
  });
}
