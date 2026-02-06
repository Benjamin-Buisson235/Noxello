import React from 'react';
import { listColumnStyles } from './styles';

type ListHeaderProps = {
  title: string;
  listIndex: number;
  listsLength: number;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRename: (event: React.MouseEvent) => void;
  onDelete: (event: React.MouseEvent) => void;
};

function ListHeader({
  title,
  listIndex,
  listsLength,
  onMoveLeft,
  onMoveRight,
  onRename,
  onDelete,
}: ListHeaderProps) {
  return (
    <div style={listColumnStyles.header}>
      <h3 style={listColumnStyles.title}>{title}</h3>
      <div style={listColumnStyles.actionsRow}>
        <div style={listColumnStyles.actionsGroup}>
          <button
            className="button button-ghost"
            style={listColumnStyles.actionButton}
            onClick={onMoveLeft}
            disabled={listIndex === 0}
          >
            ←
          </button>
          <button
            className="button button-ghost"
            style={listColumnStyles.actionButton}
            onClick={onMoveRight}
            disabled={listIndex === listsLength - 1}
          >
            →
          </button>
        </div>
        <button
          className="button button-ghost"
          style={listColumnStyles.actionButton}
          onClick={onRename}
        >
          Rename
        </button>
        <button
          className="button button-ghost"
          style={listColumnStyles.actionButton}
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default ListHeader;
