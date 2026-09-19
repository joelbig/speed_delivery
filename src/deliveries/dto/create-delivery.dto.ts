import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateDeliveryDto {
  // --- ADRESSE DE DÉPART (COMMERÇANT) ---
  @IsString()
  @IsNotEmpty()
  pickupAddress: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  pickupLatitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  pickupLongitude: number;

  // --- ADRESSE DE DESTINATION (CLIENT) ---
  @IsString()
  @IsNotEmpty()
  dropoffAddress: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  dropoffLatitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  dropoffLongitude: number;

  // --- DESTINATAIRE ---
  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @IsString()
  @IsNotEmpty()
  recipientPhone: string;

  // --- COLIS ---
  @IsOptional()
  @IsString()
  packageDescription?: string;
}