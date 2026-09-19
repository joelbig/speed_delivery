import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { Delivery } from '../../deliveries/entities/delivery.entity.js';
import { Vehicle } from '../../drivers/entities/vehicle.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phoneNumber: string;

  @Column({ select: false }) // Ne renvoie pas le hash du mot de passe par défaut dans les requêtes
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MERCHANT,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  // Spécifique aux Livreurs : statut de validation par l'Admin
  @Column({ default: false })
  isVerifiedDriver: boolean;

  // Spécifique aux Livreurs : Disponibilité
  @Column({ default: false })
  isOnline: boolean;

  // Spécifique aux Livreurs : Géolocalisation actuelle
  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  currentLatitude: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  currentLongitude: number;

  // Relation : Les courses créées par le commerçant
  @OneToMany(() => Delivery, (delivery) => delivery.merchant)
  merchantDeliveries: Delivery[];

  // Relation : Les courses effectuées par le livreur
  @OneToMany(() => Delivery, (delivery) => delivery.driver)
  driverDeliveries: Delivery[];

  // Relation : Le véhicule du livreur
  @OneToOne(() => Vehicle, (vehicle) => vehicle.driver, { cascade: true })
  vehicle: Vehicle;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}