import express from 'express';
import cors from 'cors';
import userRoutes from './src/routes/user.routes';
import productRoutes from './src/routes/product.routes';
import purchaseRoutes from './src/routes/purchase.routes';
import logger from './src/utils/logger';
import path from 'path';
import fs from 'fs';

const C = "App";

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Logging middleware
app.use((req, res, next) => {
  const F = "request";
  logger.info(`[${C}], [${F}], ${req.method} [${req.url}]`);
  next();
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/purchases', purchaseRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const F = "error";
  logger.error(`[${C}], [${F}], ${err.name}: [${err.message}]\n${err.stack}`);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  const F = "start";
  logger.info(`[${C}], [${F}], Server is running on port [${PORT}]`);
});

export default app;

