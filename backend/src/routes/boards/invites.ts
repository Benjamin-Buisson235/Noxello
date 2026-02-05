import { Router } from 'express';
import { prisma } from '../../prisma';
import { AuthRequest } from '../../authMiddleware';

export const registerInviteRoutes = (router: Router) => {
  router.get('/invites', async (req: AuthRequest, res) => {
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

  router.post('/invites/:inviteId/accept', async (req: AuthRequest, res) => {
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

  router.delete('/invites/:inviteId', async (req: AuthRequest, res) => {
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
};
