"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Users, AlertTriangle, TrendingUp, Droplets, MapPin, Activity, Clock, RefreshCw } from "lucide-react"
import Link from "next/link"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { useHealth } from "@/lib/health-context"

const translations = {
  en: {
    backToHome: "Back to Home",
    headerTitle: "Health Dashboard",
    headerSubtitle: "Real-time community health monitoring",
    lastUpdated: "Last updated:",
    refresh: "Refresh",
    highRiskCases: "High Risk Cases",
    householdsMonitored: "Households Monitored",
    avgRiskLevel: "Average Risk Level",
    activeAlerts: "Active Alerts",
    cases: "cases",
    households: "households",
    alerts: "alerts",
    realTimeData: "Real-time data",
    riskLevelDistribution: "Risk Level Distribution",
    riskDistributionSubtitle: "Current risk assessment of monitored households",
    lowRisk: "Low Risk",
    mediumRisk: "Medium Risk",
    highRisk: "High Risk",
    criticalRisk: "Critical Risk",
    mostCommonSymptoms: "Most Common Symptoms",
    symptomsSubtitle: "Symptoms reported across all health surveys",
    reports: "reports",
    noSymptomData: "No symptom data available yet. Start collecting health data to see insights.",
    recentAlerts: "Recent Alerts",
    currentAlertsSubtitle: "Current health warnings and notifications",
    noActiveAlerts: "No active alerts",
    viewAllAlerts: "View All Alerts",
    quickActions: "Quick Actions",
    quickActionsSubtitle: "Common dashboard actions",
    newHealthSurvey: "New Health Survey",
    runAIAnalysis: "Run AI Analysis",
    sendAlert: "Send Alert",
    healthEducation: "Health Education",
    selectLanguage: "Select Language",
  },
  hi: {
    backToHome: "होम पर वापस जाएं",
    headerTitle: "स्वास्थ्य डैशबोर्ड",
    headerSubtitle: "वास्तविक समय सामुदायिक स्वास्थ्य निगरानी",
    lastUpdated: "अंतिम अपडेट:",
    refresh: "ताज़ा करें",
    highRiskCases: "उच्च जोखिम वाले मामले",
    householdsMonitored: "निगरानी किए गए घर",
    avgRiskLevel: "औसत जोखिम स्तर",
    activeAlerts: "सक्रिय अलर्ट",
    cases: "मामले",
    households: "परिवार",
    alerts: "अलर्ट",
    realTimeData: "वास्तविक समय डेटा",
    riskLevelDistribution: "जोखिम स्तर वितरण",
    riskDistributionSubtitle: "निगरानी किए गए घरों का वर्तमान जोखिम मूल्यांकन",
    lowRisk: "कम जोखिम",
    mediumRisk: "मध्यम जोखिम",
    highRisk: "उच्च जोखिम",
    criticalRisk: "गंभीर जोखिम",
    mostCommonSymptoms: "सबसे आम लक्षण",
    symptomsSubtitle: "सभी स्वास्थ्य सर्वेक्षणों में रिपोर्ट किए गए लक्षण",
    reports: "रिपोर्ट",
    noSymptomData: "अभी तक कोई लक्षण डेटा उपलब्ध नहीं है। अंतर्दृष्टि देखने के लिए स्वास्थ्य डेटा एकत्र करना शुरू करें।",
    recentAlerts: "हाल के अलर्ट",
    currentAlertsSubtitle: "वर्तमान स्वास्थ्य चेतावनी और सूचनाएं",
    noActiveAlerts: "कोई सक्रिय अलर्ट नहीं",
    viewAllAlerts: "सभी अलर्ट देखें",
    quickActions: "त्वरित कार्य",
    quickActionsSubtitle: "सामान्य डैशबोर्ड कार्य",
    newHealthSurvey: "नया स्वास्थ्य सर्वेक्षण",
    runAIAnalysis: "एआई विश्लेषण चलाएं",
    sendAlert: "अलर्ट भेजें",
    healthEducation: "स्वास्थ्य शिक्षा",
    selectLanguage: "भाषा चुनें",
  },
  te: {
    backToHome: "హోమ్‌కు తిరిగి వెళ్ళు",
    headerTitle: "ఆరోగ్య డాష్‌బోర్డ్",
    headerSubtitle: "నిజ-సమయ కమ్యూనిటీ ఆరోగ్య పర్యవేక్షణ",
    lastUpdated: "చివరిగా నవీకరించబడింది:",
    refresh: "తాజాకరించు",
    highRiskCases: "అధిక ప్రమాద కేసులు",
    householdsMonitored: "పర్యవేక్షించబడిన గృహాలు",
    avgRiskLevel: "సగటు ప్రమాద స్థాయి",
    activeAlerts: "ప్రస్తుత హెచ్చరికలు",
    cases: "కేసులు",
    households: "గృహాలు",
    alerts: "హెచ్చరికలు",
    realTimeData: "నిజ-సమయ డేటా",
    riskLevelDistribution: "ప్రమాద స్థాయి పంపిణీ",
    riskDistributionSubtitle: "పర్యవేక్షించబడిన గృహాల ప్రస్తుత ప్రమాద అంచనా",
    lowRisk: "తక్కువ ప్రమాదం",
    mediumRisk: "మధ్యస్థ ప్రమాదం",
    highRisk: "అధిక ప్రమాదం",
    criticalRisk: "క్లిష్టమైన ప్రమాదం",
    mostCommonSymptoms: "అత్యంత సాధారణ లక్షణాలు",
    symptomsSubtitle: "అన్ని ఆరోగ్య సర్వేలలో నివేదించబడిన లక్షణాలు",
    reports: "నివేదికలు",
    noSymptomData: "ఇంకా లక్షణాల డేటా అందుబాటులో లేదు. అంతర్దృష్టులను చూడటానికి ఆరోగ్య డేటాను సేకరించడం ప్రారంభించండి.",
    recentAlerts: "ఇటీవలి హెచ్చరికలు",
    currentAlertsSubtitle: "ప్రస్తుత ఆరోగ్య హెచ్చరికలు మరియు నోటిఫికేషన్లు",
    noActiveAlerts: "ప్రస్తుత హెచ్చరికలు లేవు",
    viewAllAlerts: "అన్ని హెచ్చరికలను వీక్షించండి",
    quickActions: "త్వరిత చర్యలు",
    quickActionsSubtitle: "సాధారణ డాష్‌బోర్డ్ చర్యలు",
    newHealthSurvey: "కొత్త ఆరోగ్య సర్వే",
    runAIAnalysis: "AI విశ్లేషణను అమలు చేయండి",
    sendAlert: "హెచ్చరిక పంపండి",
    healthEducation: "ఆరోగ్య విద్య",
    selectLanguage: "భాషను ఎంచుకోండి",
  },
}

export default function DashboardPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en")
  const t = translations[language]

  const { healthData, alerts, getAnalysisData } = useHealth()
  const analysisData = getAnalysisData()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-gray-600"
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

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "outbreak":
        return <AlertTriangle className="w-4 h-4" />
      case "contamination":
        return <Droplets className="w-4 h-4" />
      case "shortage":
        return <Activity className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const activeAlerts = alerts.filter((alert) => alert.status === "active")
  const highRiskCases = healthData.filter((data) => (data.riskScore || 0) >= 70).length
  const totalHouseholds = healthData.length
  const avgRiskScore =
    healthData.length > 0
      ? Math.round(healthData.reduce((sum, data) => sum + (data.riskScore || 0), 0) / healthData.length)
      : 0

  const healthMetrics = [
    {
      id: "cases",
      title: t.highRiskCases,
      value: highRiskCases,
      change: 0,
      status: highRiskCases > 5 ? "critical" : highRiskCases > 2 ? "warning" : "normal",
      unit: t.cases,
    },
    {
      id: "households",
      title: t.householdsMonitored,
      value: totalHouseholds,
      change: 0,
      status: "normal",
      unit: t.households,
    },
    {
      id: "risk",
      title: t.avgRiskLevel,
      value: avgRiskScore,
      change: 0,
      status: avgRiskScore > 70 ? "critical" : avgRiskScore > 40 ? "warning" : "normal",
      unit: "%",
    },
    {
      id: "alerts",
      title: t.activeAlerts,
      value: activeAlerts.length,
      change: 0,
      status: activeAlerts.length > 3 ? "critical" : activeAlerts.length > 1 ? "warning" : "normal",
      unit: t.alerts,
    },
  ]

  const riskChartData = [
    { name: t.lowRisk, value: analysisData.riskDistribution.low, color: "#10b981" },
    { name: t.mediumRisk, value: analysisData.riskDistribution.medium, color: "#f59e0b" },
    { name: t.highRisk, value: analysisData.riskDistribution.high, color: "#f97316" },
    { name: t.criticalRisk, value: analysisData.riskDistribution.critical, color: "#dc2626" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t.backToHome}
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t.headerTitle}</h1>
                <p className="text-sm text-gray-600">{t.headerSubtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-2">
                  <div className="flex gap-2">
                    <Badge
                      variant={language === "en" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setLanguage("en")}
                    >
                      English
                    </Badge>
                    <Badge
                      variant={language === "hi" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setLanguage("hi")}
                    >
                      हिंदी
                    </Badge>
                    <Badge
                      variant={language === "te" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setLanguage("te")}
                    >
                      తెలుగు
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {t.lastUpdated} {lastUpdated.toLocaleTimeString()}
                </div>
              </div>
              <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {t.refresh}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {healthMetrics.map((metric) => (
            <Card key={metric.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-medium">{metric.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {metric.value}
                      <span className="text-sm font-normal text-gray-600 ml-1">{metric.unit}</span>
                    </div>
                    <div className={`text-sm flex items-center gap-1 ${getStatusColor(metric.status)}`}>
                      <TrendingUp className="w-3 h-3" />
                      {t.realTimeData}
                    </div>
                  </div>
                  <div
                    className={`w-2 h-12 rounded-full ${
                      metric.status === "normal"
                        ? "bg-green-500"
                        : metric.status === "warning"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Risk Distribution */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t.riskLevelDistribution}</CardTitle>
                <CardDescription>{t.riskDistributionSubtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Common Symptoms */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t.mostCommonSymptoms}</CardTitle>
                <CardDescription>{t.symptomsSubtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.commonSymptoms.length > 0 ? (
                    analysisData.commonSymptoms.map((symptom) => (
                      <div key={symptom.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{symptom.name}</span>
                          <span className="text-sm text-gray-600">
                            {symptom.count} {t.reports}
                          </span>
                        </div>
                        <Progress
                          value={analysisData.totalRecords > 0 ? (symptom.count / analysisData.totalRecords) * 100 : 0}
                          className="h-2"
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">{t.noSymptomData}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts and Activity */}
          <div className="space-y-8">
            {/* Recent Alerts */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  {t.activeAlerts} ({activeAlerts.length})
                </CardTitle>
                <CardDescription>{t.currentAlertsSubtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeAlerts.length > 0 ? (
                    activeAlerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="border border-gray-200 rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                          </div>
                          <span className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm text-gray-900 font-medium">{alert.message}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {alert.location}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">{t.noActiveAlerts}</p>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                  <Link href="/alerts">{t.viewAllAlerts}</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
<Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
  <CardHeader>
    <CardTitle>{t.quickActions}</CardTitle>
    <CardDescription>{t.quickActionsSubtitle}</CardDescription>
  </CardHeader>
  <CardContent className="space-y-3">
    <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
      <Link href="/data-collection">
        <Users className="w-4 h-4 mr-2" />
        {t.newHealthSurvey}
      </Link>
    </Button>
    <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
      <Link href="/prediction">
        <TrendingUp className="w-4 h-4 mr-2" />
        {t.runAIAnalysis}
      </Link>
    </Button>
    <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
      <Link href="/alerts">
        <AlertTriangle className="w-4 h-4 mr-2" />
        {t.sendAlert}
      </Link>
    </Button>
    <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
      <Link href="/education">
        <Activity className="w-4 h-4 mr-2" />
        {t.healthEducation}
      </Link>
    </Button>

    {/* New Buttons */}
     <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
      <Link href="/view-results">
        <Clock className="w-4 h-4 mr-2" />
        View Results
      </Link>
    </Button>
    <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
      <Link href="/view-data">
        <Droplets className="w-4 h-4 mr-2" />
        View Data
      </Link>
    </Button>
  </CardContent>
</Card>

          </div>
        </div>
      </div>
    </div>
  )
}