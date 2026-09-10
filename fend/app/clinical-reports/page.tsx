"use client"

import type { ChangeEvent, FormEvent } from "react"
import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileImage,
  FileText,
  FlaskConical,
  Loader2,
  Lock,
  MessageCircle,
  ShieldCheck,
  Upload,
  Trash2,
  ExternalLink,
} from "lucide-react"
import toast from "react-hot-toast"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

type MarkerStatus = "low" | "normal" | "high" | "critical" | "unknown"

type ParsedMarker = {
  key: string
  label: string
  category: string
  value: number
  unit: string
  detectedUnit?: string
  status: MarkerStatus
  referenceRange: string
  finding: string
}

type ReportAlert = {
  severity: "info" | "caution" | "urgent"
  title: string
  message: string
}

type ReportResult = {
  parsedAt: string
  stored: boolean
  privacy: string
  markers: ParsedMarker[]
  alerts: ReportAlert[]
  summary: string
  possibleFocusAreas: string[]
  suggestedQuestions: string[]
  rawTextPreview: string
  disclaimer: string
  fileUrl?: string
}

type HistoricalReport = {
  id: string
  title: string
  createdAt: string
  status: string
  fileUrl: string
  extractedData: string
}

const sampleReport = `Complete Blood Count
Hemoglobin 10.8 g/dL
RBC Count 3.7 million/uL
WBC Count 12800 /cumm
Platelet Count 410000 /cumm
Neutrophils 78 %
Lymphocytes 18 %
ESR 32 mm/hr

Thyroid Profile
TSH 6.8 mIU/L

Vitamins and Iron
Vitamin D 18 ng/mL
Vitamin B12 260 pg/mL
Ferritin 8 ng/mL

Metabolic
Fasting Glucose 106 mg/dL
HbA1c 5.9 %
Total Cholesterol 214 mg/dL
LDL Cholesterol 132 mg/dL
HDL Cholesterol 42 mg/dL
Triglycerides 180 mg/dL
Creatinine 0.8 mg/dL
ALT 28 U/L
AST 24 U/L`

function statusClasses(status: MarkerStatus) {
  if (status === "critical") return "border-red-200 bg-red-50 text-red-700"
  if (status === "high") return "border-amber-200 bg-amber-50 text-amber-700"
  if (status === "low") return "border-sky-200 bg-sky-50 text-sky-700"
  return "border-emerald-200 bg-emerald-50 text-emerald-700"
}

function alertClasses(severity: ReportAlert["severity"]) {
  if (severity === "urgent") return "border-red-200 bg-red-50 text-red-800"
  if (severity === "caution") return "border-amber-200 bg-amber-50 text-amber-800"
  return "border-sky-200 bg-sky-50 text-sky-800"
}

function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = () => reject(new Error("Could not read file"))
    reader.readAsText(file)
  })
}



export default function ClinicalReportsPage() {
  const router = useRouter()
  const [rawText, setRawText] = useState("")
  const [fileName, setFileName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [pregnant, setPregnant] = useState(false)
  const [age, setAge] = useState("")
  const [result, setResult] = useState<ReportResult | null>(null)
  
  const [reports, setReports] = useState<HistoricalReport[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchReports = async () => {
    setLoadingHistory(true)
    try {
      const { apiClient } = await import("@/lib/api-client")
      const data = await apiClient.get(`${API}/api/clinical-reports`)
      setReports(data.reports || [])
    } catch (err) {
      toast.error("Failed to load report history")
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent selection
    if (!window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) return

    setDeletingId(id)
    try {
      const { apiClient } = await import("@/lib/api-client")
      await apiClient.delete(`${API}/api/clinical-reports/${id}`)
      toast.success("Report deleted successfully")
      
      // Clear result view if we deleted the currently viewed report
      if (result && reports.find((r) => r.id === id)?.extractedData === JSON.stringify(result)) {
        setResult(null)
      }
      
      await fetchReports()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete report"
      toast.error(message)
    } finally {
      setDeletingId(null)
    }
  }

  const selectReport = (report: HistoricalReport) => {
    try {
      const parsedData = JSON.parse(report.extractedData)
      setResult({ 
        ...parsedData, 
        stored: true, 
        parsedAt: report.createdAt, 
        privacy: "Private", 
        fileUrl: report.fileUrl 
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      toast.error("Failed to parse historical report data")
    }
  }

  const abnormalMarkers = useMemo(
    () => result?.markers.filter((marker) => marker.status !== "normal") ?? [],
    [result]
  )

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setSelectedFile(file)
    setResult(null)

    try {
      if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".csv")) {
        const text = await readFileAsText(file)
        setRawText(text)
        toast.success("Report text loaded. Ready to parse.")
      } else if (file.type.startsWith("image/") || file.type === "application/pdf") {
        setRawText("")
        toast.success("Image/PDF selected. Click parse to upload and extract.")
      } else {
        toast.error("Unsupported file type")
      }
    } catch (err) {
      toast.error("Could not read file")
    }
  }

  const parseReport = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    
    const hasFileToUpload = selectedFile && !selectedFile.type.startsWith("text/") && !selectedFile.name.endsWith(".txt") && !selectedFile.name.endsWith(".csv")
    
    if (!hasFileToUpload && rawText.trim().length < 10) {
      toast.error("Add report text or upload an image/PDF first")
      return
    }

    setParsing(true)
    try {
      // We import apiClient inline to avoid breaking the file imports at top if not there
      const { apiClient } = await import("@/lib/api-client")
      let data: ReportResult & { message?: string, parsedData?: ReportResult }

      if (hasFileToUpload) {
        // Upload image/PDF to backend OCR
        const formData = new FormData()
        formData.append("report", selectedFile!)
        data = await apiClient.fetch(`${API}/api/clinical-reports/upload`, {
          method: "POST",
          body: formData,
        })
        if (data.parsedData) {
          // Backend returns parsedData nested for /upload
          data = { ...data.parsedData, stored: true, parsedAt: new Date().toISOString(), privacy: "Private" }
        }
      } else {
        // Parse raw text
        data = await apiClient.post(`${API}/api/clinical-reports/parse`, {
          rawText,
          sourceLabel: fileName || "Manual entry",
          patientContext: {
            age: age ? Number(age) : undefined,
            pregnant,
          },
        })
      }

      setResult(data)
      toast.success("Report parsed successfully")
      await fetchReports() // Refresh history list after a successful upload
    } catch (err) {
      const message = err instanceof Error ? err.message : "Parsing failed"
      toast.error(message)
    } finally {
      setParsing(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </button>

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-teal-600 text-white">
              <FlaskConical className="h-5 w-5" />
            </span>
            Clinical Report Parser
          </div>

          <button
            type="button"
            onClick={() => router.push("/anonymous-chat")}
            className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
          >
            <MessageCircle className="h-4 w-4" />
            Chat
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-4">
          <form onSubmit={parseReport} className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h1 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <Upload className="h-5 w-5 text-teal-700" />
                OCR Input
              </h1>
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                <Lock className="h-3.5 w-3.5" />
                Not stored
              </span>
            </div>

            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center hover:border-teal-300 hover:bg-teal-50">
              <FileImage className="h-8 w-8 text-teal-700" />
              <span className="mt-2 text-sm font-semibold text-slate-800">
                {fileName || "Upload report image or text file"}
              </span>
              <span className="mt-1 text-xs text-slate-500">PNG, JPG, PDF, TXT, or CSV</span>
              <input type="file" accept="image/*,.pdf,.txt,.csv,text/plain,text/csv,application/pdf" onChange={handleFile} className="hidden" />
            </label>


          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <FileText className="h-4 w-4 text-teal-700" />
                Extracted Text
              </h2>
              <button
                type="button"
                onClick={() => {
                  setFileName("Sample CBC and metabolic report")
                  setRawText(sampleReport)
                  setResult(null)
                }}
                className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Load sample
              </button>
            </div>

            <textarea
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              rows={13}
              placeholder="Paste OCR text or lab values here..."
              className="mt-3 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ClipboardList className="h-4 w-4 text-teal-700" />
              Context
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm font-medium text-slate-700">
                Age
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  placeholder="Optional"
                />
              </label>
              <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={pregnant}
                  onChange={(event) => setPregnant(event.target.checked)}
                  className="h-4 w-4 accent-teal-600"
                />
                Pregnancy context
              </label>
            </div>

            <button
              type="submit"
              disabled={parsing || (!selectedFile && rawText.trim().length < 10)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
              {parsing ? "Processing..." : "Parse report"}
            </button>
          </section>
        </form>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Past Reports</h2>
            {loadingHistory ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : reports.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">No reports uploaded yet.</p>
            ) : (
              <div className="flex max-h-[500px] flex-col gap-3 overflow-y-auto pr-1">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => selectReport(report)}
                    className="group relative flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 p-3 hover:border-teal-300 hover:bg-slate-50 transition-colors"
                  >
                    <div className="mt-0.5 shrink-0 rounded bg-teal-100 p-1.5 text-teal-700">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium text-slate-900">{report.title}</p>
                      <p className="text-xs text-slate-500">{new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(report.id, e)}
                      disabled={deletingId === report.id}
                      className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors"
                      title="Delete report"
                    >
                      {deletingId === report.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="space-y-4">
          {!result && (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-teal-50 text-teal-700">
                <FlaskConical className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">No parsed report yet</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Add report text or run OCR on a clear image, then parse it for markers, ranges, focus areas, and clinician questions.
              </p>
            </div>
          )}

          {result && (
            <>
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{result.summary}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {result.fileUrl && (
                      <a
                        href={result.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View Original
                      </a>
                    )}
                    <span className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {result.stored ? "Stored" : "Not stored"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs font-medium uppercase text-slate-500">Detected</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{result.markers.length}</p>
                  </div>
                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs font-medium uppercase text-slate-500">Abnormal</p>
                    <p className="mt-1 text-2xl font-semibold text-amber-700">{abnormalMarkers.length}</p>
                  </div>
                  <div className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs font-medium uppercase text-slate-500">Parsed</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{new Date(result.parsedAt).toLocaleString()}</p>
                  </div>
                </div>
              </section>

              {result.alerts.length > 0 && (
                <section className="space-y-2">
                  {result.alerts.map((alert) => (
                    <div key={`${alert.title}-${alert.message}`} className={`rounded-lg border p-4 ${alertClasses(alert.severity)}`}>
                      <h3 className="flex items-center gap-2 text-sm font-semibold">
                        {alert.severity === "urgent" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        {alert.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6">{alert.message}</p>
                    </div>
                  ))}
                </section>
              )}

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900">Detected Markers</h2>
                  <span className="text-xs text-slate-500">{result.markers.length} found</span>
                </div>

                {/* Mobile Card Presentation (< 640px) */}
                <div className="block sm:hidden divide-y divide-slate-200">
                  {result.markers.map((marker) => (
                    <div key={marker.key} className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{marker.label}</p>
                          <p className="text-xs text-slate-500">{marker.category}</p>
                        </div>
                        <span
                          className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold capitalize ${statusClasses(
                            marker.status
                          )}`}
                        >
                          {marker.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="text-slate-400 block font-medium">Value</span>
                          <span className="font-semibold text-slate-900">{marker.value} {marker.unit}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="text-slate-400 block font-medium">Ref Range</span>
                          <span className="text-slate-700">{marker.referenceRange}</span>
                        </div>
                      </div>
                      {marker.finding && (
                        <p className="text-xs leading-relaxed text-slate-600 pt-1">
                          <span className="font-medium text-slate-700">Finding:</span> {marker.finding}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop Table Presentation (>= 640px) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Marker</th>
                        <th className="px-4 py-3">Value</th>
                        <th className="px-4 py-3">Range</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Finding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {result.markers.map((marker) => (
                        <tr key={marker.key} className="align-top">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{marker.label}</p>
                            <p className="text-xs text-slate-500">{marker.category}</p>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {marker.value} {marker.unit}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{marker.referenceRange}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold capitalize ${statusClasses(
                                marker.status
                              )}`}
                            >
                              {marker.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 leading-6 text-slate-600">{marker.finding}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="grid gap-4 lg:grid-cols-2">
                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h2 className="text-base font-semibold text-slate-900">Focus Areas</h2>
                  {result.possibleFocusAreas.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                      {result.possibleFocusAreas.map((area) => (
                        <li key={area} className="flex gap-2">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-700" />
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600">No abnormal focus areas were detected.</p>
                  )}
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h2 className="text-base font-semibold text-slate-900">Clinician Questions</h2>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                    {result.suggestedQuestions.map((question) => (
                      <li key={question} className="flex gap-2">
                        <ClipboardList className="mt-1 h-4 w-4 shrink-0 text-rose-700" />
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
                <p className="font-medium text-slate-800">Clinical disclaimer</p>
                <p className="mt-1">{result.disclaimer}</p>
              </section>
            </>
          )}
        </section>
      </section>
    </main>
  )
}
