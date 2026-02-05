import { prisma } from '../../prisma';

export const getAccessibleBoard = async (boardId: number, userId: number) =>
  prisma.board.findFirst({
    where: {
      id: boardId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
  });

export const getOwnedBoard = async (boardId: number, userId: number) =>
  prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId: userId,
    },
  });

export const getListInBoard = async (listId: number, boardId: number) =>
  prisma.list.findFirst({
    where: {
      id: listId,
      boardId,
    },
  });

export const getCardInList = async (
  cardId: number,
  listId: number,
  boardId: number
) =>
  prisma.card.findFirst({
    where: {
      id: cardId,
      list: {
        id: listId,
        boardId,
      },
    },
  });
