import { useCallback, useEffect, useState } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import api from '../../../api';

type UseBoardsDataParams = {
  user?: any;
};

type UseBoardsDataResult = {
  boards: any[];
  invites: any[];
  newTitle: string;
  error: string | null;
  invitesError: string;
  loadingBoards: boolean;
  loadingInvites: boolean;
  boardToDelete: number | null;
  setNewTitle: (value: string) => void;
  handleCreateBoard: (event: FormEvent) => Promise<void>;
  handleRenameBoard: (event: MouseEvent, id: number, title: string) => Promise<void>;
  handleDeleteBoard: (event: MouseEvent, id: number) => void;
  confirmDeleteBoard: () => Promise<void>;
  cancelDeleteBoard: () => void;
  handleAcceptInvite: (inviteId: number) => Promise<void>;
  handleDeclineInvite: (inviteId: number) => Promise<void>;
};

export const useBoardsData = ({ user }: UseBoardsDataParams): UseBoardsDataResult => {
  const [boards, setBoards] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [invitesError, setInvitesError] = useState('');
  const [boardToDelete, setBoardToDelete] = useState<number | null>(null);

  const fetchBoards = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    try {
      if (!silent) {
        setLoadingBoards(true);
        setError(null);
      }
      const res = await api.get('/boards');
      setBoards(res.data.boards || []);
    } catch (err) {
      console.error('Fetch boards error ====>', err);
      if (!silent) {
        setError('Unable to load boards.');
      }
    } finally {
      if (!silent) {
        setLoadingBoards(false);
      }
    }
  }, []);

  const fetchInvites = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    try {
      if (!silent) {
        setLoadingInvites(true);
        setInvitesError('');
      }
      const res = await api.get('/boards/invites');
      setInvites(res.data.invites || []);
    } catch (err) {
      console.error('Fetch invites error ====>', err);
      if (!silent) {
        setInvitesError('Unable to load invites.');
      }
    } finally {
      if (!silent) {
        setLoadingInvites(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchBoards();
    fetchInvites();

    const intervalId = window.setInterval(() => {
      fetchBoards({ silent: true });
      fetchInvites({ silent: true });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [fetchBoards, fetchInvites, user]);

  const handleCreateBoard = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setError(null);

      if (!newTitle.trim()) {
        setError('Title is required.');
        return;
      }

      try {
        const res = await api.post('/boards', { title: newTitle.trim() });
        const board = res.data.board;
        setBoards((prev) => [...prev, board]);
        setNewTitle('');
      } catch (err) {
        console.error('Create board error ====>', err);
        setError('Unable to create board.');
      }
    },
    [newTitle]
  );

  const handleRenameBoard = useCallback(
    async (event: MouseEvent, id: number, currentTitle: string) => {
      event.stopPropagation();

      const newTitle = window.prompt('New board title', currentTitle);
      if (!newTitle || newTitle.trim() === '' || newTitle.trim() === currentTitle) {
        return;
      }

      try {
        const res = await api.put(`/boards/${id}`, { title: newTitle.trim() });
        const updated = res.data.board;
        setBoards((prev) =>
          prev.map((board: any) =>
            board.id === id ? { ...board, title: updated.title } : board
          )
        );
      } catch (err) {
        console.error('Rename board error ====>', err);
        setError('Unable to rename board.');
      }
    },
    []
  );

  const handleDeleteBoard = useCallback((event: MouseEvent, id: number) => {
    event.stopPropagation();
    setBoardToDelete(id);
  }, []);

  const confirmDeleteBoard = useCallback(async () => {
    if (boardToDelete == null) return;
    try {
      await api.delete(`/boards/${boardToDelete}`);
      setBoards((prev) => prev.filter((board: any) => board.id !== boardToDelete));
    } catch (err) {
      console.error('Delete board error ====>', err);
      setError('Unable to delete board.');
    } finally {
      setBoardToDelete(null);
    }
  }, [boardToDelete]);

  const cancelDeleteBoard = useCallback(() => {
    setBoardToDelete(null);
  }, []);

  const handleAcceptInvite = useCallback(async (inviteId: number) => {
    try {
      await api.post(`/boards/invites/${inviteId}/accept`);
      setInvites((prev) => prev.filter((invite: any) => invite.id !== inviteId));
      const res = await api.get('/boards');
      setBoards(res.data.boards || []);
    } catch (err) {
      console.error('Accept invite error ====>', err);
      setInvitesError('Unable to accept invite.');
    }
  }, []);

  const handleDeclineInvite = useCallback(async (inviteId: number) => {
    try {
      await api.delete(`/boards/invites/${inviteId}`);
      setInvites((prev) => prev.filter((invite: any) => invite.id !== inviteId));
    } catch (err) {
      console.error('Decline invite error ====>', err);
      setInvitesError('Unable to decline invite.');
    }
  }, []);

  return {
    boards,
    invites,
    newTitle,
    error,
    invitesError,
    loadingBoards,
    loadingInvites,
    boardToDelete,
    setNewTitle,
    handleCreateBoard,
    handleRenameBoard,
    handleDeleteBoard,
    confirmDeleteBoard,
    cancelDeleteBoard,
    handleAcceptInvite,
    handleDeclineInvite,
  };
};
