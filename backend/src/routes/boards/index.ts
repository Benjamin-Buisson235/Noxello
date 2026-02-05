import { Router } from 'express';
import { requireAuth } from '../../authMiddleware';
import { registerInviteRoutes } from './invites';
import { registerBoardRoutes } from './boards';
import { registerMemberRoutes } from './members';
import { registerListRoutes } from './lists';
import { registerLabelRoutes } from './labels';
import { registerCardRoutes } from './cards';
import { registerChecklistRoutes } from './checklists';
import { registerCommentRoutes } from './comments';
import { registerArchiveRoutes } from './archive';

const boardRoutes = Router();

boardRoutes.use(requireAuth);

registerInviteRoutes(boardRoutes);
registerBoardRoutes(boardRoutes);
registerMemberRoutes(boardRoutes);
registerListRoutes(boardRoutes);
registerLabelRoutes(boardRoutes);
registerCardRoutes(boardRoutes);
registerChecklistRoutes(boardRoutes);
registerCommentRoutes(boardRoutes);
registerArchiveRoutes(boardRoutes);

export { boardRoutes };
