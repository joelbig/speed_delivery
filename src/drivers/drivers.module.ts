import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriversService } from './drivers.service.js';
import { DriversController } from './drivers.controller.js';
import { DriversGateway } from './drivers.gateway.js';
import { User } from '../users/entities/user.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [DriversController],
  providers: [DriversService, DriversGateway],
  exports: [DriversService],
})
export class DriversModule {}