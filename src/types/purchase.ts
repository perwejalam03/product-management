export interface Purchase {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  purchase_date: Date;
}

export interface CreatePurchaseDTO {
  user_id: number;
  product_id: number;
  quantity: number;
}

