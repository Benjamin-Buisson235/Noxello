import { Router } from 'express';
import { prisma } from '../../prisma';
import { AuthRequest } from '../../authMiddleware';
import { getAccessibleBoard, getCardInList, getListInBoard } from './utils';

export const registerCardRoutes = (router: Router) => {
  router.get(
    '/:boardId/lists/:listId/cards',
    async (req: AuthRequest, res) => {
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

        const cards = await prisma.card.findMany({
          where: { listId, archived: false },
          orderBy: { position: 'asc' },
        });

        return res.json({ cards });
      } catch (err) {
        console.error('Get cards error ====>', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  router.post(
    '/:boardId/lists/:listId/cards',
    async (req: AuthRequest, res) => {
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

        const last = await prisma.card.findFirst({
          where: { listId },
          orderBy: { position: 'desc' },
          select: { position: true },
        });
        const position = last ? last.position + 1 : 0;

        const card = await prisma.card.create({
          data: {
            title: title.trim(),
            position,
            listId,
          },
        });

        return res.status(201).json({ card });
      } catch (err) {
        console.error('Create card error ====>', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  router.patch(
    '/:boardId/lists/:listId/cards/reorder',
    async (req: AuthRequest, res) => {
      try {
        const userId = req.userId!;
        const boardId = Number(req.params.boardId);
        const listId = Number(req.params.listId);
        const { orderedCardIds } = req.body;

        if (!Array.isArray(orderedCardIds) || orderedCardIds.length < 1) {
          return res
            .status(400)
            .json({ message: 'orderedCardIds must be a non-empty array' });
        }

        const cardIds = orderedCardIds.map((id: string | number) => Number(id));
        if (cardIds.some((id) => Number.isNaN(id))) {
          return res
            .status(400)
            .json({ message: 'orderedCardIds must contain only numbers' });
        }

        const uniqueIds = Array.from(new Set(cardIds));
        if (uniqueIds.length !== cardIds.length) {
          return res
            .status(400)
            .json({ message: 'orderedCardIds must be unique' });
        }

        const board = await getAccessibleBoard(boardId, userId);
        if (!board) {
          return res.status(404).json({ message: 'Board not found' });
        }

        const list = await getListInBoard(listId, boardId);
        if (!list) {
          return res.status(404).json({ message: 'List not found' });
        }

        const cards = await prisma.card.findMany({
          where: { id: { in: uniqueIds }, listId },
          select: { id: true },
        });
        if (cards.length !== uniqueIds.length) {
          return res.status(404).json({ message: 'Card not found' });
        }

        await prisma.$transaction(
          uniqueIds.map((id, index) =>
            prisma.card.update({
              where: { id },
              data: { position: index },
            })
          )
        );

        const updated = await prisma.card.findMany({
          where: { listId },
          orderBy: { position: 'asc' },
        });

        return res.json({ cards: updated });
      } catch (err) {
        console.error('Reorder cards error ====>', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  router.patch(
    '/:boardId/lists/:listId/cards/:cardId',
    async (req: AuthRequest, res) => {
      try {
        const userId = req.userId!;
        const boardId = Number(req.params.boardId);
        const listId = Number(req.params.listId);
        const cardId = Number(req.params.cardId);
        const { title, description, dueDate } = req.body;

        if (title === undefined && description === undefined && dueDate === undefined) {
          return res
            .status(400)
            .json({ message: 'title, description, or dueDate is required' });
        }

        let trimmedTitle: string | undefined;
        if (title !== undefined) {
          trimmedTitle = String(title).trim();
          if (!trimmedTitle) {
            return res.status(400).json({ message: 'Title is required' });
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

        let parsedDueDate: Date | null | undefined;
        if (dueDate !== undefined) {
          if (dueDate === null) {
            parsedDueDate = null;
          } else if (typeof dueDate === 'string') {
            const parsed = new Date(`${dueDate}T00:00:00.000Z`);
            if (Number.isNaN(parsed.getTime())) {
              return res.status(400).json({ message: 'Invalid dueDate' });
            }
            parsedDueDate = parsed;
          } else {
            return res.status(400).json({ message: 'Invalid dueDate' });
          }
        }

        const updated = await prisma.card.update({
          where: { id: card.id },
          data: {
            ...(trimmedTitle !== undefined ? { title: trimmedTitle } : {}),
            ...(description !== undefined ? { description } : {}),
            ...(parsedDueDate !== undefined ? { dueDate: parsedDueDate } : {}),
          },
        });

        return res.json({ card: updated });
      } catch (err) {
        console.error('Update card error ====>', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  router.put(
    '/:boardId/lists/:listId/cards/:cardId/labels',
    async (req: AuthRequest, res) => {
      try {
        const userId = req.userId!;
        const boardId = Number(req.params.boardId);
        const listId = Number(req.params.listId);
        const cardId = Number(req.params.cardId);
        const { labelIds } = req.body;

        if (!Array.isArray(labelIds)) {
          return res.status(400).json({ message: 'labelIds must be an array' });
        }

        const parsedIds = labelIds.map((id: string | number) => Number(id));
        if (parsedIds.some((id: number) => Number.isNaN(id))) {
          return res.status(400).json({ message: 'labelIds must contain only numbers' });
        }

        const uniqueIds = Array.from(new Set(parsedIds));

        const board = await getAccessibleBoard(boardId, userId);
        if (!board) {
          return res.status(404).json({ message: 'Board not found' });
        }

        const card = await getCardInList(cardId, listId, boardId);
        if (!card) {
          return res.status(404).json({ message: 'Card not found' });
        }

        if (uniqueIds.length > 0) {
          const labels = await prisma.label.findMany({
            where: { id: { in: uniqueIds }, boardId },
            select: { id: true },
          });
          if (labels.length !== uniqueIds.length) {
            return res.status(404).json({ message: 'Label not found' });
          }
        }

        await prisma.$transaction([
          prisma.cardLabel.deleteMany({ where: { cardId } }),
          ...(uniqueIds.length
            ? [
                prisma.cardLabel.createMany({
                  data: uniqueIds.map((labelId: number) => ({
                    cardId,
                    labelId,
                  })),
                }),
              ]
            : []),
        ]);

        const labels = await prisma.cardLabel.findMany({
          where: { cardId },
          include: { label: true },
        });

        return res.json({ labels: labels.map((entry) => entry.label) });
      } catch (err) {
        console.error('Update card labels error ====>', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  router.put(
    '/:boardId/lists/:listId/cards/:cardId/move',
    async (req: AuthRequest, res) => {
      try {
        const userId = req.userId!;
        const boardId = Number(req.params.boardId);
        const sourceListId = Number(req.params.listId);
        const cardId = Number(req.params.cardId);
        const { targetListId } = req.body;

        if (!targetListId) {
          return res.status(400).json({ message: 'targetListId is required' });
        }

        const board = await getAccessibleBoard(boardId, userId);
        if (!board) {
          return res.status(404).json({ message: 'Board not found' });
        }

        const card = await getCardInList(cardId, sourceListId, boardId);
        if (!card) {
          return res.status(404).json({ message: 'Card not found' });
        }

        const targetList = await getListInBoard(Number(targetListId), boardId);
        if (!targetList) {
          return res.status(404).json({ message: 'Target list not found' });
        }

        const targetCount = await prisma.card.count({
          where: { listId: Number(targetListId) },
        });

        const updated = await prisma.card.update({
          where: { id: card.id },
          data: {
            listId: Number(targetListId),
            position: targetCount,
          },
        });

        return res.json({ card: updated });
      } catch (err) {
        console.error('Move card error ====>', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  router.put(
    '/:sourceBoardId/lists/:sourceListId/cards/:cardId/move-to-list',
    async (req: AuthRequest, res) => {
      try {
        const userId = req.userId!;
        const sourceBoardId = Number(req.params.sourceBoardId);
        const sourceListId = Number(req.params.sourceListId);
        const cardId = Number(req.params.cardId);
        const { targetBoardId, targetListId } = req.body;

        if (!targetBoardId || !targetListId) {
          return res
            .status(400)
            .json({ message: 'targetBoardId and targetListId are required' });
        }

        const parsedTargetBoardId = Number(targetBoardId);
        const parsedTargetListId = Number(targetListId);
        if (Number.isNaN(parsedTargetBoardId) || Number.isNaN(parsedTargetListId)) {
          return res
            .status(400)
            .json({ message: 'targetBoardId and targetListId must be numbers' });
        }

        const sourceBoard = await getAccessibleBoard(sourceBoardId, userId);
        if (!sourceBoard) {
          return res.status(404).json({ message: 'Board not found' });
        }

        const targetBoard = await getAccessibleBoard(parsedTargetBoardId, userId);
        if (!targetBoard) {
          return res.status(404).json({ message: 'Target board not found' });
        }

        const sourceList = await getListInBoard(sourceListId, sourceBoardId);
        if (!sourceList) {
          return res.status(404).json({ message: 'List not found' });
        }

        const card = await getCardInList(cardId, sourceListId, sourceBoardId);
        if (!card) {
          return res.status(404).json({ message: 'Card not found' });
        }

        const targetList = await getListInBoard(parsedTargetListId, parsedTargetBoardId);
        if (!targetList) {
          return res.status(404).json({ message: 'Target list not found' });
        }

        const last = await prisma.card.findFirst({
          where: { listId: parsedTargetListId },
          orderBy: { position: 'desc' },
          select: { position: true },
        });
        const position = last ? last.position + 1 : 0;

        const updated = await prisma.card.update({
          where: { id: card.id },
          data: {
            listId: parsedTargetListId,
            position,
          },
        });

        return res.json({ card: updated });
      } catch (err) {
        console.error('Move card to list error ====>', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  router.delete(
    '/:boardId/lists/:listId/cards/:cardId',
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

        await prisma.card.delete({
          where: { id: card.id },
        });

        return res.status(204).send();
      } catch (err) {
        console.error('Delete card error ====>', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  );
};
