import { Request, Response } from 'express';
import { RibService } from '../services/rib.service';
import { CreateRibSchema, UpdateRibSchema } from '../dto/rib.dto';
import { asyncHandler, BusinessError } from '../middleware/errorHandler';

export class RibController {
  private ribService = new RibService();

  findAll = asyncHandler(async (req: Request, res: Response) => {
    const includeInactive = req.query.includeInactive === 'true';
    const ribs = await this.ribService.findAll(includeInactive);
    res.json(ribs);
  });

  findBySociete = asyncHandler(async (req: Request, res: Response) => {
    const { societeUuid } = req.params;
    if (!societeUuid) {
      throw new BusinessError('UUID de la société manquant', 400);
    }
    const includeInactive = req.query.includeInactive === 'true';
    const ribs = await this.ribService.findBySociete(societeUuid, includeInactive);
    res.json(ribs);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    const rib = await this.ribService.findById(uuid);

    if (!rib) {
      throw new BusinessError('RIB introuvable', 404);
    }

    res.json(rib);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = CreateRibSchema.parse(req.body);
    const rib = await this.ribService.create(data);
    res.status(201).json(rib);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    const data = UpdateRibSchema.parse(req.body);
    const rib = await this.ribService.update(uuid, data);
    res.json(rib);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    await this.ribService.delete(uuid);
    res.status(204).send();
  });
}
