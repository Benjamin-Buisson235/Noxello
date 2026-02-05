import { Router } from 'express';
import { prisma } from '../../prisma';
import { AuthRequest } from '../../authMiddleware';
import { getAccessibleBoard, getCardInList } from './utils';

export const registerArchiveRoutes = (router: Router) => {
  router.patch(
    '/:boardId/lists/:listId/cards/:cardId/archive',
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

        const updated = await prisma.card.update({
          where: { id: card.id },
          data: { archived: true, archivedAt: new Date() },
        });

        return res.json({ card: updated });
      } catch (err) {
        console.error('Archive card error ====>', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  router.patch(
    '/:boardId/lists/:listId/cards/:cardId/unarchive',
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

        const updated = await prisma.card.update({
          where: { id: card.id },
          data: { archived: false, archivedAt: null },
        });

        return res.json({ card: updated });
      } catch (err) {
        console.error('Unarchive card error ====>', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  router.get('/:boardId/archived', async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const boardId = Number(req.params.boardId);

      const board = await prisma.board.findFirst({
        where: {
          id: boardId,
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
        include: {
          lists: {
            orderBy: { position: 'asc' },
            include: {
              cards: {
                where: { archived: true },
                orderBy: { position: 'asc' },
                include: {
                  cardLabels: { include: { label: true } },
                },
              },
            },
          },
        },
      });

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const { lists } = board;
      return res.json({ lists });
    } catch (err) {
      console.error('Get archived cards error ====>', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
};
