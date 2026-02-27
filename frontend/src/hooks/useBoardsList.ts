import { useCallback, useEffect, useState } from 'react';
import api from '../api';

type UseBoardsListParams = {
  user?: any;
};

type UseBoardsListResult = {
  boards: any[];
  loading: boolean;
  refreshBoards: (options?: { silent?: boolean }) => Promise<void>;
};

export const useBoardsList = ({ user }: UseBoardsListParams): UseBoardsListResult => {
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshBoards = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    try {
      if (!silent) {
        setLoading(true);
      }
      const res = await api.get('/boards');
      setBoards(res.data.boards || []);
    } catch (err) {
      console.error('Fetch boards error ====>', err);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    refreshBoards();

    const intervalId = window.setInterval(() => {
      refreshBoards({ silent: true });
    }, 20000);

    return () => window.clearInterval(intervalId);
  }, [refreshBoards, user]);

  return { boards, loading, refreshBoards };
};
