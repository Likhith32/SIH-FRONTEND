"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Camera, Save, Send, Shield, User, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useHealth } from "@/lib/health-context"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth, canPerformActions } from "@/lib/auth-context"
import Papa from "papaparse" // CSV parsing

// Define an interface for the formData object to ensure type safety.
interface FormData {
  householdId: string
  location: string
  ashaWorker: string
  symptoms: string[]
  waterSource: string
  sanitationAccess: string
  notes: string
  healthOfficerPhone: string
}

// Translations object for English, Hindi, and Telugu
const translations = {
  en: {
    backToHome: "Back to Home",
    headerTitle: "Health Data Collection",
    headerSubtitle: "Community Health Survey Form",
    viewOnlyAccess: "View-Only Access:",
    viewOnlyDescription: "You can view this form but cannot submit data. Only ASHA Workers, Health Officials, and Administrators can collect health data.",
    selectLanguage: "Select Language",
    manualEntryTitle: "Household Health Survey (Manual Entry)",
    manualEntryDescription: "Please fill out this form to report health conditions in your community.",
    householdId: "Household ID",
    ashaWorker: "ASHA Worker Name",
    location: "Location",
    symptoms: "Reported Symptoms (Check all that apply)",
    waterSource: "Primary Water Source",
    sanitationAccess: "Sanitation Facilities",
    notes: "Additional Notes",
    healthOfficerPhone: "Health Officer Phone Number (Optional)",
    notificationText: "Health officer will be notified of the risk assessment result via WhatsApp",
    photoDocumentation: "Photo Documentation (Optional)",
    takePhoto: "Take Photo",
    submitManual: "Submit Manual Entry",
    saveAndSend: "Save & Send",
    restrictedAccess: "Data Collection Restricted",
    offlineMode: "Offline Mode Available - Data will sync when connected",
    alertNoPermission: "You do not have permission to perform this action.",
    alertSuccess: (riskLevel: string) => `Manual Entry Submitted! Risk Level: ${riskLevel}`,
    alertError: "Error sending manual data to AI backend. Please try again.",
    placeholderHouseholdId: "e.g., HH-001-2024",
    placeholderAshaWorker: "Enter ASHA worker name",
    placeholderLocation: "Village, District",
    placeholderNotes: "Any additional observations or concerns...",
    placeholderHealthOfficerPhone: "Enter health officer's phone number for notifications",
    selectPlaceholder: "Select...",
    waterSources: {
      well: "Hand Pump/Well",
      river: "River/Stream",
      pond: "Pond/Lake",
      piped: "Piped Water",
      rainwater: "Rainwater Harvesting",
      other: "Other",
    },
    sanitationFacilities: {
      privateToilet: "Private Toilet",
      sharedToilet: "Shared Toilet",
      communityToilet: "Community Toilet",
      openDefecation: "Open Defecation",
    },
    csvUploadTitle: "Optional CSV Upload",
    csvUploadDescription: "Upload a CSV file with multiple entries for batch processing.",
    uploadCsv: "Upload & Predict CSV",
    csvColumns: "CSV Columns Required: Diarrhea, Vomiting, Fever, AbdominalPain, Dehydration, Nausea, Headache, Fatigue, waterSource, sanitationAccess, location.",
    csvAlertSuccess: (count: number) => `CSV Uploaded & Predicted! Processed ${count} rows.`,
    csvAlertNoFile: "No CSV file selected.",
    csvAlertError: "Error processing CSV data.",
    csvAlertMissingColumns: (columns: string) => `CSV is missing required columns: ${columns}`,
  },
  hi: {
    backToHome: "होम पर वापस",
    headerTitle: "स्वास्थ्य डेटा संग्रह",
    headerSubtitle: "सामुदायिक स्वास्थ्य सर्वेक्षण प्रपत्र",
    viewOnlyAccess: "केवल देखने की पहुंच:",
    viewOnlyDescription: "आप यह फ़ॉर्म देख सकते हैं लेकिन डेटा जमा नहीं कर सकते। केवल आशा कार्यकर्ता, स्वास्थ्य अधिकारी और प्रशासक ही स्वास्थ्य डेटा एकत्र कर सकते हैं।",
    selectLanguage: "भाषा चुनें",
    manualEntryTitle: "गृहस्थी स्वास्थ्य सर्वेक्षण (मैनुअल एंट्री)",
    manualEntryDescription: "कृपया अपने समुदाय में स्वास्थ्य स्थितियों की रिपोर्ट करने के लिए यह फ़ॉर्म भरें।",
    householdId: "गृहस्थी आईडी",
    ashaWorker: "आशा कार्यकर्ता का नाम",
    location: "स्थान",
    symptoms: "रिपोर्ट किए गए लक्षण (सभी लागू करें)",
    waterSource: "मुख्य जल स्रोत",
    sanitationAccess: "स्वच्छता सुविधाएं",
    notes: "अतिरिक्त नोट्स",
    healthOfficerPhone: "स्वास्थ्य अधिकारी का फोन नंबर (वैकल्पिक)",
    notificationText: "स्वास्थ्य अधिकारी को व्हाट्सएप के माध्यम से जोखिम मूल्यांकन परिणाम की सूचना दी जाएगी",
    photoDocumentation: "फोटो दस्तावेज़ीकरण (वैकल्पिक)",
    takePhoto: "फोटो लें",
    submitManual: "मैनुअल एंट्री जमा करें",
    saveAndSend: "सहेजें और भेजें",
    restrictedAccess: "डेटा संग्रह प्रतिबंधित",
    offlineMode: "ऑफ़लाइन मोड उपलब्ध - कनेक्ट होने पर डेटा सिंक होगा",
    alertNoPermission: "आपके पास यह कार्रवाई करने की अनुमति नहीं है।",
    alertSuccess: (riskLevel: string) => `मैनुअल एंट्री जमा की गई! जोखिम स्तर: ${riskLevel}`,
    alertError: "AI बैकएंड में डेटा जमा करने में त्रुटि। कृपया पुनः प्रयास करें।",
    placeholderHouseholdId: "जैसे, HH-001-2024",
    placeholderAshaWorker: "आशा कार्यकर्ता का नाम दर्ज करें",
    placeholderLocation: "गांव, जिला",
    placeholderNotes: "कोई भी अतिरिक्त अवलोकन या चिंताएं...",
    placeholderHealthOfficerPhone: "अधिसूचनाओं के लिए स्वास्थ्य अधिकारी का फोन नंबर दर्ज करें",
    selectPlaceholder: "चुनें...",
    waterSources: {
      well: "हैंड पंप/कुआं",
      river: "नदी/धारा",
      pond: "तालाब/झील",
      piped: "पाइप से पानी",
      rainwater: "वर्षा जल संचयन",
      other: "अन्य",
    },
    sanitationFacilities: {
      privateToilet: "निजी शौचालय",
      sharedToilet: "साझा शौचालय",
      communityToilet: "सामुदायिक शौचालय",
      openDefecation: "खुले में शौच",
    },
    csvUploadTitle: "वैकल्पिक CSV अपलोड",
    csvUploadDescription: "बैच प्रोसेसिंग के लिए कई प्रविष्टियों वाली एक CSV फ़ाइल अपलोड करें।",
    uploadCsv: "CSV अपलोड करें और अनुमान लगाएं",
    csvColumns: "आवश्यक CSV कॉलम: Diarrhea, Vomiting, Fever, AbdominalPain, Dehydration, Nausea, Headache, Fatigue, waterSource, sanitationAccess, location.",
    csvAlertSuccess: (count: number) => `CSV अपलोड और अनुमान लगाया गया! ${count} पंक्तियाँ संसाधित की गईं।`,
    csvAlertNoFile: "कोई CSV फ़ाइल चयनित नहीं है।",
    csvAlertError: "CSV डेटा संसाधित करने में त्रुटि।",
    csvAlertMissingColumns: (columns: string) => `CSV में आवश्यक कॉलम गायब हैं: ${columns}`,
  },
  te: {
    backToHome: "హోమ్‌కు తిరిగి వెళ్లండి",
    headerTitle: "ఆరోగ్య డేటా సేకరణ",
    headerSubtitle: "కమ్యూనిటీ ఆరోగ్య సర్వే ఫారం",
    viewOnlyAccess: "వీక్షణ-మాత్రమే యాక్సెస్:",
    viewOnlyDescription: "మీరు ఈ ఫారమ్‌ను చూడవచ్చు కానీ డేటాను సమర్పించలేరు. ఆశా కార్యకర్తలు, ఆరోగ్య అధికారులు మరియు నిర్వాహకులు మాత్రమే ఆరోగ్య డేటాను సేకరించగలరు.",
    selectLanguage: "భాష ఎంచుకోండి",
    manualEntryTitle: "గృహ ఆరోగ్య సర్వే (మాన్యువల్ ఎంట్రీ)",
    manualEntryDescription: "దయచేసి మీ సమాజంలో ఆరోగ్య పరిస్థితులను నివేదించడానికి ఈ ఫారం నింపండి.",
    householdId: "గృహ ఐడి",
    ashaWorker: "ఆశా పని చేసే వారి పేరు",
    location: "స్థానం",
    symptoms: "ప్రతిపాదిత లక్షణాలు (అన్ని వర్తిస్తాయి)",
    waterSource: "ప్రధాన జల వనరు",
    sanitationAccess: "స్వచ్ఛత సౌకర్యాలు",
    notes: "అదనపు గమనికలు",
    healthOfficerPhone: "హెల్త్ ఆఫీసర్ ఫోన్ నంబర్ (ఐచ్ఛికం)",
    notificationText: "రిస్క్ అసెస్‌మెంట్ ఫలితం గురించి హెల్త్ ఆఫీసర్‌కు వాట్సాప్ ద్వారా తెలియజేయబడుతుంది",
    photoDocumentation: "ఫోటో డాక్యుమెంటేషన్ (ఐచ్ఛికం)",
    takePhoto: "ఫోటో తీసుకోండి",
    submitManual: "మాన్యువల్ ఎంట్రీ సమర్పించండి",
    saveAndSend: "సేవ్ & పంపండి",
    restrictedAccess: "డేటా సేకరణ పరిమితం చేయబడింది",
    offlineMode: "ఆఫ్‌లైన్ మోడ్ అందుబాటులో ఉంది - కనెక్ట్ అయినప్పుడు డేటా సింక్ అవుతుంది",
    alertNoPermission: "ఈ చర్య చేయడానికి మీకు అనుమతి లేదు.",
    alertSuccess: (riskLevel: string) => `మాన్యువల్ ఎంట్రీ సమర్పించబడింది! రిస్క్ స్థాయి: ${riskLevel}`,
    alertError: "AI బ్యాకెండ్‌కు డేటా సమర్పించడంలో లోపం. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    placeholderHouseholdId: "ఉదా., HH-001-2024",
    placeholderAshaWorker: "ఆశా పని చేసే వారి పేరు నమోదు చేయండి",
    placeholderLocation: "గ్రామం, జిల్లా",
    placeholderNotes: "ఏదైనా అదనపు పరిశీలనలు లేదా ఆందోళనలు...",
    placeholderHealthOfficerPhone: "నోటిఫికేషన్ల కోసం హెల్త్ ఆఫీసర్ ఫోన్ నంబర్ నమోదు చేయండి",
    selectPlaceholder: "ఎంచుకోండి...",
    waterSources: {
      well: "హ్యాండ్ పంప్/బావి",
      river: "నది/కాలువ",
      pond: "చెరువు/సరస్సు",
      piped: "పైపు నీరు",
      rainwater: "వర్షపు నీరు నిల్వ",
      other: "ఇతర",
    },
    sanitationFacilities: {
      privateToilet: "ప్రైవేట్ టాయిలెట్",
      sharedToilet: "షేర్డ్ టాయిలెట్",
      communityToilet: "కమ్యూనిటీ టాయిలెట్",
      openDefecation: "బయట మల విసర్జన",
    },
    csvUploadTitle: "ఐచ్ఛిక CSV అప్‌లోడ్",
    csvUploadDescription: "బ్యాచ్ ప్రాసెసింగ్ కోసం బహుళ ఎంట్రీలతో కూడిన CSV ఫైల్‌ను అప్‌లోడ్ చేయండి.",
    uploadCsv: "CSV అప్‌లోడ్ చేసి అంచనా వేయండి",
    csvColumns: "అవసరమైన CSV నిలువు వరుసలు: Diarrhea, Vomiting, Fever, AbdominalPain, Dehydration, Nausea, Headache, Fatigue, waterSource, sanitationAccess, location.",
    csvAlertSuccess: (count: number) => `CSV అప్‌లోడ్ చేయబడింది మరియు అంచనా వేయబడింది! ${count} పంక్తులు ప్రాసెస్ చేయబడ్డాయి.`,
    csvAlertNoFile: "ఏ CSV ఫైల్ ఎంచుకోబడలేదు.",
    csvAlertError: "CSV డేటాను ప్రాసెస్ చేయడంలో లోపం.",
    csvAlertMissingColumns: (columns: string) => `CSVలో అవసరమైన కాలమ్‌లు లేవు: ${columns}`,
  },
}

export default function DataCollectionPage() {
  const { user } = useAuth()
  const { addHealthData } = useHealth()
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en")
  const t = translations[language]
  const [formData, setFormData] = useState<FormData>({
    householdId: "",
    location: "",
    ashaWorker: "",
    symptoms: [],
    waterSource: "",
    sanitationAccess: "",
    notes: "",
    healthOfficerPhone: "",
  })
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const symptoms = ["Diarrhea", "Vomiting", "Fever", "Abdominal Pain", "Dehydration", "Nausea", "Headache", "Fatigue"]

  // Manual Symptoms Handling
  const handleSymptomChange = (symptom: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: checked ? [...prev.symptoms, symptom] : prev.symptoms.filter((s) => s !== symptom),
    }))
  }

  // Maps the frontend symptom strings and other features to the payload required by the backend.
  const mapSymptomsToFeatures = (data: FormData | any) => {
    const features: Record<string, number> = {
      Diarrhea: 0,
      Vomiting: 0,
      Fever: 0,
      AbdominalPain: 0,
      Dehydration: 0,
      Nausea: 0,
      Headache: 0,
      Fatigue: 0,
    }
    if (data.symptoms) {
      data.symptoms.forEach((s: string) => {
        const key = s.replace(" ", "")
        if (features.hasOwnProperty(key)) features[key] = 1
      })
    }
    return { ...features, waterSource: data.waterSource, sanitationAccess: data.sanitationAccess, location: data.location }
  }

  // Submit manual form
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canPerformActions(user)) return alert(t.alertNoPermission)

    try {
      const dataToSubmit = {
        ...formData,
        ashaWorker: user?.role === "ASHA Worker" ? user.name : formData.ashaWorker,
      }
      const payload = [{ ...mapSymptomsToFeatures(dataToSubmit) }]
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error("Prediction failed")

      const result = await response.json()
      addHealthData({ ...dataToSubmit, riskScore: result[0].riskLevel })
      alert(t.alertSuccess(result[0].riskLevel))
      setFormData({ householdId: "", location: "", ashaWorker: "", symptoms: [], waterSource: "", sanitationAccess: "", notes: "", healthOfficerPhone: "" })
    } catch (err) {
      console.error(err)
      alert(t.alertError)
    }
  }

  // Handle CSV Upload
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0])
    }
  }

  const handleCsvSubmit = async () => {
  if (!canPerformActions(user)) return alert(t.alertNoPermission)
  if (!csvFile) return alert(t.csvAlertNoFile)

  const formData = new FormData()
  formData.append("file", csvFile)

  try {
    const response = await fetch("http://localhost:5000/predict_csv", {
      method: "POST",
      body: formData, // no need for Content-Type header; browser sets it automatically
    })

    if (!response.ok) throw new Error("CSV Prediction Failed")

    // The response will be a file download
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "predicted_analysis.csv"
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error(err)
    alert(t.csvAlertError)
  }
}

  // This function would handle saving data to a local storage solution like IndexedDB
  const handleSaveAndSend = async () => {
    // Logic to save data locally first.
    // Example: saveToIndexedDB(formData);
    alert("Data saved locally and will be synced later.");
    // This part would ideally be an async function that sends data when online.
    // For now, it's a placeholder.
  };

  return (
    <AuthGuard>
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
              {user && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{user.name}</span>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 space-y-6">
          <div className="max-w-2xl mx-auto">
            {!canPerformActions(user) && (
              <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                <Shield className="w-4 h-4" />
                <AlertDescription>
                  <strong>{t.viewOnlyAccess}</strong> {t.viewOnlyDescription}
                </AlertDescription>
              </Alert>
            )}

            {/* Language Selector */}
            <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t.selectLanguage} / भाषा चुनें / భాషా ఎంపిక</CardTitle>
              </CardHeader>
              <CardContent>
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

            {/* Manual Entry Form */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t.manualEntryTitle}</CardTitle>
                <CardDescription>{t.manualEntryDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="householdId">{t.householdId}</Label>
                      <Input
                        id="householdId"
                        value={formData.householdId}
                        onChange={(e) => setFormData((prev) => ({ ...prev, householdId: e.target.value }))}
                        placeholder={t.placeholderHouseholdId}
                        required
                        disabled={!canPerformActions(user)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ashaWorker">{t.ashaWorker}</Label>
                      <Input
                        id="ashaWorker"
                        value={user?.role === "ASHA Worker" ? user.name : formData.ashaWorker}
                        onChange={(e) => setFormData((prev) => ({ ...prev, ashaWorker: e.target.value }))}
                        placeholder={t.placeholderAshaWorker}
                        required
                        disabled={user?.role === "ASHA Worker" || !canPerformActions(user)}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">{t.location}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                        placeholder={t.placeholderLocation}
                        required
                        disabled={!canPerformActions(user)}
                      />
                      <Button type="button" variant="outline" size="icon" disabled={!canPerformActions(user)}>
                        <MapPin className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Symptoms Checklist */}
                  <div className="space-y-4">
                    <Label>{t.symptoms}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {symptoms.map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox
                            id={symptom}
                            checked={formData.symptoms.includes(symptom)}
                            onCheckedChange={(checked) => handleSymptomChange(symptom, checked as boolean)}
                            disabled={!canPerformActions(user)}
                          />
                          <Label htmlFor={symptom} className="text-sm">
                            {symptom}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Water Source */}
                  <div className="space-y-2">
                    <Label htmlFor="waterSource">{t.waterSource}</Label>
                    <Select
                      value={formData.waterSource}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, waterSource: value }))}
                      disabled={!canPerformActions(user)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="well">{t.waterSources.well}</SelectItem>
                        <SelectItem value="river">{t.waterSources.river}</SelectItem>
                        <SelectItem value="pond">{t.waterSources.pond}</SelectItem>
                        <SelectItem value="piped">{t.waterSources.piped}</SelectItem>
                        <SelectItem value="rainwater">{t.waterSources.rainwater}</SelectItem>
                        <SelectItem value="other">{t.waterSources.other}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sanitation Access */}
                  <div className="space-y-2">
                    <Label htmlFor="sanitationAccess">{t.sanitationAccess}</Label>
                    <Select
                      value={formData.sanitationAccess}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, sanitationAccess: value }))}
                      disabled={!canPerformActions(user)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private-toilet">{t.sanitationFacilities.privateToilet}</SelectItem>
                        <SelectItem value="shared-toilet">{t.sanitationFacilities.sharedToilet}</SelectItem>
                        <SelectItem value="community-toilet">{t.sanitationFacilities.communityToilet}</SelectItem>
                        <SelectItem value="open-defecation">{t.sanitationFacilities.openDefecation}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">{t.notes}</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder={t.placeholderNotes}
                      rows={3}
                      disabled={!canPerformActions(user)}
                    />
                  </div>

                  {/* Health Officer Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="healthOfficerPhone">{t.healthOfficerPhone}</Label>
                    <Input
                      id="healthOfficerPhone"
                      value={formData.healthOfficerPhone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, healthOfficerPhone: e.target.value }))}
                      placeholder={t.placeholderHealthOfficerPhone}
                      type="tel"
                      disabled={!canPerformActions(user)}
                    />
                    <p className="text-xs text-gray-500">{t.notificationText}</p>
                  </div>

                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <Label>{t.photoDocumentation}</Label>
                    <Label
                      htmlFor="photo-upload"
                      className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {t.takePhoto}
                    </Label>
                    <input
  id="photo-upload"
  type="file"
  accept="image/*"
  capture={"camera" as any}
  className="hidden"
  disabled={!canPerformActions(user)}
/>

                  </div>

                  {/* Submit Button */}
                  {canPerformActions(user) ? (
                    <div className="flex gap-4 pt-4">
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {t.submitManual}
                      </Button>
                      <Button type="button" onClick={handleSaveAndSend} variant="outline" className="flex-1 bg-transparent">
                        <Send className="w-4 h-4 mr-2" />
                        {t.saveAndSend}
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-4">
                      <Button type="button" disabled className="w-full">
                        <Shield className="w-4 h-4 mr-2" />
                        {t.restrictedAccess}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* CSV Upload */}
            <Card className="mt-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t.csvUploadTitle}</CardTitle>
                <CardDescription>{t.csvUploadDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  disabled={!canPerformActions(user)}
                />
                <Button onClick={handleCsvSubmit} disabled={!csvFile || !canPerformActions(user)} className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                  {t.uploadCsv}
                </Button>
                <p className="text-sm text-gray-500">
                  {t.csvColumns}
                </p>
              </CardContent>
            </Card>

            {/* Offline Indicator */}
            <Card className="mt-6 border-0 shadow-lg bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">{t.offlineMode}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}