'use client'
import { useState, useEffect, useRef } from 'react'
import Cookies from 'js-cookie'
import { Tag, Plus, Download, FileText, X, Printer } from 'lucide-react'

export default function AdminLabelsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [labels, setLabels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerator, setShowGenerator] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const token = Cookies.get('token')
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    Promise.all([
      fetch('/api/products?limit=100', { headers }).then(r => r.json()),
      fetch('/api/labels', { headers }).then(r => r.json()),
    ]).then(([prodData, labelData]) => {
      setProducts(prodData.products || [])
      setLabels(labelData.labels || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const generateLabels = async () => {
    setGenerating(true)
    const selected = products.filter(p => selectedProducts.includes(p.id))

    for (const product of selected) {
      await fetch('/api/labels', {
        method: 'POST', headers,
        body: JSON.stringify({
          productId: product.id,
          data: {
            name: product.name,
            dosage: product.dosage,
            lot: product.lot,
            expiry: product.expiry,
            composition: product.composition,
            uid: product.uid,
          },
        }),
      })
    }

    const labelData = await fetch('/api/labels', { headers }).then(r => r.json())
    setLabels(labelData.labels || [])
    setShowGenerator(false)
    setSelectedProducts([])
    setGenerating(false)
  }

  const exportPDF = async () => {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')
    const QRCode = (await import('qrcode')).default

    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const labelsData = labels.filter(l => l.product)

    for (let i = 0; i < labelsData.length; i += 4) {
      const page = pdfDoc.addPage([595, 842]) // A4
      const batch = labelsData.slice(i, i + 4)

      for (let j = 0; j < batch.length; j++) {
        const label = batch[j]
        const data = typeof label.data === 'string' ? JSON.parse(label.data) : label.data
        const x = 50 + (j % 2) * 260
        const y = 750 - Math.floor(j / 2) * 380

        // Label background
        page.drawRectangle({ x, y: y - 340, width: 240, height: 340, color: rgb(0.05, 0.05, 0.08), borderColor: rgb(0.55, 0.36, 0.96), borderWidth: 1.5 })

        // Title
        page.drawText('PharmaQo Labs', { x: x + 20, y: y - 30, size: 14, font: boldFont, color: rgb(0.55, 0.36, 0.96) })
        page.drawText(data.name || label.product.name, { x: x + 20, y: y - 55, size: 11, font: boldFont, color: rgb(0.9, 0.9, 0.95) })

        if (data.dosage) page.drawText(`Dosagem: ${data.dosage}`, { x: x + 20, y: y - 80, size: 8, font, color: rgb(0.6, 0.6, 0.7) })
        if (data.lot) page.drawText(`Lote: ${data.lot}`, { x: x + 20, y: y - 100, size: 8, font, color: rgb(0.6, 0.6, 0.7) })
        if (data.expiry) page.drawText(`Validade: ${data.expiry}`, { x: x + 20, y: y - 120, size: 8, font, color: rgb(0.6, 0.6, 0.7) })
        if (data.composition) {
          const comp = data.composition.length > 40 ? data.composition.slice(0, 40) + '...' : data.composition
          page.drawText(`Comp: ${comp}`, { x: x + 20, y: y - 140, size: 7, font, color: rgb(0.5, 0.5, 0.6) })
        }

        // UID
        const uid = data.uid || label.product.uid
        page.drawText(`UID: ${uid}`, { x: x + 20, y: y - 170, size: 7, font, color: rgb(0.55, 0.36, 0.96) })

        // QR Code
        try {
          const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify?code=${uid}`
          const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 100, margin: 1, color: { dark: '#8b5cf6', light: '#0a0a0f' } })
          const qrImageBytes = Uint8Array.from(atob(qrDataUrl.split(',')[1]), c => c.charCodeAt(0))
          const qrImage = await pdfDoc.embedPng(qrImageBytes)
          page.drawImage(qrImage, { x: x + 130, y: y - 320, width: 90, height: 90 })
        } catch { /* QR generation failed */ }

        page.drawText('Escaneie para verificar', { x: x + 20, y: y - 320, size: 6, font, color: rgb(0.4, 0.4, 0.5) })
        page.drawText('autenticidade', { x: x + 20, y: y - 330, size: 6, font, color: rgb(0.4, 0.4, 0.5) })
      }
    }

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `etiquetas-pharmaqo-${Date.now()}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold gradient-text">Etiquetas</h1>
        <div className="flex gap-3">
          <button onClick={() => setShowGenerator(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Gerar Etiquetas
          </button>
          {labels.length > 0 && (
            <button onClick={exportPDF} className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" /> Exportar PDF
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {labels.map(label => {
          const data = typeof label.data === 'string' ? JSON.parse(label.data) : label.data
          return (
            <div key={label.id} className="card glow-border overflow-hidden">
              <div className="bg-gradient-to-br from-pharma-purple/10 to-pharma-bg p-4">
                <p className="text-xs text-pharma-purple font-bold mb-1">PharmaQo Labs</p>
                <p className="font-semibold text-sm mb-2">{data.name || label.product?.name}</p>
                {data.dosage && <p className="text-xs text-pharma-text-muted">Dosagem: {data.dosage}</p>}
                {data.lot && <p className="text-xs text-pharma-text-muted">Lote: {data.lot}</p>}
                {data.expiry && <p className="text-xs text-pharma-text-muted">Validade: {data.expiry}</p>}
                <p className="text-xs text-pharma-purple font-mono mt-2">UID: {(data.uid || label.product?.uid || '').slice(0, 16)}</p>
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
                  selectedProducts.includes(p.id) ? 'bg-pharma-purple/10 border border-pharma-purple/30' : 'bg-pharma-bg hover:bg-pharma-bg/80'
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

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
