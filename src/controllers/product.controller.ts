import { NextFunction, Request, Response } from 'express';
import { ProductModel } from '../models/product.model';
import { CreateProductDTO, UpdateProductDTO } from '../types/product';
import logger from '../utils/logger';

const C = "Product Controller";
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export class ProductController {
  static async getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    const F = "getAllProducts";
    try {
      logger.info(`[${C}], [${F}], Fetching all products`);
      const products = await ProductModel.findAll();
      products.forEach(product => {
        if (product.image_filename) {
          product.image_filename = `${BASE_URL}/uploads/${product.categories}/${product.image_filename}`;
        }
      });
      res.json(products);
    } catch (error) {
      logger.error(`[${C}], [${F}], Error [${(error as Error).message}]`);
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const F = "getProductById";
    try {
      const id = parseInt(req.params.id);
      logger.info(`[${C}], [${F}], ProductId [${id}]`);
      
      const product = await ProductModel.findById(id);
      if (!product) {
        logger.warn(`[${C}], [${F}], Product not found for ProductId [${id}]`);
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      if (product.image_filename) {
        product.image_filename = `${BASE_URL}/uploads/${product.categories}/${product.image_filename}`;
      }
      
      res.json(product);
    } catch (error) {
      logger.error(`[${C}], [${F}], Error [${(error as Error).message}]`);
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    const F = "createProduct";
    try {
      const productData: CreateProductDTO = req.body;
      logger.info(`[${C}], [${F}], Creating product [${productData.name}]`);
      
      let imageFilename: string | null = null;
      if (req.file) {
        const tempPath = req.file.path;
        logger.info(`[${C}], [${F}], Uploaded file path: [${tempPath}]`);
        const categoryId = productData.categories && productData.categories.length > 0 ? productData.categories[0] : null;
        if (categoryId === null) {
          logger.warn(`[${C}], [${F}], No category provided for new product [${productData.name}]`);
          throw new Error('At least one category is required for the product');
        }
        imageFilename = await ProductModel.moveImage(tempPath, categoryId);
      } else {
        logger.warn(`[${C}], [${F}], No image file uploaded for product [${productData.name}]`);
      }

      const product = await ProductModel.create(productData, imageFilename);
      if (product.image_filename) {
        product.image_filename = `${BASE_URL}/uploads/${productData.categories[0]}/${product.image_filename}`;
      }
      res.status(201).json(product);
    } catch (error) {
      logger.error(`[${C}], [${F}], Error [${(error as Error).message}]`);
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    const F = "updateProduct";
    try {
      const id = parseInt(req.params.id);
      const productData: UpdateProductDTO = req.body;
      logger.info(`[${C}], [${F}], Updating ProductId [${id}]`);
      
      let imageFilename: string | null = null;
      if (req.file) {
        const tempPath = req.file.path;
        logger.info(`[${C}], [${F}], Uploaded file path: [${tempPath}]`);
        let categoryId: number | null = null;
        if (productData.categories && productData.categories.length > 0) {
          categoryId = productData.categories[0];
        } else {
          const existingProduct = await ProductModel.findById(id);
          if (existingProduct && existingProduct.categories && existingProduct.categories.length > 0) {
            categoryId = existingProduct.categories[0];
          }
        }
        if (categoryId === null) {
          logger.warn(`[${C}], [${F}], No category found for product [${id}]`);
          throw new Error('At least one category is required for the product');
        }
        imageFilename = await ProductModel.moveImage(tempPath, categoryId);
      } else {
        logger.info(`[${C}], [${F}], No new image file uploaded for product [${id}]`);
      }

      const oldProduct = await ProductModel.findById(id);
      const product = await ProductModel.update(id, productData, imageFilename);
      
      if (!product) {
        logger.warn(`[${C}], [${F}], Product not found for ProductId [${id}]`);
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      
      if (product.image_filename) {
        product.image_filename = `${BASE_URL}/uploads/${product.categories}/${product.image_filename}`;
      }

      // Delete old image if it was replaced
      if (oldProduct && oldProduct.image_filename && imageFilename) {
        await ProductModel.deleteImage(oldProduct.image_filename);
      }
      
      res.json(product);
    } catch (error) {
      logger.error(`[${C}], [${F}], Error [${(error as Error).message}]`);
      next(error);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    const F = "deleteProduct";
    try {
      const id = parseInt(req.params.id);
      logger.info(`[${C}], [${F}], Deleting ProductId [${id}]`);
      
      const product = await ProductModel.findById(id);
      if (!product) {
        logger.warn(`[${C}], [${F}], Product not found for ProductId [${id}]`);
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      const success = await ProductModel.delete(id);
      if (!success) {
        logger.warn(`[${C}], [${F}], Failed to delete product for ProductId [${id}]`);
        res.status(500).json({ error: 'Failed to delete product' });
        return;
      }

      // Delete associated image
      if (product.image_filename) {
        await ProductModel.deleteImage(product.image_filename);
      }
      res.status(204).json({ message: 'Product deleted successfully' });
    } catch (error) {
      logger.error(`[${C}], [${F}], Error [${(error as Error).message}]`);
      next(error);
    }
  }
}

