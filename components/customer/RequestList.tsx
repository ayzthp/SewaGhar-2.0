"use client"

import type React from "react"

import { useState } from "react"
import type { ServiceRequest, ProviderProfile } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import ImageZoomModal from "@/components/ImageZoomModal"
import Chat from "@/components/Chat"
import { DollarSign, MapPin, Clock, MessageCircle } from "lucide-react"
import { ref, update } from "firebase/database"
import { db } from "@/lib/firebase"
import Image from "next/image"

import ProviderProfileView from "@/components/customer/ProviderProfile"

interface RequestListProps {
  title: string
  requests: ServiceRequest[]
  providerProfiles: { [key: string]: ProviderProfile }
}

const RequestList: React.FC<RequestListProps> = ({ title, requests, providerProfiles }) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [activeChatRequest, setActiveChatRequest] = useState<string | null>(null)
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({})
  const [selectedProviderProfile, setSelectedProviderProfile] = useState<ProviderProfile | null>(null)
  const router = useRouter()





  const handleMarkAsCompleted = async (requestId: string) => {
    try {
      const requestRef = ref(db, `service_requests/${requestId}`)
      await update(requestRef, { status: "completed", updatedAt: Date.now() })
      alert("Request marked as completed.")
    } catch (error) {
      console.error("Error marking request as completed:", error)
    }
  }



  const renderRequestItem = (request: ServiceRequest) => (
    <li key={request.id} className="bg-white shadow-md rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{request.title || request.description.substring(0, 50)}</h3>
          <p className="text-gray-600">{request.description}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-500 flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> {request.location}
            </p>
            <p className="text-sm text-gray-500 flex items-center">
              <DollarSign className="w-4 h-4 mr-1" /> Wage: ${request.wage}
            </p>
            <p className="text-sm text-gray-500 flex items-center">
              <Clock className="w-4 h-4 mr-1" /> Created: {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
          <p className="text-sm font-medium mt-2">
            Status: <span className="capitalize">{request.status}</span>
            {request.status === "pending" && request.provider_id && (
              <span className="ml-2 text-red-500">(Provider no longer interested)</span>
            )}
          </p>
          {request.provider_id && (
            <p className="text-sm text-gray-500 mt-1">
              Provider: {providerProfiles[request.provider_id]?.name || "Assigned"}
            </p>
          )}
        </div>
        {request.imageUrl && (
          <Image
            src={request.imageUrl || "/placeholder.svg"}
            alt="Request"
            width={200}
            height={200}
            className="w-24 h-24 object-cover rounded-lg cursor-pointer"
            onClick={() => setZoomedImage(request.imageUrl || null)}
          />
        )}
      </div>
      {request.status === "accepted" && (
        <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveChatRequest(request.id)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat with Provider
            {unreadCounts[request.id] > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCounts[request.id]}
              </span>
            )}
          </button>
          <button
            onClick={() => handleMarkAsCompleted(request.id)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Mark as Completed
          </button>
          <button
            onClick={() => setSelectedProviderProfile(providerProfiles[request.provider_id!])}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            View Provider Profile
          </button>
          <button
            onClick={() => router.push(`/customer-dashboard/track?providerId=${request.provider_id}&requestId=${request.id}`)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Track Provider
          </button>
        </div>
      )}

      {request.latitude && request.longitude && (
        <a
          href={`https://www.google.com/maps?q=${request.latitude},${request.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-blue-500 hover:underline"
        >
          View on Google Maps
        </a>
      )}
    </li>
  )

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {requests.length > 0 ? (
        <ul className="space-y-4">{requests.map(renderRequestItem)}</ul>
      ) : (
        <p className="text-gray-500">No {title.toLowerCase()} at the moment.</p>
      )}
      {zoomedImage && <ImageZoomModal imageUrl={zoomedImage} onClose={() => setZoomedImage(null)} />}
      {activeChatRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Chat</h3>
              <button onClick={() => setActiveChatRequest(null)} className="text-gray-500 hover:text-gray-700">
                Close
              </button>
            </div>
            <Chat
              requestId={activeChatRequest}
              otherUserId={requests.find((r) => r.id === activeChatRequest)?.provider_id || ""}
              onUnreadCountChange={(count) => {
                setUnreadCounts(prev => ({
                  ...prev,
                  [activeChatRequest]: count
                }))
              }}
            />
          </div>
        </div>
      )}

      {selectedProviderProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Provider Profile</h3>
              <button onClick={() => setSelectedProviderProfile(null)} className="text-gray-500 hover:text-gray-700">
                Close
              </button>
            </div>
            <ProviderProfileView profile={selectedProviderProfile} />
          </div>
        </div>
      )}
    </div>
  )
}

export default RequestList

