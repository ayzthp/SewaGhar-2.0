import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 bg-blue-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-4">SewaGhar</h1>
            <p className="text-blue-100 mb-6">
              Connect with local service providers or find customers for your services. Our platform makes it easy to
              request and provide services in your community.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="bg-blue-500 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p>Find trusted service providers in your area</p>
              </div>
              <div className="flex items-center">
                <div className="bg-blue-500 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p>Offer your services and grow your business</p>
              </div>
              <div className="flex items-center">
                <div className="bg-blue-500 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p>Secure payments and reliable service</p>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 p-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Choose Your Role</h2>
            <div className="space-y-4">
              <Link href="/customer-signin" className="block w-full">
                <Button className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700">Customer Login</Button>
              </Link>
              <p className="text-center text-gray-500">Looking for services? Sign in as a customer.</p>

              <Link href="/provider-signin" className="block w-full">
                <Button className="w-full py-6 text-lg bg-green-600 hover:bg-green-700">Provider Login</Button>
              </Link>
              <p className="text-center text-gray-500">Offering services? Sign in as a provider.</p>

              <div className="pt-4 text-center">
                <p className="text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-blue-600 hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

