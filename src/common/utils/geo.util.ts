/**
 * Calcule la distance entre deux coordonnées GPS en kilomètres (Formule Haversine).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Arrondi à 2 décimales
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calcule le tarif de livraison basé sur la distance.
 * Exemple de tarification :
 * - Tarif de base : 500 FCFA
 * - Prix par km supplémentaire : 250 FCFA
 * - Prix minimum : 500 FCFA
 */
export function calculateDeliveryPrice(distanceKm: number): number {
  const BASE_PRICE = 500;
  const PRICE_PER_KM = 250;

  const calculatedPrice = BASE_PRICE + distanceKm * PRICE_PER_KM;
  return Math.max(BASE_PRICE, Math.round(calculatedPrice));
}

/**
 * Génère un code OTP aléatoire à 4 chiffres.
 */
export function generateOtpCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}