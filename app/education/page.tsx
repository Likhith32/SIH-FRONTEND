"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Users,
  Droplets,
  Shield,
  Heart,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

interface EducationalModule {
  id: string
  title: string
  description: string
  duration: string
  difficulty: "beginner" | "intermediate" | "advanced"
  category: "prevention" | "treatment" | "hygiene" | "emergency"
  progress: number
  completed: boolean
  icon: React.ReactNode
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export default function EducationPage() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)

  const educationalModules: EducationalModule[] = [
    {
      id: "water-safety",
      title: "Water Safety & Purification",
      description: "Learn proper water treatment methods to prevent water-borne diseases",
      duration: "15 min",
      difficulty: "beginner",
      category: "prevention",
      progress: 100,
      completed: true,
      icon: <Droplets className="w-6 h-6" />,
    },
    {
      id: "cholera-prevention",
      title: "Cholera Prevention & Management",
      description: "Understanding cholera symptoms, prevention, and immediate response",
      duration: "20 min",
      difficulty: "intermediate",
      category: "prevention",
      progress: 65,
      completed: false,
      icon: <Shield className="w-6 h-6" />,
    },
    {
      id: "hygiene-practices",
      title: "Personal & Community Hygiene",
      description: "Essential hygiene practices for disease prevention",
      duration: "12 min",
      difficulty: "beginner",
      category: "hygiene",
      progress: 30,
      completed: false,
      icon: <Heart className="w-6 h-6" />,
    },
    {
      id: "emergency-response",
      title: "Emergency Response Protocol",
      description: "Steps to take during health emergencies and outbreaks",
      duration: "25 min",
      difficulty: "advanced",
      category: "emergency",
      progress: 0,
      completed: false,
      icon: <AlertTriangle className="w-6 h-6" />,
    },
  ]

  const sampleQuiz: QuizQuestion = {
    id: "water-boiling",
    question: "How long should water be boiled to make it safe for drinking?",
    options: ["30 seconds", "1 minute", "5 minutes", "10 minutes"],
    correctAnswer: 1,
    explanation:
      "Water should be boiled for at least 1 minute at a rolling boil to kill most disease-causing organisms. At higher altitudes (above 2000m), boil for 3 minutes.",
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "prevention":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "treatment":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "hygiene":
        return "bg-green-100 text-green-800 border-green-200"
      case "emergency":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleStartModule = (moduleId: string) => {
    setSelectedModule(moduleId)
    console.log("[v0] Starting module:", moduleId)
  }

  const handleStartQuiz = () => {
    setCurrentQuiz(sampleQuiz)
    setSelectedAnswer(null)
    setShowExplanation(false)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    setShowExplanation(true)
  }

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
              <h1 className="text-xl font-bold text-gray-900">Health Education</h1>
              <p className="text-sm text-gray-600">Community health learning modules</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Language Selector */}
          <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Select Language / भाषा चुनें / ভাষা নির্বাচন করুন</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge variant="default" className="cursor-pointer">
                  English
                </Badge>
                <Badge variant="outline" className="cursor-pointer">
                  हिंदी
                </Badge>
                <Badge variant="outline" className="cursor-pointer">
                  অসমীয়া
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Learning Progress Overview */}
          <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Learning Progress</CardTitle>
                  <CardDescription>Track your health education journey</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">1</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">2</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600 mb-1">1</div>
                  <div className="text-sm text-gray-600">Not Started</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">48%</div>
                  <div className="text-sm text-gray-600">Overall Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Educational Modules */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Learning Modules</h2>

              {educationalModules.map((module) => (
                <Card key={module.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100">{module.icon}</div>
                        <div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          <CardDescription className="mt-1">{module.description}</CardDescription>
                        </div>
                      </div>
                      {module.completed && <CheckCircle className="w-6 h-6 text-green-600" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(module.difficulty)}>{module.difficulty}</Badge>
                        <Badge className={getCategoryColor(module.category)}>{module.category}</Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-3 h-3" />
                          {module.duration}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{module.progress}%</span>
                        </div>
                        <Progress value={module.progress} className="h-2" />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleStartModule(module.id)}
                          className="flex-1"
                          variant={module.completed ? "outline" : "default"}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {module.completed ? "Review" : module.progress > 0 ? "Continue" : "Start"}
                        </Button>
                        {module.progress > 0 && (
                          <Button onClick={handleStartQuiz} variant="outline">
                            Quiz
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Interactive Content Area */}
            <div className="space-y-6">
              {/* Quick Tips */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Quick Health Tips</CardTitle>
                  <CardDescription>Essential daily practices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Droplets className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-900">Water Safety</div>
                        <div className="text-sm text-blue-800">Always boil water for 1 minute before drinking</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <Heart className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-900">Hand Hygiene</div>
                        <div className="text-sm text-green-800">Wash hands with soap for 20 seconds regularly</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                      <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-orange-900">Food Safety</div>
                        <div className="text-sm text-orange-800">Cook food thoroughly and eat while hot</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Quiz */}
              {currentQuiz && (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Knowledge Check</CardTitle>
                    <CardDescription>Test your understanding</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">{currentQuiz.question}</h3>

                      <div className="space-y-2">
                        {currentQuiz.options.map((option, index) => (
                          <div
                            key={index}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedAnswer === index
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            } ${
                              showExplanation && index === currentQuiz.correctAnswer
                                ? "border-green-500 bg-green-50"
                                : showExplanation && selectedAnswer === index && index !== currentQuiz.correctAnswer
                                  ? "border-red-500 bg-red-50"
                                  : ""
                            }`}
                            onClick={() => !showExplanation && handleAnswerSelect(index)}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded-full border-2 ${
                                  selectedAnswer === index ? "border-blue-500 bg-blue-500" : "border-gray-300"
                                }`}
                              >
                                {selectedAnswer === index && (
                                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                                )}
                              </div>
                              <span className="text-sm">{option}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {!showExplanation && selectedAnswer !== null && (
                        <Button onClick={handleSubmitAnswer} className="w-full">
                          Submit Answer
                        </Button>
                      )}

                      {showExplanation && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Explanation</h4>
                          <p className="text-sm text-blue-800">{currentQuiz.explanation}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Community Stats */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Community Learning</CardTitle>
                  <CardDescription>Learning statistics from your area</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Active Learners</span>
                      </div>
                      <span className="font-medium">247</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Modules Completed</span>
                      </div>
                      <span className="font-medium">1,456</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Average Score</span>
                      </div>
                      <span className="font-medium">87%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
