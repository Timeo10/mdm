import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ValueList } from './valueList';

@Entity('value_list_item')
export class ValueListItem {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column({ name: 'value_list_uuid', type: 'uuid' })
  valueListUuid!: string;

  @Column({ name: 'code', type: 'varchar', length: 50 })
  code!: string;

  @Column({ name: 'libelle', type: 'varchar', length: 255 })
  libelle!: string;

  @Column({ name: 'ordre', type: 'integer', default: 0 })
  ordre!: number;

  @Column({ name: 'actif', type: 'boolean', default: true })
  actif!: boolean;

  @Column({ name: 'fl_deleted', type: 'boolean', default: false })
  flDeleted!: boolean;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj' })
  dateMaj!: Date;

  @ManyToOne(() => ValueList, (valueList) => valueList.items)
  @JoinColumn({ name: 'value_list_uuid' })
  valueList?: ValueList;
}
