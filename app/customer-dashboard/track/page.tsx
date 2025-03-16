"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";

const ProviderMap = dynamic(() => import("@/components/map/ProviderMap"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-gray-100 animate-pulse rounded-lg"></div>
});

const RouteDisplay = dynamic(() => import("@/components/map/RouteDisplay"), {
  ssr: false,
  loading: () => null
});
import { getProviderProfile } from "@/lib/firebase";
// Removed unused import: import { getProviderLocation, subscribeToProviderLocation } from "@/lib/location";
import { subscribeToProviderLocation } from "@/lib/location";
import type { ProviderProfile } from "@/lib/firebase";
import type { ProviderLocation } from "@/lib/location";

export default function TrackProviderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const providerId = searchParams.get("providerId");
  const requestId = searchParams.get("requestId");
  
  const [customerLocation, setCustomerLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [providerLocation, setProviderLocation] = useState<ProviderLocation | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Using a constant instead of state since it's not changing
  const openRouteServiceApiKey = "5b3ce3597851110001cf6248f8f3a6f1d9b74b3c8c1c1c6e6c2e2c0c"; // OpenRouteService API key
  
  useEffect(() => {
    // Check if user is logged in
    const user = auth.currentUser;
    if (!user) {
      router.push("/signin");
      return;
    }
    
    // Check if providerId is provided
    if (!providerId) {
      setError("Provider ID is missing");
      return;
    }
    
    // Get customer's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCustomerLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Could not get your location. Please enable location services.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
    
    // Fetch provider profile
    const fetchProviderProfile = async () => {
      try {
        const profile = await getProviderProfile(providerId);
        if (profile) {
          setProviderProfile(profile);
        } else {
          setError("Provider not found");
        }
      } catch (err) {
        console.error("Error fetching provider profile:", err);
        setError("Failed to load provider information");
      }
    };
    
    // Subscribe to provider location updates
    let unsubscribe: (() => void) | null = null;
    
    const subscribeToLocation = () => {
      unsubscribe = subscribeToProviderLocation(providerId, (location) => {
        if (location) {
          setProviderLocation(location);
        }
      });
    };
    
    fetchProviderProfile();
    subscribeToLocation();
    
    // Clean up subscription on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [providerId, requestId, router]);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar userType="customer" />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Track Service Provider</h1>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
        
        {error ? (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Provider info card */}
            {providerProfile && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">{providerProfile.name}</h2>
                {providerProfile.skills && (
                  <p className="text-gray-600">Skills: {providerProfile.skills}</p>
                )}
                {providerLocation && (
                  <div className="mt-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm font-medium capitalize">
                        Status: {providerLocation.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Map with provider location and route */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Live Location</h2>
              <div className="h-[600px] relative">
                {customerLocation && providerId && (
                  <ProviderMap
                    providerId={providerId}
                    customerLocation={customerLocation}
                  >
                    {providerLocation && customerLocation && (
                      <RouteDisplay
                        providerLocation={providerLocation}
                        customerLocation={customerLocation}
                        apiKey={openRouteServiceApiKey}
                      />
                    )}
                  </ProviderMap>
                )}
              </div>
            </div>
            
            {/* Estimated arrival info */}
            {providerLocation && customerLocation && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">Estimated Arrival</h2>
                <p className="text-gray-600">
                  The service provider is on their way to your location.
                </p>
                {/* You could add estimated time calculation here based on distance */}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}