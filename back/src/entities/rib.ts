import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Societe } from './societe';

@Entity('rib')
export class Rib {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column({ name: 'societe_uuid', type: 'uuid' })
  societeUuid!: string;

  @Column({ name: 'type_iban_code', type: 'varchar', length: 50 })
  typeIbanCode!: string;

  @Column({ name: 'iban', type: 'varchar', length: 34 })
  iban!: string;

  @Column({ name: 'bic', type: 'varchar', length: 11, nullable: true })
  bic?: string;

  @Column({ name: 'titulaire', type: 'varchar', length: 255 })
  titulaire!: string;

  @Column({ name: 'banque', type: 'varchar', length: 255, nullable: true })
  banque?: string;

  @Column({ name: 'actif', type: 'boolean', default: true })
  actif!: boolean;

  @Column({ name: 'fl_deleted', type: 'boolean', default: false })
  flDeleted!: boolean;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj' })
  dateMaj!: Date;

  @Column({ name: 'ics', type: 'varchar', length: 255, nullable: true })
  ics?: string;

  @ManyToOne(() => Societe, (societe) => societe.ribs)
  @JoinColumn({ name: 'societe_uuid' })
  societe?: Societe;
}
