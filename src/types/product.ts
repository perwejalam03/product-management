export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_filename: string | null;
  created_at: Date;
  updated_at: Date;
  categories?: number[];
}

export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  stock: number;
  categories: number[];
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categories?: number[];
}

