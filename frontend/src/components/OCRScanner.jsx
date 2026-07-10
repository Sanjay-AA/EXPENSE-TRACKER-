import { useState, useRef, useEffect } from "react"
import Tesseract from "tesseract.js"
import { addTransaction } from "../lib/api.js"

export default function OCRScanner({ onAdded }) {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [imagePreview, setImagePreview] = useState(null)
  const [extractedData, setExtractedData] = useState({
    amount: "",
    date: "",
    merchant: "",
    category: "",
    note: "",
  })
  const [showEditForm, setShowEditForm] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)
  const scanAreaRef = useRef(null)

  /** ---------- Parsing Helpers ---------- **/
  const extractAmount = (text) => {
    const patterns = [
      /(?:total|amount|sum|due|pay|rs\.?|₹|inr)\s*:?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:rs\.?|₹|inr)/i,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)/,
    ]
    for (const p of patterns) {
      const match = text.match(p)
      if (match) return parseFloat((match[1] || match[0]).replace(/,/g, ""))
    }
    return null
  }

  const extractDate = (text) => {
    const patterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
      /(?:date|dated)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    ]
    for (const p of patterns) {
      const m = text.match(p)
      if (m) {
        const d = new Date(m[1])
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
      }
    }
    return new Date().toISOString().slice(0, 10)
  }

  const extractMerchant = (text) => {
    const lines = text.split("\n").filter((l) => l.trim())
    return lines[0]?.trim().slice(0, 50) || ""
  }

  const extractCategory = (text) => {
    const t = text.toLowerCase()
    if (/grocery|food|restaurant|cafe/.test(t)) return "Food & Dining"
    if (/fuel|petrol|gas|transport/.test(t)) return "Transportation"
    if (/medical|pharmacy|hospital|clinic/.test(t)) return "Healthcare"
    if (/clothing|fashion|apparel|shopping/.test(t)) return "Shopping"
    if (/utility|electricity|water|bill/.test(t)) return "Utilities"
    if (/entertainment|movie|game/.test(t)) return "Entertainment"
    if (/education|course|book/.test(t)) return "Education"
    return "General"
  }

  /** ---------- OCR Process ---------- **/
  const processImage = async (file) => {
    if (!file) return
    if (!file.type.startsWith("image/")) return setError("Please select an image")
    if (file.size > 10 * 1024 * 1024)
      return setError("File too large (max 10MB)")

    setLoading(true)
    setProgress(0)
    setError("")
    setImagePreview(null)
    setShowEditForm(false)

    try {
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)

      const { data } = await Tesseract.recognize(file, "eng", {
        logger: (m) =>
          m.status === "recognizing text" &&
          setProgress(Math.round(m.progress * 100)),
      })

      const extractedText = data.text || ""
      setText(extractedText)

      const amount = extractAmount(extractedText)
      const date = extractDate(extractedText)
      const merchant = extractMerchant(extractedText)
      const category = extractCategory(extractedText)

      setExtractedData({
        amount: amount ? amount.toString() : "",
        date,
        merchant,
        category,
        note: `OCR Scan: ${merchant || "Receipt"}`,
      })

      if (amount) setShowEditForm(true)
      else setError("Could not detect amount. Please edit manually.")
    } catch (err) {
      console.error(err)
      setError("OCR failed: " + err.message)
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  /** ---------- Handlers ---------- **/
  const handleSubmit = async () => {
    if (!extractedData.amount) return
    try {
      await addTransaction({
        type: "expense",
        amount: parseFloat(extractedData.amount),
        category: extractedData.category,
        note: extractedData.note,
        date: extractedData.date,
      })
      resetForm()
      onAdded?.()
    } catch (err) {
      setError("Failed to add transaction: " + err.message)
    }
  }

  const resetForm = () => {
    setExtractedData({ amount: "", date: "", merchant: "", category: "", note: "" })
    setShowEditForm(false)
    setText("")
    setImagePreview(null)
    setError("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) processImage(file)
  }

  /** ---------- JSX ---------- **/
  return (
    <div className="card morph-shape">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "var(--bg-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
          }}
        >
          📷
        </div>
        <div>
          <h3>Scan Receipt (OCR)</h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
            Upload or drag & drop an image to extract details automatically
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#ef4444",
            padding: "12px",
            borderRadius: "var(--radius-md)",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div
        ref={dropZoneRef}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: "2px dashed var(--border-secondary)",
          borderRadius: "var(--radius-lg)",
          padding: "32px 20px",
          textAlign: "center",
          background: "var(--bg-secondary)",
          cursor: "pointer",
          marginBottom: "24px",
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: "none" }}
        />
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>📁</div>
        <div style={{ fontWeight: 600 }}>Click to upload or drag & drop image</div>
      </div>

      {loading && (
        <div ref={scanAreaRef} style={{ textAlign: "center", padding: "20px" }}>
          <div>🔍 Scanning... {progress}%</div>
        </div>
      )}

      {imagePreview && (
        <div style={{ marginBottom: "16px" }}>
          <h4>📸 Preview</h4>
          <img src={imagePreview} alt="Receipt preview" style={{ maxWidth: "100%", borderRadius: "8px" }} />
        </div>
      )}

      {showEditForm && (
        <div>
          <h4>📋 Extracted Information</h4>
          <div style={{ display: "grid", gap: "12px" }}>
            <input
              type="number"
              value={extractedData.amount}
              onChange={(e) => setExtractedData((p) => ({ ...p, amount: e.target.value }))}
              placeholder="Amount (₹)"
            />
            <input
              type="date"
              value={extractedData.date}
              onChange={(e) => setExtractedData((p) => ({ ...p, date: e.target.value }))}
            />
            <input
              type="text"
              value={extractedData.merchant}
              onChange={(e) => setExtractedData((p) => ({ ...p, merchant: e.target.value }))}
              placeholder="Merchant"
            />
            <select
              value={extractedData.category}
              onChange={(e) => setExtractedData((p) => ({ ...p, category: e.target.value }))}
            >
              <option>General</option>
              <option>Food & Dining</option>
              <option>Transportation</option>
              <option>Healthcare</option>
              <option>Shopping</option>
              <option>Utilities</option>
              <option>Entertainment</option>
              <option>Education</option>
            </select>
            <input
              type="text"
              value={extractedData.note}
              onChange={(e) => setExtractedData((p) => ({ ...p, note: e.target.value }))}
              placeholder="Note"
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleSubmit} disabled={!extractedData.amount} style={{ flex: 1 }}>
                ✅ Add
              </button>
              <button onClick={resetForm}>🔄 Reset</button>
            </div>
          </div>
        </div>
      )}

      {text && !showEditForm && (
        <div>
          <h4>📝 Extracted Text</h4>
          <pre style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px", maxHeight: "200px", overflowY: "auto" }}>
            {text}
          </pre>
        </div>
      )}
    </div>
  )
}
