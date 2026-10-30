import { AppDataSource } from '../config/database';
import { Societe } from '../entities/societe';
import { CreateSocieteDto, UpdateSocieteDto } from '../dto';
import { randomUUID } from 'crypto';
import { BusinessError } from '../middleware/errorHandler';

export class SocieteService {
  private societeRepository = AppDataSource.getRepository(Societe);

  async findAll(includeInactive = false): Promise<Societe[]> {
    const query = this.societeRepository
      .createQueryBuilder('societe')
      .where('societe.flDeleted = :flDeleted', { flDeleted: false });

    if (!includeInactive) {
      query.andWhere('societe.actif = :actif', { actif: true });
    }

    return query.orderBy('societe.raisonSociale', 'ASC').getMany();
  }

  async findById(uuid: string): Promise<Societe | null> {
    return this.societeRepository.findOne({
      where: { uuid, flDeleted: false },
    });
  }

  async create(data: CreateSocieteDto): Promise<Societe> {
    // Vérifier si le code existe déjà
    const existingCode = await this.societeRepository.findOne({
      where: { code: data.code, flDeleted: false },
    });
    if (existingCode) {
      throw new BusinessError(`Une société avec le code "${data.code}" existe déjà`, 409);
    }

    // Vérifier si le SIREN existe déjà
    if (data.siren) {
      const existingSiren = await this.societeRepository.findOne({
        where: { siren: data.siren, flDeleted: false },
      });
      if (existingSiren) {
        throw new BusinessError(`Une société avec le SIREN "${data.siren}" existe déjà`, 409);
      }
    }

    const societeData: any = {
      uuid: randomUUID(),
      code: data.code,
      raisonSociale: data.raisonSociale,
      actif: data.actif,
    };

    if (data.description !== undefined) {
      societeData.description = data.description;
    }
    if (data.siren !== undefined && data.siren !== null) {
      societeData.siren = data.siren;
    }
    if (data.siret !== undefined && data.siret !== null) {
      societeData.siret = data.siret;
    }

    const societe = this.societeRepository.create(societeData);

    const savedSocieteArray = await this.societeRepository.save(societe);
    const savedSociete = (Array.isArray(savedSocieteArray) ? savedSocieteArray[0] : savedSocieteArray) as Societe;
    return savedSociete;
  }

  async update(uuid: string, data: UpdateSocieteDto): Promise<Societe> {
    const societe = await this.findById(uuid);
    if (!societe) {
      throw new BusinessError('Société introuvable', 404);
    }

    // Vérifier si le nouveau code existe déjà (si code est modifié)
    if (data.code && data.code !== societe.code) {
      const existingCode = await this.societeRepository.findOne({
        where: { code: data.code, flDeleted: false },
      });
      if (existingCode) {
        throw new BusinessError(`Une société avec le code "${data.code}" existe déjà`, 409);
      }
    }

    // Vérifier si le nouveau SIREN existe déjà (si SIREN est modifié)
    if (data.siren && data.siren !== societe.siren) {
      const existingSiren = await this.societeRepository.findOne({
        where: { siren: data.siren, flDeleted: false },
      });
      if (existingSiren) {
        throw new BusinessError(`Une société avec le SIREN "${data.siren}" existe déjà`, 409);
      }
    }

    Object.assign(societe, data);
    return this.societeRepository.save(societe);
  }

  async delete(uuid: string): Promise<void> {
    const societe = await this.societeRepository.findOne({
      where: { uuid },
    });

    if (!societe) {
      throw new BusinessError('Société introuvable', 404);
    }

    if (societe.flDeleted) {
      throw new BusinessError('Cette société a déjà été supprimée', 400);
    }

    // Suppression logique
    societe.flDeleted = true;
    await this.societeRepository.save(societe);
  }
}
