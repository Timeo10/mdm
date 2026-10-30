import { Request, Response } from 'express';
import { SocieteService } from '../services/societe.service';
import { CreateSocieteSchema, UpdateSocieteSchema } from '../dto';
import { asyncHandler, BusinessError } from '../middleware/errorHandler';

export class SocieteController {
  private societeService = new SocieteService();

  findAll = asyncHandler(async (req: Request, res: Response) => {
    const includeInactive = req.query.includeInactive === 'true';
    const societes = await this.societeService.findAll(includeInactive);
    res.json(societes);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    const societe = await this.societeService.findById(uuid);

    if (!societe) {
      throw new BusinessError('Société introuvable', 404);
    }

    res.json(societe);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = CreateSocieteSchema.parse(req.body);
    const societe = await this.societeService.create(data);
    res.status(201).json(societe);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    const data = UpdateSocieteSchema.parse(req.body);
    const societe = await this.societeService.update(uuid, data);
    res.json(societe);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    await this.societeService.delete(uuid);
    res.status(204).send();
  });
}
