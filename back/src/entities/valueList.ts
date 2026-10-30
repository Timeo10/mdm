import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ValueListItem } from './valueListItem';

@Entity('value_list')
export class ValueList {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column({ name: 'code', type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({ name: 'libelle', type: 'varchar', length: 255 })
  libelle!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'actif', type: 'boolean', default: true })
  actif!: boolean;

  @Column({ name: 'fl_deleted', type: 'boolean', default: false })
  flDeleted!: boolean;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj' })
  dateMaj!: Date;

  @OneToMany(() => ValueListItem, (item) => item.valueList, { cascade: true })
  items?: ValueListItem[];
}
