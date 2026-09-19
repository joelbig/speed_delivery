import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { VehicleType } from '../../common/enums/vehicle-type.enum.js';
import type { User as UserType } from '../../users/entities/user.entity.js';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
    default: VehicleType.MOTORCYCLE,
  })
  type: VehicleType;

  @Column({ length: 50, nullable: true })
  brand: string; // Ex: Honda, Yamaha

  @Column({ length: 50, nullable: true })
  licensePlate: string; // Immatriculation

  @Column({ length: 30, nullable: true })
  color: string;

  // Clé étrangère liée à l'utilisateur (Livreur)
  @OneToOne(() => User, (user) => user.vehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_id' })
  driver: UserType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}