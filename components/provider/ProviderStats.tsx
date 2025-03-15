import type React from "react"
import type { ServiceRequest } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface ProviderStatsProps {
  requests: ServiceRequest[]
}

const ProviderStats: React.FC<ProviderStatsProps> = ({ requests }) => {
  const completedRequests = requests.filter((request) => request.status === "completed")
  const totalEarnings = completedRequests.reduce((sum, request) => sum + (request.wage || 0), 0)
  const averageWagePerRequest = completedRequests.length > 0 ? totalEarnings / completedRequests.length : 0

  const monthlyData = completedRequests.reduce(
    (acc, request) => {
      const month = new Date(request.updatedAt).toLocaleString("default", { month: "short" })
      acc[month] = (acc[month] || 0) + (request.wage || 0)
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = Object.entries(monthlyData).map(([month, total]) => ({ month, total }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Total Completed Requests:</strong> {completedRequests.length}
          </p>
          <p>
            <strong>Total Earnings:</strong> ${totalEarnings.toFixed(2)}
          </p>
          <p>
            <strong>Average Wage per Request:</strong> ${averageWagePerRequest.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No completed requests yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ProviderStats

