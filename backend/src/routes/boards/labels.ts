import { Router } from 'express';
import { prisma } from '../../prisma';
import { AuthRequest } from '../../authMiddleware';
import { getAccessibleBoard } from './utils';

export const registerLabelRoutes = (router: Router) => {
  router.get('/:boardId/labels', async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const boardId = Number(req.params.boardId);

      const board = await getAccessibleBoard(boardId, userId);
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const labels = await prisma.label.findMany({
        where: { boardId },
        orderBy: { id: 'asc' },
      });

      return res.json({ labels });
    } catch (err) {
      console.error('Get labels error ====>', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.post('/:boardId/labels', async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const boardId = Number(req.params.boardId);
      const { name, color } = req.body;

      if (!name || String(name).trim() === '') {
        return res.status(400).json({ message: 'Name is required' });
      }

      const board = await getAccessibleBoard(boardId, userId);
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const label = await prisma.label.create({
        data: {
          name: String(name).trim(),
          color: color ? String(color) : null,
          boardId,
        },
      });

      return res.status(201).json({ label });
    } catch (err) {
      console.error('Create label error ====>', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
};
