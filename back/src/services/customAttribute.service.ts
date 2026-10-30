import { AppDataSource } from '../config/database';
import { CustomAttribute } from '../entities/customAttribute';
import { Societe } from '../entities/societe';
import {
  CreateCustomAttributeDto,
  UpdateCustomAttributeDto,
  PorteeChamp,
} from '../dto';

export class CustomAttributeService {
  private attributeRepository = AppDataSource.getRepository(CustomAttribute);
  private societeRepository = AppDataSource.getRepository(Societe);

  async findAll(societeUuid?: string, includeInactive = false): Promise<CustomAttribute[]> {
    const queryBuilder = this.attributeRepository
      .createQueryBuilder('attribute')
      .leftJoinAndSelect('attribute.societes', 'societe')
      .where('attribute.fl_deleted = :deleted', { deleted: false });

    if (!includeInactive) {
      queryBuilder.andWhere('attribute.actif = :actif', { actif: true });
    }

    if (societeUuid) {
      queryBuilder.andWhere(
        '(attribute.portee = :global OR societe.uuid = :societeUuid)',
        { global: PorteeChamp.GLOBAL, societeUuid }
      );
    }

    return queryBuilder
      .orderBy('attribute.ordreAffichage', 'ASC')
      .addOrderBy('attribute.libelle', 'ASC')
      .getMany();
  }

  async findById(uuid: string): Promise<CustomAttribute | null> {
    return this.attributeRepository.findOne({
      where: { uuid, flDeleted: false },
      relations: ['societes'],
    });
  }

  async findByCode(code: string): Promise<CustomAttribute | null> {
    return this.attributeRepository.findOne({ where: { code, flDeleted: false } });
  }

  async create(data: CreateCustomAttributeDto): Promise<CustomAttribute> {
    const existingAttribute = await this.findByCode(data.code);
    if (existingAttribute) {
      throw new Error(`Un attribut avec le code "${data.code}" existe déjà`);
    }

    if (data.portee === PorteeChamp.SOCIETE && (!data.societeUuids || data.societeUuids.length === 0)) {
      throw new Error('Au moins une société est obligatoire pour un attribut de portée société');
    }

    const attributeData: any = {
      code: data.code,
      libelle: data.libelle,
      typeChamp: data.typeChamp,
      portee: data.portee,
      obligatoire: data.obligatoire ?? false,
      ordreAffichage: data.ordreAffichage ?? 0,
      actif: data.actif ?? true,
    };

    if (data.description !== undefined && data.description !== null) {
      attributeData.description = data.description;
    }
    if (data.optionsListe !== undefined && data.optionsListe !== null) {
      attributeData.optionsListe = data.optionsListe;
    }
    if (data.valeurParDefaut !== undefined && data.valeurParDefaut !== null) {
      attributeData.valeurParDefaut = data.valeurParDefaut;
    }

    const attributeCreated = this.attributeRepository.create(attributeData);
    const attribute = (Array.isArray(attributeCreated) ? attributeCreated[0] : attributeCreated) as CustomAttribute;

    if (data.societeUuids && data.societeUuids.length > 0) {
      const societes = await this.societeRepository.find({
        where: data.societeUuids.map(uuid => ({ uuid }))
      });
      attribute.societes = societes;
    }

    const savedAttributeArray = await this.attributeRepository.save(attribute);
    const savedAttribute = (Array.isArray(savedAttributeArray) ? savedAttributeArray[0] : savedAttributeArray) as CustomAttribute;
    return savedAttribute;
  }

  async update(uuid: string, data: UpdateCustomAttributeDto): Promise<CustomAttribute> {
    const attribute = await this.findById(uuid);
    if (!attribute) {
      throw new Error('Attribut personnalisé introuvable');
    }

    if (data.code && data.code !== attribute.code) {
      const existingAttribute = await this.findByCode(data.code);
      if (existingAttribute) {
        throw new Error(`Un attribut avec le code "${data.code}" existe déjà`);
      }
    }

    // Mise à jour des propriétés simples
    if (data.code !== undefined) attribute.code = data.code;
    if (data.libelle !== undefined) attribute.libelle = data.libelle;
    if (data.description !== undefined && data.description !== null) attribute.description = data.description;
    if (data.typeChamp !== undefined) attribute.typeChamp = data.typeChamp;
    if (data.portee !== undefined) attribute.portee = data.portee;
    if (data.obligatoire !== undefined) attribute.obligatoire = data.obligatoire;
    if (data.ordreAffichage !== undefined) attribute.ordreAffichage = data.ordreAffichage;
    if (data.optionsListe !== undefined && data.optionsListe !== null) attribute.optionsListe = data.optionsListe;
    if (data.valeurParDefaut !== undefined && data.valeurParDefaut !== null) attribute.valeurParDefaut = data.valeurParDefaut;
    if (data.actif !== undefined) attribute.actif = data.actif;

    // Mise à jour des sociétés
    if (data.societeUuids !== undefined) {
      if (data.societeUuids.length > 0) {
        const societes = await this.societeRepository.find({
          where: data.societeUuids.map(uuid => ({ uuid }))
        });
        attribute.societes = societes;
      } else {
        attribute.societes = [];
      }
    }

    const savedAttributeArray = await this.attributeRepository.save(attribute);
    const savedAttribute = (Array.isArray(savedAttributeArray) ? savedAttributeArray[0] : savedAttributeArray) as CustomAttribute;
    return savedAttribute;
  }

  async delete(uuid: string): Promise<void> {
    const attribute = await this.attributeRepository.findOne({
      where: { uuid },
    });

    if (!attribute) {
      throw new Error('Attribut personnalisé introuvable');
    }

    if (attribute.flDeleted) {
      throw new Error('Attribut personnalisé déjà supprimé');
    }

    // Suppression logique
    attribute.flDeleted = true;
    await this.attributeRepository.save(attribute);
  }
}
