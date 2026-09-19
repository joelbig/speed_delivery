import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveriesService } from './deliveries.service.js';
import { DeliveriesController } from './deliveries.controller.js';
import { Delivery } from './entities/delivery.entity.js';
import { User } from '../users/entities/user.entity.js';
import { AuthModule } from '../auth/auth.module.js'; 

@Module({
  imports: [TypeOrmModule.forFeature([Delivery, User]), AuthModule],
  controllers: [DeliveriesController],
  providers: [DeliveriesService],
  exports: [DeliveriesService],
})
export class DeliveriesModule {}