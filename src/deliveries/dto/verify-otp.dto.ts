import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 6, { message: 'Le code OTP doit contenir entre 4 et 6 chiffres' })
  otpCode: string;
}