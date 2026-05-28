export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: number
}

export interface UserData {
  id: string
  name: string
  email: string
  role: string
  phone?: string
}

export interface ProductData {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  stock: number
  categoryId: string
  composition?: string
  benefits?: string
  dosage?: string
  tags: string
  featured: boolean
  active: boolean
  uid: string
  lot?: string
  expiry?: string
  images: { id: string; url: string; isPrimary: boolean }[]
  category: { id: string; name: string; slug: string }
}

export interface ChatMessage {
  id: string
  chatRoomId: string
  senderId: string
  content: string
  type: string
  read: boolean
  createdAt: string
  sender: { name: string; role: string }
}

export interface FreightData {
  state: string
  price: number
  days: number
}
