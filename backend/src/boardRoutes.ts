import { Router } from 'express';
import { prisma } from './prisma';
import { requireAuth, AuthRequest } from './authMiddleware';

const boardRoutes = Router();

boardRoutes.use(requireAuth);

const getAccessibleBoard = async (boardId: number, userId: number) =>
  prisma.board.findFirst({
    where: {
      id: boardId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
  });

boardRoutes.get('/', async (req: AuthRequest, res) => {
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

boardRoutes.get('/invites', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const invites = await prisma.boardInvite.findMany({
      where: { inviteeId: userId },
      orderBy: { createdAt: 'asc' },
      include: {
        board: { select: { id: true, title: true } },
        inviter: { select: { id: true, name: true, email: true } },
      },
    });

    return res.json({
      invites: invites.map((invite: any) => ({
        id: invite.id,
        boardId: invite.boardId,
        boardTitle: invite.board.title,
        inviter: invite.inviter,
        createdAt: invite.createdAt,
      })),
    });
  } catch (err) {
    console.error('Get invites error ====>', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

boardRoutes.post('/invites/:inviteId/accept', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const inviteId = Number(req.params.inviteId);

    const invite = await prisma.boardInvite.findFirst({
      where: { id: inviteId, inviteeId: userId },
      include: { board: { select: { id: true, title: true } } },
    });
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    await prisma.$transaction([
      prisma.boardMember.upsert({
        where: { boardId_userId: { boardId: invite.boardId, userId } },
        update: {},
        create: { boardId: invite.boardId, userId, role: 'MEMBER' },
      }),
      prisma.boardInvite.delete({ where: { id: invite.id } }),
    ]);

    return res.json({ boardId: invite.boardId, boardTitle: invite.board.title });
  } catch (err) {
    console.error('Accept invite error ====>', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

boardRoutes.delete('/invites/:inviteId', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const inviteId = Number(req.params.inviteId);

    const invite = await prisma.boardInvite.findFirst({
      where: { id: inviteId, inviteeId: userId },
    });
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    await prisma.boardInvite.delete({ where: { id: invite.id } });
    return res.status(204).send();
  } catch (err) {
    console.error('Decline invite error ====>', err);
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

boardRoutes.post('/:id/lists', async (req: AuthRequest, res) => {
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

boardRoutes.get('/:boardId/labels', async (req: AuthRequest, res) => {
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

boardRoutes.post('/:boardId/labels', async (req: AuthRequest, res) => {
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

boardRoutes.put('/:boardId/lists/:listId', async (req: AuthRequest, res) => {
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

    const board = await getAccessibleBoard(boardId, userId);

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

      const board = await getAccessibleBoard(boardId, userId);
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

      const board = await getAccessibleBoard(boardId, userId);
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

      const board = await getAccessibleBoard(boardId, userId);
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

boardRoutes.patch(
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

boardRoutes.put(
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

boardRoutes.get(
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

boardRoutes.post(
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

boardRoutes.patch(
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

boardRoutes.delete(
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

boardRoutes.patch(
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

boardRoutes.get(
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

boardRoutes.post(
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

boardRoutes.delete(
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

boardRoutes.patch(
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

boardRoutes.patch(
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

boardRoutes.get('/:boardId/archived', async (req: AuthRequest, res) => {
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

      const board = await getAccessibleBoard(boardId, userId);
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

boardRoutes.put(
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

      const sourceList = await prisma.list.findFirst({
        where: { id: sourceListId, boardId: sourceBoardId },
      });
      if (!sourceList) {
        return res.status(404).json({ message: 'List not found' });
      }

      const card = await prisma.card.findFirst({
        where: {
          id: cardId,
          list: {
            id: sourceListId,
            boardId: sourceBoardId,
          },
        },
      });
      if (!card) {
        return res.status(404).json({ message: 'Card not found' });
      }

      const targetList = await prisma.list.findFirst({
        where: { id: parsedTargetListId, boardId: parsedTargetBoardId },
      });
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

boardRoutes.delete(
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

boardRoutes.get('/:id/full', async (req: AuthRequest, res) => {
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

boardRoutes.get('/:id/move-targets', async (req: AuthRequest, res) => {
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
        : [boards[currentIndex], ...boards.slice(0, currentIndex), ...boards.slice(currentIndex + 1)];

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

boardRoutes.get('/:id/members', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const boardId = Number(req.params.id);

    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const ownerEntry = {
      userId: board.owner.id,
      name: board.owner.name,
      email: board.owner.email,
      role: 'OWNER',
      isOwner: true,
    };

    const memberEntries = board.members
      .filter((member: any) => member.userId !== board.ownerId)
      .map((member: any) => ({
        userId: member.userId,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
        isOwner: false,
      }));

    return res.json({ members: [ownerEntry, ...memberEntries] });
  } catch (err) {
    console.error('Get board members error ====>', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

boardRoutes.post('/:id/invite', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const boardId = Number(req.params.id);
    const { email } = req.body;

    if (!email || String(email).trim() === '') {
      return res.status(400).json({ message: 'Email is required' });
    }

    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: userId },
    });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const targetEmail = String(email).trim();
    const user = await prisma.user.findFirst({
      where: { email: { equals: targetEmail, mode: 'insensitive' } },
      select: { id: true, name: true, email: true },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.id === userId) {
      return res.status(400).json({ message: 'Cannot invite yourself' });
    }

    const existingMember = await prisma.boardMember.findFirst({
      where: { boardId, userId: user.id },
    });
    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    const invite = await prisma.boardInvite.upsert({
      where: { boardId_inviteeId: { boardId, inviteeId: user.id } },
      update: {},
      create: { boardId, inviterId: userId, inviteeId: user.id },
    });

    return res.status(201).json({
      invite: {
        id: invite.id,
        boardId: invite.boardId,
        inviteeId: invite.inviteeId,
        inviterId: invite.inviterId,
        createdAt: invite.createdAt,
      },
    });
  } catch (err) {
    console.error('Invite member error ====>', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

boardRoutes.delete('/:id/members/:userId', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const boardId = Number(req.params.id);
    const memberUserId = Number(req.params.userId);

    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: userId },
    });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (memberUserId === board.ownerId) {
      return res.status(400).json({ message: 'Cannot remove the owner' });
    }

    const membership = await prisma.boardMember.findFirst({
      where: { boardId, userId: memberUserId },
    });
    if (!membership) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await prisma.boardMember.delete({
      where: { boardId_userId: { boardId, userId: memberUserId } },
    });

    return res.status(204).send();
  } catch (err) {
    console.error('Remove member error ====>', err);
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

    await prisma.$transaction([
      prisma.list.deleteMany({ where: { boardId: board.id } }),
      prisma.board.delete({ where: { id: board.id } }),
    ]);

    return res.status(204).send();
  } catch (err) {
    console.error('Delete board error ====>', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export { boardRoutes };
