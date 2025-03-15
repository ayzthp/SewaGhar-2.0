import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase, ref, get, set, update } from "firebase/database"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyC8q580wSDEbSDs4SKLMqjj5PtPHaHgRqw",
  authDomain: "gharsewa-442a2.firebaseapp.com",
  projectId: "gharsewa-442a2",
  storageBucket: "gharsewa-442a2.appspot.com",
  messagingSenderId: "306387121230",
  appId: "1:306387121230:web:c4d7888343d2881c1e7f1f",
  measurementId: "G-6N1H42ZWMZ",
  databaseURL: "https://gharsewa-442a2-default-rtdb.asia-southeast1.firebasedatabase.app",
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getDatabase(app)
const storage = getStorage(app)

export type ServiceRequest = {
  id: string
  customer_id: string
  provider_id: string | null
  description: string
  location: string
  wage: number
  contactNumber: string
  status: "pending" | "accepted" | "completed"
  createdAt: number
  updatedAt: number
  imageUrl?: string
  latitude?: number | null
  longitude?: number | null
  title?: string
  reviewed?: boolean
}

export type ChatMessage = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  timestamp: number
  read: boolean
}



export type ProviderProfile = {
  id: string
  name: string
  email: string
  skills: string
  userType: string
  averageRating?: number
  bio?: string
  profilePicture?: string
}

export type CustomerProfile = {
  id: string
  name: string
  email: string
  userType: string
}

export type NotInterestedRequests = {
  [requestId: string]: boolean
}

// Add UnreadCounts type
export type UnreadCounts = {
  [requestId: string]: number
}

export interface ProviderData {
  userType: string
  name: string
  email: string
  skills?: string
  latitude?: number
  longitude?: number
  averageRating?: number
}

export { app, auth, db, storage }

export const getProviderProfile = async (providerId: string): Promise<ProviderProfile | null> => {
  const providerRef = ref(db, `users/${providerId}`)
  const snapshot = await get(providerRef)
  return snapshot.val()
}

export const handleAccept = async (requestId: string) => {
  const user = auth.currentUser
  if (user) {
    try {
      const requestRef = ref(db, `service_requests/${requestId}`)
      await update(requestRef, {
        provider_id: user.uid,
        status: "accepted",
        updatedAt: Date.now(),
      })
    } catch (error) {
      console.error("Error accepting request:", error)
    }
  }
}

export const markRequestAsNotInterested = async (requestId: string, providerId?: string) => {
  const user = auth.currentUser
  if (user) {
    try {
      const providerIdToUse = providerId || user.uid

      // Add the request to the provider's not interested requests
      const notInterestedRef = ref(db, `providers/${providerIdToUse}/notInterestedRequests/${requestId}`)
      await set(notInterestedRef, true)

      // Update the service request status only if the current provider is assigned to it
      const requestRef = ref(db, `service_requests/${requestId}`)
      const requestSnapshot = await get(requestRef)
      const requestData = requestSnapshot.val() as ServiceRequest

      if (requestData && requestData.provider_id === providerIdToUse) {
        await update(requestRef, {
          status: "pending",
          provider_id: null,
          updatedAt: Date.now(),
        })
      }
    } catch (error) {
      console.error("Error marking request as not interested:", error)
    }
  }
}

export const getNotInterestedRequests = async (providerId: string): Promise<{ [key: string]: boolean }> => {
  const notInterestedRef = ref(db, `providers/${providerId}/notInterestedRequests`)
  const snapshot = await get(notInterestedRef)
  return snapshot.val() || {}
}

// Add getUnreadCounts function
export const getUnreadCounts = async (userId: string): Promise<UnreadCounts> => {
  const unreadCountsRef = ref(db, `unreadCounts/${userId}`)
  const snapshot = await get(unreadCountsRef)
  return snapshot.val() || {}
}

