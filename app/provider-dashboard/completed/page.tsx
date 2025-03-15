"use client"

import { useState, useEffect } from "react"
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database"
import { db, auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import type { ServiceRequest } from "@/lib/firebase"
import Navbar from "@/components/Navbar"
import CompletedRequestsList from "@/components/provider/CompletedRequestsList"
import CompletedRequestDetails from "@/components/provider/CompletedRequestDetails"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProviderStats from "@/components/provider/ProviderStats"

export default function CompletedRequestsPage() {
  const [completedRequests, setCompletedRequests] = useState<ServiceRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const router = useRouter()

  useEffect(() => {
    const user = auth.currentUser
    if (!user) {
      router.push("/signin")
      return
    }

    const requestsRef = ref(db, "service_requests")
    const completedRequestsQuery = query(requestsRef, orderByChild("provider_id"), equalTo(user.uid))

    const unsubscribe = onValue(completedRequestsQuery, (snapshot) => {
      const requestsData = snapshot.val()
      const requestsList = requestsData
        ? Object.entries(requestsData)
            .map(([id, data]) => ({ ...(data as ServiceRequest), id }))
            .filter((request) => request.status === "completed")
            .sort((a, b) => b.updatedAt - a.updatedAt)
        : []
      setCompletedRequests(requestsList)
    })

    return () => unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar userType="provider" />
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-6">Provider Dashboard</h1>
        <Tabs defaultValue="completed" className="w-full">
          <TabsList>
            <TabsTrigger value="completed">Completed Requests</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CompletedRequestsList requests={completedRequests} onRequestClick={setSelectedRequest} />
              {selectedRequest && <CompletedRequestDetails request={selectedRequest} />}
            </div>
          </TabsContent>
          <TabsContent value="stats">
            <ProviderStats requests={completedRequests} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

