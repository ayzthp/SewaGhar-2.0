"use client"

import type React from "react"

import type { ServiceRequest, CustomerProfile, NotInterestedRequests } from "@/lib/firebase"
import { useState } from "react"
import Chat from "@/components/Chat"
import { MapPin, DollarSign, User, MessageCircle, X } from "lucide-react"
import { markRequestAsNotInterested } from "@/lib/firebase"
import Image from "next/image"

interface AcceptedRequestsProps {
  requests: ServiceRequest[]

  customerProfiles: { [key: string]: CustomerProfile }
  notInterestedRequests: NotInterestedRequests
  onNotInterestedUpdate: (requestId: string) => void
}

const AcceptedRequests: React.FC<AcceptedRequestsProps> = ({
  requests,
  customerProfiles,
  notInterestedRequests,
  onNotInterestedUpdate,
}) => {
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null)
  const [activeChatRequest, setActiveChatRequest] = useState<string | null>(null)

  const toggleExpand = (requestId: string) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId)
  }

  const handleNotInterested = async (requestId: string) => {
    if (
      window.confirm(
        "Are you sure you want to mark this request as not interested? This will change the status back to pending.",
      )
    ) {
      await markRequestAsNotInterested(requestId)
      // Call the callback to update parent component state
      onNotInterestedUpdate(requestId)
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-green-600 text-white">
        <h2 className="text-xl font-semibold">Accepted Requests</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {requests
          .filter((request) => !notInterestedRequests[request.id])
          .map((request) => (
            <li key={request.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {request.title || request.description.substring(0, 30)}
                </h3>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Accepted
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{request.description}</p>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    {request.location}
                  </p>
                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                    <DollarSign className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    Wage: ${request.wage}
                  </p>
                </div>
                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  Client: {customerProfiles[request.customer_id]?.name || "Unknown"}
                </p>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => setActiveChatRequest(request.id)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat with Customer

                </button>
                <button
                  onClick={() => handleNotInterested(request.id)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <X className="mr-2 h-4 w-4" />
                  Not Interested
                </button>
                <button
                  onClick={() => toggleExpand(request.id)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  {expandedRequest === request.id ? "Hide Details" : "Show Details"}
                </button>
              </div>
              {expandedRequest === request.id && (
                <div className="mt-4 space-y-2">
                  {request.imageUrl && (
                    <div className="relative w-full h-64">
                      <Image
                        src={request.imageUrl || "/placeholder.svg"}
                        alt="Request"
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                  )}
                  {request.latitude && request.longitude && (
                    <p className="text-sm text-gray-500">
                      Location:{" "}
                      <a
                        href={`https://www.google.com/maps?q=${request.latitude},${request.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View on Google Maps
                      </a>
                    </p>
                  )}
                  <p className="text-sm text-gray-500">Contact Number: {request.contactNumber}</p>
                </div>
              )}
            </li>
          ))}
      </ul>
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
              otherUserId={requests.find((r) => r.id === activeChatRequest)?.customer_id || ""}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AcceptedRequests

