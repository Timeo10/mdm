import { Request, Response } from 'express';
import { TiersContactService } from '../services/tiersContact.service';
import { TiersAuditService } from '../services/tiersAudit.service';
import { CreateTiersContactSchema, UpdateTiersContactSchema } from '../dto/tiersContact.dto';
import { asyncHandler, BusinessError } from '../middleware/errorHandler';

export class TiersContactController {
  private contactService = new TiersContactService();
  private auditService = new TiersAuditService();

  findByTiers = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID du tiers manquant', 400);
    }
    const contacts = await this.contactService.findByTiersUuid(uuid);
    res.json(contacts);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = req.params;
    if (!uuid) {
      throw new BusinessError('UUID du tiers manquant', 400);
    }
    const data = CreateTiersContactSchema.parse(req.body);
    const auditContext = this.auditService.extractContextFromRequest(req);
    const contact = await this.contactService.create(uuid, data, auditContext);
    res.status(201).json(contact);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { contactUuid } = req.params;
    if (!contactUuid) {
      throw new BusinessError('UUID du contact manquant', 400);
    }
    const data = UpdateTiersContactSchema.parse(req.body);
    const auditContext = this.auditService.extractContextFromRequest(req);
    const contact = await this.contactService.update(contactUuid, data, auditContext);
    res.json(contact);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { contactUuid } = req.params;
    if (!contactUuid) {
      throw new BusinessError('UUID du contact manquant', 400);
    }
    const auditContext = this.auditService.extractContextFromRequest(req);
    await this.contactService.delete(contactUuid, auditContext);
    res.status(204).send();
  });
}
