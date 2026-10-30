import { In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { TiersContact } from '../entities/tiersContact';
import { Societe } from '../entities/societe';
import { CreateTiersContactDto, UpdateTiersContactDto } from '../dto/tiersContact.dto';
import { BusinessError } from '../middleware/errorHandler';
import { TiersAuditService, AuditContext } from './tiersAudit.service';
import { TiersAuditAction } from '../entities/tiersAuditLog';

export class TiersContactService {
  private contactRepository = AppDataSource.getRepository(TiersContact);
  private societeRepository = AppDataSource.getRepository(Societe);
  private auditService = new TiersAuditService();

  async findByTiersUuid(tiersUuid: string): Promise<TiersContact[]> {
    return this.contactRepository.find({
      where: { tiersUuid, flDeleted: false },
      relations: ['societes'],
      order: { nom: 'ASC', prenom: 'ASC' },
    });
  }

  async create(tiersUuid: string, data: CreateTiersContactDto, auditContext?: AuditContext): Promise<TiersContact> {
    const contact = this.contactRepository.create({
      tiersUuid,
      nom: data.nom,
      prenom: data.prenom ?? undefined,
      titre: data.titre ?? undefined,
      telephoneFixe: data.telephoneFixe ?? undefined,
      portable: data.portable ?? undefined,
      email: data.email ?? undefined,
    });

    if (data.societeUuids && data.societeUuids.length > 0) {
      contact.societes = await this.societeRepository.find({
        where: { uuid: In(data.societeUuids) },
      });
    } else {
      contact.societes = [];
    }

    const saved = await this.contactRepository.save(contact);

    await this.auditService.createAuditLog({
      tiersUuid,
      action: TiersAuditAction.CREATE_CONTACT,
      entityType: 'tiersContact',
      entityUuid: saved.uuid,
      newValues: { nom: data.nom, prenom: data.prenom, titre: data.titre, email: data.email, telephoneFixe: data.telephoneFixe, portable: data.portable },
      description: this.auditService.generateDescription(TiersAuditAction.CREATE_CONTACT),
      context: auditContext,
    });

    return saved;
  }

  async update(contactUuid: string, data: UpdateTiersContactDto, auditContext?: AuditContext): Promise<TiersContact> {
    const contact = await this.contactRepository.findOne({
      where: { uuid: contactUuid, flDeleted: false },
      relations: ['societes'],
    });

    if (!contact) {
      throw new BusinessError('Contact introuvable', 404);
    }

    const oldValues: Record<string, any> = {
      nom: contact.nom,
      prenom: contact.prenom,
      titre: contact.titre,
      telephoneFixe: contact.telephoneFixe,
      portable: contact.portable,
      email: contact.email,
    };

    if (data.nom !== undefined) contact.nom = data.nom;
    if (data.prenom !== undefined) contact.prenom = data.prenom ?? undefined;
    if (data.titre !== undefined) contact.titre = data.titre ?? undefined;
    if (data.telephoneFixe !== undefined) contact.telephoneFixe = data.telephoneFixe ?? undefined;
    if (data.portable !== undefined) contact.portable = data.portable ?? undefined;
    if (data.email !== undefined) contact.email = data.email ?? undefined;
    if (data.actif !== undefined) contact.actif = data.actif;

    if (data.societeUuids !== undefined) {
      if (data.societeUuids && data.societeUuids.length > 0) {
        contact.societes = await this.societeRepository.find({
          where: { uuid: In(data.societeUuids) },
        });
      } else {
        contact.societes = [];
      }
    }

    const saved = await this.contactRepository.save(contact);

    const auditFields = ['nom', 'prenom', 'titre', 'telephoneFixe', 'portable', 'email', 'actif'];
    const changes: Record<string, any> = {};
    for (const key of auditFields) {
      if ((data as any)[key] !== undefined && (data as any)[key] !== oldValues[key]) {
        changes[key] = { old: oldValues[key], new: (data as any)[key] };
      }
    }

    const { societeUuids, ...newValuesWithoutIds } = data as any;
    await this.auditService.createAuditLog({
      tiersUuid: contact.tiersUuid,
      action: TiersAuditAction.UPDATE_CONTACT,
      entityType: 'tiersContact',
      entityUuid: contact.uuid,
      oldValues,
      newValues: newValuesWithoutIds,
      changes,
      description: this.auditService.generateDescription(TiersAuditAction.UPDATE_CONTACT, 'tiersContact', changes),
      context: auditContext,
    });

    return saved;
  }

  async delete(contactUuid: string, auditContext?: AuditContext): Promise<void> {
    const contact = await this.contactRepository.findOne({
      where: { uuid: contactUuid, flDeleted: false },
    });

    if (!contact) {
      throw new BusinessError('Contact introuvable', 404);
    }

    contact.flDeleted = true;
    await this.contactRepository.save(contact);

    await this.auditService.createAuditLog({
      tiersUuid: contact.tiersUuid,
      action: TiersAuditAction.DELETE_CONTACT,
      entityType: 'tiersContact',
      entityUuid: contact.uuid,
      oldValues: { nom: contact.nom, prenom: contact.prenom, email: contact.email },
      description: this.auditService.generateDescription(TiersAuditAction.DELETE_CONTACT),
      context: auditContext,
    });
  }
}
