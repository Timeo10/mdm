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
import { TiersSociete } from './tiersSociete';
import { CustomAttribute } from './customAttribute';

@Entity('custom_attribute_value')
@Index(['tiersSocieteUuid', 'attributeUuid'])
export class CustomAttributeValue {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column({ name: 'tiers_societe_uuid', type: 'uuid' })
  tiersSocieteUuid!: string;

  @Column({ name: 'attribute_uuid', type: 'uuid' })
  attributeUuid!: string;

  @Column({ name: 'valeur', type: 'text', nullable: true })
  valeur?: string;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj' })
  dateMaj!: Date;

  @ManyToOne(() => TiersSociete, (tierSociete) => tierSociete.attributeValues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tiers_societe_uuid' })
  tiersSociete?: TiersSociete;

  @ManyToOne(() => CustomAttribute, (attribute) => attribute.valeurs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_uuid' })
  attribute?: CustomAttribute;
}
