import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import api from '../../../api';

type UseBoardDataParams = {
  boardId?: string;
  user?: any;
};

type UseBoardDataResult = {
  board: any | null;
  lists: any[];
  boardLabels: any[];
  archivedLists: any[];
  loadingBoard: boolean;
  error: string | null;
  setLists: Dispatch<SetStateAction<any[]>>;
  setBoardLabels: Dispatch<SetStateAction<any[]>>;
  setArchivedLists: Dispatch<SetStateAction<any[]>>;
  fetchBoardFull: (options?: { silent?: boolean }) => Promise<void>;
  fetchBoardLabels: () => Promise<void>;
  fetchArchivedLists: () => Promise<void>;
};

export const useBoardData = ({ boardId, user }: UseBoardDataParams): UseBoardDataResult => {
  const [board, setBoard] = useState<any | null>(null);
  const [lists, setLists] = useState<any[]>([]);
  const [boardLabels, setBoardLabels] = useState<any[]>([]);
  const [archivedLists, setArchivedLists] = useState<any[]>([]);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoardFull = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!user || !boardId) return;
      const silent = options?.silent ?? false;
      try {
        if (!silent) {
          setLoadingBoard(true);
          setError(null);
        }
        const res = await api.get(`/boards/${boardId}/full`);
        setBoard(res.data.board);
        setLists(res.data.lists || []);
      } catch (err: any) {
        console.error('Fetch board full error ====>', err);
        if (!silent) {
          const status = err?.response?.status;
          if (status === 404) {
            setError("You don't have permission to view this board.");
          } else {
            setError('Unable to load this board.');
          }
        }
      } finally {
        if (!silent) {
          setLoadingBoard(false);
        }
      }
    },
    [boardId, user]
  );

  const fetchBoardLabels = useCallback(async () => {
    if (!user || !boardId) return;
    try {
      const res = await api.get(`/boards/${boardId}/labels`);
      setBoardLabels(res.data.labels || []);
    } catch (err: any) {
      console.error('Fetch labels error ====>', err);
    }
  }, [boardId, user]);

  const fetchArchivedLists = useCallback(async () => {
    if (!user || !boardId) return;
    try {
      const res = await api.get(`/boards/${boardId}/archived`);
      setArchivedLists(res.data.lists || []);
    } catch (err: any) {
      console.error('Fetch archived cards error ====>', err);
      setArchivedLists([]);
    }
  }, [boardId, user]);

  useEffect(() => {
    if (!user || !boardId) return;
    fetchBoardFull();
    fetchBoardLabels();
    fetchArchivedLists();

    const intervalId = window.setInterval(() => {
      fetchBoardFull({ silent: true });
      fetchBoardLabels();
      fetchArchivedLists();
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [boardId, fetchBoardFull, fetchBoardLabels, fetchArchivedLists, user]);

  return {
    board,
    lists,
    boardLabels,
    archivedLists,
    loadingBoard,
    error,
    setLists,
    setBoardLabels,
    setArchivedLists,
    fetchBoardFull,
    fetchBoardLabels,
    fetchArchivedLists,
  };
};
