import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import patientRoutes from './routes/patientRoutes.js';
import visitRoutes from './routes/visitRoutes.js';
import labRoutes from './routes/labRoutes.js';
import consentRoutes from './routes/consentRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MedIndia EHR REST API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/patients', patientRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/consents', consentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

// Start Server (local only — Vercel uses serverless, no app.listen needed)
async function startServer() {
  await connectDB();
  if (!process.env.VERCEL) {
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 MedIndia EHR API Server running on port ${PORT}`);
      console.log(`📊 Health Endpoint: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Network Access:  http://10.148.142.139:${PORT}/api/health`);
    });
  }
}

startServer();

export default app;
