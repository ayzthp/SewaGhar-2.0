"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database"
import { db, auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import type { ServiceRequest, ProviderProfile } from "@/lib/firebase"
import Navbar from "@/components/Navbar"

const CompletedRequestDetails = dynamic(
  () => import("@/components/customer/CompletedRequestDetails"),
  { ssr: false }
)

export default function CompletedRequestsPage() {
  const [completedRequests, setCompletedRequests] = useState<ServiceRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [providerProfiles, setProviderProfiles] = useState<{ [key: string]: ProviderProfile }>({})
  const router = useRouter()

  useEffect(() => {
    const user = auth.currentUser
    if (!user) {
      router.push("/signin")
      return
    }

    const requestsRef = ref(db, "service_requests")
    const userRequestsQuery = query(requestsRef, orderByChild("customer_id"), equalTo(user.uid))

    const unsubscribe = onValue(userRequestsQuery, (snapshot) => {
      const requestsData = snapshot.val()
      const requestsList = requestsData
        ? Object.entries(requestsData)
            .map(([id, data]) => ({ ...(data as ServiceRequest), id }))
            .filter((request) => request.status === "completed")
            .sort((a, b) => b.updatedAt - a.updatedAt)
        : []
      setCompletedRequests(requestsList)
    })

    // Fetch provider profiles
    const providersRef = ref(db, "users")
    const unsubscribeProviders = onValue(providersRef, (snapshot) => {
      const providersData = snapshot.val()
      const profiles: { [key: string]: ProviderProfile } = {}
      for (const [id, data] of Object.entries(providersData)) {
        if ((data as ProviderProfile).userType === "provider") {
          profiles[id] = data as ProviderProfile
        }
      }
      setProviderProfiles(profiles)
    })

    return () => {
      unsubscribe()
      unsubscribeProviders()
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar userType="customer" />
      <div className="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Completed Requests</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-1 bg-white shadow overflow-hidden rounded-lg">
            <ul className="divide-y divide-gray-200">
              {completedRequests.map((request) => (
                <li
                  key={request.id}
                  className="px-4 sm:px-6 py-3 sm:py-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                  onClick={() => setSelectedRequest(request)}
                >
                  <p className="text-sm font-medium text-indigo-600 truncate">{request.title}</p>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">{new Date(request.updatedAt).toLocaleDateString()}</p>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Provider: {providerProfiles[request.provider_id!]?.name || "Unknown"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            {selectedRequest ? (
              <CompletedRequestDetails
                request={selectedRequest}
                providerProfile={providerProfiles[selectedRequest.provider_id!]}
              />
            ) : (
              <div className="bg-white shadow overflow-hidden rounded-lg p-4 sm:p-6">
                <p className="text-sm text-gray-500">Select a completed request to view details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

