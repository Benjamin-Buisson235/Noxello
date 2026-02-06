import React from 'react';

type BoardCardProps = {
  board: any;
  index: number;
  isOwner: boolean;
  onOpen: () => void;
  onRename: (event: React.MouseEvent) => void;
  onDelete: (event: React.MouseEvent) => void;
};

function BoardCard({ board, index, isOwner, onOpen, onRename, onDelete }: BoardCardProps) {
  return (
    <div
      className="board-card"
      onClick={onOpen}
      style={{
        minWidth: 220,
        maxWidth: 260,
        borderRadius: 12,
        padding: 10,
        background:
          'linear-gradient(145deg, rgba(55,10,98,0.96), rgba(92,28,168,0.96))',
        border: '1px solid rgba(199,125,255,0.75)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 8,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              marginBottom: 6,
              fontSize: 15,
              color: '#fdfcff',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {board.title}
          </h3>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 6px',
              borderRadius: 999,
              fontSize: 10,
              border: '1px solid rgba(199,125,255,0.55)',
              color: 'rgba(226,232,240,0.9)',
            }}
          >
            {isOwner ? 'Owned' : 'Shared'}
          </span>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(226,232,240,0.9)' }}>
            Position: {index}
          </p>
          <p
            style={{
              margin: 0,
              marginTop: 4,
              fontSize: 11,
              color: 'rgba(226,232,240,0.75)',
            }}
          >
            Created on{' '}
            {new Date(board.createdAt).toLocaleString('en-US', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button
            className="button button-ghost"
            style={{ padding: '3px 8px', fontSize: 11, lineHeight: 1 }}
            onClick={onRename}
          >
            Rename
          </button>
          <button
            className="button button-ghost"
            style={{ padding: '3px 8px', fontSize: 11, lineHeight: 1 }}
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default BoardCard;
