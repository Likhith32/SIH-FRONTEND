"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth, type User } from "@/lib/auth-context"
import { Heart, Shield, Users, UserCheck } from "lucide-react"

export default function LoginPage() {
  const [name, setName] = useState("")
  const [role, setRole] = useState<User["role"] | "">("")
  const [ashaId, setAshaId] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!name.trim() || !role) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (role === "ASHA Worker" && !ashaId.trim()) {
      setError("ASHA Worker ID is required")
      setIsLoading(false)
      return
    }

    const success = await login(name, role, role === "ASHA Worker" ? ashaId : undefined)

    if (success) {
      router.push("/")
    } else {
      setError("Invalid ASHA Worker ID. Please check your credentials.")
    }

    setIsLoading(false)
  }

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case "ASHA Worker":
        return <UserCheck className="w-5 h-5" />
      case "Health Official":
        return <Shield className="w-5 h-5" />
      case "Administrator":
        return <Users className="w-5 h-5" />
      default:
        return <Heart className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Health Monitoring System
          </CardTitle>
          <CardDescription>Sign in to access the community health platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as User["role"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASHA Worker">
                    <div className="flex items-center gap-2">
                      {getRoleIcon("ASHA Worker")}
                      ASHA Worker
                    </div>
                  </SelectItem>
                  <SelectItem value="Health Official">
                    <div className="flex items-center gap-2">
                      {getRoleIcon("Health Official")}
                      Health Official
                    </div>
                  </SelectItem>
                  <SelectItem value="Administrator">
                    <div className="flex items-center gap-2">
                      {getRoleIcon("Administrator")}
                      Administrator
                    </div>
                  </SelectItem>
                  <SelectItem value="Community Member">
                    <div className="flex items-center gap-2">
                      {getRoleIcon("Community Member")}
                      Community Member
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === "ASHA Worker" && (
              <div className="space-y-2">
                <Label htmlFor="ashaId">ASHA Worker ID</Label>
                <Input
                  id="ashaId"
                  type="text"
                  placeholder="Enter your ASHA Worker ID"
                  value={ashaId}
                  onChange={(e) => setAshaId(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Valid IDs: 23232323, 32323232</p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Role Permissions:</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>
                • <strong>ASHA Worker:</strong> Full access - data collection, alerts
              </li>
              <li>
                • <strong>Health Official:</strong> Full access - monitoring, alerts
              </li>
              <li>
                • <strong>Administrator:</strong> Full system access
              </li>
              <li>
                • <strong>Community Member:</strong> View-only access
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
