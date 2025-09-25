"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Wifi,
  WifiOff,
  Thermometer,
  Droplets,
  Wind,
  Activity,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  Plus,
  Send,
} from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useHealth } from "@/lib/health-context"

const API_BASE = "https://sih-backend-vjdd.onrender.com"

export default function SensorsPage() {
  const { iotSensors, updateSensorData, addAlert } = useHealth()
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [manualValue, setManualValue] = useState("")
  const [showManualInput, setShowManualInput] = useState(false)

  // New fetchLatestReading function to call the backend
  const fetchLatestReading = async (sensorId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/sensors/${sensorId}/latest`)
      const data = await res.json()
      if (data.value && data.timestamp) {
        updateSensorData(sensorId, data.value, data.timestamp)
      }
    } catch (err) {
      console.error(`Error fetching latest reading for sensor ${sensorId}:`, err)
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      iotSensors.forEach((sensor) => {
        if (sensor.status !== "offline") fetchLatestReading(sensor.id)
      })
    }, 30000)

    // Initial fetch
    iotSensors.forEach((sensor) => {
      if (sensor.status !== "offline") fetchLatestReading(sensor.id)
    })

    return () => clearInterval(interval)
  }, [iotSensors])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all(
      iotSensors.map((sensor) => {
        return fetchLatestReading(sensor.id)
      })
    )
    setIsRefreshing(false)
  }

  // New handleManualReading function to post to the backend
  const handleManualReading = async () => {
    if (selectedSensor && manualValue) {
      const value = Number.parseFloat(manualValue)
      if (!isNaN(value)) {
        try {
          const res = await fetch(`${API_BASE}/api/sensors/${selectedSensor}/manual`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value }),
          })
          const saved = await res.json()
          updateSensorData(selectedSensor, saved.value, saved.timestamp)

          addAlert({
            title: "Manual Reading Added",
            message: `Manual reading of ${saved.value} ${saved.unit} added for ${saved.name}`,
            severity: "low",
            location: saved.location,
            status: "active",
            channels: ["Dashboard"],
            source: "manual",
          })

          setManualValue("")
          setShowManualInput(false)
        } catch (err) {
          console.error("Failed to save manual reading:", err)
        }
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800 border-green-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "offline":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-4 h-4" />
      case "warning":
        return <AlertTriangle className="w-4 h-4" />
      case "offline":
        return <WifiOff className="w-4 h-4" />
      default:
        return <Wifi className="w-4 h-4" />
    }
  }

  const isValueInRange = (value: number, threshold: { min: number; max: number }) =>
    value >= threshold.min && value <= threshold.max

  const getValueColor = (value: number, threshold: { min: number; max: number }) =>
    isValueInRange(value, threshold) ? "text-green-600" : "text-red-600"

  const getSensorIcon = (type: string) => {
    switch (type) {
      case "water_quality":
        return <Droplets className="w-5 h-5" />
      case "weather":
        return <Thermometer className="w-5 h-5" />
      case "air_quality":
        return <Wind className="w-5 h-5" />
      case "flow_rate":
        return <Activity className="w-5 h-5" />
      default:
        return <Activity className="w-5 h-5" />
    }
  }

  const networkStats = {
    online: iotSensors.filter((s) => s.status === "online").length,
    offline: iotSensors.filter((s) => s.status === "offline").length,
    warnings: iotSensors.filter((s) => s.status === "warning").length,
    uptime: Math.round(
      (iotSensors.filter((s) => s.status !== "offline").length / iotSensors.length) * 100 * 10
    ) / 10,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">IoT Sensor Network</h1>
                <p className="text-sm text-gray-600">Real-time environmental monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live Data
                </div>
              </div>
              <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" size="sm">
                <Settings className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Network Overview */}
          <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Sensor Network Status</CardTitle>
                  <CardDescription>Environmental monitoring across rural Northeast India</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{networkStats.online}</div>
                  <div className="text-sm text-gray-600">Online Sensors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 mb-1">{networkStats.offline}</div>
                  <div className="text-sm text-gray-600">Offline Sensors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">{networkStats.warnings}</div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{networkStats.uptime}%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sensor List */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Active Sensors</h2>

              <div className="space-y-4">
                {iotSensors.map((sensor) => (
                  <Card
                    key={sensor.id}
                    className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm cursor-pointer transition-all hover:shadow-xl ${
                      selectedSensor === sensor.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setSelectedSensor(sensor.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-100">{getSensorIcon(sensor.type)}</div>
                          <div>
                            <CardTitle className="text-lg">{sensor.name}</CardTitle>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <MapPin className="w-3 h-3" />
                              {sensor.location}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(sensor.status)}>
                          {getStatusIcon(sensor.status)}
                          <span className="ml-1 capitalize">{sensor.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-2xl font-bold ${getValueColor(sensor.value, sensor.threshold)}`}>
                            {sensor.value.toFixed(1)}
                            <span className="text-sm font-normal text-gray-600 ml-1">{sensor.unit}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Range: {sensor.threshold.min} - {sensor.threshold.max} {sensor.unit}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {sensor.lastReading}
                          </div>
                        </div>
                      </div>

                      {/* Value indicator bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>{sensor.threshold.min}</span>
                          <span>Current: {sensor.value.toFixed(1)}</span>
                          <span>{sensor.threshold.max}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              isValueInRange(sensor.value, sensor.threshold) ? "bg-green-500" : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  ((sensor.value - sensor.threshold.min) /
                                    (sensor.threshold.max - sensor.threshold.min)) *
                                    100,
                                ),
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sensor Details & Charts */}
            <div className="space-y-6">
              {selectedSensor ? (
                <>
                  {/* Selected Sensor Chart */}
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">24-Hour Trend</CardTitle>
                      <CardDescription>{iotSensors.find((s) => s.id === selectedSensor)?.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={iotSensors.find((s) => s.id === selectedSensor)?.readings || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                            <XAxis dataKey="timestamp" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#2563eb"
                              strokeWidth={3}
                              dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Manual Reading</CardTitle>
                      <CardDescription>Add manual sensor reading</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!showManualInput ? (
                        <Button
                          onClick={() => setShowManualInput(true)}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Manual Reading
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="manual-value">
                              Value ({iotSensors.find((s) => s.id === selectedSensor)?.unit})
                            </Label>
                            <Input
                              id="manual-value"
                              type="number"
                              value={manualValue}
                              onChange={(e) => setManualValue(e.target.value)}
                              placeholder="Enter reading value"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleManualReading} className="flex-1">
                              <Send className="w-4 h-4 mr-2" />
                              Submit
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowManualInput(false)
                                setManualValue("")
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Sensor Configuration */}
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Sensor Configuration</CardTitle>
                      <CardDescription>Settings and calibration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Reading Interval</span>
                        <span className="font-medium">5 minutes</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Data Retention</span>
                        <span className="font-medium">30 days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Alert Threshold</span>
                        <span className="font-medium">Enabled</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Battery Level</span>
                        <div className="flex items-center gap-2">
                          <Progress value={78} className="w-16 h-2" />
                          <span className="font-medium">78%</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4 bg-transparent">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure Sensor
                      </Button>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a sensor to view detailed information and add manual readings</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Sensor management tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Add New Sensor
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Activity className="w-4 h-4 mr-2" />
                    Calibrate Sensors
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Set Alert Rules
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Wifi className="w-4 h-4 mr-2" />
                    Network Diagnostics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
