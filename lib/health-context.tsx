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


const calculateRiskScore = (data: HealthData | Omit<HealthData, "id" | "timestamp" | "dataSource">): number => {
  let score = 0

  // Symptom-based scoring
  const highRiskSymptoms = ["Diarrhea", "Vomiting", "Dehydration"]
  const mediumRiskSymptoms = ["Fever", "Abdominal Pain"]

  data.symptoms.forEach((symptom) => {
    if (highRiskSymptoms.includes(symptom)) score += 25
    else if (mediumRiskSymptoms.includes(symptom)) score += 15
    else score += 10
  })

  // Water source risk
  if (data.waterSource === "pond" || data.waterSource === "river") score += 20
  else if (data.waterSource === "well") score += 10

  // Sanitation risk
  if (data.sanitationAccess === "open-defecation") score += 25
  else if (data.sanitationAccess === "community-toilet") score += 15

  return Math.min(score, 100)
}

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [healthData, setHealthData] = useState<HealthData[]>(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("healthData")
      if (savedData) return JSON.parse(savedData)
    }
    return []
  })
  
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [iotSensors, setIoTSensors] = useState<IoTSensorData[]>([
    {
      id: "wq-001",
      name: "Borbari Well Water Quality - pH",
      type: "water_quality",
      location: "Borbari Village, Jorhat",
      status: "online",
      lastReading: "Just now",
      value: 7.2,
      unit: "pH",
      threshold: { min: 6.5, max: 8.5 },
      timestamp: new Date().toISOString(),
      readings: [
        { timestamp: "00:00", value: 7.1 },
        { timestamp: "04:00", value: 7.0 },
        { timestamp: "08:00", value: 7.2 },
        { timestamp: "12:00", value: 7.4 },
        { timestamp: "16:00", value: 7.2 },
        { timestamp: "20:00", value: 7.1 },
        { timestamp: "24:00", value: 7.2 },
      ],
      fieldNumber: 1,
    },
    {
      id: "wq-002",
      name: "Borbari Well Water Quality - Turbidity",
      type: "water_quality",
      location: "Borbari Village, Jorhat",
      status: "online",
      lastReading: "Just now",
      value: 3.5,
      unit: "NTU",
      threshold: { min: 0, max: 5 },
      timestamp: new Date().toISOString(),
      readings: [
        { timestamp: "00:00", value: 3.2 },
        { timestamp: "04:00", value: 3.0 },
        { timestamp: "08:00", value: 3.5 },
        { timestamp: "12:00", value: 4.1 },
        { timestamp: "16:00", value: 3.5 },
        { timestamp: "20:00", value: 3.3 },
        { timestamp: "24:00", value: 3.5 },
      ],
      fieldNumber: 2,
    },
    {
      id: "wq-003",
      name: "Borbari Well Water Quality - Dissolved Oxygen",
      type: "water_quality",
      location: "Borbari Village, Jorhat",
      status: "online",
      lastReading: "Just now",
      value: 7.8,
      unit: "mg/L",
      threshold: { min: 5, max: 9 },
      timestamp: new Date().toISOString(),
      readings: [
        { timestamp: "00:00", value: 7.5 },
        { timestamp: "04:00", value: 7.3 },
        { timestamp: "08:00", value: 7.8 },
        { timestamp: "12:00", value: 8.1 },
        { timestamp: "16:00", value: 7.8 },
        { timestamp: "20:00", value: 7.6 },
        { timestamp: "24:00", value: 7.8 },
      ],
      fieldNumber: 3,
    },
    {
      id: "wq-004",
      name: "Borbari Well Water Quality - Coliform Count",
      type: "water_quality",
      location: "Borbari Village, Jorhat",
      status: "warning",
      lastReading: "Just now",
      value: 200,
      unit: "CFU/100mL",
      threshold: { min: 0, max: 100 },
      timestamp: new Date().toISOString(),
      readings: [
        { timestamp: "00:00", value: 150 },
        { timestamp: "04:00", value: 180 },
        { timestamp: "08:00", value: 200 },
        { timestamp: "12:00", value: 210 },
        { timestamp: "16:00", value: 200 },
        { timestamp: "20:00", value: 190 },
        { timestamp: "24:00", value: 200 },
      ],
      fieldNumber: 4,
    },
    {
      id: "wt-001",
      name: "Majuli Weather Station",
      type: "weather",
      location: "Majuli District",
      status: "online",
      lastReading: "1 minute ago",
      value: 28.5,
      unit: "°C",
      threshold: { min: 15, max: 40 },
      timestamp: new Date().toISOString(),
      readings: [
        { timestamp: "00:00", value: 26.1 },
        { timestamp: "04:00", value: 24.5 },
        { timestamp: "08:00", value: 27.2 },
        { timestamp: "12:00", value: 30.1 },
        { timestamp: "16:00", value: 28.5 },
        { timestamp: "20:00", value: 27.8 },
        { timestamp: "24:00", value: 26.9 },
      ],
    },
    {
      id: "aq-001",
      name: "Jorhat Air Quality Monitor",
      type: "air_quality",
      location: "Jorhat Town",
      status: "online",
      lastReading: "3 minutes ago",
      value: 45,
      unit: "AQI",
      threshold: { min: 0, max: 100 },
      timestamp: new Date().toISOString(),
      readings: [
        { timestamp: "00:00", value: 42 },
        { timestamp: "04:00", value: 38 },
        { timestamp: "08:00", value: 45 },
        { timestamp: "12:00", value: 52 },
        { timestamp: "16:00", value: 48 },
        { timestamp: "20:00", value: 44 },
        { timestamp: "24:00", value: 45 },
      ],
    },
    {
      id: "fr-001",
      name: "River Flow Sensor",
      type: "flow_rate",
      location: "Brahmaputra River",
      status: "offline",
      lastReading: "2 hours ago",
      value: 1250,
      unit: "L/min",
      threshold: { min: 500, max: 2000 },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      readings: [
        { timestamp: "00:00", value: 1180 },
        { timestamp: "04:00", value: 1220 },
        { timestamp: "08:00", value: 1250 },
        { timestamp: "12:00", value: 1300 },
        { timestamp: "16:00", value: 1250 },
        { timestamp: "20:00", value: 1200 },
        { timestamp: "24:00", value: 1250 },
      ],
    },
  ])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem("alerts")
    const savedIoTSensors = localStorage.getItem("iotSensors")
    const savedHealthData = localStorage.getItem("healthData")

    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts))
    }
    if (savedIoTSensors) {
      setIoTSensors(JSON.parse(savedIoTSensors))
    }
    if (savedHealthData) {
      setHealthData(JSON.parse(savedHealthData))
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("healthData", JSON.stringify(healthData))
  }, [healthData])

  useEffect(() => {
    localStorage.setItem("alerts", JSON.stringify(alerts))
  }, [alerts])

  useEffect(() => {
    localStorage.setItem("iotSensors", JSON.stringify(iotSensors))
  }, [iotSensors])

  const addHealthData = (data: Omit<HealthData, "id" | "timestamp" | "dataSource">) => {
    console.warn("Manual data entry is disabled. Data can only be added via IoT sensors or CSV upload.")
    const caseNumber = healthData.length + 1
    const newData: HealthData = {
      ...data,
      id: `HD-${String(caseNumber).padStart(3, "0")}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      riskScore: calculateRiskScore(data),
      dataSource: "manual",
    }

    // Auto-generate alert if high risk
    if (newData.riskScore && newData.riskScore >= 70) {
      const alert: Omit<Alert, "id" | "timestamp"> = {
        title: `High Risk Health Alert - Case ${caseNumber}`,
        message: `Multiple symptoms reported in ${data.location}. Immediate attention required.`,
        severity: newData.riskScore >= 85 ? "critical" : "high",
        location: data.location,
        status: "active",
        channels: ["SMS", "WhatsApp", "Dashboard"],
        source: "system",
      }
      addAlert(alert)
    }
  }

  const addAlert = (alert: Omit<Alert, "id" | "timestamp">) => {
    const newAlert: Alert = {
      ...alert,
      id: `AL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    }

    console.log("[v0] Adding alert:", newAlert)
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
  }

  const updateAlertStatus = (id: string, status: "active" | "resolved") => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, status } : alert)))
  }

  const updateSensorData = (sensorId: string, value: number, timestamp?: string) => {
    setIoTSensors((prev) =>
      prev.map((sensor) => {
        if (sensor.id === sensorId) {
          const updatedTimestamp = timestamp ? new Date(timestamp).toLocaleTimeString() : "Just now"
          const updatedSensor = {
            ...sensor,
            value,
            lastReading: updatedTimestamp,
            timestamp: timestamp || new Date().toISOString(),
            readings: [...sensor.readings.slice(1), { timestamp: updatedTimestamp, value }],
          }

          // Check if value is out of threshold and create alert
          if (value < sensor.threshold.min || value > sensor.threshold.max) {
            const alert: Omit<Alert, "id" | "timestamp"> = {
              title: `${sensor.name} Alert`,
              message: `${sensor.name} reading (${value} ${sensor.unit}) is outside normal range (${sensor.threshold.min}-${sensor.threshold.max} ${sensor.unit})`,
              severity: "high",
              location: sensor.location,
              status: "active",
              channels: ["Dashboard", "SMS"],
              source: "iot",
            }
            addAlert(alert)
            updatedSensor.status = "warning"

            if (Math.random() > 0.7) {
              // 30% chance to generate health case
              addIoTHealthData(updatedSensor)
            }
          } else {
            updatedSensor.status = "online"
          }

          return updatedSensor
        }
        return sensor
      }),
    )
  }

  const addManualSensorReading = (sensorId: string, value: number) => {
    console.log("[v0] Adding manual sensor reading:", sensorId, value)
    updateSensorData(sensorId, value)
  }

  const addIoTHealthData = (sensorData: IoTSensorData) => {
    const caseNumber = healthData.length + 1

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
      const newData: HealthData = {
        id: `HD-${String(caseNumber).padStart(3, "0")}-IOT-${Math.random().toString(36).substr(2, 6)}`,
        householdId: `HH-IOT-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
        location: sensorData.location,
        ashaWorker: "IoT System",
        symptoms,
        waterSource: sensorData.type === "water_quality" ? "monitored-source" : "unknown",
        sanitationAccess: "unknown",
        notes: `Case ${caseNumber}: IoT-detected case - ${riskFactors}. Sensor: ${sensorData.name}`,
        timestamp: new Date().toISOString(),
        riskScore: calculateRiskScore({
          symptoms,
          waterSource: "monitored-source",
          sanitationAccess: "unknown",
        } as any),
        dataSource: "iot",
      }

      console.log(`[v0] Adding IoT health data - Case ${caseNumber}:`, newData)
      setHealthData((prev) => [...prev, newData])

      // Auto-generate alert for IoT-detected cases
      const alert: Omit<Alert, "id" | "timestamp"> = {
        title: `IoT Health Alert - Case ${caseNumber}`,
        message: `${riskFactors} in ${sensorData.location}. Automated case generated.`,
        severity: "high",
        location: sensorData.location,
        status: "active",
        channels: ["Dashboard", "SMS"],
        source: "iot",
      }
      addAlert(alert)
    }
  }

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
  console.log(`[v0] Sending WhatsApp to ${phoneNumber}: ${message}`)
  // In a real implementation, this would integrate with WhatsApp Business API
  // For demo purposes, we'll simulate the API call
  try {
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log(`[v0] WhatsApp message sent successfully to ${phoneNumber}`)
    return true
  } catch (error) {
    console.error(`[v0] Failed to send WhatsApp message:`, error)
    return false
  }
}

const sendSMSMessage = async (phoneNumber: string, message: string) => {
  console.log(`[v0] Sending SMS to ${phoneNumber}: ${message}`)
  // In a real implementation, this would integrate with SMS gateway
  // For demo purposes, we'll simulate the API call
  try {
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 800))
    console.log(`[v0] SMS sent successfully to ${phoneNumber}`)
    return true
  } catch (error) {
    console.error(`[v0] Failed to send SMS:`, error)
    return false
  }
}

const ALERT_PHONE_NUMBER = "9392995909"