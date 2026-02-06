import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import api from '../../../api';

type UseMembersParams = {
  boardId?: string;
  enabled: boolean;
};

type InviteStatus = 'idle' | 'success' | 'error';

type UseMembersResult = {
  showMembersModal: boolean;
  members: any[];
  membersLoading: boolean;
  membersError: string;
  inviteEmail: string;
  inviteStatus: InviteStatus;
  inviteMessage: string;
  setInviteEmail: (value: string) => void;
  openMembers: () => void;
  closeMembers: () => void;
  inviteMember: (event: FormEvent) => Promise<void>;
  removeMember: (memberUserId: number) => Promise<void>;
};

export const useMembers = ({ boardId, enabled }: UseMembersParams): UseMembersResult => {
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>('idle');
  const [inviteMessage, setInviteMessage] = useState('');

  const fetchMembers = useCallback(async () => {
    if (!enabled || !boardId) return;
    try {
      setMembersLoading(true);
      setMembersError('');
      const res = await api.get(`/boards/${boardId}/members`);
      setMembers(res.data.members || []);
    } catch (err) {
      console.error('Fetch members error ====>', err);
      setMembersError('Unable to load members.');
    } finally {
      setMembersLoading(false);
    }
  }, [boardId, enabled]);

  const openMembers = useCallback(() => {
    setShowMembersModal(true);
    setInviteStatus('idle');
    setInviteMessage('');
    fetchMembers();
  }, [fetchMembers]);

  const closeMembers = useCallback(() => {
    setShowMembersModal(false);
    setInviteStatus('idle');
    setInviteMessage('');
  }, []);

  const inviteMember = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!inviteEmail.trim()) {
        setInviteStatus('error');
        setInviteMessage('Email is required.');
        return;
      }
      if (!enabled || !boardId) return;

      try {
        setInviteStatus('idle');
        setInviteMessage('');
        await api.post(`/boards/${boardId}/invite`, { email: inviteEmail.trim() });
        setInviteEmail('');
        setInviteStatus('success');
        setInviteMessage('Invite sent.');
        fetchMembers();
      } catch (err) {
        console.error('Invite member error ====>', err);
        const message =
          err?.response?.data?.message || 'Unable to invite this user.';
        setInviteStatus('error');
        setInviteMessage(message);
      }
    },
    [boardId, enabled, fetchMembers, inviteEmail]
  );

  const removeMember = useCallback(
    async (memberUserId: number) => {
      if (!enabled || !boardId) return;
      try {
        await api.delete(`/boards/${boardId}/members/${memberUserId}`);
        fetchMembers();
      } catch (err) {
        console.error('Remove member error ====>', err);
      }
    },
    [boardId, enabled, fetchMembers]
  );

  return {
    showMembersModal,
    members,
    membersLoading,
    membersError,
    inviteEmail,
    inviteStatus,
    inviteMessage,
    setInviteEmail,
    openMembers,
    closeMembers,
    inviteMember,
    removeMember,
  };
};
