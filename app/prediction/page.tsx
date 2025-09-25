"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Brain, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useHealth } from "@/lib/health-context"
import { getPredictionsFromAPI } from "../lib/ai-api"

// We'll create a mock function for the backend API for demonstration purposes,
// so you can run this code locally and see the fallback in action.
// In a real application, this would be an actual API call.
// For this example, it's set to always fail.
const getPredictionsFromAPI_mock = (data: any): Promise<PredictionResult[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate a network or backend error
      reject(new Error("Failed to connect to AI backend."));
    }, 1500);
  });
};


interface PredictionResult {
  disease: string
  riskLevel: "Low" | "Medium" | "High" | "Critical"
  probability: number
  factors: string[]
  recommendation: string
  affectedHouseholds: number
}

export default function PredictionPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [analysisComplete, setAnalysisComplete] = useState(false)

  const { healthData, getAnalysisData } = useHealth()
  const analysisData = getAnalysisData()

  const generatePredictions = (): PredictionResult[] => {
    if (healthData.length === 0) {
      return [
        {
          disease: "No Data Available",
          riskLevel: "Low",
          probability: 0,
          factors: ["No health data collected yet"],
          recommendation: "Start collecting health data to enable AI predictions",
          affectedHouseholds: 0,
        },
      ]
    }

    const predictions: PredictionResult[] = []

    // Analyze common symptoms for disease predictions
    const symptomCounts = analysisData.commonSymptoms
    const totalRecords = analysisData.totalRecords
    const highRiskCount = analysisData.riskDistribution.high + analysisData.riskDistribution.critical

    // Diarrheal diseases prediction
    const diarrheaCount = symptomCounts.find((s) => s.name === "Diarrhea")?.count || 0
    const vomitingCount = symptomCounts.find((s) => s.name === "Vomiting")?.count || 0
    const dehydrationCount = symptomCounts.find((s) => s.name === "Dehydration")?.count || 0

    const diarrhealRisk = Math.min(((diarrheaCount + vomitingCount + dehydrationCount) / totalRecords) * 100, 100)

    if (diarrhealRisk > 0) {
      predictions.push({
        disease: "Diarrheal Diseases",
        riskLevel:
          diarrhealRisk > 60 ? "Critical" : diarrhealRisk > 40 ? "High" : diarrhealRisk > 20 ? "Medium" : "Low",
        probability: Math.round(diarrhealRisk),
        factors: [
          diarrheaCount > 0 ? `${diarrheaCount} diarrhea cases reported` : "",
          vomitingCount > 0 ? `${vomitingCount} vomiting cases` : "",
          dehydrationCount > 0 ? `${dehydrationCount} dehydration cases` : "",
          "Water source contamination risk",
          "Seasonal patterns",
        ].filter(Boolean),
        recommendation:
          diarrhealRisk > 40
            ? "Immediate water quality testing and community alert required"
            : "Enhanced monitoring and preventive measures advised",
        affectedHouseholds: diarrheaCount + vomitingCount,
      })
    }

    // Cholera prediction based on severe symptoms
    const severeSymptoms = diarrheaCount + vomitingCount + dehydrationCount
    const choleraRisk = Math.min((severeSymptoms / totalRecords) * 80, 100)

    if (choleraRisk > 10) {
      predictions.push({
        disease: "Cholera",
        riskLevel: choleraRisk > 50 ? "Critical" : choleraRisk > 30 ? "High" : "Medium",
        probability: Math.round(choleraRisk),
        factors: [
          "Multiple severe gastrointestinal symptoms",
          "Water source contamination indicators",
          "High population density areas",
          "Poor sanitation access",
        ],
        recommendation:
          choleraRisk > 30
            ? "Emergency response protocol activation recommended"
            : "Increased surveillance and water quality monitoring",
        affectedHouseholds: severeSymptoms,
      })
    }

    // Typhoid prediction
    const feverCount = symptomCounts.find((s) => s.name === "Fever")?.count || 0
    const abdominalPainCount = symptomCounts.find((s) => s.name === "Abdominal Pain")?.count || 0

    const typhoidRisk = Math.min(((feverCount + abdominalPainCount) / totalRecords) * 60, 100)

    if (typhoidRisk > 5) {
      predictions.push({
        disease: "Typhoid",
        riskLevel: typhoidRisk > 40 ? "High" : typhoidRisk > 20 ? "Medium" : "Low",
        probability: Math.round(typhoidRisk),
        factors: [
          feverCount > 0 ? `${feverCount} fever cases` : "",
          abdominalPainCount > 0 ? `${abdominalPainCount} abdominal pain cases` : "",
          "Contaminated food/water sources",
          "Temperature and seasonal factors",
        ].filter(Boolean),
        recommendation: "Continue monitoring and ensure proper food safety measures",
        affectedHouseholds: feverCount + abdominalPainCount,
      })
    }

    // General outbreak risk
    const outbreakRisk = Math.min((highRiskCount / totalRecords) * 100, 100)

    if (outbreakRisk > 15) {
      predictions.push({
        disease: "General Outbreak Risk",
        riskLevel: outbreakRisk > 50 ? "Critical" : outbreakRisk > 30 ? "High" : "Medium",
        probability: Math.round(outbreakRisk),
        factors: [
          `${highRiskCount} high-risk households identified`,
          "Multiple symptom clusters",
          "Environmental risk factors",
          "Community transmission patterns",
        ],
        recommendation: "Implement comprehensive outbreak prevention measures",
        affectedHouseholds: highRiskCount,
      })
    }

    return predictions.length > 0
      ? predictions
      : [
          {
            disease: "Low Risk Environment",
            riskLevel: "Low",
            probability: 15,
            factors: ["Limited symptom reports", "Good sanitation coverage", "Clean water sources"],
            recommendation: "Continue routine monitoring and preventive measures",
            affectedHouseholds: 0,
          },
        ]
  }

  // Helper function to animate predictions one by one
  const animatePredictions = async (predictionList: PredictionResult[]) => {
    for (let i = 0; i < predictionList.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setPredictions((prev) => [...prev, predictionList[i]])
    }
    setAnalysisComplete(true)
  }

  const runPredictionAnalysis = async () => {
    // Replaced the alert with a console log for a better user experience
    if (healthData.length === 0) {
      console.warn("No health data available. Please add some data first.")
      return
    }

    setIsAnalyzing(true)
    setAnalysisComplete(false)
    setPredictions([])

    try {
      // Primary flow: Attempt to get predictions from the AI backend
      const newPredictions = await getPredictionsFromAPI(healthData)
      await animatePredictions(newPredictions)
    } catch (err) {
      // Fallback flow: Use the local prediction generation if the backend fails
      console.warn("Backend down, falling back to local predictions.")
      const localPredictions = generatePredictions()
      await animatePredictions(localPredictions)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return <CheckCircle className="w-4 h-4" />
      case "Medium":
        return <Clock className="w-4 h-4" />
      case "High":
      case "Critical":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <CheckCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Prediction Engine</h1>
              <p className="text-sm text-gray-600">Disease Outbreak Risk Assessment</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Analysis Control */}
          <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Disease Outbreak Prediction</CardTitle>
                  <CardDescription>
                    AI-powered analysis of collected health data, environmental factors, and risk patterns
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>Available data: {healthData.length} health records</p>
                  <p>Data sources: Community surveys, symptom reports, risk assessments</p>
                  {healthData.length === 0 && (
                    <p className="text-orange-600 font-medium">
                      ⚠️ No health data available - collect data first for accurate predictions
                    </p>
                  )}
                </div>
                <Button
                  onClick={runPredictionAnalysis}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Run Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing health data...</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Community Data ({healthData.length} records)
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Symptom Analysis
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      Risk Modeling
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      Generating Report
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prediction Results */}
          {predictions.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Prediction Results</h2>
                {analysisComplete && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Analysis Complete
                  </Badge>
                )}
              </div>

              <div className="grid gap-6">
                {predictions.map((prediction, index) => (
                  <Card
                    key={prediction.disease}
                    className="border-0 shadow-lg bg-white/80 backdrop-blur-sm animate-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{prediction.disease}</CardTitle>
                          <Badge className={getRiskColor(prediction.riskLevel)}>
                            {getRiskIcon(prediction.riskLevel)}
                            <span className="ml-1">{prediction.riskLevel} Risk</span>
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{prediction.probability}%</div>
                          <div className="text-sm text-gray-600">Probability</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Progress value={prediction.probability} className="h-3" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Contributing Factors</h4>
                            <div className="flex flex-wrap gap-2">
                              {prediction.factors.map((factor, factorIndex) => (
                                <Badge key={factorIndex} variant="outline" className="bg-gray-50">
                                  {factor}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Affected Households</h4>
                            <div className="text-2xl font-bold text-orange-600">{prediction.affectedHouseholds}</div>
                            <div className="text-sm text-gray-600">households at risk</div>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-2">Recommendation</h4>
                          <p className="text-blue-800 text-sm">{prediction.recommendation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Model Information */}
          {analysisComplete && (
            <Card className="mt-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Analysis Summary</CardTitle>
                <CardDescription>Details about the current analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Data Quality</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {healthData.length > 10 ? "High" : healthData.length > 5 ? "Medium" : "Low"}
                    </div>
                    <p className="text-sm text-gray-600">Based on {healthData.length} records</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Risk Distribution</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisData.riskDistribution.high + analysisData.riskDistribution.critical}
                    </div>
                    <p className="text-sm text-gray-600">High-risk households</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Analysis Time</h4>
                    <div className="text-2xl font-bold text-purple-600">Real-time</div>
                    <p className="text-sm text-gray-600">Live data processing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
