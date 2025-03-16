"use client"

import { useState, useEffect } from "react"
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database"
import { db, auth, getNotInterestedRequests } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import type { ServiceRequest, CustomerProfile } from "@/lib/firebase"
import Navbar from "@/components/Navbar"
import AvailableRequests from "@/components/provider/AvailableRequests"
import AcceptedRequests from "@/components/provider/AcceptedRequests"
import LocationUpdater from "@/components/map/LocationUpdater"

export default function ProviderDashboard() {
  const [availableRequests, setAvailableRequests] = useState<ServiceRequest[]>([])
  const [acceptedRequests, setAcceptedRequests] = useState<ServiceRequest[]>([])
  const [customerProfiles, setCustomerProfiles] = useState<{ [key: string]: CustomerProfile }>({})
  const [notInterestedRequests, setNotInterestedRequests] = useState<{ [key: string]: boolean }>({})
  const [blockedRequests, setBlockedRequests] = useState<{ [key: string]: boolean }>({})
  const router = useRouter()

  useEffect(() => {
    const user = auth.currentUser
    if (!user) {
      router.push("/signin")
      return
    }

    const availableRequestsRef = ref(db, "service_requests")
    const availableRequestsQuery = query(availableRequestsRef, orderByChild("status"), equalTo("pending"))

    const unsubscribeAvailable = onValue(availableRequestsQuery, (snapshot) => {
      const requestsData = snapshot.val()
      const requestsList = requestsData
        ? Object.entries(requestsData).map(([id, data]) => ({ ...data as ServiceRequest, id }))
        : []
      setAvailableRequests(requestsList)
    })

    const acceptedRequestsRef = ref(db, "service_requests")
    const acceptedRequestsQuery = query(acceptedRequestsRef, orderByChild("provider_id"), equalTo(user.uid))

    const unsubscribeAccepted = onValue(acceptedRequestsQuery, (snapshot) => {
      const requestsData = snapshot.val()
      const requestsList = requestsData
        ? Object.entries(requestsData)
            .map(([id, data]) => ({ ...data as ServiceRequest, id }))
            .filter((request) => request.status === "accepted")
        : []
      setAcceptedRequests(requestsList)
    })

    // Fetch customer profiles
    const customersRef = ref(db, "users")
    const unsubscribeCustomers = onValue(customersRef, (snapshot) => {
      const customersData = snapshot.val()
      const profiles: { [key: string]: CustomerProfile } = {}
      for (const [id, data] of Object.entries(customersData)) {
        if ((data as CustomerProfile).userType === "customer") {
          profiles[id] = data as CustomerProfile
        }
      }
      setCustomerProfiles(profiles)
    })

    // Fetch not interested requests
    if (user) {
      getNotInterestedRequests(user.uid).then(setNotInterestedRequests)
    }

    return () => {
      unsubscribeAvailable()
      unsubscribeAccepted()
      unsubscribeCustomers()
    }
  }, [router])

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const notInterestedRef = ref(db, `notInterested/${user.uid}`)
    const unsubscribeNotInterested = onValue(notInterestedRef, (snapshot) => {
      const notInterestedData = snapshot.val() || {}
      setNotInterestedRequests(notInterestedData)
    })

    const blockedRequestsRef = ref(db, `providers/${user.uid}/blockedRequests`)
    const unsubscribeBlockedRequests = onValue(blockedRequestsRef, (snapshot) => {
      const blockedRequestsData = snapshot.val() || {}
      setBlockedRequests(blockedRequestsData)
    })

    return () => {
      unsubscribeNotInterested()
      unsubscribeBlockedRequests()
    }
  }, [])

  const handleNotInterestedUpdate = (requestId: string) => {
    setNotInterestedRequests((prev) => ({ ...prev, [requestId]: true }))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar userType="provider" />
      <div className="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Provider Dashboard</h1>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            <AvailableRequests
              requests={availableRequests.filter(
                (request) => !notInterestedRequests[request.id] && !blockedRequests[request.id],
              )}
              customerProfiles={customerProfiles}
              onNotInterestedUpdate={handleNotInterestedUpdate}
            />
            <AcceptedRequests
              requests={acceptedRequests}
              customerProfiles={customerProfiles}
              notInterestedRequests={notInterestedRequests}
              onNotInterestedUpdate={handleNotInterestedUpdate}
            />
          </div>
          <div className="space-y-4 sm:space-y-6">
            <LocationUpdater status="available" updateInterval={5000} />
          </div>
        </div>
      </div>
    </div>
  )
}

