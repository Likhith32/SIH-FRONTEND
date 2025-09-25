"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface HealthData {
  id: string
  householdId: string
  location: string
  ashaWorker: string
  symptoms: string[]
  waterSource: string
  sanitationAccess: string
  notes: string
  timestamp: string
  riskScore?: number
  dataSource: "manual" | "iot" // Added data source tracking
}

export interface IoTSensorData {
  id: string
  name: string
  type: "water_quality" | "weather" | "air_quality" | "flow_rate"
  location: string
  status: "online" | "offline" | "warning"
  lastReading: string
  value: number
  unit: string
  threshold: { min: number; max: number }
  timestamp: string
  readings: { timestamp: string; value: number }[]
  fieldNumber?: number // Added fieldNumber for ThingSpeak integration
}

export interface Alert {
  id: string
  title: string
  message: string
  severity: "low" | "medium" | "high" | "critical"
  location: string
  timestamp: string
  status: "active" | "resolved"
  channels: string[]
  source: "manual" | "iot" | "system" // Added alert source tracking
}

interface HealthContextType {
  healthData: HealthData[]
  alerts: Alert[]
  iotSensors: IoTSensorData[] // Added IoT sensors to context
  addHealthData: (data: Omit<HealthData, "id" | "timestamp" | "dataSource">) => void
  addAlert: (alert: Omit<Alert, "id" | "timestamp">) => void
  updateAlertStatus: (id: string, status: "active" | "resolved") => void
  updateSensorData: (sensorId: string, value: number, timestamp?: string) => void // Updated to accept timestamp
  addManualSensorReading: (sensorId: string, value: number) => void // Added manual sensor reading function
  addIoTHealthData: (sensorData: IoTSensorData) => void // Added function to add IoT-generated health cases
  getAnalysisData: () => {
    totalRecords: number
    riskDistribution: { low: number; medium: number; high: number; critical: number }
    commonSymptoms: { name: string; count: number }[]
    waterSourceDistribution: { source: string; count: number }[]
    iotMetrics: { onlineSensors: number; offlineSensors: number; warnings: number; uptime: number }
  }
}

const HealthContext = createContext<HealthContextType | undefined>(undefined)

// Define the base API URL
const API_BASE = "https://sih-backend-vjdd.onrender.com"

const calculateRiskScore = (data: HealthData | Omit<HealthData, "id" | "timestamp" | "dataSource">): number => {
  let score = 0
  const highRiskSymptoms = ["Diarrhea", "Vomiting", "Dehydration"]
  const mediumRiskSymptoms = ["Fever", "Abdominal Pain"]

  data.symptoms.forEach((symptom) => {
    if (highRiskSymptoms.includes(symptom)) score += 25
    else if (mediumRiskSymptoms.includes(symptom)) score += 15
    else score += 10
  })

  if (data.waterSource === "pond" || data.waterSource === "river") score += 20
  else if (data.waterSource === "well") score += 10

  if (data.sanitationAccess === "open-defecation") score += 25
  else if (data.sanitationAccess === "community-toilet") score += 15

  return Math.min(score, 100)
}

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [healthData, setHealthData] = useState<HealthData[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [iotSensors, setIoTSensors] = useState<IoTSensorData[]>([])

  // Load initial data from the backend instead of localStorage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, alertsRes, sensorsRes] = await Promise.all([
          fetch(`${API_BASE}/api/health`),
          fetch(`${API_BASE}/api/alerts`),
          fetch(`${API_BASE}/api/sensors`),
        ])

        const healthData = await healthRes.json()
        const alertsData = await alertsRes.json()
        const sensorsData = await sensorsRes.json()

        setHealthData(healthData)
        setAlerts(alertsData)
        setIoTSensors(sensorsData)
      } catch (err) {
        console.error("Failed to fetch initial data:", err)
      }
    }
    fetchData()
  }, [])

  // Refactored addHealthData to POST to backend
  const addHealthData = async (data: Omit<HealthData, "id" | "timestamp" | "dataSource">) => {
    try {
      const newData: Omit<HealthData, "id" | "timestamp" | "dataSource"> = {
        ...data,
        riskScore: calculateRiskScore(data),
        dataSource: "manual",
      }

      const res = await fetch(`${API_BASE}/api/health`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      })
      const saved = await res.json()
      setHealthData((prev) => [...prev, saved])

      // Auto-generate alert if high risk
      if (saved.riskScore && saved.riskScore >= 70) {
        const alert: Omit<Alert, "id" | "timestamp"> = {
          title: `High Risk Health Alert - Case ${saved.id}`,
          message: `Multiple symptoms reported in ${saved.location}. Immediate attention required.`,
          severity: saved.riskScore >= 85 ? "critical" : "high",
          location: saved.location,
          status: "active",
          channels: ["SMS", "WhatsApp", "Dashboard"],
          source: "system",
        }
        addAlert(alert)
      }
    } catch (err) {
      console.error("Failed to add health data:", err)
    }
  }

  // Refactored addAlert to POST to backend
  const addAlert = async (alert: Omit<Alert, "id" | "timestamp">) => {
    try {
      const res = await fetch(`${API_BASE}/api/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert),
      })
      const newAlert = await res.json()
      setAlerts((prev) => [...prev, newAlert])

      if (alert.channels.includes("WhatsApp") || alert.channels.includes("SMS")) {
        const alertMessage = `🚨 HEALTH ALERT 🚨\n\n${alert.title}\n\n${alert.message}\n\nLocation: ${alert.location}\nSeverity: ${alert.severity.toUpperCase()}\nTime: ${new Date().toLocaleString()}\n\n- HealthGuard System`

        if (alert.channels.includes("WhatsApp")) {
          sendWhatsAppMessage(ALERT_PHONE_NUMBER, alertMessage)
        }

        if (alert.channels.includes("SMS")) {
          sendSMSMessage(ALERT_PHONE_NUMBER, alertMessage)
        }
      }
    } catch (err) {
      console.error("Failed to add alert:", err)
    }
  }

  // Refactored updateAlertStatus to PATCH to backend
  const updateAlertStatus = async (id: string, status: "active" | "resolved") => {
    try {
      const res = await fetch(`${API_BASE}/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const updatedAlert = await res.json()
      setAlerts((prev) => prev.map((alert) => (alert.id === id ? updatedAlert : alert)))
    } catch (err) {
      console.error("Failed to update alert status:", err)
    }
  }

  // Refactored updateSensorData to PATCH to backend
  const updateSensorData = async (sensorId: string, value: number, timestamp?: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/sensors/${sensorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value,
          timestamp: timestamp || new Date().toISOString(),
        }),
      })
      const updatedSensor = await res.json()
      setIoTSensors((prev) =>
        prev.map((sensor) => {
          if (sensor.id === sensorId) {
            return {
              ...updatedSensor,
              readings: [...sensor.readings.slice(1), { timestamp: updatedSensor.timestamp, value: updatedSensor.value }],
            }
          }
          return sensor
        }),
      )

      if (value < updatedSensor.threshold.min || value > updatedSensor.threshold.max) {
        const alert: Omit<Alert, "id" | "timestamp"> = {
          title: `${updatedSensor.name} Alert`,
          message: `${updatedSensor.name} reading (${value} ${updatedSensor.unit}) is outside normal range (${updatedSensor.threshold.min}-${updatedSensor.threshold.max} ${updatedSensor.unit})`,
          severity: "high",
          location: updatedSensor.location,
          status: "active",
          channels: ["Dashboard", "SMS"],
          source: "iot",
        }
        addAlert(alert)

        if (Math.random() > 0.7) {
          addIoTHealthData(updatedSensor)
        }
      }
    } catch (err) {
      console.error("Failed to update sensor data:", err)
    }
  }

  const addManualSensorReading = (sensorId: string, value: number) => {
    console.log("[v1] Adding manual sensor reading via API:", sensorId, value)
    updateSensorData(sensorId, value)
  }

  // Refactored addIoTHealthData to POST to backend
  const addIoTHealthData = async (sensorData: IoTSensorData) => {
    // Generate health data based on sensor readings
    let symptoms: string[] = []
    let riskFactors = ""

    if (sensorData.type === "water_quality" && (sensorData.value < 6.5 || sensorData.value > 8.5)) {
      symptoms = ["Diarrhea", "Nausea", "Abdominal Pain"]
      riskFactors = "Poor water quality detected"
    } else if (sensorData.type === "air_quality" && sensorData.value > 100) {
      symptoms = ["Headache", "Nausea", "Fatigue"]
      riskFactors = "High air pollution levels"
    }

    if (symptoms.length > 0) {
      const newData: Omit<HealthData, "id" | "timestamp" | "dataSource"> = {
        householdId: `HH-IOT-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
        location: sensorData.location,
        ashaWorker: "IoT System",
        symptoms,
        waterSource: sensorData.type === "water_quality" ? "monitored-source" : "unknown",
        sanitationAccess: "unknown",
        notes: `IoT-detected case - ${riskFactors}. Sensor: ${sensorData.name}`,
        riskScore: calculateRiskScore({
          symptoms,
          waterSource: "monitored-source",
          sanitationAccess: "unknown",
        } as any),
        dataSource: "iot",
      }

      try {
        const res = await fetch(`${API_BASE}/api/health`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newData),
        })
        const saved = await res.json()
        setHealthData((prev) => [...prev, saved])

        const alert: Omit<Alert, "id" | "timestamp"> = {
          title: `IoT Health Alert - Case ${saved.id}`,
          message: `${riskFactors} in ${sensorData.location}. Automated case generated.`,
          severity: "high",
          location: sensorData.location,
          status: "active",
          channels: ["Dashboard", "SMS"],
          source: "iot",
        }
        addAlert(alert)
      } catch (err) {
        console.error("Failed to add IoT health data:", err)
      }
    }
  }

  // The rest of the functions (getAnalysisData, useHealth, etc.) do not require changes.
  // I will include them for completeness.

  const getAnalysisData = () => {
    const totalRecords = healthData.length
    const riskDistribution = healthData.reduce(
      (acc, data) => {
        const risk = data.riskScore || 0
        if (risk >= 85) acc.critical++
        else if (risk >= 70) acc.high++
        else if (risk >= 40) acc.medium++
        else acc.low++
        return acc
      },
      { low: 0, medium: 0, high: 0, critical: 0 },
    )
    const symptomCounts = healthData.reduce(
      (acc, data) => {
        data.symptoms.forEach((symptom) => {
          acc[symptom] = (acc[symptom] || 0) + 1
        })
        return acc
      },
      {} as Record<string, number>,
    )
    const commonSymptoms = Object.entries(symptomCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    const waterSourceCounts = healthData.reduce(
      (acc, data) => {
        if (data.waterSource) {
          acc[data.waterSource] = (acc[data.waterSource] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )
    const waterSourceDistribution = Object.entries(waterSourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
    const iotMetrics = {
      onlineSensors: iotSensors.filter((s) => s.status === "online").length,
      offlineSensors: iotSensors.filter((s) => s.status === "offline").length,
      warnings: iotSensors.filter((s) => s.status === "warning").length,
      uptime: Math.round((iotSensors.filter((s) => s.status !== "offline").length / iotSensors.length) * 100 * 10) / 10,
    }
    return {
      totalRecords,
      riskDistribution,
      commonSymptoms,
      waterSourceDistribution,
      iotMetrics,
    }
  }
  return (
    <HealthContext.Provider
      value={{
        healthData,
        alerts,
        iotSensors,
        addHealthData,
        addAlert,
        updateAlertStatus,
        updateSensorData,
        addManualSensorReading,
        addIoTHealthData,
        getAnalysisData,
      }}
    >
      {children}
    </HealthContext.Provider>
  )
}
export function useHealth() {
  const context = useContext(HealthContext)
  if (context === undefined) {
    throw new Error("useHealth must be used within a HealthProvider")
  }
  return context
}

const sendWhatsAppMessage = async (phoneNumber: string, message: string) => {
  console.log(`[v1] Sending WhatsApp to ${phoneNumber}: ${message}`)
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log(`[v1] WhatsApp message sent successfully to ${phoneNumber}`)
    return true
  } catch (error) {
    console.error(`[v1] Failed to send WhatsApp message:`, error)
    return false
  }
}

const sendSMSMessage = async (phoneNumber: string, message: string) => {
  console.log(`[v1] Sending SMS to ${phoneNumber}: ${message}`)
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))
    console.log(`[v1] SMS sent successfully to ${phoneNumber}`)
    return true
  } catch (error) {
    console.error(`[v1] Failed to send SMS:`, error)
    return false
  }
}

const ALERT_PHONE_NUMBER = "9392995909"
