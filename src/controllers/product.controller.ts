import { Request, Response, NextFunction } from 'express';
import { ProductModel } from '../models/product.model';
import { CreateProductDTO, UpdateProductDTO } from '../types/product';
import logger from '../utils/logger';

const C = "Product Controller";

export class ProductController {
  static async getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    const F = "getAllProducts";
    try {
      logger.info(`[${C}], [${F}], Fetching all products`);
      const products = await ProductModel.findAll();
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
      
      const product = await ProductModel.create(productData);
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
      
      const product = await ProductModel.update(id, productData);
      
      if (!product) {
        logger.warn(`[${C}], [${F}], Product not found for ProductId [${id}]`);
        res.status(404).json({ error: 'Product not found' });
        return;
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
      
      const success = await ProductModel.delete(id);
      
      if (!success) {
        logger.warn(`[${C}], [${F}], Product not found for ProductId [${id}]`);
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      logger.error(`[${C}], [${F}], Error [${(error as Error).message}]`);
      next(error);
    }
  }
}

