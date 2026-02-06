import type { CSSProperties } from 'react';

type InvitesModalProps = {
  open: boolean;
  invites: any[];
  loading: boolean;
  error: string;
  onAccept: (inviteId: number) => void;
  onDecline: (inviteId: number) => void;
  onClose: () => void;
  overlayStyle: CSSProperties;
  dialogStyle: CSSProperties;
  dialogButtonsStyle: CSSProperties;
};

function InvitesModal({
  open,
  invites,
  loading,
  error,
  onAccept,
  onDecline,
  onClose,
  overlayStyle,
  dialogStyle,
  dialogButtonsStyle,
}: InvitesModalProps) {
  if (!open) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(event) => event.stopPropagation()}>
        <h3 style={{ margin: 0, marginBottom: 12, fontSize: 18 }}>Invites</h3>
        {loading ? (
          <p>Loading invites…</p>
        ) : invites.length === 0 ? (
          <p className="text-muted">No pending invites.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {invites.map((invite: any) => (
              <div
                key={invite.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 12,
                  background:
                    'linear-gradient(145deg, rgba(38,10,80,0.9), rgba(52,18,120,0.9))',
                  border: '1px solid rgba(199,125,255,0.65)',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, color: '#fdfcff' }}>
                    {invite.boardTitle}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.8)' }}>
                    Invited by {invite.inviter?.name || invite.inviter?.email || 'Unknown'} (
                    {invite.inviter?.email || 'no email'})
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="button button-primary"
                    onClick={() => onAccept(invite.id)}
                  >
                    Accept
                  </button>
                  <button
                    className="button button-ghost"
                    onClick={() => onDecline(invite.id)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {error && <div className="text-error">{error}</div>}
        <div style={dialogButtonsStyle}>
          <button className="button button-ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvitesModal;
