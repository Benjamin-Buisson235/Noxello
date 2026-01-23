import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './authRoutes';
import { boardRoutes } from './boardRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const rawFrontendOrigin = process.env.FRONTEND_ORIGIN?.trim();
const allowedOrigins = new Set(
  [rawFrontendOrigin, 'http://localhost:5173'].filter(Boolean),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
  }),
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/boards', boardRoutes);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
