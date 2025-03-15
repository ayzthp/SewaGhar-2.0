"use client"

import type React from "react"

import type { ServiceRequest, CustomerProfile } from "@/lib/firebase"
import { handleAccept, markRequestAsNotInterested, auth, getNotInterestedRequests } from "@/lib/firebase"
import { MapPin, DollarSign, User, X } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

interface AvailableRequestsProps {
  requests: ServiceRequest[]
  customerProfiles: { [key: string]: CustomerProfile }
  onNotInterestedUpdate: (requestId: string) => void
}

const AvailableRequests: React.FC<AvailableRequestsProps> = ({ requests, customerProfiles, onNotInterestedUpdate }) => {
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null)
  const [notInterestedRequests, setNotInterestedRequests] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const fetchNotInterestedRequests = async () => {
      if (auth.currentUser) {
        const notInterested = await getNotInterestedRequests(auth.currentUser.uid)
        setNotInterestedRequests(notInterested)
      }
    }
    fetchNotInterestedRequests()
  }, [])

  const toggleExpand = (requestId: string) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId)
  }

  const handleNotInterested = async (requestId: string) => {
    if (
      window.confirm(
        "Are you sure you want to mark this request as 'Not Interested'? You won't see it in your dashboard anymore.",
      )
    ) {
      if (auth.currentUser) {
        await markRequestAsNotInterested(requestId, auth.currentUser.uid)
        setNotInterestedRequests((prev) => ({ ...prev, [requestId]: true }))
        // Call the callback to update parent component state
        onNotInterestedUpdate(requestId)
      }
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    await handleAccept(requestId)
    // You might want to update some local state or show a notification here
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-blue-600 text-white">
        <h2 className="text-xl font-semibold">Available Requests</h2>
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
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Available
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
                  onClick={() => handleAcceptRequest(request.id)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Accept Request
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
    </div>
  )
}

export default AvailableRequests

