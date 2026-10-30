import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Tiers } from './tiers';
import { CustomAttribute } from './customAttribute';

@Entity('tiers_global_attribute_value')
@Index(['tiersUuid', 'attributeUuid'])
export class TierGlobalAttributeValue {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column({ name: 'tiers_uuid', type: 'uuid' })
  tiersUuid!: string;

  @Column({ name: 'attribute_uuid', type: 'uuid' })
  attributeUuid!: string;

  @Column({ name: 'valeur', type: 'text', nullable: true })
  valeur?: string;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj' })
  dateMaj!: Date;

  @ManyToOne(() => Tiers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tiers_uuid' })
  tier?: Tiers;

  @ManyToOne(() => CustomAttribute, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_uuid' })
  attribute?: CustomAttribute;
}
