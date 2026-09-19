import { Controller, Patch, Body, UseGuards, Request } from '@nestjs/common';
// 1. IMPORTATION DES TYPES POUR EXPRESS ET L'ENTITÉ USER
import type { Request as ExpressRequest } from 'express';
import { User } from '../users/entities/user.entity.js';

import { DriversService } from './drivers.service.js';
import { UpdateLocationDto } from './dto/update-location.dto.js';
import { ToggleOnlineDto } from './dto/toggle-online.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';

// 2. INTERFACE POUR LES REQUÊTES AUTHENTIFIÉES
interface AuthenticatedRequest extends ExpressRequest {
  user: User;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DRIVER)
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Patch('status')
  // 3. APPLICATION DU TYPE AuthenticatedRequest 👇
  toggleOnline(@Request() req: AuthenticatedRequest, @Body() dto: ToggleOnlineDto) {
    return this.driversService.toggleOnlineStatus(req.user.id, dto.isOnline);
  }

  @Patch('location')
  // 3. APPLICATION DU TYPE AuthenticatedRequest 👇
  updateLocation(@Request() req: AuthenticatedRequest, @Body() dto: UpdateLocationDto) {
    return this.driversService.updateLocation(req.user.id, dto);
  }
} // 👈 4. ACCOLADE DE FERMETURE AJOUTÉE

