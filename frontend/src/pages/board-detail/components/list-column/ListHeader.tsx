import type { HTMLAttributes, MouseEvent } from 'react';
import { listColumnStyles } from './styles';

type ListHeaderProps = {
  title: string;
  onRename: (event: MouseEvent) => void;
  onDelete: (event: MouseEvent) => void;
  dragAttributes?: HTMLAttributes<HTMLHeadingElement>;
  dragListeners?: HTMLAttributes<HTMLHeadingElement>;
};

function ListHeader({
  title,
  onRename,
  onDelete,
  dragAttributes,
  dragListeners,
}: ListHeaderProps) {
  return (
    <div style={listColumnStyles.header}>
      <h3
        style={{ ...listColumnStyles.title, cursor: 'grab' }}
        {...dragAttributes}
        {...dragListeners}
      >
        {title}
      </h3>
      <div style={listColumnStyles.actionsRow}>
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
