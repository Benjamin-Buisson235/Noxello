import { useCallback, useEffect, useState } from 'react';
import api from '../api';

type UseInvitesParams = {
  user?: any;
  pollIntervalMs?: number;
};

type UseInvitesResult = {
  invites: any[];
  loading: boolean;
  error: string;
  refreshInvites: (options?: { silent?: boolean }) => Promise<void>;
  acceptInvite: (inviteId: number) => Promise<number | null>;
  declineInvite: (inviteId: number) => Promise<void>;
};

export const useInvites = ({
  user,
  pollIntervalMs = 15000,
}: UseInvitesParams): UseInvitesResult => {
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshInvites = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    try {
      if (!silent) {
        setLoading(true);
        setError('');
      }
      const res = await api.get('/boards/invites');
      setInvites(res.data.invites || []);
    } catch (err) {
      console.error('Fetch invites error ====>', err);
      if (!silent) {
        setError('Unable to load invites.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    refreshInvites();

    const intervalId = window.setInterval(() => {
      refreshInvites({ silent: true });
    }, pollIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [pollIntervalMs, refreshInvites, user]);

  const acceptInvite = useCallback(async (inviteId: number) => {
    try {
      const res = await api.post(`/boards/invites/${inviteId}/accept`);
      setInvites((prev) => prev.filter((invite: any) => invite.id !== inviteId));
      return res.data?.boardId ?? null;
    } catch (err) {
      console.error('Accept invite error ====>', err);
      setError('Unable to accept invite.');
      return null;
    }
  }, []);

  const declineInvite = useCallback(async (inviteId: number) => {
    try {
      await api.delete(`/boards/invites/${inviteId}`);
      setInvites((prev) => prev.filter((invite: any) => invite.id !== inviteId));
    } catch (err) {
      console.error('Decline invite error ====>', err);
      setError('Unable to decline invite.');
    }
  }, []);

  return {
    invites,
    loading,
    error,
    refreshInvites,
    acceptInvite,
    declineInvite,
  };
};
