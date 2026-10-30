import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { UserRole as UserRoleEnum } from '../types/roles';

@Entity('user_roles')
export class UserRole {
  @PrimaryColumn('char', { length: 36 })
  uuid!: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  @Index()
  email!: string;

  @Column({ name: 'role', type: 'varchar', length: 50, default: 'READONLY' })
  @Index()
  role!: UserRoleEnum;

  @Column({ name: 'actif', type: 'boolean', default: true })
  actif!: boolean;

  @CreateDateColumn({ name: 'date_creation' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj' })
  dateMaj!: Date;
}
