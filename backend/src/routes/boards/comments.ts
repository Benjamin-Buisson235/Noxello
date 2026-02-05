import { Router } from 'express';
import { prisma } from '../../prisma';
import { AuthRequest } from '../../authMiddleware';
import { getAccessibleBoard, getCardInList } from './utils';

export const registerCommentRoutes = (router: Router) => {
  router.get(
    '/:boardId/lists/:listId/cards/:cardId/comments',
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

        const comments = await prisma.comment.findMany({
          where: { cardId },
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
        });

        return res.json({ comments });
      } catch (err) {
        console.error('Get comments error ====>', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  router.post(
    '/:boardId/lists/:listId/cards/:cardId/comments',
    async (req: AuthRequest, res) => {
      try {
        const userId = req.userId!;
        const boardId = Number(req.params.boardId);
        const listId = Number(req.params.listId);
        const cardId = Number(req.params.cardId);
        const { content } = req.body;

        if (!content || String(content).trim() === '') {
          return res.status(400).json({ message: 'Content is required' });
        }

        const board = await getAccessibleBoard(boardId, userId);
        if (!board) {
          return res.status(404).json({ message: 'Board not found' });
        }

        const card = await getCardInList(cardId, listId, boardId);
        if (!card) {
          return res.status(404).json({ message: 'Card not found' });
        }

        const comment = await prisma.comment.create({
          data: {
            cardId,
            authorId: userId,
            content: String(content).trim(),
          },
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
        });

        return res.status(201).json({ comment });
      } catch (err) {
        console.error('Create comment error ====>', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  router.delete(
    '/:boardId/lists/:listId/cards/:cardId/comments/:commentId',
    async (req: AuthRequest, res) => {
      try {
        const userId = req.userId!;
        const boardId = Number(req.params.boardId);
        const listId = Number(req.params.listId);
        const cardId = Number(req.params.cardId);
        const commentId = Number(req.params.commentId);

        const board = await getAccessibleBoard(boardId, userId);
        if (!board) {
          return res.status(404).json({ message: 'Board not found' });
        }

        const card = await getCardInList(cardId, listId, boardId);
        if (!card) {
          return res.status(404).json({ message: 'Card not found' });
        }

        const comment = await prisma.comment.findFirst({
          where: { id: commentId, cardId },
        });
        if (!comment) {
          return res.status(404).json({ message: 'Comment not found' });
        }
        if (comment.authorId !== userId) {
          return res.status(403).json({ message: 'Not allowed to delete this comment' });
        }

        await prisma.comment.delete({ where: { id: comment.id } });

        return res.status(204).send();
      } catch (err) {
        console.error('Delete comment error ====>', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  );
};
