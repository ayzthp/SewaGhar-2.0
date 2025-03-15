import type React from "react"
import type { ServiceRequest, ProviderProfile } from "@/lib/firebase"
import Link from "next/link"

interface AcceptedRequestsProps {
  requests: ServiceRequest[]
  providerProfiles: { [key: string]: ProviderProfile }
}

const AcceptedRequests: React.FC<AcceptedRequestsProps> = ({ requests, providerProfiles }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Accepted Requests</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {requests.map((request) => (
          <li key={request.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-indigo-600 truncate">{request.description}</p>
              <div className="ml-2 flex-shrink-0 flex">
                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Accepted
                </p>
              </div>
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="sm:flex">
                <p className="flex items-center text-sm text-gray-500">Location: {request.location}</p>
                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">Wage: ${request.wage}</p>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                Provider: {providerProfiles[request.provider_id!]?.name || "Loading..."}
              </div>
            </div>
            <div className="mt-2">
              <Link
                href={`/chat/${request.id}`}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Chat with Provider
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AcceptedRequests

