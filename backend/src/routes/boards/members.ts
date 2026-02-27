import { Router } from 'express';
import { prisma } from '../../prisma';
import { AuthRequest } from '../../authMiddleware';
import { getAccessibleBoard, getOwnedBoard } from './utils';

export const registerMemberRoutes = (router: Router) => {
  router.get('/:id/members', async (req: AuthRequest, res) => {
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

  router.post('/:id/invite', async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const boardId = Number(req.params.id);
      const { email } = req.body;

      if (!email || String(email).trim() === '') {
        return res.status(400).json({ message: 'Email is required' });
      }

      const board = await getOwnedBoard(boardId, userId);
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

  router.delete('/:id/members/:userId', async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const boardId = Number(req.params.id);
      const memberUserId = Number(req.params.userId);

      if (Number.isNaN(boardId) || Number.isNaN(memberUserId)) {
        return res.status(400).json({ message: 'Invalid board or member id' });
      }

      if (memberUserId === userId) {
        const board = await getAccessibleBoard(boardId, userId);
        if (!board) {
          return res.status(404).json({ message: 'Board not found' });
        }
        if (board.ownerId === userId) {
          return res.status(400).json({ message: 'Cannot remove the owner' });
        }

        const membership = await prisma.boardMember.findFirst({
          where: { boardId, userId },
        });
        if (!membership) {
          return res.status(404).json({ message: 'Member not found' });
        }

        await prisma.boardMember.delete({
          where: { boardId_userId: { boardId, userId } },
        });
        return res.status(204).send();
      }

      const board = await getOwnedBoard(boardId, userId);
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
};
