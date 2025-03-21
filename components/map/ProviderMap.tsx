"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ProviderLocation, subscribeToProviderLocation, getNearbyProviders } from "@/lib/location";
import { ProviderProfile, getProviderProfile } from "@/lib/firebase";

// Fix Leaflet icon issue in Next.js
const fixLeafletIcon = () => {
  // Only run on the client side
  if (typeof window !== "undefined") {
    // @ts-expect-error - Leaflet's Icon.Default prototype structure is not fully typed
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }
};



interface ProviderMapProps {
  customerId?: string; // Kept for future use
  providerId?: string;
  customerLocation?: { latitude: number; longitude: number };
  onProviderSelect?: (providerId: string) => void;
  showAllProviders?: boolean;
  children?: React.ReactNode;
}

const ProviderMap: React.FC<ProviderMapProps> = ({
  // customerId, // Commented out as currently unused
  providerId,
  customerLocation,
  onProviderSelect,
  showAllProviders = false,
  children,
}) => {
  const [providers, setProviders] = useState<Array<ProviderLocation & { profile?: ProviderProfile }>>([]);
  // const [selectedProvider, setSelectedProvider] = useState<string | null>(null); // Commented out as currently unused
  const [mapCenter] = useState<[number, number]>([27.7172, 85.3240]); // Default to Kathmandu
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Fix Leaflet icon issue
  useEffect(() => {
    fixLeafletIcon();
  }, []);

  // Load provider locations
  useEffect(() => {
    if (!isMapInitialized) return;
    
    let unsubscribe: (() => void) | null = null;
    
    const loadProviders = async () => {
      if (providerId) {
        // If providerId is provided, just track that specific provider
        const providerProfile = await getProviderProfile(providerId);
        
        unsubscribe = subscribeToProviderLocation(providerId, (location) => {
          if (location) {
            setProviders([{ ...location, profile: providerProfile || undefined }]);
          }
        });
      } else if (showAllProviders && customerLocation) {
        // If showing all providers and we have customer location
        const nearbyProviders = await getNearbyProviders(
          customerLocation.latitude,
          customerLocation.longitude,
          10 // 10km radius
        );
        
        // Get profiles for all providers
        const providersWithProfiles = await Promise.all(
          nearbyProviders.map(async (provider) => {
            const profile = await getProviderProfile(provider.providerId);
            return { ...provider, profile: profile || undefined };
          })
        );
        
        setProviders(providersWithProfiles);
      }
    };
    
    loadProviders();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [providerId, customerLocation, showAllProviders, isMapInitialized]);


  const handleProviderClick = (providerId: string) => {
    // setSelectedProvider(providerId); // Commented out as currently unused
    if (onProviderSelect) {
      onProviderSelect(providerId);
    }
  };

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        whenReady={() => setIsMapInitialized(true)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Customer location marker */}
        {customerLocation && (
          <Marker position={[customerLocation.latitude, customerLocation.longitude]}>
            <Popup>Your Location</Popup>
          </Marker>
        )}
        
        {/* Provider markers */}
        {providers.map((provider) => (
          <Marker 
            key={provider.providerId}
            position={[provider.latitude, provider.longitude]}
            eventHandlers={{
              click: () => handleProviderClick(provider.providerId),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{provider.profile?.name || 'Service Provider'}</h3>
                {provider.profile?.skills && (
                  <p className="text-sm">Skills: {provider.profile.skills}</p>
                )}
                <p className="text-xs mt-1">
                  Status: <span className="font-semibold capitalize">{provider.status}</span>
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Static markers with popups for interaction */}
        {providers.map((provider) => (
          <Marker 
            key={`static-${provider.providerId}`}
            position={[provider.latitude, provider.longitude]}
            eventHandlers={{
              click: () => handleProviderClick(provider.providerId),
            }}
            opacity={0} // Make it invisible but interactive
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{provider.profile?.name || 'Service Provider'}</h3>
                {provider.profile?.skills && (
                  <p className="text-sm">Skills: {provider.profile.skills}</p>
                )}
                <p className="text-xs mt-1">
                  Status: <span className="font-semibold capitalize">{provider.status}</span>
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Render children components (like RouteDisplay) */}
        {children}
      </MapContainer>
    </div>
  );
};

export default ProviderMap;