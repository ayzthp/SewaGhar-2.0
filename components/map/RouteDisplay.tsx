"use client";

import { useEffect, useState } from "react";
import { Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RouteDisplayProps {
  providerLocation: { latitude: number; longitude: number };
  customerLocation: { latitude: number; longitude: number };
  apiKey?: string;
}

interface RouteInfo {
  coordinates: [number, number][];
  duration: number;
  distance: number;
}

const RouteDisplay: React.FC<RouteDisplayProps> = ({
  providerLocation,
  customerLocation,
  apiKey = "", // Default to empty string if not provided
}) => {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const map = useMap();

  useEffect(() => {
    const fetchRoute = async () => {
      if (!providerLocation || !customerLocation) return;
      
      // If no API key is provided, just show a direct line
      if (!apiKey) {
        const directLine = [
          [providerLocation.latitude, providerLocation.longitude],
          [customerLocation.latitude, customerLocation.longitude]
        ] as [number, number][];
        setRouteInfo({
          coordinates: directLine,
          duration: 0,
          distance: 0
        });
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Format coordinates for OpenRouteService API
        // Note: OpenRouteService expects [longitude, latitude] format
        const start = `${providerLocation.longitude},${providerLocation.latitude}`;
        const end = `${customerLocation.longitude},${customerLocation.latitude}`;
        
        const url = `https://api.openrouteservice.org/v2/directions/driving-car?start=${start}&end=${end}`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch route: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Extract route information from the response
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          // OpenRouteService returns coordinates as [longitude, latitude]
          // We need to convert them to [latitude, longitude] for Leaflet
          const coordinates = feature.geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );
          
          const duration = feature.properties.segments[0].duration; // in seconds
          const distance = feature.properties.segments[0].distance; // in meters
          
          setRouteInfo({
            coordinates,
            duration,
            distance
          });
          
          // Fit the map to the route bounds
          if (coordinates.length > 0) {
            const bounds = coordinates.reduce(
              (bounds: L.LatLngBounds, coord: [number, number]) => bounds.extend(coord),
              L.latLngBounds(coordinates[0], coordinates[0])
            );
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        } else {
          setError("No route found");
        }
      } catch (err) {
        console.error("Error fetching route:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch route");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRoute();
  }, [providerLocation, customerLocation, apiKey, map]);

  if (isLoading) {
    return <div className="text-center p-2">Loading route...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-2">{error}</div>;
  }

  if (!routeInfo) return null;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDistance = (meters: number) => {
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${Math.round(meters)}m`;
  };

  return (
    <>
      <Polyline 
        positions={routeInfo.coordinates} 
        color="blue" 
        weight={5} 
        opacity={0.7} 
        dashArray="10, 10"
      />
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md z-[1000]">
        <div className="text-sm font-medium">
          <div>ETA: {formatDuration(routeInfo.duration)}</div>
          <div>Distance: {formatDistance(routeInfo.distance)}</div>
        </div>
      </div>
    </>
  );
};

export default RouteDisplay;