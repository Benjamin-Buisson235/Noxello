import React from 'react';
import { sortableCardStyles } from './styles';

type CardHeaderProps = {
  title: string;
  onEdit: () => void;
};

function CardHeader({ title, onEdit }: CardHeaderProps) {
  return (
    <div style={sortableCardStyles.header}>
      <span>{title}</span>
      <button
        type="button"
        className="button button-ghost"
        style={sortableCardStyles.editButton}
        onClick={(event) => {
          event.stopPropagation();
          onEdit();
        }}
        onPointerDown={(event) => event.stopPropagation()}
        title="Edit card"
      >
        ✎
      </button>
    </div>
  );
}

export default CardHeader;
