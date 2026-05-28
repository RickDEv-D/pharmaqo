import Link from 'next/link'
import { Shield, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-pharma-card border-t border-pharma-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pharma-purple to-pharma-purple-dark flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">PharmaQo</span>
            </div>
            <p className="text-pharma-text-muted text-sm">
              Soluções farmacêuticas premium com tecnologia de autenticação anti-fraude avançada.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-pharma-purple">Links</h4>
            <div className="flex flex-col gap-2 text-sm text-pharma-text-muted">
              <Link href="/products" className="hover:text-pharma-purple transition-colors">Produtos</Link>
              <Link href="/verify" className="hover:text-pharma-purple transition-colors">Verificar Autenticidade</Link>
              <Link href="/chat" className="hover:text-pharma-purple transition-colors">Atendimento</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-pharma-purple">Suporte</h4>
            <div className="flex flex-col gap-2 text-sm text-pharma-text-muted">
              <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> suporte@pharmaqo.com</span>
              <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> (11) 9999-9999</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> São Paulo, BR</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-pharma-purple">Segurança</h4>
            <p className="text-sm text-pharma-text-muted">
              Todos os nossos produtos possuem QRCode único de autenticação anti-fraude.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-pharma-purple/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-pharma-purple" />
              </div>
              <span className="text-xs text-pharma-purple font-semibold">Produto Autenticado</span>
            </div>
          </div>
        </div>
        <div className="border-t border-pharma-border mt-8 pt-8 text-center text-sm text-pharma-text-muted">
          &copy; {new Date().getFullYear()} PharmaQo Labs. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
