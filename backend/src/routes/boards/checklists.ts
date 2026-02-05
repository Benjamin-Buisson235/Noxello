import { Router } from 'express';
import { prisma } from '../../prisma';
import { AuthRequest } from '../../authMiddleware';
import { getAccessibleBoard, getCardInList } from './utils';

export const registerChecklistRoutes = (router: Router) => {
  router.get(
    '/:boardId/lists/:listId/cards/:cardId/checklist',
    async (req: AuthRequest, res) => {
      try {
        const userId = req.userId!;
        const boardId = Number(req.params.boardId);
        const listId = Number(req.params.listId);
        const cardId = Number(req.params.cardId);

        const board = await getAccessibleBoard(boardId, userId);
        if (!board) {
          return res.status(404).json({ message: 'Board not found' });
        }

        const card = await getCardInList(cardId, listId, boardId);
        if (!card) {
          return res.status(404).json({ message: 'Card not found' });
        }

        const items = await prisma.checklistItem.findMany({
          where: { cardId },
          orderBy: { position: 'asc' },
        });

        return res.json({ items });
      } catch (err) {
        console.error('Get checklist error ====>', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  router.post(
    '/:boardId/lists/:listId/cards/:cardId/checklist',
    async (req: AuthRequest, res) => {
      try {
        const userId = req.userId!;
        const boardId = Number(req.params.boardId);
        const listId = Number(req.params.listId);
        const cardId = Number(req.params.cardId);
        const { text } = req.body;

        if (!text || String(text).trim() === '') {
          return res.status(400).json({ message: 'Text is required' });
        }

        const board = await getAccessibleBoard(boardId, userId);
        if (!board) {
          return res.status(404).json({ message: 'Board not found' });
        }

        const card = await getCardInList(cardId, listId, boardId);
        if (!card) {
          return res.status(404).json({ message: 'Card not found' });
        }

        const last = await prisma.checklistItem.findFirst({
          where: { cardId },
          orderBy: { position: 'desc' },
          select: { position: true },
        });
        const position = last ? last.position + 1 : 0;

        const item = await prisma.checklistItem.create({
          data: {
            cardId,
            text: String(text).trim(),
            position,
          },
        });

        return res.status(201).json({ item });
      } catch (err) {
        console.error('Create checklist item error ====>', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  router.patch(
    '/:boardId/lists/:listId/cards/:cardId/checklist/:itemId',
    async (req: AuthRequest, res) => {
      try {
        const userId = req.userId!;
        const boardId = Number(req.params.boardId);
        const listId = Number(req.params.listId);
        const cardId = Number(req.params.cardId);
        const itemId = Number(req.params.itemId);
        const { text, done } = req.body;

        if (text === undefined && done === undefined) {
          return res.status(400).json({ message: 'text or done is required' });
        }

        let trimmedText: string | undefined;
        if (text !== undefined) {
          trimmedText = String(text).trim();
          if (!trimmedText) {
            return res.status(400).json({ message: 'Text is required' });
          }
        }

        const board = await getAccessibleBoard(boardId, userId);
        if (!board) {
          return res.status(404).json({ message: 'Board not found' });
        }

        const card = await getCardInList(cardId, listId, boardId);
        if (!card) {
          return res.status(404).json({ message: 'Card not found' });
        }

        const item = await prisma.checklistItem.findFirst({
          where: { id: itemId, cardId },
        });
        if (!item) {
          return res.status(404).json({ message: 'Checklist item not found' });
        }

        const updated = await prisma.checklistItem.update({
          where: { id: item.id },
          data: {
            ...(trimmedText !== undefined ? { text: trimmedText } : {}),
            ...(done !== undefined ? { done: Boolean(done) } : {}),
          },
        });

        return res.json({ item: updated });
      } catch (err) {
        console.error('Update checklist item error ====>', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  router.delete(
    '/:boardId/lists/:listId/cards/:cardId/checklist/:itemId',
    async (req: AuthRequest, res) => {
      try {
        const userId = req.userId!;
        const boardId = Number(req.params.boardId);
        const listId = Number(req.params.listId);
        const cardId = Number(req.params.cardId);
        const itemId = Number(req.params.itemId);

        const board = await getAccessibleBoard(boardId, userId);
        if (!board) {
          return res.status(404).json({ message: 'Board not found' });
        }

        const card = await getCardInList(cardId, listId, boardId);
        if (!card) {
          return res.status(404).json({ message: 'Card not found' });
        }

        const item = await prisma.checklistItem.findFirst({
          where: { id: itemId, cardId },
        });
        if (!item) {
          return res.status(404).json({ message: 'Checklist item not found' });
        }

        await prisma.checklistItem.delete({ where: { id: item.id } });

        return res.status(204).send();
      } catch (err) {
        console.error('Delete checklist item error ====>', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  router.patch(
    '/:boardId/lists/:listId/cards/:cardId/checklist/reorder',
    async (req: AuthRequest, res) => {
      try {
        const userId = req.userId!;
        const boardId = Number(req.params.boardId);
        const listId = Number(req.params.listId);
        const cardId = Number(req.params.cardId);
        const { orderedItemIds } = req.body;

        if (!Array.isArray(orderedItemIds) || orderedItemIds.length === 0) {
          return res.status(400).json({ message: 'orderedItemIds must be a non-empty array' });
        }

        const parsedIds = orderedItemIds.map((id: string | number) => Number(id));
        if (parsedIds.some((id: number) => Number.isNaN(id))) {
          return res.status(400).json({ message: 'orderedItemIds must contain only numbers' });
        }

        const board = await getAccessibleBoard(boardId, userId);
        if (!board) {
          return res.status(404).json({ message: 'Board not found' });
        }

        const card = await getCardInList(cardId, listId, boardId);
        if (!card) {
          return res.status(404).json({ message: 'Card not found' });
        }

        const items = await prisma.checklistItem.findMany({
          where: { id: { in: parsedIds }, cardId },
          select: { id: true },
        });
        if (items.length !== parsedIds.length) {
          return res.status(404).json({ message: 'Checklist item not found' });
        }

        await prisma.$transaction(
          parsedIds.map((itemId: number, index: number) =>
            prisma.checklistItem.update({
              where: { id: itemId },
              data: { position: index },
            })
          )
        );

        const ordered = await prisma.checklistItem.findMany({
          where: { cardId },
          orderBy: { position: 'asc' },
        });

        return res.json({ items: ordered });
      } catch (err) {
        console.error('Reorder checklist error ====>', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  );
};
