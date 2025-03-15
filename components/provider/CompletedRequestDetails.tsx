import type React from "react"
import type { ServiceRequest } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

interface CompletedRequestDetailsProps {
  request: ServiceRequest
}

const CompletedRequestDetails: React.FC<CompletedRequestDetailsProps> = ({ request }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{request.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          <strong>Description:</strong> {request.description}
        </p>
        <p>
          <strong>Location:</strong> {request.location}
        </p>
        <p>
          <strong>Wage:</strong> ${request.wage}
        </p>
        <p>
          <strong>Completed on:</strong> {new Date(request.updatedAt).toLocaleDateString()}
        </p>
        {request.imageUrl && (
          <Image 
            src={request.imageUrl || "/placeholder.svg"} 
            alt="Request" 
            width={800} 
            height={600} 
            className="mt-4 w-full h-auto rounded-lg" 
            style={{ objectFit: 'contain' }}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default CompletedRequestDetails

