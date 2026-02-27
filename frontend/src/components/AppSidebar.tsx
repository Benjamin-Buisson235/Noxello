import type { ReactNode } from 'react';

type AppSidebarProps = {
  boards: any[];
  activeBoardId?: number | null;
  userName?: string | null;
  userEmail?: string | null;
  onHome: () => void;
  onSelectBoard: (id: number) => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onOpenInvites?: () => void;
  invitesCount?: number;
  topContent?: ReactNode;
};

function AppSidebar({
  boards,
  activeBoardId,
  userName,
  userEmail,
  onHome,
  onSelectBoard,
  onOpenSettings,
  onLogout,
  onOpenInvites,
  invitesCount = 0,
  topContent,
}: AppSidebarProps) {
  const displayName = userName?.trim() || userEmail || 'Unknown user';

  return (
    <aside className="app-sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="sidebar-brand-title">Noxello</div>
          <div className="sidebar-brand-divider" />
          <div className="sidebar-user">Signed in as {displayName}</div>
        </div>
        <button
          type="button"
          className={`sidebar-item${activeBoardId == null ? ' active' : ''}`}
          onClick={onHome}
        >
          Home
        </button>
        {onOpenInvites && (
          <button type="button" className="sidebar-item" onClick={onOpenInvites}>
            Invites
            {invitesCount > 0 && <span className="sidebar-badge" />}
          </button>
        )}
        {topContent}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Boards</div>
        <div className="sidebar-list">
          {boards.length === 0 ? (
            <span className="sidebar-muted">No boards yet.</span>
          ) : (
            boards.map((board: any) => (
              <button
                key={board.id}
                type="button"
                className={`sidebar-item${activeBoardId === board.id ? ' active' : ''}`}
                onClick={() => onSelectBoard(board.id)}
                title={board.title}
              >
                <span className="sidebar-item-title">{board.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="sidebar-bottom">
        <button type="button" className="sidebar-item" onClick={onOpenSettings}>
          Settings
        </button>
        <button type="button" className="sidebar-item" onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default AppSidebar;
