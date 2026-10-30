import { AppDataSource } from '../config/database';
import { ValueList } from '../entities/valueList';
import { ValueListItem } from '../entities/valueListItem';
import { CreateValueListDto, UpdateValueListDto } from '../dto';
import { randomUUID } from 'crypto';
import { BusinessError } from '../middleware/errorHandler';

export class ValueListService {
  private valueListRepository = AppDataSource.getRepository(ValueList);
  private valueListItemRepository = AppDataSource.getRepository(ValueListItem);

  async findAll(includeInactive = false): Promise<ValueList[]> {
    const query = this.valueListRepository
      .createQueryBuilder('valueList')
      .leftJoinAndSelect('valueList.items', 'items', 'items.flDeleted = :flDeleted', { flDeleted: false })
      .where('valueList.flDeleted = :flDeleted', { flDeleted: false });

    if (!includeInactive) {
      query.andWhere('valueList.actif = :actif', { actif: true });
    }

    const result = await query.orderBy('valueList.libelle', 'ASC').addOrderBy('items.ordre', 'ASC').getMany();

    // Filtrer les items inactifs si nécessaire
    if (!includeInactive) {
      result.forEach(list => {
        if (list.items) {
          list.items = list.items.filter(item => item.actif);
        }
      });
    }

    return result;
  }

  async findById(uuid: string): Promise<ValueList | null> {
    const valueList = await this.valueListRepository
      .createQueryBuilder('valueList')
      .leftJoinAndSelect('valueList.items', 'items', 'items.flDeleted = :flDeleted', { flDeleted: false })
      .where('valueList.uuid = :uuid', { uuid })
      .andWhere('valueList.flDeleted = :flDeleted', { flDeleted: false })
      .orderBy('items.ordre', 'ASC')
      .getOne();

    return valueList;
  }

  async findByCode(code: string): Promise<ValueList | null> {
    const valueList = await this.valueListRepository
      .createQueryBuilder('valueList')
      .leftJoinAndSelect('valueList.items', 'items', 'items.flDeleted = :flDeleted AND items.actif = :actif', { flDeleted: false, actif: true })
      .where('valueList.code = :code', { code })
      .andWhere('valueList.flDeleted = :flDeleted', { flDeleted: false })
      .andWhere('valueList.actif = :actif', { actif: true })
      .orderBy('items.ordre', 'ASC')
      .getOne();

    return valueList;
  }

  async create(data: CreateValueListDto): Promise<ValueList> {
    // Vérifier si le code existe déjà
    const existingCode = await this.valueListRepository.findOne({
      where: { code: data.code, flDeleted: false },
    });
    if (existingCode) {
      throw new BusinessError(`Une liste de valeurs avec le code "${data.code}" existe déjà`, 409);
    }

    const valueListData: any = {
      uuid: randomUUID(),
      code: data.code,
      libelle: data.libelle,
      actif: data.actif,
    };

    if (data.description !== undefined) {
      valueListData.description = data.description;
    }

    const valueList = this.valueListRepository.create(valueListData);
    const savedValueList = await this.valueListRepository.save(valueList);

    // Créer les items si fournis
    if (data.items && data.items.length > 0) {
      const items = data.items.map((item, index) => {
        return this.valueListItemRepository.create({
          uuid: randomUUID(),
          valueListUuid: savedValueList.uuid,
          code: item.code,
          libelle: item.libelle,
          ordre: item.ordre ?? index,
          actif: item.actif ?? true,
        });
      });
      await this.valueListItemRepository.save(items);
      savedValueList.items = items;
    }

    return savedValueList;
  }

  async update(uuid: string, data: UpdateValueListDto): Promise<ValueList> {
    const valueList = await this.findById(uuid);
    if (!valueList) {
      throw new BusinessError('Liste de valeurs introuvable', 404);
    }

    // Vérifier si le nouveau code existe déjà (si code est modifié)
    if (data.code && data.code !== valueList.code) {
      const existingCode = await this.valueListRepository.findOne({
        where: { code: data.code, flDeleted: false },
      });
      if (existingCode) {
        throw new BusinessError(`Une liste de valeurs avec le code "${data.code}" existe déjà`, 409);
      }
    }

    // Mettre à jour les propriétés de la liste
    if (data.code !== undefined) valueList.code = data.code;
    if (data.libelle !== undefined) valueList.libelle = data.libelle;
    if (data.description !== undefined) valueList.description = data.description;
    if (data.actif !== undefined) valueList.actif = data.actif;

    const savedValueList = await this.valueListRepository.save(valueList);

    // Gérer les items si fournis
    if (data.items !== undefined) {
      // Récupérer les items existants
      const existingItems = await this.valueListItemRepository.find({
        where: { valueListUuid: uuid, flDeleted: false },
      });

      const itemUuidsToKeep = new Set<string>();

      // Créer ou mettre à jour les items
      for (let i = 0; i < data.items.length; i++) {
        const itemData = data.items[i];

        if (itemData.uuid) {
          // Mise à jour d'un item existant
          const existingItem = existingItems.find(item => item.uuid === itemData.uuid);
          if (existingItem) {
            existingItem.code = itemData.code;
            existingItem.libelle = itemData.libelle;
            existingItem.ordre = itemData.ordre ?? i;
            existingItem.actif = itemData.actif ?? true;
            await this.valueListItemRepository.save(existingItem);
            itemUuidsToKeep.add(existingItem.uuid);
          }
        } else {
          // Création d'un nouvel item
          const newItem = this.valueListItemRepository.create({
            uuid: randomUUID(),
            valueListUuid: uuid,
            code: itemData.code,
            libelle: itemData.libelle,
            ordre: itemData.ordre ?? i,
            actif: itemData.actif ?? true,
          });
          const saved = await this.valueListItemRepository.save(newItem);
          itemUuidsToKeep.add(saved.uuid);
        }
      }

      // Marquer les items supprimés
      for (const existingItem of existingItems) {
        if (!itemUuidsToKeep.has(existingItem.uuid)) {
          existingItem.flDeleted = true;
          await this.valueListItemRepository.save(existingItem);
        }
      }
    }

    // Recharger avec les items
    return (await this.findById(uuid))!;
  }

  async delete(uuid: string): Promise<void> {
    const valueList = await this.valueListRepository.findOne({
      where: { uuid },
    });

    if (!valueList) {
      throw new BusinessError('Liste de valeurs introuvable', 404);
    }

    if (valueList.flDeleted) {
      throw new BusinessError('Cette liste de valeurs a déjà été supprimée', 400);
    }

    // Suppression logique
    valueList.flDeleted = true;
    await this.valueListRepository.save(valueList);

    // Marquer tous les items comme supprimés
    await this.valueListItemRepository
      .createQueryBuilder()
      .update(ValueListItem)
      .set({ flDeleted: true })
      .where('valueListUuid = :uuid', { uuid })
      .execute();
  }
}
