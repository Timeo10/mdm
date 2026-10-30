import { AppDataSource } from '../config/database';
import { Rib } from '../entities/rib';
import { CreateRibDto, UpdateRibDto } from '../dto/rib.dto';
import { randomUUID } from 'crypto';
import { BusinessError } from '../middleware/errorHandler';

export class RibService {
  private ribRepository = AppDataSource.getRepository(Rib);

  async findAll(includeInactive = false): Promise<Rib[]> {
    const query = this.ribRepository
      .createQueryBuilder('rib')
      .leftJoinAndSelect('rib.societe', 'societe')
      .where('rib.flDeleted = :flDeleted', { flDeleted: false });

    if (!includeInactive) {
      query.andWhere('rib.actif = :actif', { actif: true });
    }

    return query.orderBy('societe.raisonSociale', 'ASC').getMany();
  }

  async findBySociete(societeUuid: string, includeInactive = false): Promise<Rib[]> {
    const query = this.ribRepository
      .createQueryBuilder('rib')
      .where('rib.societeUuid = :societeUuid', { societeUuid })
      .andWhere('rib.flDeleted = :flDeleted', { flDeleted: false });

    if (!includeInactive) {
      query.andWhere('rib.actif = :actif', { actif: true });
    }

    return query.orderBy('rib.typeIbanCode', 'ASC').getMany();
  }

  async findById(uuid: string): Promise<Rib | null> {
    return this.ribRepository.findOne({
      where: { uuid, flDeleted: false },
      relations: ['societe'],
    });
  }

  async create(data: CreateRibDto): Promise<Rib> {
    // Vérifier si un RIB avec le même IBAN existe déjà pour cette société
    const existingIban = await this.ribRepository.findOne({
      where: {
        societeUuid: data.societeUuid,
        iban: data.iban,
        flDeleted: false,
      },
    });
    if (existingIban) {
      throw new BusinessError('Un RIB avec cet IBAN existe déjà pour cette société', 409);
    }

    const ribData: any = {
      uuid: randomUUID(),
      societeUuid: data.societeUuid,
      typeIbanCode: data.typeIbanCode,
      iban: data.iban,
      titulaire: data.titulaire,
      actif: data.actif,
    };

    if (data.bic !== undefined && data.bic !== null) {
      ribData.bic = data.bic;
    }
    if (data.banque !== undefined && data.banque !== null) {
      ribData.banque = data.banque;
    }

    const rib = this.ribRepository.create(ribData);
    const savedRibArray = await this.ribRepository.save(rib);
    const savedRib = (Array.isArray(savedRibArray) ? savedRibArray[0] : savedRibArray) as Rib;

    // Charger les relations
    return this.findById(savedRib.uuid) as Promise<Rib>;
  }

  async update(uuid: string, data: UpdateRibDto): Promise<Rib> {
    const rib = await this.findById(uuid);
    if (!rib) {
      throw new BusinessError('RIB introuvable', 404);
    }

    // Vérifier si le nouveau IBAN existe déjà pour cette société (si IBAN est modifié)
    if (data.iban && data.iban !== rib.iban) {
      const existingIban = await this.ribRepository.findOne({
        where: {
          societeUuid: rib.societeUuid,
          iban: data.iban,
          flDeleted: false,
        },
      });
      if (existingIban) {
        throw new BusinessError('Un RIB avec cet IBAN existe déjà pour cette société', 409);
      }
    }

    Object.assign(rib, data);
    await this.ribRepository.save(rib);

    // Retourner le RIB avec les relations chargées
    return this.findById(uuid) as Promise<Rib>;
  }

  async delete(uuid: string): Promise<void> {
    const rib = await this.ribRepository.findOne({
      where: { uuid },
    });

    if (!rib) {
      throw new BusinessError('RIB introuvable', 404);
    }

    if (rib.flDeleted) {
      throw new BusinessError('Ce RIB a déjà été supprimé', 400);
    }

    // Suppression logique
    rib.flDeleted = true;
    await this.ribRepository.save(rib);
  }
}
