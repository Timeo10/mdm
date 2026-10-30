import { AppDataSource } from '../config/database';
import { TiersRole } from '../entities/tiersRole';
import { CreateTiersRoleDto, UpdateTiersRoleDto } from '../dto';
import { randomUUID } from 'crypto';
import { BusinessError } from '../middleware/errorHandler';

export class TiersRoleService {
  private roleRepository = AppDataSource.getRepository(TiersRole);

  async findAll(includeInactive = false): Promise<TiersRole[]> {
    const query = this.roleRepository
      .createQueryBuilder('role')
      .where('role.flDeleted = :flDeleted', { flDeleted: false });

    if (!includeInactive) {
      query.andWhere('role.actif = :actif', { actif: true });
    }

    return query.getMany();
  }

  async findById(uuid: string): Promise<TiersRole | null> {
    return this.roleRepository.findOne({
      where: { uuid, flDeleted: false },
    });
  }

  async findByCode(code: string): Promise<TiersRole | null> {
    return this.roleRepository.findOne({
      where: { code, flDeleted: false },
    });
  }

  async create(data: CreateTiersRoleDto): Promise<TiersRole> {
    // Vérifier que le code n'existe pas déjà
    const existing = await this.roleRepository.findOne({
      where: { code: data.code },
    });

    if (existing && !existing.flDeleted) {
      throw new BusinessError('Un rôle avec ce code existe déjà', 409);
    }

    const roleData: any = {
      uuid: randomUUID(),
      code: data.code.toUpperCase(),
      libelle: data.libelle,
      couleur: data.couleur || '#757575',
      actif: data.actif ?? true,
    };

    if (data.description !== undefined) {
      roleData.description = data.description;
    }

    const role = this.roleRepository.create(roleData);

    const savedRoleArray = await this.roleRepository.save(role);
    const savedRole = (Array.isArray(savedRoleArray) ? savedRoleArray[0] : savedRoleArray) as TiersRole;
    return savedRole;
  }

  async update(uuid: string, data: UpdateTiersRoleDto): Promise<TiersRole> {
    const role = await this.findById(uuid);

    if (!role) {
      throw new BusinessError('Rôle introuvable', 404);
    }

    // Si le code est modifié, vérifier qu'il n'existe pas déjà
    if (data.code && data.code !== role.code) {
      const existing = await this.roleRepository.findOne({
        where: { code: data.code },
      });

      if (existing && !existing.flDeleted && existing.uuid !== uuid) {
        throw new BusinessError('Un rôle avec ce code existe déjà', 409);
      }
    }

    Object.assign(role, {
      code: data.code ? data.code.toUpperCase() : role.code,
      libelle: data.libelle ?? role.libelle,
      description: data.description ?? role.description,
      couleur: data.couleur ?? role.couleur,
      actif: data.actif ?? role.actif,
    });

    return this.roleRepository.save(role);
  }

  async delete(uuid: string): Promise<void> {
    const role = await this.findById(uuid);

    if (!role) {
      throw new BusinessError('Rôle introuvable', 404);
    }

    // Suppression logique
    role.flDeleted = true;
    await this.roleRepository.save(role);
  }

  async reorder(orderedUuids: string[]): Promise<void> {
    for (let i = 0; i < orderedUuids.length; i++) {
      const uuid = orderedUuids[i];
      if (!uuid) continue;
      const role = await this.findById(uuid);
      if (role) {
        await this.roleRepository.save(role);
      }
    }
  }
}
