"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, AlertTriangle, Send, MessageSquare, Phone, Mail, MapPin, Clock, Users, Droplets, Activity } from "lucide-react"
import Link from "next/link"
import { useHealth } from "@/lib/health-context"

// In a real app, replace this with your actual backend URL
const API_BASE = "https://sih-backend-vjdd.onrender.com"

export default function AlertsPage() {
  const [newAlert, setNewAlert] = useState({
    title: "",
    message: "",
    severity: "",
    type: "",
    location: "",
    channels: [] as string[],
    healthOfficerPhone: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const { alerts, setAlerts, addAlert, updateAlertStatus } = useHealth()

  // Load alerts from backend on mount
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/alerts`)
        if (!response.ok) {
          throw new Error("Failed to fetch alerts from backend")
        }
        const backendAlerts = await response.json()
        setAlerts(backendAlerts) // Assuming setAlerts exists in your context
      } catch (error) {
        console.error("Error fetching alerts:", error)
      }
    }
    fetchAlerts()
  }, [setAlerts])

  const handleChannelToggle = (channel: string) => {
    setNewAlert((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }))
  }

  const handleSubmitAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 1️⃣ Send new alert to the backend API
      const response = await fetch(`${API_BASE}/api/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAlert,
          status: "active",
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create alert on backend")
      }

      const savedAlert = await response.json()
      addAlert(savedAlert) // Add the new alert (with its backend ID) to the local context

      // 2️⃣ Send Twilio SMS if phone provided (existing logic)
      if (newAlert.healthOfficerPhone) {
        const twilioResponse = await fetch("/api/sendAlert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: newAlert.healthOfficerPhone,
            title: newAlert.title,
            message: newAlert.message,
            severity: newAlert.severity,
            location: newAlert.location,
            type: newAlert.type,
          }),
        })

        if (!twilioResponse.ok) {
          const data = await twilioResponse.json()
          console.error(`Failed to send Twilio alert: ${data.error}`)
        } else {
          const data = await twilioResponse.json()
          console.log(`Alert sent successfully via Twilio! SID: ${data.sid}`)
        }
      } else {
        console.log("Alert saved and sent to dashboard channels!")
      }

      // 3️⃣ Reset form
      setNewAlert({
        title: "",
        message: "",
        severity: "",
        type: "",
        location: "",
        channels: [],
        healthOfficerPhone: "",
      })
    } catch (error) {
      console.error("Something went wrong while sending the alert:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    try {
      // Send resolution request to the backend API
      const response = await fetch(`${API_BASE}/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      })

      if (!response.ok) {
        throw new Error("Failed to resolve alert on backend")
      }
      
      updateAlertStatus(alertId, "resolved")
      console.log(`Alert ${alertId} resolved successfully.`)
    } catch (error) {
      console.error("Error resolving alert:", error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800 border-red-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const activeAlerts = alerts.filter((alert) => alert.status === "active")
  const resolvedAlerts = alerts.filter((alert) => alert.status === "resolved")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Alert Management</h1>
              <p className="text-sm text-gray-600">Community health alert system</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Active Alerts ({activeAlerts.length})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved ({resolvedAlerts.length})</TabsTrigger>
              <TabsTrigger value="create">Create Alert</TabsTrigger>
            </TabsList>

            {/* Active Alerts Tab */}
            <TabsContent value="active" className="space-y-6">
              <div className="grid gap-6">
                {activeAlerts.length > 0 ? (
                  activeAlerts.map((alert) => (
                    <Card key={alert.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gray-100">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{alert.title}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                                <Badge className={getStatusColor(alert.status)}>{alert.status}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(alert.timestamp).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Users className="w-3 h-3" />
                              {alert.channels.join(", ")}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">{alert.message}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-3 h-3" />
                            {alert.location}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleResolveAlert(alert.id)}>
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardContent className="py-12 text-center">
                      <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
                      <p className="text-gray-600">All alerts have been resolved or no alerts have been created yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Resolved Alerts Tab */}
            <TabsContent value="resolved" className="space-y-6">
              <div className="grid gap-6">
                {resolvedAlerts.length > 0 ? (
                  resolvedAlerts.map((alert) => (
                    <Card key={alert.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm opacity-75">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100">
                              <AlertTriangle className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{alert.title}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                                <Badge className={getStatusColor(alert.status)}>{alert.status}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(alert.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">{alert.message}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {alert.location}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardContent className="py-12 text-center">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Resolved Alerts</h3>
                      <p className="text-gray-600">No alerts have been resolved yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Create Alert Tab */}
            <TabsContent value="create">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Create New Alert</CardTitle>
                  <CardDescription>Send health alerts to community members and officials</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitAlert} className="space-y-6">
                    {/* Alert Type and Severity */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Alert Type</Label>
                        <Select
                          value={newAlert.type}
                          onValueChange={(value) => setNewAlert((prev) => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select alert type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="outbreak">Disease Outbreak</SelectItem>
                            <SelectItem value="contamination">Water Contamination</SelectItem>
                            <SelectItem value="shortage">Medical Shortage</SelectItem>
                            <SelectItem value="weather">Weather Warning</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="severity">Severity Level</Label>
                        <Select
                          value={newAlert.severity}
                          onValueChange={(value) => setNewAlert((prev) => ({ ...prev, severity: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Alert Title</Label>
                      <Input
                        id="title"
                        value={newAlert.title}
                        onChange={(e) => setNewAlert((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Brief, clear alert title"
                        required
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">Alert Message</Label>
                      <Textarea
                        id="message"
                        value={newAlert.message}
                        onChange={(e) => setNewAlert((prev) => ({ ...prev, message: e.target.value }))}
                        placeholder="Detailed alert message with instructions..."
                        rows={4}
                        required
                      />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <Label htmlFor="location">Affected Location</Label>
                      <Input
                        id="location"
                        value={newAlert.location}
                        onChange={(e) => setNewAlert((prev) => ({ ...prev, location: e.target.value }))}
                        placeholder="Village, District, or specific area"
                        required
                      />
                    </div>

                    {/* Health Officer Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="healthOfficerPhone">Nearby Health Officer Phone Number (Optional)</Label>
                      <Input
                        id="healthOfficerPhone"
                        value={newAlert.healthOfficerPhone}
                        onChange={(e) => setNewAlert((prev) => ({ ...prev, healthOfficerPhone: e.target.value }))}
                        placeholder="Enter health officer's phone number for direct notification"
                        type="tel"
                      />
                      <p className="text-xs text-gray-500">
                        Health officer will receive immediate WhatsApp notification about this alert
                      </p>
                    </div>

                    {/* Communication Channels */}
                    <div className="space-y-4">
                      <Label>Communication Channels</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { id: "SMS", label: "SMS", icon: <Phone className="w-4 h-4" /> },
                          { id: "WhatsApp", label: "WhatsApp", icon: <MessageSquare className="w-4 h-4" /> },
                          { id: "Email", label: "Email", icon: <Mail className="w-4 h-4" /> },
                          { id: "Dashboard", label: "Dashboard", icon: <Activity className="w-4 h-4" /> },
                        ].map((channel) => (
                          <div
                            key={channel.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                              newAlert.channels.includes(channel.id)
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleChannelToggle(channel.id)}
                          >
                            <div className="flex items-center gap-2">
                              {channel.icon}
                              <span className="text-sm font-medium">{channel.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Sending Alert...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Alert
                          </>
                        )}
                      </Button>
                      <Button type="button" variant="outline" className="flex-1 bg-transparent">
                        Save as Draft
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
