import { Router } from 'express'
import { ProductController } from '../controllers/product.controller'
import { validateProduct } from '../middlewares/product.validator'

const router = Router()

router.get('/products', ProductController.getAllProducts)
router.get('/products/:id', ProductController.getProductById)
router.post('/products', validateProduct, ProductController.createProduct)
router.put('/products/:id', validateProduct, ProductController.updateProduct)
router.delete('/products/:id', ProductController.deleteProduct)

export default router

