import { Router } from 'express';
import { prisma } from '../../prisma';
import { AuthRequest } from '../../authMiddleware';
import { getAccessibleBoard, getOwnedBoard } from './utils';

export const registerBoardRoutes = (router: Router) => {
  router.get('/', async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const boards = await prisma.board.findMany({
        where: {
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
        orderBy: { createdAt: 'asc' },
      });
      return res.json({ boards });
    } catch (err) {
      console.error('Get boards error ====>', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.post('/', async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { title } = req.body;

      if (!title || title.trim() === '') {
        return res.status(400).json({ message: 'Title is required' });
      }

      const board = await prisma.board.create({
        data: {
          title: title.trim(),
          ownerId: userId,
        },
      });

      return res.status(201).json({ board });
    } catch (err) {
      console.error('Create board error ====>', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get('/:id', async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const id = Number(req.params.id);

      const board = await getAccessibleBoard(id, userId);

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      return res.json({ board });
    } catch (err) {
      console.error('Get board error ====>', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get('/:id/full', async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const boardId = Number(req.params.id);

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
                where: { archived: false },
                orderBy: { position: 'asc' },
                include: {
                  cardLabels: {
                    include: { label: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const { lists, ...boardData } = board;
      return res.json({ board: boardData, lists });
    } catch (err) {
      console.error('Get board full error ====>', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get('/:id/move-targets', async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const boardId = Number(req.params.id);

      const currentBoard = await getAccessibleBoard(boardId, userId);
      if (!currentBoard) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const boards = await prisma.board.findMany({
        where: {
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          title: true,
          lists: {
            orderBy: { position: 'asc' },
            select: { id: true, title: true },
          },
        },
      });

      const currentIndex = boards.findIndex((board) => board.id === boardId);
      if (currentIndex === -1) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const orderedBoards =
        currentIndex <= 0
          ? boards
          : [
              boards[currentIndex],
              ...boards.slice(0, currentIndex),
              ...boards.slice(currentIndex + 1),
            ];

      const targets = orderedBoards.flatMap((board) =>
        board.lists.map((list: any) => ({
          boardId: board.id,
          boardTitle: board.title,
          listId: list.id,
          listTitle: list.title,
        }))
      );

      return res.json({ currentBoardId: boardId, targets });
    } catch (err) {
      console.error('Get move targets error ====>', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.put('/:id', async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const id = Number(req.params.id);
      const { title } = req.body;

      if (!title || title.trim() === '') {
        return res.status(400).json({ message: 'Title is required' });
      }

      const board = await getOwnedBoard(id, userId);

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const updated = await prisma.board.update({
        where: { id: board.id },
        data: {
          title: title.trim(),
        },
      });

      return res.json({ board: updated });
    } catch (err) {
      console.error('Update board error ====>', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.delete('/:id', async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const id = Number(req.params.id);

      const board = await getOwnedBoard(id, userId);

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      await prisma.$transaction([
        prisma.cardLabel.deleteMany({
          where: { card: { list: { boardId: board.id } } },
        }),
        prisma.checklistItem.deleteMany({
          where: { card: { list: { boardId: board.id } } },
        }),
        prisma.comment.deleteMany({
          where: { card: { list: { boardId: board.id } } },
        }),
        prisma.card.deleteMany({ where: { list: { boardId: board.id } } }),
        prisma.label.deleteMany({ where: { boardId: board.id } }),
        prisma.list.deleteMany({ where: { boardId: board.id } }),
        prisma.board.delete({ where: { id: board.id } }),
      ]);

      return res.status(204).send();
    } catch (err) {
      console.error('Delete board error ====>', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
};
