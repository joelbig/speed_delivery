import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { VehicleType } from '../../common/enums/vehicle-type.enum.js';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  // Champs optionnels spécifiques au Livreur
  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  @IsOptional()
  @IsString()
  vehicleBrand?: string;

  @IsOptional()
  @IsString()
  vehicleLicensePlate?: string;
}