import { Request, Response } from 'express';
import { ValueListService } from '../services/valueList.service';
import { CreateValueListSchema, UpdateValueListSchema } from '../dto';
import { asyncHandler, BusinessError } from '../middleware/errorHandler';

export class ValueListController {
  private valueListService = new ValueListService();

  findAll = asyncHandler(async (req: Request, res: Response) => {
    const includeInactive = req.query.includeInactive === 'true';
    const valueLists = await this.valueListService.findAll(includeInactive);
    res.json(valueLists);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    const valueList = await this.valueListService.findById(uuid);

    if (!valueList) {
      throw new BusinessError('Liste de valeurs introuvable', 404);
    }

    res.json(valueList);
  });

  findByCode = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.params;
    if (!code) {
      throw new BusinessError('Code manquant', 400);
    }
    const valueList = await this.valueListService.findByCode(code);

    if (!valueList) {
      throw new BusinessError('Liste de valeurs introuvable', 404);
    }

    res.json(valueList);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = CreateValueListSchema.parse(req.body);
    const valueList = await this.valueListService.create(data);
    res.status(201).json(valueList);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    const data = UpdateValueListSchema.parse(req.body);
    const valueList = await this.valueListService.update(uuid, data);
    res.json(valueList);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID manquant', 400);
    }
    await this.valueListService.delete(uuid);
    res.status(204).send();
  });
}
