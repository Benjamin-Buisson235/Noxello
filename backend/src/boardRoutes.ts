import { Router } from 'express';
import { prisma } from './prisma';
import { requireAuth, AuthRequest } from './authMiddleware';

const boardRoutes = Router();

boardRoutes.use(requireAuth);

boardRoutes.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const boards = await prisma.board.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'asc' },
    });
    return res.json({ boards });
  } catch (err) {
    console.error('Get boards error ====>', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

boardRoutes.post('/', async (req: AuthRequest, res) => {
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

boardRoutes.get('/:id/lists', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const boardId = Number(req.params.id);

    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: userId },
    });

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

boardRoutes.post('/:id/lists', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const boardId = Number(req.params.id);
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: userId },
    });

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

boardRoutes.patch('/:id/lists/reorder', async (req: AuthRequest, res) => {
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

    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: userId },
    });
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

boardRoutes.put('/:boardId/lists/:listId', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const boardId = Number(req.params.boardId);
    const listId = Number(req.params.listId);
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: userId },
    });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const list = await prisma.list.findFirst({
      where: { id: listId, boardId },
    });
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

boardRoutes.delete('/:boardId/lists/:listId', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const boardId = Number(req.params.boardId);
    const listId = Number(req.params.listId);

    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: userId },
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const list = await prisma.list.findFirst({
      where: { id: listId, boardId },
    });

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

boardRoutes.get(
  '/:boardId/lists/:listId/cards',
  async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const boardId = Number(req.params.boardId);
      const listId = Number(req.params.listId);

      const board = await prisma.board.findFirst({
        where: { id: boardId, ownerId: userId },
      });
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const list = await prisma.list.findFirst({
        where: { id: listId, boardId },
      });
      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }

      const cards = await prisma.card.findMany({
        where: { listId },
        orderBy: { position: 'asc' },
      });

      return res.json({ cards });
    } catch (err) {
      console.error('Get cards error ====>', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

boardRoutes.post(
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

      const board = await prisma.board.findFirst({
        where: { id: boardId, ownerId: userId },
      });
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const list = await prisma.list.findFirst({
        where: { id: listId, boardId },
      });
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

boardRoutes.patch(
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

      const board = await prisma.board.findFirst({
        where: { id: boardId, ownerId: userId },
      });
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const list = await prisma.list.findFirst({
        where: { id: listId, boardId },
      });
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

boardRoutes.put(
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

      const board = await prisma.board.findFirst({
        where: { id: boardId, ownerId: userId },
      });
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const card = await prisma.card.findFirst({
        where: {
          id: cardId,
          list: {
            id: sourceListId,
            boardId,
          },
        },
      });
      if (!card) {
        return res.status(404).json({ message: 'Card not found' });
      }

      const targetList = await prisma.list.findFirst({
        where: { id: targetListId, boardId },
      });
      if (!targetList) {
        return res.status(404).json({ message: 'Target list not found' });
      }

      const targetCount = await prisma.card.count({
        where: { listId: targetListId },
      });

      const updated = await prisma.card.update({
        where: { id: card.id },
        data: {
          listId: targetListId,
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

boardRoutes.delete(
  '/:boardId/lists/:listId/cards/:cardId',
  async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const boardId = Number(req.params.boardId);
      const listId = Number(req.params.listId);
      const cardId = Number(req.params.cardId);

      const board = await prisma.board.findFirst({
        where: { id: boardId, ownerId: userId },
      });
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const card = await prisma.card.findFirst({
        where: {
          id: cardId,
          list: {
            id: listId,
            boardId,
          },
        },
      });
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

boardRoutes.get('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);

    const board = await prisma.board.findFirst({
      where: { id, ownerId: userId },
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    return res.json({ board });
  } catch (err) {
    console.error('Get board error ====>', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

boardRoutes.get('/:id/full', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const boardId = Number(req.params.id);

    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: userId },
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
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

boardRoutes.put('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    const board = await prisma.board.findFirst({
      where: { id, ownerId: userId },
    });

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

boardRoutes.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);

    const board = await prisma.board.findFirst({
      where: { id, ownerId: userId },
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    await prisma.board.delete({
      where: { id: board.id },
    });

    return res.status(204).send();
  } catch (err) {
    console.error('Delete board error ====>', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export { boardRoutes };
