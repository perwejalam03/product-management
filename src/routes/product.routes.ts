import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validateProduct } from '../middlewares/product.validator';
import { handleMulterError, upload } from '../utils/multer';

const router = Router();

router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', upload.single('image'), handleMulterError, validateProduct, ProductController.createProduct);
router.put('/:id', upload.single('image'), handleMulterError, validateProduct, ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

export default router;

