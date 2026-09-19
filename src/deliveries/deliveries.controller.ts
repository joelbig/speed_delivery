import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
// 1. IMPORTATION DE VOTRE ENTITÉ USER (en tant que classe ou type)
import { User } from '../users/entities/user.entity.js'; 

import { DeliveriesService } from './deliveries.service.js';
import { CreateDeliveryDto } from './dto/create-delivery.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { DeliveryStatus } from '../common/enums/delivery-status.enum.js';

// 2. CRÉATION D'UN TYPE PERSONNALISÉ POUR LA REQUÊTE
interface AuthenticatedRequest extends ExpressRequest {
  user: User; // On force TypeScript à savoir que req.user est de type User
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  // --- COMMERÇANT ---
  @Roles(UserRole.MERCHANT)
  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() createDeliveryDto: CreateDeliveryDto) { // 3. REMPLACER PAR LE NOUVEAU TYPE
    return this.deliveriesService.createDelivery(req.user, createDeliveryDto);
  }

  // --- LIVREUR ---
  @Roles(UserRole.DRIVER)
  @Get('available')
  findAvailable() {
    return this.deliveriesService.findAvailableDeliveries();
  }

  @Roles(UserRole.DRIVER)
  @Patch(':id/accept')
  acceptDelivery(@Param('id') id: string, @Request() req: AuthenticatedRequest) { // 3. REMPLACER PAR LE NOUVEAU TYPE
    return this.deliveriesService.acceptDelivery(id, req.user);
  }

  @Roles(UserRole.DRIVER)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest, // 3. REMPLACER PAR LE NOUVEAU TYPE
    @Body('status') status: DeliveryStatus,
  ) {
    return this.deliveriesService.updateStatus(id, req.user, status);
  }

  @Roles(UserRole.DRIVER)
  @Post(':id/complete')
  completeDelivery(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest, // 3. REMPLACER PAR LE NOUVEAU TYPE
    @Body() verifyOtpDto: VerifyOtpDto,
  ) {
    return this.deliveriesService.completeDeliveryWithOtp(id, req.user, verifyOtpDto);
  }

  // --- COMMUN ---
  @Get('my-deliveries')
  findMyDeliveries(@Request() req: AuthenticatedRequest) { // 3. REMPLACER PAR LE NOUVEAU TYPE
    return this.deliveriesService.findUserDeliveries(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveriesService.findOne(id);
  }
}
