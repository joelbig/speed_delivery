import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DriversService } from './drivers.service.js';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/tracking',
})
export class DriversGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly driversService: DriversService) {}

  handleConnection(client: Socket) {
    console.log(`🔌 Client connecté : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client déconnecté : ${client.id}`);
  }

  // Rejoindre une room dédiée à une livraison
  @SubscribeMessage('joinDeliveryRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { deliveryId: string },
  ) {
    client.join(`delivery_${data.deliveryId}`);
    return { event: 'joinedRoom', room: `delivery_${data.deliveryId}` };
  }

  // Émission de la position GPS par le livreur
  @SubscribeMessage('updateDriverLocation')
  async handleLocationUpdate(
    @MessageBody()
    data: { driverId: string; deliveryId?: string; latitude: number; longitude: number },
  ) {
    await this.driversService.updateLocation(data.driverId, {
      latitude: data.latitude,
      longitude: data.longitude,
    });

    const payload = {
      driverId: data.driverId,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: new Date(),
    };

    // Diffusion aux clients qui suivent cette livraison spécifique
    if (data.deliveryId) {
      this.server.to(`delivery_${data.deliveryId}`).emit('driverLocationUpdated', payload);
    }

    // Diffusion globale (ex: dashboard admin)
    this.server.emit('globalDriverLocation', payload);
  }
}