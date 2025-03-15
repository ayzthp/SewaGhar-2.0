"use client"

import { useState, useEffect } from "react"
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database"
import { db, auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import type { ServiceRequest, ProviderProfile } from "@/lib/firebase"
import Navbar from "@/components/Navbar"
import ProblemSubmissionForm from "@/components/customer/ProblemSubmissionForm"
import RequestList from "@/components/customer/RequestList"

export default function CustomerDashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
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
        ? Object.entries(requestsData).map(([key, data]) => ({ ...(data as ServiceRequest), id: key }))
        : []
      setRequests(requestsList)
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

  const pendingRequests = requests.filter((request) => request.status === "pending")
  const acceptedRequests = requests.filter((request) => request.status === "accepted")

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar userType="customer" />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Customer Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ProblemSubmissionForm />
          </div>
          <div className="space-y-6">
            <RequestList
              title="Pending Requests"
              requests={pendingRequests}
              providerProfiles={providerProfiles}
            />
            <RequestList
              title="Accepted Requests"
              requests={acceptedRequests}
              providerProfiles={providerProfiles}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

