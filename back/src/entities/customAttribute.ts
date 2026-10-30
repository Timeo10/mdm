import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  Index,
} from 'typeorm';
import { Societe } from './societe';
import { CustomAttributeValue } from './customAttributeValue';

export enum TypeChamp {
  TEXTE = 'texte',
  NOMBRE = 'nombre',
  DATE = 'date',
  BOOLEEN = 'booleen',
  LISTE = 'liste',
  EMAIL = 'email',
  TELEPHONE = 'telephone',
  URL = 'url',
}

export enum PorteeChamp {
  GLOBAL = 'global',
  SOCIETE = 'societe',
}

@Entity('custom_attribute')
@Index(['ordreAffichage'])
@Index(['actif'])
@Index(['flDeleted'])
@Index(['portee'])
export class CustomAttribute {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column({ name: 'code', type: 'varchar', length: 100, unique: true })
  code!: string;

  @Column({ name: 'libelle', type: 'varchar', length: 255 })
  libelle!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'type_champ',
    type: 'enum',
    enum: TypeChamp,
    default: TypeChamp.TEXTE,
  })
  typeChamp!: TypeChamp;

  @Column({
    name: 'portee',
    type: 'enum',
    enum: PorteeChamp,
    default: PorteeChamp.GLOBAL,
  })
  portee!: PorteeChamp;

  @Column({ name: 'obligatoire', type: 'boolean', default: false })
  obligatoire!: boolean;

  @Column({ name: 'ordre_affichage', type: 'int', default: 0 })
  ordreAffichage!: number;

  @Column({ name: 'options_liste', type: 'json', nullable: true })
  optionsListe?: string[];

  @Column({ name: 'valeur_par_defaut', type: 'text', nullable: true })
  valeurParDefaut?: string;

  @Column({ name: 'actif', type: 'boolean', default: true })
  actif!: boolean;

  @Column({ name: 'fl_deleted', type: 'boolean', default: false })
  flDeleted!: boolean;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj' })
  dateMaj!: Date;

  @ManyToMany(() => Societe, { nullable: true })
  @JoinTable({
    name: 'custom_attribute_societe',
    joinColumn: { name: 'attribute_uuid', referencedColumnName: 'uuid' },
    inverseJoinColumn: { name: 'societe_uuid', referencedColumnName: 'uuid' },
  })
  societes?: Societe[];

  @OneToMany(() => CustomAttributeValue, (valeur) => valeur.attribute)
  valeurs?: CustomAttributeValue[];
}
