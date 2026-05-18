'use client'
import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { Image, Plus, X } from 'lucide-react'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '' })

  const token = Cookies.get('token')
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    fetch('/api/banners', { headers })
      .then(r => r.json())
      .then(d => { setBanners(d.banners || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const createBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/banners', { method: 'POST', headers, body: JSON.stringify(form) })
    const data = await fetch('/api/banners', { headers }).then(r => r.json())
    setBanners(data.banners || [])
    setShowModal(false)
    setForm({ title: '', subtitle: '', image: '', link: '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold gradient-text">Banners & Sliders</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Banner
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {banners.map(banner => (
          <div key={banner.id} className="card-hover overflow-hidden">
            <div className="aspect-video bg-pharma-bg rounded-xl overflow-hidden mb-3">
              {banner.image ? (
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${banner.image})` }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Image className="w-8 h-8 text-pharma-text-muted" /></div>
              )}
            </div>
            <h3 className="font-semibold">{banner.title}</h3>
            {banner.subtitle && <p className="text-sm text-pharma-text-muted">{banner.subtitle}</p>}
          </div>
        ))}
        {banners.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 text-pharma-text-muted">
            <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum banner criado</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Novo Banner</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-pharma-bg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createBanner} className="space-y-4">
              <div>
                <label className="text-sm text-pharma-text-muted mb-1 block">Título</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="input-field" required />
              </div>
              <div>
                <label className="text-sm text-pharma-text-muted mb-1 block">Subtítulo</label>
                <input type="text" value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))}
                  className="input-field" />
              </div>
              <div>
                <label className="text-sm text-pharma-text-muted mb-1 block">URL da Imagem</label>
                <input type="url" value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                  className="input-field" required />
              </div>
              <div>
                <label className="text-sm text-pharma-text-muted mb-1 block">Link (opcional)</label>
                <input type="url" value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
                  className="input-field" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Criar Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
