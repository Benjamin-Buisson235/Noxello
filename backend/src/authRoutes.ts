import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { requireAuth, AuthRequest } from './authMiddleware';

const authRoutes = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function generateToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

authRoutes.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
      },
    });

    const token = generateToken(user.id);

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    console.error('Register error ====>', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

authRoutes.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    console.error('Login error ====>', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

authRoutes.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Get me error ====>', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

authRoutes.put('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name && name.trim() !== '' ? name.trim() : null,
      },
    });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Update me error ====>', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export { authRoutes };
