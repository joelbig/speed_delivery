import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { DeliveriesModule } from './deliveries/deliveries.module.js';
import { DriversModule } from './drivers/drivers.module.js';

@Module({
  imports: [
    // Fichier de configuration .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Connexion MySQL via TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true, // ⚠️ Mettre à false en production !
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    DeliveriesModule,
    DriversModule,
  ],
})
export class AppModule {}