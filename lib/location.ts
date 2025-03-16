import { ref, set, onValue, get } from "firebase/database";
import { db, auth } from "./firebase";

// Type for provider location data
export interface ProviderLocation {
  providerId: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  status: "available" | "en_route" | "busy";
}

/**
 * Update the provider's current location in the database
 */
export const updateProviderLocation = async (
  latitude: number,
  longitude: number,
  status: "available" | "en_route" | "busy" = "available"
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const locationRef = ref(db, `provider_locations/${user.uid}`);
    await set(locationRef, {
      providerId: user.uid,
      latitude,
      longitude,
      timestamp: Date.now(),
      status,
    });
  } catch (error) {
    console.error("Error updating location:", error);
  }
};

/**
 * Get a provider's current location
 */
export const getProviderLocation = async (providerId: string): Promise<ProviderLocation | null> => {
  try {
    const locationRef = ref(db, `provider_locations/${providerId}`);
    const snapshot = await get(locationRef);
    return snapshot.val();
  } catch (error) {
    console.error("Error getting provider location:", error);
    return null;
  }
};

/**
 * Subscribe to real-time updates of a provider's location
 */
export const subscribeToProviderLocation = (
  providerId: string,
  callback: (location: ProviderLocation | null) => void
) => {
  const locationRef = ref(db, `provider_locations/${providerId}`);
  return onValue(locationRef, (snapshot) => {
    callback(snapshot.val());
  });
};

/**
 * Get all nearby providers within a certain radius (in kilometers)
 */
export const getNearbyProviders = async (
  latitude: number,
  longitude: number,
  radiusInKm: number = 10
): Promise<ProviderLocation[]> => {
  try {
    const locationsRef = ref(db, "provider_locations");
    const snapshot = await get(locationsRef);
    const locations: ProviderLocation[] = [];

    if (snapshot.exists()) {
      const data = snapshot.val();
      for (const key in data) {
        const location = data[key] as ProviderLocation;
        const distance = calculateDistance(
          latitude,
          longitude,
          location.latitude,
          location.longitude
        );

        if (distance <= radiusInKm) {
          locations.push(location);
        }
      }
    }

    return locations;
  } catch (error) {
    console.error("Error getting nearby providers:", error);
    return [];
  }
};

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};