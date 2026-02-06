import React from 'react';

type BoardsHeaderProps = {
  userEmail: string;
  invitesCount: number;
  onOpenInvites: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
};

function BoardsHeader({
  userEmail,
  invitesCount,
  onOpenInvites,
  onOpenSettings,
  onLogout,
}: BoardsHeaderProps) {
  return (
    <header className="boards-header">
      <div>
        <h1 className="boards-title">Boards</h1>
        <p className="boards-user">Signed in as {userEmail}</p>
      </div>
      <div className="boards-toolbar">
        <button
          className="button button-ghost"
          onClick={onOpenInvites}
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            paddingRight: invitesCount > 0 ? 22 : undefined,
          }}
        >
          Invites
          {invitesCount > 0 && (
            <span
              aria-label="Pending invites"
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'var(--lavender-purple)',
                boxShadow: '0 0 0 3px rgba(123, 44, 191, 0.35)',
              }}
            />
          )}
        </button>
        <button className="button button-ghost" onClick={onOpenSettings}>
          Settings
        </button>
        <button className="button button-ghost" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default BoardsHeader;
