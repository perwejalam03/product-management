import fs from 'fs/promises';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import path from 'path';
import pool from '../config/database';
import { CreateProductDTO, Product, UpdateProductDTO } from '../types/product';
import logger from '../utils/logger';

const C = "Product Model";

export class ProductModel {
  static async findAll(): Promise<Product[]> {
    const F = "findAll";
    logger.info(`[${C}], [${F}], Fetching all products`);
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT p.*, GROUP_CONCAT(pc.category_id) as categories
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      GROUP BY p.id
    `);
    return rows.map(row => ({
      ...row,
      categories: row.categories ? row.categories.split(',').map(Number) : []
    })) as Product[];
  }

  static async findById(id: number): Promise<Product | null> {
    const F = "findById";
    logger.info(`[${C}], [${F}], Fetching product with ID [${id}]`);
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT p.*, GROUP_CONCAT(pc.category_id) as categories
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);
    if (rows.length === 0) return null;
    const product = rows[0] as Product;
    product.categories = product.categories ? (product.categories as unknown as string).split(',').map(Number) : [];
    return product;
  }

  static async create(product: CreateProductDTO, imageFilename: string | null): Promise<Product> {
    const F = "create";
    const { name, description, price, stock, categories } = product;
    
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      logger.info(`[${C}], [${F}], Creating new product [${name}]`);
      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO products (name, description, price, stock, image_filename) VALUES (?, ?, ?, ?, ?)',
        [name, description, price, stock, imageFilename]
      );

      const productId = result.insertId;

      if (categories && categories.length > 0) {
        const values = categories.map(categoryId => [productId, categoryId]);
        await connection.query(
          'INSERT INTO product_categories (product_id, category_id) VALUES ?',
          [values]
        );
      }

      await connection.commit();
      
      logger.info(`[${C}], [${F}], Product created successfully with ID [${productId}]`);
      return this.findById(productId) as Promise<Product>;
    } catch (error) {
      await connection.rollback();
      logger.error(`[${C}], [${F}], Error creating product: [${(error as Error).message}]`);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id: number, product: UpdateProductDTO, imageFilename: string | null): Promise<Product | null> {
    const F = "update";
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      logger.info(`[${C}], [${F}], Updating product with ID [${id}]`);
      const updates: string[] = [];
      const values: any[] = [];

      if (product.name !== undefined) {
        updates.push('name = ?');
        values.push(product.name);
      }
      if (product.description !== undefined) {
        updates.push('description = ?');
        values.push(product.description);
      }
      if (product.price !== undefined) {
        updates.push('price = ?');
        values.push(product.price);
      }
      if (product.stock !== undefined) {
        updates.push('stock = ?');
        values.push(product.stock);
      }
      if (imageFilename !== null) {
        updates.push('image_filename = ?');
        values.push(imageFilename);
      }

      if (updates.length > 0) {
        values.push(id);
        await connection.query(
          `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }

      if (product.categories) {
        await connection.query(
          'DELETE FROM product_categories WHERE product_id = ?',
          [id]
        );

        if (product.categories.length > 0) {
          const values = product.categories.map(categoryId => [id, categoryId]);
          await connection.query(
            'INSERT INTO product_categories (product_id, category_id) VALUES ?',
            [values]
          );
        }
      }

      await connection.commit();
      logger.info(`[${C}], [${F}], Product updated successfully with ID [${id}]`);
      return this.findById(id);
    } catch (error) {
      await connection.rollback();
      logger.error(`[${C}], [${F}], Error updating product: [${(error as Error).message}]`);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id: number): Promise<boolean> {
    const F = "delete";
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      logger.info(`[${C}], [${F}], Deleting product with ID [${id}]`);
      const [result] = await connection.query<ResultSetHeader>(
        'DELETE FROM products WHERE id = ?',
        [id]
      );

      await connection.commit();
      logger.info(`[${C}], [${F}], Product deleted successfully with ID [${id}]`);
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      logger.error(`[${C}], [${F}], Error deleting product: [${(error as Error).message}]`);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async moveImage(tempPath: string, categoryId: number): Promise<string> {
    const F = "moveImage";
    const categoryDir = path.join(__dirname, '..', '..', 'uploads', categoryId.toString());
    logger.info(`[${C}], [${F}], Moving image from [${tempPath}] to [${categoryDir}]`);
    await fs.mkdir(categoryDir, { recursive: true });
    const filename = path.basename(tempPath);
    logger.info(`[${C}], [${F}], Filename: [${filename}]`);
    const newPath = path.join(categoryDir, filename);
    logger.info(`[${C}], [${F}], New path: [${newPath}]`);
    await fs.rename(tempPath, newPath);
    logger.info(`[${C}], [${F}], Moved image from [${tempPath}] to [${newPath}]`);
    return path.join(filename);
    // return path.join('uploads', categoryId.toString(), filename);
  }

  static async deleteImage(imagePath: string): Promise<void> {
    const F = "deleteImage";
    try {
      await fs.unlink(path.join(__dirname, '..', '..', imagePath));
      logger.info(`[${C}], [${F}], Deleted image [${imagePath}]`);
    } catch (error) {
      logger.error(`[${C}], [${F}], Error deleting image [${imagePath}]: [${(error as Error).message}]`);
    }
  }
}

