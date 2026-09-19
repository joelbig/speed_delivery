import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { DeliveryStatus } from '../../common/enums/delivery-status.enum.js';
import type { User as UserType } from '../../users/entities/user.entity.js';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- ADRESSE DE DEPART (COMMERÇANT) ---
  @Column()
  pickupAddress: string;

  @Column('decimal', { precision: 10, scale: 7 })
  pickupLatitude: number;

  @Column('decimal', { precision: 10, scale: 7 })
  pickupLongitude: number;

  // --- ADRESSE DE DESTINATION (CLIENT FINAL) ---
  @Column()
  dropoffAddress: string;

  @Column('decimal', { precision: 10, scale: 7 })
  dropoffLatitude: number;

  @Column('decimal', { precision: 10, scale: 7 })
  dropoffLongitude: number;

  // --- INFORMATIONS DESTINATAIRE ---
  @Column()
  recipientName: string;

  @Column()
  recipientPhone: string;

  // --- INFORMATIONS COLIS & PRIX ---
  @Column({ type: 'text', nullable: true })
  packageDescription: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number; // Prix de la livraison calculé

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  distanceKm: number; // Distance calculée en kilomètres

  // --- PREUVE DE LIVRAISON (SECURITY PIN) ---
  @Column({ length: 6, select: false, nullable: true })
  otpCode: string; // Code PIN généré à l'expéditeur/destinataire pour valider la course

  // --- STATUT ---
  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  // --- RELATIONS ---
  // Le commerçant qui a sollicité la livraison
  @ManyToOne(() => User, (user) => user.merchantDeliveries, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'merchant_id' })
  merchant: UserType;

  // Le livreur qui a accepté la course (null tant qu'elle est en PENDING)
  @ManyToOne(() => User, (user) => user.driverDeliveries, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'driver_id' })
  driver: UserType;

  // --- HORODATAGE DES ÉTAPES ---
  @Column({ nullable: true })
  acceptedAt: Date;

  @Column({ nullable: true })
  pickedUpAt: Date;

  @Column({ nullable: true })
  deliveredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}