import type React from "react"
import type { ServiceRequest, ProviderProfile } from "@/lib/firebase"
import { MapPin, DollarSign, Clock, User } from "lucide-react"
import Image from "next/image"
import Rating from "../Rating"
import ProviderMap from "../map/ProviderMap"
import RouteDisplay from "../map/RouteDisplay"

interface CompletedRequestDetailsProps {
  request: ServiceRequest
  providerProfile: ProviderProfile | undefined
}

const CompletedRequestDetails: React.FC<CompletedRequestDetailsProps> = ({ request, providerProfile }) => {
  const customerLocation = request.latitude && request.longitude
    ? { latitude: request.latitude, longitude: request.longitude }
    : undefined;
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{request.title}</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">{request.description}</p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <MapPin className="mr-2 h-5 w-5" /> Location
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{request.location}</dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <DollarSign className="mr-2 h-5 w-5" /> Wage
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${request.wage}</dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Clock className="mr-2 h-5 w-5" /> Completed Date
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {new Date(request.updatedAt).toLocaleString()}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <User className="mr-2 h-5 w-5" /> Provider
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {providerProfile ? providerProfile.name : "Unknown"}
            </dd>
          </div>
        </dl>
      </div>
      {request.imageUrl && (
        <div className="px-4 py-5 sm:px-6">
          <Image 
            src={request.imageUrl || "/placeholder.svg"} 
            alt="Request" 
            width={800} 
            height={600} 
            className="w-full h-auto rounded-lg" 
            style={{ objectFit: 'contain' }}
          />
        </div>
      )}
      {customerLocation && request.provider_id && (
        <div className="px-4 py-5 sm:px-6">
          <div className="h-[400px] w-full rounded-lg overflow-hidden">
            <ProviderMap
              providerId={request.provider_id}
              customerLocation={customerLocation}
            >
              <RouteDisplay
                providerLocation={customerLocation}
                customerLocation={customerLocation}
              />
            </ProviderMap>
          </div>
        </div>
      )}
      
      {!request.reviewed && request.provider_id && (
        <div className="px-4 py-5 sm:px-6">
          <Rating
            targetUserId={request.provider_id}
            requestId={request.id}
            userType="customer"
          />
        </div>
      )}
    </div>
  )
}

export default CompletedRequestDetails

