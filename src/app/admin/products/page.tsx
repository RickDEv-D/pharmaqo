'use client'
import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { formatCurrency } from '@/lib/utils'
import { Plus, Edit, Trash2, Search, Package, X } from 'lucide-react'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    name: '', description: '', price: '', comparePrice: '', stock: '', categoryId: '',
    composition: '', benefits: '', dosage: '', tags: '', featured: false, lot: '', expiry: '',
    images: [''],
  })

  const token = Cookies.get('token')
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const loadProducts = () => {
    fetch('/api/products?limit=100', { headers })
      .then(r => r.json())
      .then(d => {
        setProducts(d.products || [])
        const cats = Array.from(new Map((d.products || []).map((p: any) => [p.category.id, p.category])).values())
        setCategories(cats as any[])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadProducts() }, [])

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', comparePrice: '', stock: '', categoryId: '',
      composition: '', benefits: '', dosage: '', tags: '', featured: false, lot: '', expiry: '', images: [''] })
    setEditProduct(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products'
    const method = editProduct ? 'PUT' : 'POST'

    await fetch(url, { method, headers, body: JSON.stringify({
      ...form,
      images: form.images.filter(Boolean),
    })})
    setShowModal(false)
    resetForm()
    loadProducts()
  }

  const handleEdit = (product: any) => {
    setEditProduct(product)
    setForm({
      name: product.name, description: product.description, price: String(product.price),
      comparePrice: product.comparePrice ? String(product.comparePrice) : '',
      stock: String(product.stock), categoryId: product.categoryId,
      composition: product.composition || '', benefits: product.benefits || '',
      dosage: product.dosage || '', tags: product.tags || '', featured: product.featured,
      lot: product.lot || '', expiry: product.expiry || '',
      images: product.images?.map((i: any) => i.url) || [''],
    })
    setShowModal(true)
  }

  const handleDelete = async (product: any) => {
    if (!confirm(`Excluir ${product.name}?`)) return
    await fetch(`/api/products/${product.id}`, { method: 'DELETE', headers })
    loadProducts()
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold gradient-text">Produtos</h1>
        <button onClick={() => { resetForm(); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pharma-text-muted" />
        <input type="text" placeholder="Buscar produtos..." value={search}
          onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pharma-border">
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Produto</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Categoria</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Preço</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Estoque</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Tags</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">UID</th>
                <th className="text-right py-3 px-4 text-sm text-pharma-text-muted font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product.id} className="border-b border-pharma-border/50 hover:bg-pharma-bg/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-pharma-bg overflow-hidden flex-shrink-0">
                        {product.images[0] ? (
                          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${product.images[0].url})` }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-pharma-text-muted" /></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{product.name}</p>
                        {product.featured && <span className="badge badge-lancamento">Destaque</span>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-pharma-text-muted">{product.category?.name}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-pharma-purple">{formatCurrency(product.price)}</td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-pharma-success' : 'text-pharma-danger'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {product.tags?.split(',').filter(Boolean).map((tag: string) => (
                        <span key={tag} className="badge bg-pharma-purple/20 text-pharma-purple text-xs">{tag.trim()}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-pharma-text-muted">{product.uid?.slice(0, 12)}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(product)} className="p-2 rounded-lg hover:bg-pharma-purple/10 text-pharma-purple">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product)} className="p-2 rounded-lg hover:bg-pharma-danger/10 text-pharma-danger">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => { setShowModal(false); resetForm() }} className="p-2 rounded-lg hover:bg-pharma-bg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm text-pharma-text-muted mb-1 block">Nome</label>
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="input-field" required />
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-pharma-text-muted mb-1 block">Descrição</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="input-field min-h-[80px]" required />
                </div>
                <div>
                  <label className="text-sm text-pharma-text-muted mb-1 block">Preço</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    className="input-field" required />
                </div>
                <div>
                  <label className="text-sm text-pharma-text-muted mb-1 block">Preço Comparação</label>
                  <input type="number" step="0.01" value={form.comparePrice} onChange={e => setForm(p => ({ ...p, comparePrice: e.target.value }))}
                    className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-pharma-text-muted mb-1 block">Estoque</label>
                  <input type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                    className="input-field" required />
                </div>
                <div>
                  <label className="text-sm text-pharma-text-muted mb-1 block">Categoria</label>
                  <select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
                    className="input-field" required>
                    <option value="">Selecione...</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-pharma-text-muted mb-1 block">Dosagem</label>
                  <input type="text" value={form.dosage} onChange={e => setForm(p => ({ ...p, dosage: e.target.value }))}
                    className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-pharma-text-muted mb-1 block">Lote</label>
                  <input type="text" value={form.lot} onChange={e => setForm(p => ({ ...p, lot: e.target.value }))}
                    className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-pharma-text-muted mb-1 block">Validade</label>
                  <input type="text" value={form.expiry} onChange={e => setForm(p => ({ ...p, expiry: e.target.value }))}
                    className="input-field" placeholder="MM/YYYY" />
                </div>
                <div>
                  <label className="text-sm text-pharma-text-muted mb-1 block">Tags (separar por vírgula)</label>
                  <input type="text" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                    className="input-field" placeholder="NOVO,MAIS VENDIDO" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-pharma-text-muted mb-1 block">Composição</label>
                  <textarea value={form.composition} onChange={e => setForm(p => ({ ...p, composition: e.target.value }))}
                    className="input-field min-h-[60px]" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-pharma-text-muted mb-1 block">Benefícios</label>
                  <textarea value={form.benefits} onChange={e => setForm(p => ({ ...p, benefits: e.target.value }))}
                    className="input-field min-h-[60px]" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-pharma-text-muted mb-1 block">URLs das Imagens</label>
                  {form.images.map((img, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input type="url" value={img} onChange={e => {
                        const newImages = [...form.images]
                        newImages[i] = e.target.value
                        setForm(p => ({ ...p, images: newImages }))
                      }} className="input-field" placeholder="https://..." />
                    </div>
                  ))}
                  <button type="button" onClick={() => setForm(p => ({ ...p, images: [...p.images, ''] }))}
                    className="text-pharma-purple text-sm hover:underline">+ Adicionar imagem</button>
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.featured}
                      onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))}
                      className="w-4 h-4 rounded border-pharma-border bg-pharma-bg text-pharma-purple focus:ring-pharma-purple" />
                    <span className="text-sm">Produto em destaque</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-pharma-border">
                <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">{editProduct ? 'Salvar' : 'Criar Produto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
