import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { CreatePurchaseDTO, Purchase } from '../types/purchase';
import { ProductModel } from './product.model';

export class PurchaseModel {
  static async findAll(): Promise<Purchase[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM purchases');
    return rows as Purchase[];
  }

  static async findById(id: number): Promise<Purchase | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM purchases WHERE id = ?', [id]);
    return rows[0] as Purchase || null;
  }

  static async findByUserId(userId: number): Promise<Purchase[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM purchases WHERE user_id = ?', [userId]);
    return rows as Purchase[];
  }

  static async create(purchase: CreatePurchaseDTO): Promise<Purchase> {
    const { user_id, product_id, quantity } = purchase;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const product = await ProductModel.findById(product_id);
      if (!product) {
        throw new Error('Product not found');
      }

      if (product.stock < quantity) {
        throw new Error('Insufficient stock');
      }

      const total_price = product.price * quantity;

      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO purchases (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)',
        [user_id, product_id, quantity, total_price]
      );

      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [quantity, product_id]
      );

      await connection.commit();

      const purchaseId = result.insertId;
      return this.findById(purchaseId) as Promise<Purchase>;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

