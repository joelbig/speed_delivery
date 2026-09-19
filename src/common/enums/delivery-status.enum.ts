export enum DeliveryStatus {
  PENDING = 'PENDING',               // En attente d'un livreur
  ACCEPTED = 'ACCEPTED',             // Acceptée par un livreur
  ARRIVED_AT_MERCHANT = 'ARRIVED_AT_MERCHANT', // Livreur chez le commerçant
  PICKED_UP = 'PICKED_UP',           // Colis récupéré (en cours de route)
  ARRIVED_AT_DESTINATION = 'ARRIVED_AT_DESTINATION', // Livreur à destination
  DELIVERED = 'DELIVERED',           // Livré avec validation OTP
  CANCELLED = 'CANCELLED',           // Annulée
}