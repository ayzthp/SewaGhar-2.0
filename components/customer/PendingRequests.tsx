import type React from "react"
import type { ServiceRequest } from "@/lib/firebase"

interface PendingRequestsProps {
  requests: ServiceRequest[]
}

const PendingRequests: React.FC<PendingRequestsProps> = ({ requests }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Pending Requests</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {requests.map((request) => (
          <li key={request.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-indigo-600 truncate">{request.description}</p>
              <div className="ml-2 flex-shrink-0 flex">
                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Pending
                </p>
              </div>
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="sm:flex">
                <p className="flex items-center text-sm text-gray-500">Location: {request.location}</p>
                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">Wage: ${request.wage}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PendingRequests

