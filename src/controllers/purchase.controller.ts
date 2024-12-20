import { Request, Response } from 'express';
import { PurchaseModel } from '../models/purchase.model';
import { CreatePurchaseDTO } from '../types/purchase';

export class PurchaseController {
  static async createPurchase(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const purchaseData: CreatePurchaseDTO = { ...req.body, user_id: userId };
      const purchase = await PurchaseModel.create(purchaseData);
      res.status(201).json(purchase);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create purchase' });
    }
  }

  static async getUserPurchases(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const purchases = await PurchaseModel.findByUserId(userId);
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user purchases' });
    }
  }
}

