export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  created_at: Date
  updated_at: Date
}

export interface CreateProductDTO {
  name: string
  description: string
  price: number
  stock: number
  categories?: number[]
}

export interface UpdateProductDTO {
  name?: string
  description?: string
  price?: number
  stock?: number
  categories?: number[]
}

