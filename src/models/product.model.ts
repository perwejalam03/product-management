import { RowDataPacket, ResultSetHeader } from 'mysql2'
import pool from '../config/database'
import { Product, CreateProductDTO, UpdateProductDTO } from '../types/product'

export class ProductModel {
  static async findAll(): Promise<Product[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products')
    return rows as Product[]
  }

  static async findById(id: number): Promise<Product | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id])
    return rows[0] as Product || null
  }

  static async create(product: CreateProductDTO): Promise<Product> {
    const { name, description, price, stock, categories } = product
    
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
        [name, description, price, stock]
      )

      const productId = result.insertId

      if (categories && categories.length > 0) {
        const values = categories.map(categoryId => [productId, categoryId])
        await connection.query(
          'INSERT INTO product_categories (product_id, category_id) VALUES ?',
          [values]
        )
      }

      await connection.commit()
      
      return this.findById(productId) as Promise<Product>
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  static async update(id: number, product: UpdateProductDTO): Promise<Product | null> {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      const updates: string[] = []
      const values: any[] = []

      if (product.name !== undefined) {
        updates.push('name = ?')
        values.push(product.name)
      }
      if (product.description !== undefined) {
        updates.push('description = ?')
        values.push(product.description)
      }
      if (product.price !== undefined) {
        updates.push('price = ?')
        values.push(product.price)
      }
      if (product.stock !== undefined) {
        updates.push('stock = ?')
        values.push(product.stock)
      }

      if (updates.length > 0) {
        values.push(id)
        await connection.query(
          `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
          values
        )
      }

      if (product.categories) {
        await connection.query(
          'DELETE FROM product_categories WHERE product_id = ?',
          [id]
        )

        if (product.categories.length > 0) {
          const values = product.categories.map(categoryId => [id, categoryId])
          await connection.query(
            'INSERT INTO product_categories (product_id, category_id) VALUES ?',
            [values]
          )
        }
      }

      await connection.commit()
      return this.findById(id)
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  static async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      await connection.query('DELETE FROM product_categories WHERE product_id = ?', [id])
      const [result] = await connection.query<ResultSetHeader>(
        'DELETE FROM products WHERE id = ?',
        [id]
      )

      await connection.commit()
      return result.affectedRows > 0
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }
}

