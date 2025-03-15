"use client"

import type React from "react"

import type { ServiceRequest } from "@/lib/firebase"

interface CompletedRequestsListProps {
  requests: ServiceRequest[]
  onRequestClick: (request: ServiceRequest) => void
}

const CompletedRequestsList: React.FC<CompletedRequestsListProps> = ({ requests, onRequestClick }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <ul className="divide-y divide-gray-200">
        {requests.map((request) => (
          <li
            key={request.id}
            className="px-4 py-4 sm:px-6 hover:bg-accent cursor-pointer"
            onClick={() => onRequestClick(request)}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-indigo-600 truncate">{request.description}</p>
              <div className="ml-2 flex-shrink-0 flex">
                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                  Completed
                </p>
              </div>
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="sm:flex">
                <p className="flex items-center text-sm text-gray-500">Location: {request.location}</p>
                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">Wage: ${request.wage}</p>
              </div>
              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                Completed on: {new Date(request.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CompletedRequestsList

