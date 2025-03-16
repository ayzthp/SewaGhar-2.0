"use client";

import { useEffect, useState } from "react";
import { updateProviderLocation } from "@/lib/location";
import { auth } from "@/lib/firebase";

interface LocationUpdaterProps {
  status?: "available" | "en_route" | "busy";
  updateInterval?: number; // in milliseconds
  onLocationUpdate?: (latitude: number, longitude: number) => void;
}

const LocationUpdater: React.FC<LocationUpdaterProps> = ({
  status = "available",
  updateInterval = 5000, // Default to 5 seconds
  onLocationUpdate,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    // Check if the user is logged in
    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to share your location");
      return;
    }

    // Check if geolocation is supported by the browser
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    let watchId: number;
    let intervalId: NodeJS.Timeout;

    const startTracking = () => {
      setIsTracking(true);

      // Watch position for changes
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          
          if (onLocationUpdate) {
            onLocationUpdate(latitude, longitude);
          }
        },
        (err) => {
          setError(`Error getting location: ${err.message}`);
          setIsTracking(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 30000, // 30 seconds
          timeout: 27000, // 27 seconds
        }
      );

      // Set up interval to update location in Firebase
      intervalId = setInterval(async () => {
        if (currentLocation) {
          try {
            await updateProviderLocation(
              currentLocation.latitude,
              currentLocation.longitude,
              status
            );
          } catch (err) {
            console.error("Error updating location in Firebase:", err);
          }
        }
      }, updateInterval);
    };

    startTracking();

    // Clean up on unmount
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (intervalId) clearInterval(intervalId);
      setIsTracking(false);
    };
  }, [status, updateInterval, onLocationUpdate, currentLocation]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Location Sharing</h3>
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : isTracking ? (
        <div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span>Sharing your location</span>
          </div>
          {currentLocation && (
            <div className="mt-2 text-sm text-gray-600">
              Lat: {currentLocation.latitude.toFixed(6)}, Lng: {currentLocation.longitude.toFixed(6)}
            </div>
          )}
          <div className="mt-2 text-sm text-gray-600">
            Status: <span className="font-semibold capitalize">{status}</span>
          </div>
        </div>
      ) : (
        <div className="text-yellow-500">Starting location tracking...</div>
      )}
    </div>
  );
};

export default LocationUpdater;