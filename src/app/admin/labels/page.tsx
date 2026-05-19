"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import Cookies from "js-cookie"
import { Tag, Plus, Download, X, Printer, Save, Trash2, Eye, Layers, Type, Palette, Move, Lock, Unlock, Copy, FileText, Image as ImageIcon, ZoomIn, ZoomOut, RotateCcw, RotateCw, Grid3X3, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface LabelField {
  id: string
  type: "text" | "qrcode" | "image" | "rect"
  text?: string
  x: number
  y: number
  width?: number
  height?: number
  fontSize?: number
  fontFamily?: string
  fill?: string
  fontWeight?: string
  locked?: boolean
  opacity?: number
  layerOrder?: number
  visible?: boolean
  rotation?: number
}

interface LabelTemplate {
  id: string
  name: string
  width: number
  height: number
  fields: LabelField[]
  background?: string
  bgColor?: string
  stripColor1?: string
  stripColor2?: string
}

const generateAuthCode = (productName: string): string => {
  const abbrev = productName
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 7)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let random = ""
  for (let i = 0; i < 8; i++) random += chars[Math.floor(Math.random() * chars.length)]
  return `PHQ-${abbrev || "PROD"}-${random}`
}

const DEFAULT_FIELDS: LabelField[] = [
  { id: "bg-strip-top", type: "rect", x: 0, y: 0, width: 1024, height: 18, fill: "#4da6d9", locked: true, opacity: 1, layerOrder: 1, visible: true },
  { id: "bg-strip-bottom", type: "rect", x: 0, y: 494, width: 1024, height: 18, fill: "#4da6d9", locked: true, opacity: 1, layerOrder: 2, visible: true },
  { id: "bg-strip-accent", type: "rect", x: 30, y: 260, width: 420, height: 50, fill: "#7c3aac", locked: false, opacity: 1, layerOrder: 3, visible: true },
  { id: "category", type: "text", text: "60Caps Orals", x: 30, y: 30, fontSize: 16, fontFamily: "Arial", fill: "#333", fontWeight: "normal", locked: false, opacity: 1, layerOrder: 10, visible: true },
  { id: "product-name", type: "text", text: "Anadrol", x: 30, y: 65, fontSize: 52, fontFamily: "Georgia", fill: "#1a1a2e", fontWeight: "bold", locked: false, opacity: 1, layerOrder: 11, visible: true },
  { id: "subtitle", type: "text", text: "Oxymetholone", x: 30, y: 150, fontSize: 36, fontFamily: "Georgia", fill: "#333", fontWeight: "normal", locked: false, opacity: 1, layerOrder: 12, visible: true },
  { id: "dosage", type: "text", text: "50mg x 60 Caps", x: 45, y: 268, fontSize: 22, fontFamily: "Arial", fill: "#ffffff", fontWeight: "bold", locked: false, opacity: 1, layerOrder: 13, visible: true },
  { id: "application", type: "text", text: "FOR ORAL USE ONLY", x: 30, y: 325, fontSize: 22, fontFamily: "Arial", fill: "#cc0000", fontWeight: "bold", locked: false, opacity: 1, layerOrder: 14, visible: true },
  { id: "composition", type: "text", text: "Each caps contains: Oxymetholone 50mg.\nKeep out of reach of children, Store below 30°C, Protect\nfrom light, Do not Refrigerate, Prescription only medicine", x: 30, y: 370, fontSize: 12, fontFamily: "Arial", fill: "#333", fontWeight: "bold", locked: false, opacity: 1, layerOrder: 15, visible: true, width: 450 },
  { id: "security-text", type: "text", text: "Caution 5 layer Security Label\nLabel Concept with multi-step security\nverification for anti-counterfeit protection.", x: 530, y: 30, fontSize: 13, fontFamily: "Arial", fill: "#cc0000", fontWeight: "normal", locked: false, opacity: 1, layerOrder: 16, visible: true, width: 470 },
  { id: "website", type: "text", text: "www.pharmaqo.life", x: 730, y: 100, fontSize: 16, fontFamily: "Arial", fill: "#cc0000", fontWeight: "bold", locked: false, opacity: 1, layerOrder: 17, visible: true },
  { id: "mfg", type: "text", text: "MFG: 07-2023", x: 880, y: 200, fontSize: 11, fontFamily: "Arial", fill: "#333", fontWeight: "normal", locked: false, opacity: 1, layerOrder: 18, visible: true, rotation: 90 },
  { id: "expiry", type: "text", text: "EXP: 07-2026", x: 910, y: 200, fontSize: 11, fontFamily: "Arial", fill: "#333", fontWeight: "normal", locked: false, opacity: 1, layerOrder: 19, visible: true, rotation: 90 },
  { id: "batch", type: "text", text: "BATCH: 100-0313167250", x: 940, y: 200, fontSize: 11, fontFamily: "Arial", fill: "#333", fontWeight: "normal", locked: false, opacity: 1, layerOrder: 20, visible: true, rotation: 90 },
  { id: "uid", type: "text", text: "UID: PHQ-ANADROL-XXXXXXXX", x: 970, y: 200, fontSize: 9, fontFamily: "Arial", fill: "#1a3a7c", fontWeight: "bold", locked: false, opacity: 1, layerOrder: 21, visible: true, rotation: 90 },
  { id: "auth-code", type: "text", text: "Auth: PHQ-ANADROL-XXXXXXXX", x: 990, y: 200, fontSize: 8, fontFamily: "Arial", fill: "#999", fontWeight: "normal", locked: false, opacity: 1, layerOrder: 22, visible: true, rotation: 90 },
  { id: "qrcode", type: "qrcode", text: "QR", x: 530, y: 140, width: 150, height: 150, fill: "#1a3a7c", locked: false, opacity: 1, layerOrder: 25, visible: true },
  { id: "qrcode-2", type: "qrcode", text: "QR2", x: 710, y: 140, width: 150, height: 150, fill: "#333333", locked: false, opacity: 1, layerOrder: 26, visible: true },
  { id: "logo", type: "text", text: "PHARMAQO", x: 700, y: 420, fontSize: 32, fontFamily: "Arial", fill: "#cc0000", fontWeight: "bold", locked: false, opacity: 1, layerOrder: 27, visible: true },
  { id: "qr-label", type: "text", text: "Scan to verify", x: 570, y: 295, fontSize: 10, fontFamily: "Arial", fill: "#888", fontWeight: "normal", locked: false, opacity: 1, layerOrder: 28, visible: true },
]

export default function AdminLabelsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [labels, setLabels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [templates, setTemplates] = useState<LabelTemplate[]>([])
  const [currentTemplate, setCurrentTemplate] = useState<LabelTemplate>({
    id: "default",
    name: "PharmaQo Anadrol",
    width: 1024,
    height: 512,
    fields: [...DEFAULT_FIELDS],
    bgColor: "#f8f8f8",
    stripColor1: "#4da6d9",
    stripColor2: "#7c3aac",
  })
  const [selectedField, setSelectedField] = useState<LabelField | null>(null)
  const [selectedFields, setSelectedFields] = useState<LabelField[]>([])
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, fieldX: 0, fieldY: 0, fieldW: 0, fieldH: 0 })
  const [templateName, setTemplateName] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [massExporting, setMassExporting] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [qrDataUrl2, setQrDataUrl2] = useState<string>("")
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([])
  const [codeCount, setCodeCount] = useState(10)
  const [showCodesPanel, setShowCodesPanel] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const token = Cookies.get("token")
  const headers: Record<string, string> = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }

  useEffect(() => {
    Promise.all([
      fetch("/api/products?limit=100", { headers }).then(r => r.json()),
      fetch("/api/labels", { headers }).then(r => r.json()),
    ]).then(([prodData, labelData]) => {
      setProducts(prodData.products || [])
      setLabels(labelData.labels || [])
      setLoading(false)
    }).catch(() => setLoading(false))

    const saved = localStorage.getItem("pharmaqo-label-templates")
    if (saved) {
      try { setTemplates(JSON.parse(saved)) } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    const uidField = currentTemplate.fields.find(f => f.id === "uid")
    const uid = uidField?.text?.replace("UID: ", "") || "PQ-XXXX-XXXX"
    const batchField = currentTemplate.fields.find(f => f.id === "batch")
    const batch = batchField?.text?.replace("BATCH: ", "") || "000"
    import("qrcode").then(mod => {
      const QRCode = mod.default
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
      const verifyUrl = `${baseUrl}/verify?code=${uid}`
      QRCode.toDataURL(verifyUrl, { width: 200, margin: 1, color: { dark: "#1a3a7c", light: "#ffffff" } })
        .then((dataUrl: string) => setQrDataUrl(dataUrl))
        .catch(() => {})
      QRCode.toDataURL(`${baseUrl}/verify?batch=${batch}&code=${uid}`, { width: 200, margin: 1, color: { dark: "#333333", light: "#ffffff" } })
        .then((dataUrl: string) => setQrDataUrl2(dataUrl))
        .catch(() => {})
    }).catch(() => {})
  }, [currentTemplate.fields])

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const generateLabels = async () => {
    setGenerating(true)
    const selected = products.filter(p => selectedProducts.includes(p.id))
    for (const product of selected) {
      await fetch("/api/labels", {
        method: "POST", headers,
        body: JSON.stringify({
          productId: product.id,
          data: { name: product.name, dosage: product.dosage, lot: product.lot, expiry: product.expiry, composition: product.composition, uid: product.uid },
        }),
      })
    }
    const labelData = await fetch("/api/labels", { headers }).then(r => r.json())
    setLabels(labelData.labels || [])
    setShowGenerator(false)
    setSelectedProducts([])
    setGenerating(false)
  }

  const updateField = (fieldId: string, updates: Partial<LabelField>) => {
    setCurrentTemplate(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f),
    }))
    if (selectedField?.id === fieldId) {
      setSelectedField(prev => prev ? { ...prev, ...updates } : null)
    }
    setSelectedFields(prev => prev.map(f => f.id === fieldId ? { ...f, ...updates } : f))
  }

  const updateMultipleFields = (updates: Partial<LabelField>) => {
    const ids = selectedFields.map(f => f.id)
    setCurrentTemplate(prev => ({
      ...prev,
      fields: prev.fields.map(f => ids.includes(f.id) ? { ...f, ...updates } : f),
    }))
    setSelectedFields(prev => prev.map(f => ({ ...f, ...updates })))
    if (selectedField && ids.includes(selectedField.id)) {
      setSelectedField(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  const moveLayerUp = (fieldId: string) => {
    const sorted = [...currentTemplate.fields].sort((a, b) => (a.layerOrder || 0) - (b.layerOrder || 0))
    const idx = sorted.findIndex(f => f.id === fieldId)
    if (idx < sorted.length - 1) {
      const curOrder = sorted[idx].layerOrder || 0
      const nextOrder = sorted[idx + 1].layerOrder || 0
      updateField(sorted[idx + 1].id, { layerOrder: curOrder })
      updateField(fieldId, { layerOrder: nextOrder })
    }
  }

  const moveLayerDown = (fieldId: string) => {
    const sorted = [...currentTemplate.fields].sort((a, b) => (a.layerOrder || 0) - (b.layerOrder || 0))
    const idx = sorted.findIndex(f => f.id === fieldId)
    if (idx > 0) {
      const curOrder = sorted[idx].layerOrder || 0
      const prevOrder = sorted[idx - 1].layerOrder || 0
      updateField(sorted[idx - 1].id, { layerOrder: curOrder })
      updateField(fieldId, { layerOrder: prevOrder })
    }
  }

  const moveToFront = (fieldId: string) => {
    const maxOrder = Math.max(...currentTemplate.fields.map(f => f.layerOrder || 0), 0)
    updateField(fieldId, { layerOrder: maxOrder + 1 })
  }

  const moveToBack = (fieldId: string) => {
    const minOrder = Math.min(...currentTemplate.fields.map(f => f.layerOrder || 0), 999)
    updateField(fieldId, { layerOrder: minOrder - 1 })
  }

  const openEditorForProduct = (product: any) => {
    setEditingProduct(product)
    const authCode = generateAuthCode(product.name || "PROD")
    setCurrentTemplate(prev => ({
      ...prev,
      fields: prev.fields.map(f => {
        switch (f.id) {
          case "product-name": return { ...f, text: product.name || "Anadrol" }
          case "subtitle": return { ...f, text: product.composition?.split(",")[0]?.trim() || product.subtitle || "Oxymetholone" }
          case "category": return { ...f, text: product.category || "60Caps Orals" }
          case "dosage": return { ...f, text: product.dosage || "50mg x 60 Caps" }
          case "application": return { ...f, text: product.application || "FOR ORAL USE ONLY" }
          case "composition": return { ...f, text: product.composition ? `Each caps contains: ${product.composition}.\nKeep out of reach of children, Store below 30°C, Protect\nfrom light, Do not Refrigerate, Prescription only medicine` : f.text || "" }
          case "mfg": return { ...f, text: `MFG: ${product.mfg || new Date().toLocaleDateString("en-US", { month: "2-digit", year: "numeric" }).replace("/", "-")}` }
          case "expiry": return { ...f, text: `EXP: ${product.expiry || new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "2-digit", year: "numeric" }).replace("/", "-")}` }
          case "batch": return { ...f, text: `BATCH: ${product.lot || "100-" + Date.now().toString().slice(-10)}` }
          case "uid": return { ...f, text: `UID: ${authCode}` }
          case "auth-code": return { ...f, text: `Auth: ${authCode}` }
          default: return f
        }
      }),
    }))
    setShowEditor(true)
  }

  const saveTemplate = () => {
    const name = templateName || currentTemplate.name
    const newTemplate = { ...currentTemplate, id: `tpl-${Date.now()}`, name }
    const updated = [...templates.filter(t => t.name !== name), newTemplate]
    setTemplates(updated)
    localStorage.setItem("pharmaqo-label-templates", JSON.stringify(updated))
    setShowSaveDialog(false)
    setTemplateName("")
  }

  const loadTemplate = (template: LabelTemplate) => {
    setCurrentTemplate({ ...template })
    setSelectedField(null)
  }

  const deleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id)
    setTemplates(updated)
    localStorage.setItem("pharmaqo-label-templates", JSON.stringify(updated))
  }

  const generateAndApplyCode = () => {
    const productField = currentTemplate.fields.find(f => f.id === "product-name")
    const productName = productField?.text || "PROD"
    const code = generateAuthCode(productName)
    updateField("uid", { text: `UID: ${code}` })
    updateField("auth-code", { text: `Auth: ${code}` })
  }

  const generateBulkCodes = (count: number) => {
    const productField = currentTemplate.fields.find(f => f.id === "product-name")
    const productName = productField?.text || "PROD"
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      codes.push(generateAuthCode(productName))
    }
    setGeneratedCodes(codes)
    if (codes.length > 0) {
      updateField("uid", { text: `UID: ${codes[0]}` })
      updateField("auth-code", { text: `Auth: ${codes[0]}` })
    }
    setShowCodesPanel(true)
  }

  const exportCodesToCSV = () => {
    if (generatedCodes.length === 0) return
    const csv = "Código de Autenticidade\n" + generatedCodes.join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `codigos-autenticidade-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {})
  }

  const addNewTextField = () => {
    const newId = `text-${Date.now()}`
    const maxOrder = Math.max(...currentTemplate.fields.map(f => f.layerOrder || 0), 0)
    const newField: LabelField = {
      id: newId, type: "text", text: "Novo Texto", x: 100, y: 200,
      fontSize: 16, fontFamily: "Arial", fill: "#333333", fontWeight: "normal",
      locked: false, opacity: 1, layerOrder: maxOrder + 1, visible: true,
    }
    setCurrentTemplate(prev => ({ ...prev, fields: [...prev.fields, newField] }))
    setSelectedField(newField)
  }

  const addNewColorStrip = () => {
    const newId = `strip-${Date.now()}`
    const maxOrder = Math.max(...currentTemplate.fields.map(f => f.layerOrder || 0), 0)
    const newField: LabelField = {
      id: newId, type: "rect", x: 0, y: 180, width: 800, height: 30,
      fill: "#8b5cf6", locked: false, opacity: 1, layerOrder: maxOrder + 1, visible: true,
    }
    setCurrentTemplate(prev => ({ ...prev, fields: [...prev.fields, newField] }))
    setSelectedField(newField)
  }

  const deleteField = (fieldId: string) => {
    setCurrentTemplate(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== fieldId) }))
    if (selectedField?.id === fieldId) setSelectedField(null)
  }

  const handleCanvasMouseDown = (e: React.MouseEvent, field: LabelField) => {
    if (field.locked) return
    e.preventDefault()
    e.stopPropagation()
    if (e.shiftKey) {
      setSelectedFields(prev => {
        const exists = prev.find(f => f.id === field.id)
        if (exists) return prev.filter(f => f.id !== field.id)
        return [...prev, field]
      })
      setSelectedField(field)
    } else {
      if (!selectedFields.find(f => f.id === field.id)) {
        setSelectedFields([field])
      }
      setSelectedField(field)
    }
    setIsDragging(true)
    setDragStart({ mouseX: e.clientX, mouseY: e.clientY, fieldX: field.x, fieldY: field.y, fieldW: field.width || 200, fieldH: field.height || 30 })
  }

  const handleResizeStart = (e: React.MouseEvent, field: LabelField, handle: string) => {
    if (field.locked) return
    e.preventDefault()
    e.stopPropagation()
    setSelectedField(field)
    setIsResizing(handle)
    setDragStart({ mouseX: e.clientX, mouseY: e.clientY, fieldX: field.x, fieldY: field.y, fieldW: field.width || 200, fieldH: field.height || 30 })
  }

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isResizing && selectedField && !selectedField.locked) {
      const deltaX = (e.clientX - dragStart.mouseX) / zoom
      const deltaY = (e.clientY - dragStart.mouseY) / zoom
      let newW = dragStart.fieldW
      let newH = dragStart.fieldH
      let newX = dragStart.fieldX
      let newY = dragStart.fieldY
      if (isResizing.includes("e")) newW = Math.max(30, dragStart.fieldW + deltaX)
      if (isResizing.includes("w")) { newW = Math.max(30, dragStart.fieldW - deltaX); newX = dragStart.fieldX + deltaX }
      if (isResizing.includes("s")) newH = Math.max(15, dragStart.fieldH + deltaY)
      if (isResizing.includes("n")) { newH = Math.max(15, dragStart.fieldH - deltaY); newY = dragStart.fieldY + deltaY }
      updateField(selectedField.id, { width: Math.round(newW), height: Math.round(newH), x: Math.round(newX), y: Math.round(newY) })
      return
    }
    if (!isDragging || !selectedField || selectedField.locked) return
    const deltaX = (e.clientX - dragStart.mouseX) / zoom
    const deltaY = (e.clientY - dragStart.mouseY) / zoom
    if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) return
    if (selectedFields.length > 1) {
      const primaryField = currentTemplate.fields.find(f => f.id === selectedField.id)
      if (!primaryField) return
      const primaryDx = dragStart.fieldX + deltaX - primaryField.x
      const primaryDy = dragStart.fieldY + deltaY - primaryField.y
      selectedFields.forEach(sf => {
        if (sf.locked) return
        const curField = currentTemplate.fields.find(f => f.id === sf.id)
        if (!curField) return
        let nx = curField.x + primaryDx
        let ny = curField.y + primaryDy
        nx = Math.max(0, Math.min(nx, currentTemplate.width - 20))
        ny = Math.max(0, Math.min(ny, currentTemplate.height - 20))
        if (showGrid) { nx = Math.round(nx / 10) * 10; ny = Math.round(ny / 10) * 10 }
        updateField(sf.id, { x: Math.round(nx), y: Math.round(ny) })
      })
    } else {
      let newX = dragStart.fieldX + deltaX
      let newY = dragStart.fieldY + deltaY
      newX = Math.max(0, Math.min(newX, currentTemplate.width - 20))
      newY = Math.max(0, Math.min(newY, currentTemplate.height - 20))
      if (showGrid) {
        newX = Math.round(newX / 10) * 10
        newY = Math.round(newY / 10) * 10
      }
      updateField(selectedField.id, { x: Math.round(newX), y: Math.round(newY) })
    }
  }, [isDragging, isResizing, selectedField, selectedFields, zoom, showGrid, dragStart, currentTemplate.width, currentTemplate.height])

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(null)
  }, [])

  const renderLabelPreview = (template: LabelTemplate, scale: number = 1) => {
    const w = template.width * scale
    const h = template.height * scale
    return (
      <div style={{ width: w, height: h, position: "relative", backgroundColor: template.bgColor || "#f8f8f8", overflow: "hidden", backgroundImage: `url(/images/anadrol-template.png)`, backgroundSize: "cover", backgroundPosition: "center" }}>
        {showGrid && (
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            {Array.from({ length: Math.ceil(template.width / 20) }, (_, i) => (
              <line key={`v${i}`} x1={i * 20 * scale} y1={0} x2={i * 20 * scale} y2={h} stroke="rgba(139,92,246,0.1)" strokeWidth={1} />
            ))}
            {Array.from({ length: Math.ceil(template.height / 20) }, (_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 20 * scale} x2={w} y2={i * 20 * scale} stroke="rgba(139,92,246,0.1)" strokeWidth={1} />
            ))}
          </svg>
        )}
        {[...template.fields].sort((a, b) => (a.layerOrder || 0) - (b.layerOrder || 0)).filter(f => f.visible !== false).map(field => {
          const isMultiSelected = selectedFields.some(sf => sf.id === field.id)
          const isSelected = selectedField?.id === field.id || isMultiSelected
          const rotStyle = field.rotation ? `rotate(${field.rotation}deg)` : undefined
          if (field.type === "rect") {
            return (
              <div
                key={field.id}
                onClick={(e) => { e.stopPropagation(); setSelectedField(field) }}
                onMouseDown={(e) => handleCanvasMouseDown(e, field)}
                style={{
                  position: "absolute",
                  left: field.x * scale,
                  top: field.y * scale,
                  width: (field.width || 100) * scale,
                  height: (field.height || 40) * scale,
                  backgroundColor: field.fill || "#1a3a7c",
                  opacity: field.opacity ?? 1,
                  cursor: field.locked ? "default" : "move",
                  outline: isSelected ? `2px solid ${isMultiSelected && selectedFields.length > 1 ? "#f59e0b" : "#8b5cf6"}` : "none",
                  outlineOffset: "2px",
                  transform: rotStyle,
                  transformOrigin: "center center",
                }}
              />
            )
          }
          if (field.type === "qrcode") {
            return (
              <div
                key={field.id}
                onClick={(e) => { e.stopPropagation(); setSelectedField(field) }}
                onMouseDown={(e) => handleCanvasMouseDown(e, field)}
                style={{
                  position: "absolute",
                  left: field.x * scale,
                  top: field.y * scale,
                  width: (field.width || 150) * scale,
                  height: (field.height || 150) * scale,
                  opacity: field.opacity ?? 1,
                  cursor: field.locked ? "default" : "move",
                  outline: isSelected ? `2px solid ${isMultiSelected && selectedFields.length > 1 ? "#f59e0b" : "#8b5cf6"}` : "none",
                  outlineOffset: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `2px solid ${field.fill || "#1a3a7c"}`,
                  borderRadius: "8px",
                  backgroundColor: "white",
                  transform: rotStyle,
                  transformOrigin: "center center",
                }}
              >
                {(field.id === "qrcode-2" ? qrDataUrl2 : qrDataUrl) ? (
                  <img src={field.id === "qrcode-2" ? qrDataUrl2 : qrDataUrl} alt="QR Code" style={{ width: "100%", height: "100%", objectFit: "contain" }} draggable={false} />
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <Grid3X3 style={{ width: 40 * scale, height: 40 * scale, color: field.fill || "#1a3a7c" }} />
                    <p style={{ fontSize: 8 * scale, color: "#888", marginTop: 4 }}>QR Code</p>
                  </div>
                )}
              </div>
            )
          }
          const hasBox = !!(field.width && field.width > 0)
          const outlineColor = isMultiSelected && selectedFields.length > 1 ? "#f59e0b" : "#8b5cf6"
          return (
            <div
              key={field.id}
              onClick={(e) => { e.stopPropagation(); setSelectedField(field) }}
              onMouseDown={(e) => handleCanvasMouseDown(e, field)}
              style={{
                position: "absolute",
                left: field.x * scale,
                top: field.y * scale,
                width: hasBox ? (field.width! * scale) : undefined,
                height: (hasBox && field.height) ? (field.height * scale) : undefined,
                fontSize: (field.fontSize || 14) * scale,
                fontFamily: field.fontFamily || "Arial",
                color: field.fill || "#000",
                fontWeight: field.fontWeight || "normal",
                opacity: field.opacity ?? 1,
                cursor: field.locked ? "default" : "move",
                outline: isSelected ? `2px solid ${outlineColor}` : "none",
                outlineOffset: "2px",
                padding: `${2 * scale}px`,
                whiteSpace: hasBox ? "normal" : "nowrap",
                wordBreak: hasBox ? "break-word" : undefined,
                overflow: hasBox ? "hidden" : undefined,
                userSelect: "none",
                transform: rotStyle,
                transformOrigin: "center center",
                lineHeight: 1.3,
              }}
            >
              {field.text}
              {isSelected && !field.locked && (
                <>
                  {/* Right edge */}
                  <div onMouseDown={(e) => handleResizeStart(e, field, "e")}
                    style={{ position: "absolute", right: -4, top: "50%", marginTop: -5, width: 8, height: 10, background: outlineColor, borderRadius: 2, cursor: "e-resize" }} />
                  {/* Bottom edge */}
                  <div onMouseDown={(e) => handleResizeStart(e, field, "s")}
                    style={{ position: "absolute", bottom: -4, left: "50%", marginLeft: -5, width: 10, height: 8, background: outlineColor, borderRadius: 2, cursor: "s-resize" }} />
                  {/* Bottom-right corner */}
                  <div onMouseDown={(e) => handleResizeStart(e, field, "se")}
                    style={{ position: "absolute", right: -5, bottom: -5, width: 10, height: 10, background: outlineColor, borderRadius: 2, cursor: "se-resize" }} />
                  {/* Left edge */}
                  <div onMouseDown={(e) => handleResizeStart(e, field, "w")}
                    style={{ position: "absolute", left: -4, top: "50%", marginTop: -5, width: 8, height: 10, background: outlineColor, borderRadius: 2, cursor: "w-resize" }} />
                  {/* Top edge */}
                  <div onMouseDown={(e) => handleResizeStart(e, field, "n")}
                    style={{ position: "absolute", top: -4, left: "50%", marginLeft: -5, width: 10, height: 8, background: outlineColor, borderRadius: 2, cursor: "n-resize" }} />
                </>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const hexToRgb = (hex: string) => {
    const clean = hex.replace("#", "")
    return { r: parseInt(clean.slice(0, 2), 16) / 255, g: parseInt(clean.slice(2, 4), 16) / 255, b: parseInt(clean.slice(4, 6), 16) / 255 }
  }

  const drawLabelOnPage = async (page: any, pdfDoc: any, fields: LabelField[], templateWidth: number, templateHeight: number, labelLeft: number, labelTop: number, uniformScale: number, font: any, boldFont: any, rgb: any, QRCode: any, hexToRgbFn: (hex: string) => { r: number; g: number; b: number }) => {
    const sortedFields = [...fields].sort((a, b) => (a.layerOrder || 0) - (b.layerOrder || 0)).filter(f => f.visible !== false)
    for (const field of sortedFields) {
      const fx = labelLeft + field.x * uniformScale
      const fy = labelTop - field.y * uniformScale
      if (field.type === "rect") {
        const c = hexToRgbFn(field.fill || "#1a3a7c")
        const rW = (field.width || 100) * uniformScale
        const rH = (field.height || 40) * uniformScale
        page.drawRectangle({ x: fx, y: fy - rH, width: rW, height: rH, color: rgb(c.r, c.g, c.b), opacity: field.opacity ?? 1 })
      } else if (field.type === "text") {
        const c = hexToRgbFn(field.fill || "#000000")
        const fontSize = Math.max(4, (field.fontSize || 14) * uniformScale)
        const useFont = field.fontWeight === "bold" ? boldFont : font
        const lines = (field.text || "").split("\n")
        try {
          if (field.rotation === 90 || field.rotation === -90) {
            const dir = field.rotation === 90 ? -1 : 1
            for (let li = 0; li < lines.length; li++) {
              page.drawText(lines[li], { x: fx, y: fy - fontSize - li * fontSize * 1.3 * dir, size: fontSize, font: useFont, color: rgb(c.r, c.g, c.b), opacity: field.opacity ?? 1, rotate: { type: "degrees" as const, angle: -field.rotation } })
            }
          } else {
            for (let li = 0; li < lines.length; li++) {
              page.drawText(lines[li], { x: fx, y: fy - fontSize - li * fontSize * 1.3, size: fontSize, font: useFont, color: rgb(c.r, c.g, c.b), opacity: field.opacity ?? 1 })
            }
          }
        } catch { /* skip unsupported chars */ }
      } else if (field.type === "qrcode") {
        try {
          const uidField = fields.find(f => f.id === "uid")
          const uid = uidField?.text?.replace("UID: ", "") || "PQ-XXXX-XXXX"
          const batchField = fields.find(f => f.id === "batch")
          const batch = batchField?.text?.replace("BATCH: ", "") || "000"
          const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
          const qrData = field.id === "qrcode-2" ? `${baseUrl}/verify?batch=${batch}&code=${uid}` : `${baseUrl}/verify?code=${uid}`
          const darkColor = field.id === "qrcode-2" ? "#333333" : "#1a3a7c"
          const qrImg = await QRCode.toDataURL(qrData, { width: 300, margin: 1, color: { dark: darkColor, light: "#ffffff" } })
          const qrImageBytes = Uint8Array.from(atob(qrImg.split(",")[1]), (c: string) => c.charCodeAt(0))
          const qrImage = await pdfDoc.embedPng(qrImageBytes)
          const qrW = (field.width || 150) * uniformScale
          const qrH = (field.height || 150) * uniformScale
          page.drawImage(qrImage, { x: fx, y: fy - qrH, width: qrW, height: qrH })
        } catch { /* QR failed */ }
      }
    }
  }

  const exportEditorPDF = async () => {
    const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib")
    const QRCode = (await import("qrcode")).default
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const aspect = currentTemplate.width / currentTemplate.height
    const pageWidth = 595
    const pageHeight = 842
    const margin = 30
    const availW = pageWidth - margin * 2
    const availH = pageHeight - margin * 2
    let labelWidth: number, labelHeight: number
    if (availW / aspect <= availH) {
      labelWidth = availW
      labelHeight = availW / aspect
    } else {
      labelHeight = availH
      labelWidth = availH * aspect
    }
    const uniformScale = labelWidth / currentTemplate.width
    const labelLeft = margin + (availW - labelWidth) / 2
    const labelTop = pageHeight - margin

    const page = pdfDoc.addPage([pageWidth, pageHeight])
    const bgC = hexToRgb(currentTemplate.bgColor || "#f8f8f8")
    page.drawRectangle({ x: labelLeft, y: labelTop - labelHeight, width: labelWidth, height: labelHeight,
      color: rgb(bgC.r, bgC.g, bgC.b), borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 0.5 })

    await drawLabelOnPage(page, pdfDoc, currentTemplate.fields, currentTemplate.width, currentTemplate.height, labelLeft, labelTop, uniformScale, font, boldFont, rgb, QRCode, hexToRgb)

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const pName = editingProduct?.name || "etiqueta"
    a.download = `${pName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = async () => {
    const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib")
    const QRCode = (await import("qrcode")).default

    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const labelsData = labels.filter(l => l.product)

    for (let i = 0; i < labelsData.length; i += 4) {
      const page = pdfDoc.addPage([595, 842])
      const batch = labelsData.slice(i, i + 4)

      for (let j = 0; j < batch.length; j++) {
        const label = batch[j]
        const data = typeof label.data === "string" ? JSON.parse(label.data) : label.data
        const x = 50 + (j % 2) * 260
        const y = 750 - Math.floor(j / 2) * 380

        page.drawRectangle({ x, y: y - 340, width: 240, height: 340, color: rgb(0.96, 0.96, 0.97), borderColor: rgb(0.1, 0.23, 0.49), borderWidth: 1.5 })
        page.drawRectangle({ x, y: y - 20, width: 240, height: 20, color: rgb(0.1, 0.23, 0.49) })
        page.drawRectangle({ x, y: y - 340, width: 240, height: 20, color: rgb(0.1, 0.23, 0.49) })
        page.drawRectangle({ x, y: y - 318, width: 240, height: 6, color: rgb(0.96, 0.77, 0.09) })

        page.drawText("PharmaQo Labs", { x: x + 15, y: y - 50, size: 14, font: boldFont, color: rgb(0.1, 0.23, 0.49) })
        page.drawText(data.name || label.product.name, { x: x + 15, y: y - 75, size: 12, font: boldFont, color: rgb(0.1, 0.1, 0.15) })

        if (data.dosage) page.drawText(`Dosage: ${data.dosage}`, { x: x + 15, y: y - 100, size: 9, font, color: rgb(0.3, 0.3, 0.4) })
        if (data.lot) page.drawText(`Lot: ${data.lot}`, { x: x + 15, y: y - 120, size: 8, font, color: rgb(0.4, 0.4, 0.5) })
        if (data.expiry) page.drawText(`Exp: ${data.expiry}`, { x: x + 15, y: y - 138, size: 8, font, color: rgb(0.4, 0.4, 0.5) })
        if (data.composition) {
          const comp = data.composition.length > 35 ? data.composition.slice(0, 35) + "..." : data.composition
          page.drawText(`Comp: ${comp}`, { x: x + 15, y: y - 156, size: 7, font, color: rgb(0.4, 0.4, 0.5) })
        }

        const uid = data.uid || label.product.uid
        page.drawText(`UID: ${uid.slice(0, 20)}`, { x: x + 15, y: y - 260, size: 7, font: boldFont, color: rgb(0.1, 0.23, 0.49) })

        try {
          const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/verify?code=${uid}`
          const qrPngUrl = await QRCode.toDataURL(verifyUrl, { width: 100, margin: 1, color: { dark: "#1a3a7c", light: "#ffffff" } })
          const qrImageBytes = Uint8Array.from(atob(qrPngUrl.split(",")[1]), c => c.charCodeAt(0))
          const qrImage = await pdfDoc.embedPng(qrImageBytes)
          page.drawImage(qrImage, { x: x + 140, y: y - 250, width: 80, height: 80 })
        } catch { /* QR generation failed */ }

        page.drawText("Scan to verify", { x: x + 15, y: y - 280, size: 6, font, color: rgb(0.5, 0.5, 0.6) })
        page.drawText("authenticity", { x: x + 15, y: y - 290, size: 6, font, color: rgb(0.5, 0.5, 0.6) })
      }
    }

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `etiquetas-pharmaqo-${Date.now()}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const massExportPDF = async () => {
    setMassExporting(true)
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib")
      const QRCode = (await import("qrcode")).default
      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      const aspect = currentTemplate.width / currentTemplate.height
      const pageWidth = 595
      const pageHeight = 842
      const margin = 20
      const availW = pageWidth - margin * 2
      const availH = pageHeight - margin * 2
      let labelWidth: number, labelHeight: number
      if (availW / aspect <= availH) { labelWidth = availW; labelHeight = availW / aspect }
      else { labelHeight = availH; labelWidth = availH * aspect }
      const uniformScale = labelWidth / currentTemplate.width

      const codesToExport = generatedCodes.length > 0 ? generatedCodes : [currentTemplate.fields.find(f => f.id === "uid")?.text?.replace("UID: ", "") || "PHQ-PROD-00000000"]

      for (const code of codesToExport) {
        const page = pdfDoc.addPage([pageWidth, pageHeight])
        const labelLeft = margin + (availW - labelWidth) / 2
        const labelTop = pageHeight - margin
        const bgC = hexToRgb(currentTemplate.bgColor || "#f8f8f8")
        page.drawRectangle({ x: labelLeft, y: labelTop - labelHeight, width: labelWidth, height: labelHeight, color: rgb(bgC.r, bgC.g, bgC.b), borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 0.5 })

        const fieldsWithCode = currentTemplate.fields.map(f => {
          if (f.id === "uid") return { ...f, text: `UID: ${code}` }
          if (f.id === "auth-code") return { ...f, text: `Auth: ${code}` }
          return f
        })
        await drawLabelOnPage(page, pdfDoc, fieldsWithCode, currentTemplate.width, currentTemplate.height, labelLeft, labelTop, uniformScale, font, boldFont, rgb, QRCode, hexToRgb)
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `etiquetas-massa-pharmaqo-${Date.now()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Mass export error:", err)
    }
    setMassExporting(false)
  }

  const massExportZIP = async () => {
    setMassExporting(true)
    try {
      const JSZip = (await import("jszip")).default
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib")
      const QRCode = (await import("qrcode")).default
      const zip = new JSZip()

      const aspect = currentTemplate.width / currentTemplate.height
      const pageWidth = 595
      const pageHeight = 842
      const margin = 20
      const availW = pageWidth - margin * 2
      const availH = pageHeight - margin * 2
      let labelWidth: number, labelHeight: number
      if (availW / aspect <= availH) { labelWidth = availW; labelHeight = availW / aspect }
      else { labelHeight = availH; labelWidth = availH * aspect }
      const uniformScale = labelWidth / currentTemplate.width

      const codesToExport = generatedCodes.length > 0 ? generatedCodes : [currentTemplate.fields.find(f => f.id === "uid")?.text?.replace("UID: ", "") || "PHQ-PROD-00000000"]

      for (let idx = 0; idx < codesToExport.length; idx++) {
        const code = codesToExport[idx]
        const pdfDoc = await PDFDocument.create()
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        const page = pdfDoc.addPage([pageWidth, pageHeight])
        const labelLeft = margin + (availW - labelWidth) / 2
        const labelTop = pageHeight - margin
        const bgC = hexToRgb(currentTemplate.bgColor || "#f8f8f8")
        page.drawRectangle({ x: labelLeft, y: labelTop - labelHeight, width: labelWidth, height: labelHeight, color: rgb(bgC.r, bgC.g, bgC.b), borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 0.5 })

        const fieldsWithCode = currentTemplate.fields.map(f => {
          if (f.id === "uid") return { ...f, text: `UID: ${code}` }
          if (f.id === "auth-code") return { ...f, text: `Auth: ${code}` }
          return f
        })
        await drawLabelOnPage(page, pdfDoc, fieldsWithCode, currentTemplate.width, currentTemplate.height, labelLeft, labelTop, uniformScale, font, boldFont, rgb, QRCode, hexToRgb)

        const pdfBytes = await pdfDoc.save()
        zip.file(`etiqueta-${idx + 1}-${code}.pdf`, pdfBytes)
      }

      const content = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(content)
      const a = document.createElement("a")
      a.href = url
      a.download = `etiquetas-pharmaqo-${Date.now()}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("ZIP export error:", err)
    }
    setMassExporting(false)
  }

  if (showEditor) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { setShowEditor(false); setSelectedField(null) }} className="p-2 rounded-lg hover:bg-pharma-bg">
              <X className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold gradient-text">Editor de Etiquetas</h1>
            {editingProduct && <span className="text-sm text-pharma-text-muted">- {editingProduct.name}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowGrid(!showGrid)} className={`p-2 rounded-lg transition-colors ${showGrid ? "bg-pharma-purple text-white" : "hover:bg-pharma-bg text-pharma-text-muted"}`} title="Grid">
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-2 rounded-lg hover:bg-pharma-bg text-pharma-text-muted" title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-pharma-text-muted w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-2 rounded-lg hover:bg-pharma-bg text-pharma-text-muted" title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={() => setZoom(1)} className="p-2 rounded-lg hover:bg-pharma-bg text-pharma-text-muted" title="Reset">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={addNewTextField} className="btn-secondary text-sm flex items-center gap-1" title="Adicionar Texto">
              <Type className="w-4 h-4" /> Novo Texto
            </button>
            <button onClick={addNewColorStrip} className="btn-secondary text-sm flex items-center gap-1" title="Adicionar Faixa">
              <Palette className="w-4 h-4" /> Nova Faixa
            </button>
            <button onClick={generateAndApplyCode} className="btn-secondary text-sm flex items-center gap-1" title="Gerar código de autenticidade único">
              <Grid3X3 className="w-4 h-4" /> Gerar Código
            </button>
            <button onClick={() => setShowSaveDialog(true)} className="btn-secondary text-sm flex items-center gap-1">
              <Save className="w-4 h-4" /> Salvar Template
            </button>
            <button onClick={exportEditorPDF} className="btn-primary text-sm flex items-center gap-1">
              <Download className="w-4 h-4" /> Exportar PDF
            </button>
          </div>
        </div>

        <div className="flex gap-4" style={{ height: "calc(100vh - 180px)" }}>
          {/* Left Sidebar - Layers */}
          <div className="w-56 bg-pharma-card rounded-xl border border-pharma-border overflow-y-auto flex-shrink-0">
            <div className="p-3 border-b border-pharma-border flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Layers className="w-4 h-4" /> Camadas</h3>
              <div className="flex gap-1">
                <button onClick={addNewTextField} className="p-1 rounded hover:bg-pharma-purple/20 text-pharma-purple" title="Adicionar Texto">
                  <Type className="w-3 h-3" />
                </button>
                <button onClick={addNewColorStrip} className="p-1 rounded hover:bg-pharma-purple/20 text-pharma-purple" title="Adicionar Faixa">
                  <Palette className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="p-2 space-y-1">
              {[...currentTemplate.fields].sort((a, b) => (b.layerOrder || 0) - (a.layerOrder || 0)).map(field => {
                const isInMulti = selectedFields.some(sf => sf.id === field.id)
                return (
                <div
                  key={field.id}
                  onClick={(e) => {
                    if (e.shiftKey) {
                      setSelectedFields(prev => {
                        const exists = prev.find(f => f.id === field.id)
                        if (exists) return prev.filter(f => f.id !== field.id)
                        return [...prev, field]
                      })
                    } else {
                      setSelectedFields([field])
                    }
                    setSelectedField(field)
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                    isInMulti && selectedFields.length > 1 ? "bg-amber-500/20 text-amber-400" :
                    selectedField?.id === field.id ? "bg-pharma-purple/20 text-pharma-purple" : "hover:bg-pharma-bg text-pharma-text-muted"
                  }`}
                >
                  {field.locked ? <Lock className="w-3 h-3 flex-shrink-0" /> : <Unlock className="w-3 h-3 flex-shrink-0" />}
                  <span className="truncate flex-1">{field.id}</span>
                  <div className="flex items-center gap-0.5 ml-auto">
                    <button onClick={(e) => { e.stopPropagation(); moveLayerUp(field.id) }}
                      className="p-0.5 rounded hover:bg-pharma-purple/20 text-pharma-text-muted hover:text-pharma-purple" title="Subir camada">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); moveLayerDown(field.id) }}
                      className="p-0.5 rounded hover:bg-pharma-purple/20 text-pharma-text-muted hover:text-pharma-purple" title="Descer camada">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); updateField(field.id, { visible: !field.visible }) }}
                      className={`p-0.5 ${field.visible !== false ? "text-pharma-purple" : "text-pharma-text-muted/30"}`}>
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                )
              })}
            </div>

            {/* Saved Templates */}
            {templates.length > 0 && (
              <>
                <div className="p-3 border-t border-pharma-border">
                  <h3 className="font-semibold text-sm">Templates Salvos</h3>
                </div>
                <div className="p-2 space-y-1">
                  {templates.map(tpl => (
                    <div key={tpl.id} className="flex items-center gap-1">
                      <button onClick={() => loadTemplate(tpl)} className="flex-1 text-left px-2 py-1.5 rounded-lg text-xs hover:bg-pharma-bg text-pharma-text-muted truncate">
                        {tpl.name}
                      </button>
                      <button onClick={() => deleteTemplate(tpl.id)} className="p-1 text-red-400 hover:bg-red-500/10 rounded">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 bg-pharma-bg rounded-xl border border-pharma-border overflow-auto flex items-center justify-center p-8"
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onClick={() => { setSelectedField(null); setSelectedFields([]) }}
          >
            <div ref={canvasRef} className="shadow-2xl rounded-lg overflow-hidden border border-pharma-border" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
              {renderLabelPreview(currentTemplate, 1)}
            </div>
          </div>

          {/* Right Sidebar - Properties */}
          <div className="w-64 bg-pharma-card rounded-xl border border-pharma-border overflow-y-auto flex-shrink-0">
            <div className="p-3 border-b border-pharma-border">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Palette className="w-4 h-4" /> {selectedField ? "Propriedades" : "Cores do Template"}
              </h3>
            </div>
            <div className="p-3 space-y-3">
              {selectedField ? (
                <>
                  <div>
                    <label className="text-xs text-pharma-text-muted block mb-1">ID</label>
                    <p className="text-sm font-mono">{selectedField.id}</p>
                  </div>
                  {selectedField.type === "text" && (
                    <div>
                      <label className="text-xs text-pharma-text-muted block mb-1">Texto</label>
                      <textarea value={selectedField.text || ""} onChange={e => updateField(selectedField.id, { text: e.target.value })}
                        rows={2} className="input-field text-sm resize-none" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-pharma-text-muted block mb-1">X</label>
                      <input type="number" value={Math.round(selectedField.x)} onChange={e => updateField(selectedField.id, { x: parseInt(e.target.value) || 0 })}
                        className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-pharma-text-muted block mb-1">Y</label>
                      <input type="number" value={Math.round(selectedField.y)} onChange={e => updateField(selectedField.id, { y: parseInt(e.target.value) || 0 })}
                        className="input-field text-sm" />
                    </div>
                  </div>
                  {(selectedField.type === "rect" || selectedField.type === "qrcode" || selectedField.type === "text") && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-pharma-text-muted block mb-1">Largura</label>
                          <input type="number" value={selectedField.width || ""} placeholder="Auto"
                            onChange={e => updateField(selectedField.id, { width: parseInt(e.target.value) || 0 })}
                            className="input-field text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-pharma-text-muted block mb-1">Altura</label>
                          <input type="number" value={selectedField.height || ""} placeholder="Auto"
                            onChange={e => updateField(selectedField.id, { height: parseInt(e.target.value) || 0 })}
                            className="input-field text-sm" />
                        </div>
                      </div>
                      {selectedField.type === "text" && (
                        <p className="text-xs text-pharma-text-muted -mt-1">Defina largura para quebrar texto. Arraste as alças na tela.</p>
                      )}
                      {selectedField.type === "rect" && (
                        <div>
                          <label className="text-xs text-pharma-text-muted block mb-1">Tipo de Faixa</label>
                          <div className="grid grid-cols-4 gap-1">
                            {["#1a3a7c", "#f5c518", "#8b5cf6", "#dc2626", "#059669", "#d97706", "#ec4899", "#000000"].map(c => (
                              <button key={c} onClick={() => updateField(selectedField.id, { fill: c })}
                                className={`w-full h-6 rounded border-2 transition-all ${selectedField.fill === c ? "border-white scale-110" : "border-transparent"}`}
                                style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {selectedField.type === "text" && (
                    <>
                      <div>
                        <label className="text-xs text-pharma-text-muted block mb-1">Tamanho Fonte</label>
                        <input type="number" value={selectedField.fontSize || 14} onChange={e => updateField(selectedField.id, { fontSize: parseInt(e.target.value) || 14 })}
                          className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-pharma-text-muted block mb-1">Fonte</label>
                        <select value={selectedField.fontFamily || "Arial"} onChange={e => updateField(selectedField.id, { fontFamily: e.target.value })}
                          className="input-field text-sm">
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-pharma-text-muted block mb-1">Peso</label>
                        <select value={selectedField.fontWeight || "normal"} onChange={e => updateField(selectedField.id, { fontWeight: e.target.value })}
                          className="input-field text-sm">
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="text-xs text-pharma-text-muted block mb-1">Cor</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={selectedField.fill || "#000000"} onChange={e => updateField(selectedField.id, { fill: e.target.value })}
                        className="w-8 h-8 rounded border border-pharma-border cursor-pointer" />
                      <input type="text" value={selectedField.fill || "#000000"} onChange={e => updateField(selectedField.id, { fill: e.target.value })}
                        className="input-field text-sm flex-1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-pharma-text-muted block mb-1">Rotação: {selectedField.rotation || 0}°</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="-180" max="180" value={selectedField.rotation || 0}
                        onChange={e => updateField(selectedField.id, { rotation: parseInt(e.target.value) })}
                        className="flex-1 accent-pharma-purple" />
                      <input type="number" min="-360" max="360" value={selectedField.rotation || 0}
                        onChange={e => updateField(selectedField.id, { rotation: parseInt(e.target.value) || 0 })}
                        className="input-field text-sm w-16" />
                      <button onClick={() => updateField(selectedField.id, { rotation: 0 })}
                        className="p-1 rounded hover:bg-pharma-bg text-pharma-text-muted" title="Reset rotação">
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-pharma-text-muted block mb-1">Opacidade: {Math.round((selectedField.opacity ?? 1) * 100)}%</label>
                    <input type="range" min="0" max="100" value={Math.round((selectedField.opacity ?? 1) * 100)}
                      onChange={e => updateField(selectedField.id, { opacity: parseInt(e.target.value) / 100 })}
                      className="w-full accent-pharma-purple" />
                  </div>
                  <div>
                    <label className="text-xs text-pharma-text-muted block mb-1">Camada</label>
                    <div className="flex gap-1">
                      <button onClick={() => moveToBack(selectedField.id)}
                        className="flex-1 text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 bg-pharma-bg text-pharma-text-muted hover:text-white" title="Enviar para trás">
                        <ChevronsDown className="w-3 h-3" /> Trás
                      </button>
                      <button onClick={() => moveLayerDown(selectedField.id)}
                        className="flex-1 text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 bg-pharma-bg text-pharma-text-muted hover:text-white" title="Descer camada">
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <button onClick={() => moveLayerUp(selectedField.id)}
                        className="flex-1 text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 bg-pharma-bg text-pharma-text-muted hover:text-white" title="Subir camada">
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button onClick={() => moveToFront(selectedField.id)}
                        className="flex-1 text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 bg-pharma-bg text-pharma-text-muted hover:text-white" title="Trazer para frente">
                        <ChevronsUp className="w-3 h-3" /> Frente
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateField(selectedField.id, { locked: !selectedField.locked })}
                      className={`flex-1 text-xs py-2 rounded-lg flex items-center justify-center gap-1 ${selectedField.locked ? "bg-red-500/20 text-red-400" : "bg-pharma-bg text-pharma-text-muted hover:text-white"}`}>
                      {selectedField.locked ? <><Lock className="w-3 h-3" /> Locked</> : <><Unlock className="w-3 h-3" /> Unlocked</>}
                    </button>
                  </div>
                  {selectedFields.length > 1 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                      <p className="text-xs text-amber-400 font-semibold mb-1">{selectedFields.length} elementos selecionados</p>
                      <p className="text-xs text-pharma-text-muted">Shift+click para adicionar/remover</p>
                    </div>
                  )}
                  {!['bg-strip-top', 'bg-strip-bottom', 'bg-strip-accent', 'logo', 'qrcode'].includes(selectedField.id) && (
                    <button onClick={() => deleteField(selectedField.id)}
                      className="w-full text-xs py-2 rounded-lg flex items-center justify-center gap-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                      <Trash2 className="w-3 h-3" /> Remover Elemento
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs text-pharma-text-muted block mb-1">Cor de Fundo</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={currentTemplate.bgColor || "#f8f8f8"} onChange={e => setCurrentTemplate(p => ({ ...p, bgColor: e.target.value }))}
                        className="w-8 h-8 rounded border border-pharma-border cursor-pointer" />
                      <input type="text" value={currentTemplate.bgColor || "#f8f8f8"} onChange={e => setCurrentTemplate(p => ({ ...p, bgColor: e.target.value }))}
                        className="input-field text-sm flex-1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-pharma-text-muted block mb-1">Faixa Principal</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={currentTemplate.stripColor1 || "#1a3a7c"} onChange={e => {
                        const color = e.target.value
                        setCurrentTemplate(p => ({
                          ...p,
                          stripColor1: color,
                          fields: p.fields.map(f =>
                            (f.id === "bg-strip-top" || f.id === "bg-strip-bottom") ? { ...f, fill: color } : f
                          ),
                        }))
                      }}
                        className="w-8 h-8 rounded border border-pharma-border cursor-pointer" />
                      <span className="text-xs text-pharma-text-muted">{currentTemplate.stripColor1}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-pharma-text-muted block mb-1">Faixa Accent</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={currentTemplate.stripColor2 || "#f5c518"} onChange={e => {
                        const color = e.target.value
                        setCurrentTemplate(p => ({
                          ...p,
                          stripColor2: color,
                          fields: p.fields.map(f =>
                            f.id === "bg-strip-accent" ? { ...f, fill: color } : f
                          ),
                        }))
                      }}
                        className="w-8 h-8 rounded border border-pharma-border cursor-pointer" />
                      <span className="text-xs text-pharma-text-muted">{currentTemplate.stripColor2}</span>
                    </div>
                  </div>
                  <div className="border-t border-pharma-border pt-3">
                    <label className="text-xs text-pharma-text-muted block mb-2">Códigos de Autenticidade</label>
                    <div className="space-y-2">
                      <button onClick={generateAndApplyCode} className="w-full btn-secondary text-xs flex items-center justify-center gap-1">
                        <Grid3X3 className="w-3 h-3" /> Gerar 1 Código
                      </button>
                      <button onClick={() => { generateBulkCodes(codeCount); }} className="w-full btn-primary text-xs flex items-center justify-center gap-1">
                        <Download className="w-3 h-3" /> Gerar {codeCount} Códigos em Massa
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-pharma-border pt-3">
                    <p className="text-xs text-pharma-text-muted mb-2">Selecione um elemento na tela para editar suas propriedades.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Save Template Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="card max-w-sm w-full">
              <h2 className="text-lg font-bold mb-4">Salvar Template</h2>
              <input type="text" value={templateName} onChange={e => setTemplateName(e.target.value)}
                placeholder="Nome do template..." className="input-field mb-4" />
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowSaveDialog(false)} className="btn-secondary">Cancelar</button>
                <button onClick={saveTemplate} className="btn-primary">Salvar</button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Codes Panel */}
        {showCodesPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="card max-w-lg w-full max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Códigos de Autenticidade</h2>
                <button onClick={() => setShowCodesPanel(false)} className="p-1 rounded hover:bg-pharma-bg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-xs text-pharma-text-muted">Quantidade:</label>
                <input type="number" min="1" max="1000" value={codeCount} onChange={e => setCodeCount(parseInt(e.target.value) || 10)}
                  className="input-field text-sm w-20" />
                <button onClick={() => generateBulkCodes(codeCount)} className="btn-primary text-sm">
                  Gerar {codeCount} Códigos
                </button>
                {generatedCodes.length > 0 && (
                  <button onClick={exportCodesToCSV} className="btn-secondary text-sm flex items-center gap-1">
                    <Download className="w-3 h-3" /> CSV
                  </button>
                )}
              </div>
              {generatedCodes.length > 0 && (
                <p className="text-xs text-pharma-text-muted mb-2">{generatedCodes.length} códigos gerados. Clique para copiar.</p>
              )}
              <div className="overflow-y-auto flex-1 border border-pharma-border rounded-lg">
                {generatedCodes.map((code, i) => (
                  <div key={i} onClick={() => copyCodeToClipboard(code)}
                    className="flex items-center justify-between px-3 py-1.5 text-xs font-mono hover:bg-pharma-purple/10 cursor-pointer border-b border-pharma-border/50 last:border-b-0">
                    <span>{i + 1}. {code}</span>
                    <button onClick={(e) => { e.stopPropagation(); updateField("uid", { text: `UID: ${code}` }); updateField("auth-code", { text: `Auth: ${code}` }) }}
                      className="text-pharma-purple hover:underline text-xs">
                      Aplicar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold gradient-text">Etiquetas</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setEditingProduct(null); setShowEditor(true) }} className="btn-secondary flex items-center gap-2 text-sm">
            <Palette className="w-4 h-4" /> Editor Visual
          </button>
          <button onClick={() => setShowGenerator(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Gerar Etiquetas
          </button>
          {labels.length > 0 && (
            <button onClick={exportPDF} className="btn-secondary flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" /> Exportar PDF
            </button>
          )}
          <button onClick={massExportPDF} disabled={massExporting} className="btn-secondary flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4" /> {massExporting ? "Exportando..." : "PDF em Massa"}
          </button>
          <button onClick={massExportZIP} disabled={massExporting} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> {massExporting ? "Exportando..." : "ZIP em Massa"}
          </button>
        </div>
      </div>

      {/* Quick Edit - Click product to open in editor */}
      <div className="card">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-pharma-purple" /> Editar Etiqueta por Produto</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {products.map(p => (
            <button key={p.id} onClick={() => openEditorForProduct(p)}
              className="text-left p-3 rounded-xl bg-pharma-bg hover:bg-pharma-purple/10 transition-colors border border-pharma-border hover:border-pharma-purple/30">
              <p className="font-semibold text-sm truncate">{p.name}</p>
              <p className="text-xs text-pharma-text-muted mt-1">{p.dosage || "Sem dosagem"}</p>
              <p className="text-xs text-pharma-purple font-mono mt-1">UID: {p.uid?.slice(0, 12)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Existing Labels */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {labels.map(label => {
          const data = typeof label.data === "string" ? JSON.parse(label.data) : label.data
          return (
            <div key={label.id} className="card glow-border overflow-hidden cursor-pointer hover:border-pharma-purple/50 transition-colors"
              onClick={() => label.product && openEditorForProduct(label.product)}>
              <div className="bg-gradient-to-br from-[#1a3a7c]/10 to-pharma-bg p-4">
                <p className="text-xs text-[#1a3a7c] font-bold mb-1">PharmaQo Labs</p>
                <p className="font-semibold text-sm mb-2">{data.name || label.product?.name}</p>
                {data.dosage && <p className="text-xs text-pharma-text-muted">Dosagem: {data.dosage}</p>}
                {data.lot && <p className="text-xs text-pharma-text-muted">Lote: {data.lot}</p>}
                {data.expiry && <p className="text-xs text-pharma-text-muted">Validade: {data.expiry}</p>}
                <p className="text-xs text-[#1a3a7c] font-mono mt-2">UID: {(data.uid || label.product?.uid || "").slice(0, 16)}</p>
              </div>
            </div>
          )
        })}
        {labels.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 text-pharma-text-muted">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma etiqueta gerada ainda</p>
          </div>
        )}
      </div>

      {/* Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Gerar Etiquetas</h2>
              <button onClick={() => setShowGenerator(false)} className="p-2 rounded-lg hover:bg-pharma-bg"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-pharma-text-muted mb-4">Selecione os produtos para gerar etiquetas:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {products.map(p => (
                <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  selectedProducts.includes(p.id) ? "bg-pharma-purple/10 border border-pharma-purple/30" : "bg-pharma-bg hover:bg-pharma-bg/80"
                }`}>
                  <input type="checkbox" checked={selectedProducts.includes(p.id)}
                    onChange={() => toggleProduct(p.id)}
                    className="w-4 h-4 rounded border-pharma-border text-pharma-purple focus:ring-pharma-purple" />
                  <div>
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-xs text-pharma-text-muted">UID: {p.uid?.slice(0, 16)}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowGenerator(false)} className="btn-secondary">Cancelar</button>
              <button onClick={generateLabels} disabled={selectedProducts.length === 0 || generating}
                className="btn-primary flex items-center gap-2">
                {generating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Printer className="w-4 h-4" />}
                Gerar ({selectedProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
