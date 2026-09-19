import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { UpdateLocationDto } from './dto/update-location.dto.js';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async toggleOnlineStatus(driverId: string, isOnline: boolean): Promise<User> {
    const driver = await this.userRepository.findOne({ where: { id: driverId } });
    if (!driver) throw new NotFoundException('Livreur non trouvé');

    driver.isOnline = isOnline;
    return this.userRepository.save(driver);
  }

  async updateLocation(driverId: string, dto: UpdateLocationDto): Promise<User> {
    const driver = await this.userRepository.findOne({ where: { id: driverId } });
    if (!driver) throw new NotFoundException('Livreur non trouvé');

    driver.currentLatitude = dto.latitude;
    driver.currentLongitude = dto.longitude;
    return this.userRepository.save(driver);
  }
}