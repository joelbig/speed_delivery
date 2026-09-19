import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from './entities/delivery.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CreateDeliveryDto } from './dto/create-delivery.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { DeliveryStatus } from '../common/enums/delivery-status.enum.js';
import {
  calculateDistanceKm,
  calculateDeliveryPrice,
  generateOtpCode,
} from '../common/utils/geo.util.js';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 1. Création d'une livraison par un commerçant
  async createDelivery(merchant: User, dto: CreateDeliveryDto): Promise<Delivery> {
    const distanceKm = calculateDistanceKm(
      dto.pickupLatitude,
      dto.pickupLongitude,
      dto.dropoffLatitude,
      dto.dropoffLongitude,
    );

    const price = calculateDeliveryPrice(distanceKm);
    const otpCode = generateOtpCode();

    const delivery = this.deliveryRepository.create({
      ...dto,
      distanceKm,
      price,
      otpCode,
      merchant,
      status: DeliveryStatus.PENDING,
    });

    const savedDelivery = await this.deliveryRepository.save(delivery);

    // ✅ Nettoyage propre sans conflit de variable ni erreur d'entité incomplète
    (savedDelivery as any).otpCode = undefined;
    return savedDelivery; 
  }

  // 2. Liste des courses en attente pour les livreurs (PENDING)
  async findAvailableDeliveries(): Promise<Delivery[]> {
    return this.deliveryRepository.find({
      where: { status: DeliveryStatus.PENDING },
      relations: { merchant: true }, // ✅ Virgule ajoutée
      order: { createdAt: 'DESC' },
    });
  }

  // 3. Un livreur accepte une course
  async acceptDelivery(deliveryId: string, driver: User): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id: deliveryId },
    });

    if (!delivery) {
      throw new NotFoundException('Livraison introuvable.');
    }

    if (delivery.status !== DeliveryStatus.PENDING) {
      throw new BadRequestException('Cette course n\'est plus disponible.');
    }

    delivery.driver = driver;
    delivery.status = DeliveryStatus.ACCEPTED;
    delivery.acceptedAt = new Date();

    return this.deliveryRepository.save(delivery);
  }

  // 4. Mise à jour du statut de la course
  async updateStatus(
    deliveryId: string,
    driver: User,
    status: DeliveryStatus,
  ): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id: deliveryId },
      relations: { driver: true }
    });

    if (!delivery) {
      throw new NotFoundException('Livraison introuvable.');
    }

    if (delivery.driver?.id !== driver.id) {
      throw new ForbiddenException('Vous n\'êtes pas le livreur assigné à cette course.');
    }

    delivery.status = status;

    if (status === DeliveryStatus.PICKED_UP) {
      delivery.pickedUpAt = new Date();
    }

    return this.deliveryRepository.save(delivery);
  }

  // 5. Validation finale de la livraison par code OTP
  async completeDeliveryWithOtp(
    deliveryId: string,
    driver: User,
    verifyOtpDto: VerifyOtpDto,
  ): Promise<Delivery> {
    const delivery = await this.deliveryRepository
      .createQueryBuilder('delivery')
      .addSelect('delivery.otpCode')
      .leftJoinAndSelect('delivery.driver', 'driver')
      .where('delivery.id = :id', { id: deliveryId })
      .getOne();

    if (!delivery) {
      throw new NotFoundException('Livraison introuvable.');
    }

    if (delivery.driver?.id !== driver.id) {
      throw new ForbiddenException('Vous n\'êtes pas le livreur assigné à cette course.');
    }

    if (delivery.status !== DeliveryStatus.ARRIVED_AT_DESTINATION && delivery.status !== DeliveryStatus.PICKED_UP) {
      throw new BadRequestException('La commande ne peut pas être livrée à ce stade.');
    }

    if (delivery.otpCode !== verifyOtpDto.otpCode) {
      throw new BadRequestException('Code OTP incorrect.');
    }

    delivery.status = DeliveryStatus.DELIVERED;
    delivery.deliveredAt = new Date();

    const updatedDelivery = await this.deliveryRepository.save(delivery);
    // ✅ Remplacement du mot-clé delete par une assignation undefined
    (updatedDelivery as any).otpCode = undefined;

    return updatedDelivery;
  }

  // 6. Historique des courses pour un utilisateur
  async findUserDeliveries(user: User): Promise<Delivery[]> {
    if (user.role === 'MERCHANT') {
      return this.deliveryRepository.find({
        where: { merchant: { id: user.id } },
        relations: { driver: true }, // ✅ Virgule ajoutée
        order: { createdAt: 'DESC' },
      });
    } else if (user.role === 'DRIVER') {
      return this.deliveryRepository.find({
        where: { driver: { id: user.id } },
        relations: { merchant: true }, // ✅ Syntaxe de l'objet corrigée
        order: { createdAt: 'DESC' },
      });
    }

    return this.deliveryRepository.find({ order: { createdAt: 'DESC' } });
  }

  // 7. Obtenir les détails d'une livraison
  async findOne(id: string): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id },
      relations: { merchant: true, driver: true },
    });

    if (!delivery) {
      throw new NotFoundException('Livraison non trouvée.');
    }

    return delivery;
  }
}
