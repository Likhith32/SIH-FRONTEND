"use client"

import { useHealth } from "@/lib/health-context"

export default function ViewResultsPage() {
  const { healthData } = useHealth()

  const getRiskLevel = (score?: number) => {
    if (!score) return "Unknown"
    if (score >= 85) return "Critical"
    if (score >= 70) return "High"
    if (score >= 40) return "Medium"
    return "Low"
  }

  const getRiskColor = (score?: number) => {
    if (!score) return "text-gray-500"
    if (score >= 85) return "text-red-800"
    if (score >= 70) return "text-orange-600"
    if (score >= 40) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Predicted Household Risk Levels</h1>
      {healthData.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthData.map((data, idx) => (
            <div key={data.id} className="border rounded-lg p-4 shadow bg-white">
              <h2 className="font-medium text-gray-800">{data.householdId || `Household ${idx + 1}`}</h2>
              <p className="text-sm text-gray-600">Location: {data.location}</p>
              <p className="text-sm text-gray-600">
                Symptoms: {data.symptoms.length > 0 ? data.symptoms.join(", ") : "None reported"}
              </p>
              <p className="text-sm text-gray-600">Water Source: {data.waterSource}</p>
              <p className="text-sm text-gray-600">Sanitation: {data.sanitationAccess}</p>
              <p className={`mt-2 font-bold ${getRiskColor(data.riskScore)}`}>
                Risk: {getRiskLevel(data.riskScore)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Reported by: {data.ashaWorker}</p>
              <p className="text-xs text-gray-400">Date: {new Date(data.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No analysis available. Enter health data first.</p>
      )}
    </div>
  )
}
