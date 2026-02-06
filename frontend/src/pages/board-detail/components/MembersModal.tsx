import type { CSSProperties, FormEvent } from 'react';

type MembersModalProps = {
  open: boolean;
  members: any[];
  membersLoading: boolean;
  membersError: string;
  isOwner: boolean;
  inviteEmail: string;
  inviteMessage: string;
  inviteStatus: 'idle' | 'success' | 'error';
  onInviteEmailChange: (value: string) => void;
  onInviteSubmit: (event: FormEvent) => void;
  onRemoveMember: (userId: number) => void;
  onClose: () => void;
  overlayStyle: CSSProperties;
  dialogStyle: CSSProperties;
  dialogButtonsStyle: CSSProperties;
};

function MembersModal({
  open,
  members,
  membersLoading,
  membersError,
  isOwner,
  inviteEmail,
  inviteMessage,
  inviteStatus,
  onInviteEmailChange,
  onInviteSubmit,
  onRemoveMember,
  onClose,
  overlayStyle,
  dialogStyle,
  dialogButtonsStyle,
}: MembersModalProps) {
  if (!open) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(event) => event.stopPropagation()}>
        <h3 style={{ margin: 0, marginBottom: 12, fontSize: 18 }}>Members</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {membersLoading && (
            <span style={{ fontSize: 12, color: 'rgba(226,232,240,0.8)' }}>
              Loading members…
            </span>
          )}
          {!membersLoading && membersError && (
            <span style={{ fontSize: 12, color: 'rgba(248, 113, 113, 0.95)' }}>
              {membersError}
            </span>
          )}
          {!membersLoading && !membersError && members.length === 0 && (
            <span style={{ fontSize: 12, color: 'rgba(226,232,240,0.7)' }}>
              No members yet.
            </span>
          )}
          {!membersLoading &&
            members.map((member: any) => (
              <div
                key={member.userId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 10,
                  border: '1px solid rgba(157,78,221,0.35)',
                  backgroundColor: 'rgba(11, 15, 35, 0.6)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 12, color: '#f9f5ff' }}>
                    {member.name || 'Unnamed'}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(226,232,240,0.7)' }}>
                    {member.email}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {member.isOwner && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 999,
                        border: '1px solid rgba(125, 247, 200, 0.6)',
                        color: 'rgba(125, 247, 200, 0.95)',
                      }}
                    >
                      Owner
                    </span>
                  )}
                  {isOwner && !member.isOwner && (
                    <button
                      type="button"
                      className="button button-ghost"
                      onClick={() => onRemoveMember(member.userId)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>

        {isOwner && (
          <form
            onSubmit={onInviteSubmit}
            style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <label style={{ fontSize: 12, color: 'rgba(226,232,240,0.9)' }}>
              Invite by email
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(event) => onInviteEmailChange(event.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="button button-primary">
                Invite
              </button>
            </div>
            {inviteMessage && (
              <span
                style={{
                  fontSize: 12,
                  color:
                    inviteStatus === 'error'
                      ? 'rgba(248, 113, 113, 0.95)'
                      : 'rgba(125, 247, 200, 0.95)',
                }}
              >
                {inviteMessage}
              </span>
            )}
          </form>
        )}

        <div style={dialogButtonsStyle}>
          <button className="button button-ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default MembersModal;
