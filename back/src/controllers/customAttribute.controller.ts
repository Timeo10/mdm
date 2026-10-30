import { Request, Response } from 'express';
import { CustomAttributeService } from '../services/customAttribute.service';
import {
  CreateCustomAttributeSchema,
  UpdateCustomAttributeSchema,
} from '../dto';
import { asyncHandler, BusinessError } from '../middleware/errorHandler';

export class CustomAttributeController {
  private attributeService = new CustomAttributeService();

  findAll = asyncHandler(async (req: Request, res: Response) => {
    const { societeUuid } = req.query;
    const includeInactive = req.query.includeInactive === 'true';
    const attributes = await this.attributeService.findAll(
      societeUuid as string | undefined,
      includeInactive
    );
    res.json(attributes);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    const attribute = await this.attributeService.findById(uuid);

    if (!attribute) {
      throw new BusinessError('Attribut personnalisé introuvable', 404);
    }

    res.json(attribute);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = CreateCustomAttributeSchema.parse(req.body);
    const attribute = await this.attributeService.create(data);
    res.status(201).json(attribute);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    const data = UpdateCustomAttributeSchema.parse(req.body);
    const attribute = await this.attributeService.update(uuid, data);
    res.json(attribute);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    await this.attributeService.delete(uuid);
    res.status(204).send();
  });
}
