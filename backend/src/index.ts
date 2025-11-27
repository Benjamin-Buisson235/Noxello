import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './authRoutes';
import { boardRoutes } from './boardRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/boards', boardRoutes);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
