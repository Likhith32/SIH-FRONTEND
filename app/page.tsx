"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Users, AlertTriangle, TrendingUp, Droplets, LogOut, User } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth, canPerformActions } from "@/lib/auth-context"

export default function HomePage() {
  const { user, logout } = useAuth()

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">HealthGuard</h1>
                  <p className="text-sm text-gray-600">Community Health Monitoring</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {user && (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.role}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={logout}
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                )}
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Activity className="w-3 h-3 mr-1" />
                  System Active
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-balance">Smart Community Health Monitoring</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto text-pretty">
              Early warning system for water-borne diseases in rural Northeast India. Empowering ASHA workers and health
              officials with AI-powered insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {canPerformActions(user) ? (
                <>
                  <Link href="/data-collection">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Start Data Collection
                    </Button>
                  </Link>
                  <Link href="/alerts">
                    <Button size="lg" variant="outline">
                      Manage Alerts
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <User className="w-5 h-5" />
                    <span className="font-medium">View-Only Access</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    You can view data and reports but cannot collect data or send alerts.
                  </p>
                </div>
              )}
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-16 bg-white/50">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Comprehensive Health Monitoring</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>Community Data Collection</CardTitle>
                  <CardDescription>
                    Mobile-friendly forms for ASHA workers to collect health data from households
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Multilingual support (English, Hindi, Assamese)</li>
                    <li>• Offline data collection capability</li>
                    <li>• GPS location tracking</li>
                    <li>• Photo documentation</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>AI Prediction Engine</CardTitle>
                  <CardDescription>Machine learning algorithms to predict disease outbreaks</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Pattern recognition in health data</li>
                    <li>• Weather correlation analysis</li>
                    <li>• Risk assessment scoring</li>
                    <li>• Outbreak probability forecasting</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <CardTitle>Real-Time Alerts</CardTitle>
                  <CardDescription>Instant notifications for health officials and communities</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• SMS and WhatsApp integration</li>
                    <li>• Severity-based alert levels</li>
                    <li>• Geographic targeting</li>
                    <li>• Multi-channel distribution</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
                <div className="text-gray-600">Households Monitored</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">89</div>
                <div className="text-gray-600">ASHA Workers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">12</div>
                <div className="text-gray-600">Villages Covered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">3</div>
                <div className="text-gray-600">Early Warnings</div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Navigation */}
        <section className="py-16 bg-white/50">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Quick Access</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/dashboard">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-medium">Dashboard</p>
                  </CardContent>
                </Card>
              </Link>

              {canPerformActions(user) && (
                <>
                  <Link href="/data-collection">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="font-medium">Data Collection</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/alerts">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                        <p className="font-medium">Alerts</p>
                      </CardContent>
                    </Card>
                  </Link>
                </>
              )}

              <Link href="/education">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="font-medium">Education</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold">HealthGuard</span>
                </div>
                <p className="text-gray-400">
                  Protecting communities through smart health monitoring and early disease detection.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/data-collection" className="hover:text-white">
                      Data Collection
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="hover:text-white">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/alerts" className="hover:text-white">
                      Alerts
                    </Link>
                  </li>
                  <li>
                    <Link href="/education" className="hover:text-white">
                      Education
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <p className="text-gray-400">For technical support or inquiries about the health monitoring system.</p>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 HealthGuard. Built for rural healthcare in Northeast India.</p>
            </div>
          </div>
        </footer>
      </div>
    </AuthGuard>
  )
}
