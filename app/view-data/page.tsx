"use client"
import { useHealth } from "@/lib/health-context"

export default function ViewDataPage() {
  const { healthData } = useHealth()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Recent Health Data</h1>
      {healthData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Household</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Symptoms</th>
                <th className="px-4 py-2">Water Source</th>
                <th className="px-4 py-2">Sanitation</th>
                <th className="px-4 py-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {healthData.map((data, idx) => (
                <tr key={data.id} className="border-t border-gray-200">
                  <td className="px-4 py-2">{data.householdId || `Household ${idx + 1}`}</td>
                  <td className="px-4 py-2">{data.location}</td>
                  <td className="px-4 py-2">
                    {data.symptoms.length > 0 ? data.symptoms.join(", ") : "None reported"}
                  </td>
                  <td className="px-4 py-2">{data.waterSource}</td>
                  <td className="px-4 py-2">{data.sanitationAccess}</td>
                  <td className="px-4 py-2">{new Date(data.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No data entered yet.</p>
      )}
    </div>
  )
}
