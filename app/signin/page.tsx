"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import CustomerSignIn from "@/components/CustomerSignIn"
import ProviderSignIn from "@/components/ProviderSignIn"
import { auth } from "@/lib/firebase"
import { User, Briefcase } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<"customer" | "provider">("customer")

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, redirect to the appropriate dashboard
        router.push("/customer-dashboard")
      }
    })

    return () => unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500 relative">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl relative z-10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Welcome to SewaGhar</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account or{" "}
            <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
            </Link>
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setUserType("customer")}
              className={`flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
                userType === "customer"
                  ? "bg-indigo-600 text-white border-transparent"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <User className="mr-2 h-5 w-5" />
              Customer
            </button>
            <button
              onClick={() => setUserType("provider")}
              className={`flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
                userType === "provider"
                  ? "bg-indigo-600 text-white border-transparent"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <Briefcase className="mr-2 h-5 w-5" />
              Service Provider
            </button>
          </div>
          {userType === "customer" ? <CustomerSignIn /> : <ProviderSignIn />}
        </div>
      </div>
    </div>
  )
}

