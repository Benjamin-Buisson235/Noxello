import { Router } from 'express';
import { prisma } from '../../prisma';
import { AuthRequest } from '../../authMiddleware';
import { getAccessibleBoard, getListInBoard } from './utils';

export const registerListRoutes = (router: Router) => {
  router.get('/:id/lists', async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const boardId = Number(req.params.id);

      const board = await getAccessibleBoard(boardId, userId);

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const lists = await prisma.list.findMany({
        where: { boardId },
        orderBy: { position: 'asc' },
      });

      return res.json({ lists });
    } catch (err) {
      console.error('Get lists error ====>', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.post('/:id/lists', async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const boardId = Number(req.params.id);
      const { title } = req.body;

      if (!title || title.trim() === '') {
        return res.status(400).json({ message: 'Title is required' });
      }

      const board = await getAccessibleBoard(boardId, userId);

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const last = await prisma.list.findFirst({
        where: { boardId },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
      const position = last ? last.position + 1 : 0;

      const list = await prisma.list.create({
        data: {
          title: title.trim(),
          position,
          boardId,
        },
      });

      return res.status(201).json({ list });
    } catch (err) {
      console.error('Create list error ====>', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.patch('/:id/lists/reorder', async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const boardId = Number(req.params.id);
      const { orderedListIds } = req.body;

      if (!Array.isArray(orderedListIds) || orderedListIds.length < 1) {
        return res
          .status(400)
          .json({ message: 'orderedListIds must be a non-empty array' });
      }

      const listIds = orderedListIds.map((id: string | number) => Number(id));
      if (listIds.some((id) => Number.isNaN(id))) {
        return res
          .status(400)
          .json({ message: 'orderedListIds must contain only numbers' });
      }

      const uniqueIds = Array.from(new Set(listIds));
      if (uniqueIds.length !== listIds.length) {
        return res
          .status(400)
          .json({ message: 'orderedListIds must be unique' });
      }

      const board = await getAccessibleBoard(boardId, userId);
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const lists = await prisma.list.findMany({
        where: { id: { in: uniqueIds }, boardId },
        select: { id: true },
      });
      if (lists.length !== uniqueIds.length) {
        return res.status(404).json({ message: 'List not found' });
      }

      await prisma.$transaction(
        uniqueIds.map((id, index) =>
          prisma.list.update({
            where: { id },
            data: { position: index },
          })
        )
      );

      const updated = await prisma.list.findMany({
        where: { boardId },
        orderBy: { position: 'asc' },
      });

      return res.json({ lists: updated });
    } catch (err) {
      console.error('Reorder lists error ====>', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.put('/:boardId/lists/:listId', async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const boardId = Number(req.params.boardId);
      const listId = Number(req.params.listId);
      const { title } = req.body;

      if (!title || title.trim() === '') {
        return res.status(400).json({ message: 'Title is required' });
      }

      const board = await getAccessibleBoard(boardId, userId);
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const list = await getListInBoard(listId, boardId);
      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }

      const updated = await prisma.list.update({
        where: { id: list.id },
        data: {
          title: title.trim(),
        },
      });

      return res.json({ list: updated });
    } catch (err) {
      console.error('Update list error ====>', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.delete('/:boardId/lists/:listId', async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const boardId = Number(req.params.boardId);
      const listId = Number(req.params.listId);

      const board = await getAccessibleBoard(boardId, userId);

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const list = await getListInBoard(listId, boardId);

      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }

      await prisma.list.delete({
        where: { id: list.id },
      });

      return res.status(204).send();
    } catch (err) {
      console.error('Delete list error ====>', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
};
