"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface User {
  name: string
  role: "ASHA Worker" | "Health Officer" | "Admin" | "Community Member"
  id?: string
  isAuthenticated: boolean
}

interface AuthContextType {
  user: User | null
  login: (name: string, role: User["role"], id?: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const VALID_ASHA_IDS = ["23232323", "32323232"]
const VALID_ADMIN_IDS = ["12345"]
const VALID_HEALTH_OFFICER_IDS = ["54321"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("healthMonitoringUser")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (name: string, role: User["role"], id?: string): Promise<boolean> => {
    if (role === "ASHA Worker") {
      if (!id || !VALID_ASHA_IDS.includes(id)) {
        return false
      }
    } else if (role === "Admin") {
      if (!id || !VALID_ADMIN_IDS.includes(id)) {
        return false
      }
    } else if (role === "Health Officer") {
      if (!id || !VALID_HEALTH_OFFICER_IDS.includes(id)) {
        return false
      }
    }

    const newUser: User = {
      name,
      role,
      id,
      isAuthenticated: true,
    }

    setUser(newUser)
    localStorage.setItem("healthMonitoringUser", JSON.stringify(newUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("healthMonitoringUser")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function canPerformActions(user: User | null): boolean {
  return user?.role === "ASHA Worker" || user?.role === "Health Officer" || user?.role === "Admin"
}

export function canOnlyView(user: User | null): boolean {
  return user?.role === "Community Member"
}
