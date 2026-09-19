import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity.js';
import { Vehicle } from '../drivers/entities/vehicle.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UserRole } from '../common/enums/user-role.enum.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, role, vehicleType, vehicleBrand, vehicleLicensePlate, ...userData } =
      registerDto;

    // 1. Vérifier si l'email existe déjà
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Cet adresse email est déjà utilisée.');
    }

    // 2. Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Créer l'entité User
    const newUser = this.userRepository.create({
      ...userData,
      email,
      passwordHash,
      role,
    });

    const savedUser = await this.userRepository.save(newUser);

    // 4. Si c'est un livreur, créer son véhicule associé
    if (role === UserRole.DRIVER && vehicleType) {
      const vehicle = this.vehicleRepository.create({
        type: vehicleType,
        brand: vehicleBrand,
        licensePlate: vehicleLicensePlate,
        driver: savedUser,
      });
      await this.vehicleRepository.save(vehicle);
    }

    // 5. Générer les tokens et retourner la réponse
    return this.generateAuthResponse(savedUser);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Trouver l'utilisateur avec son hash de mot de passe
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // 2. Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // 3. Retourner le token
    return this.generateAuthResponse(user);
  }

  private generateAuthResponse(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    // Masquer le hash dans le retour
    const { passwordHash, ...userWithoutPassword } = user;
return userWithoutPassword;

    return {
      accessToken,
      user,
    };
  }
}