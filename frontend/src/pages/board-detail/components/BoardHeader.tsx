import React from 'react';

type BoardHeaderProps = {
  board: any;
  onBack: () => void;
  onMembers: () => void;
  onLogout: () => void;
};

function BoardHeader({ board, onBack, onMembers, onLogout }: BoardHeaderProps) {
  return (
    <header className="boards-header">
      <div>
        <h1 className="boards-title">{board.title}</h1>
        <p className="boards-user">
          Board #{board.id} — created on{' '}
          {new Date(board.createdAt).toLocaleString('en-US', {
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </p>
      </div>
      <div className="boards-toolbar">
        <button className="button button-ghost" onClick={onBack}>
          Back to boards
        </button>
        <button className="button button-ghost" onClick={onMembers}>
          Members
        </button>
        <button className="button button-ghost" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default BoardHeader;
