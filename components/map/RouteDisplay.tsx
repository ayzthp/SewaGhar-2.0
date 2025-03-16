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

const RouteDisplay: React.FC<RouteDisplayProps> = ({
  providerLocation,
  customerLocation,
  apiKey = "", // Default to empty string if not provided
}) => {
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const map = useMap();

  useEffect(() => {
    const fetchRoute = async () => {
      if (!providerLocation || !customerLocation) return;
      
      // If no API key is provided, just show a direct line
      if (!apiKey) {
        setRouteCoordinates([
          [providerLocation.latitude, providerLocation.longitude],
          [customerLocation.latitude, customerLocation.longitude]
        ]);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Format coordinates for OpenRouteService API
        // Note: OpenRouteService expects [longitude, latitude] format
        const start = `${providerLocation.longitude},${providerLocation.latitude}`;
        const end = `${customerLocation.longitude},${customerLocation.latitude}`;
        
        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start}&end=${end}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch route: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Extract coordinates from the response
        if (data.features && data.features.length > 0) {
          // OpenRouteService returns coordinates as [longitude, latitude]
          // We need to convert them to [latitude, longitude] for Leaflet
          const coordinates = data.features[0].geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );
          
          setRouteCoordinates(coordinates);
          
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

  return routeCoordinates.length > 0 ? (
    <Polyline 
      positions={routeCoordinates} 
      color="blue" 
      weight={5} 
      opacity={0.7} 
      dashArray="10, 10"
    />
  ) : null;
};

export default RouteDisplay;