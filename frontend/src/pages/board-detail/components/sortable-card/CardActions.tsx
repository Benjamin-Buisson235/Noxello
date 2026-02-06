import type { MouseEvent } from 'react';
import { sortableCardStyles } from './styles';

type CardActionsProps = {
  listId: number;
  card: any;
  cardIndex: number;
  cardsLength: number;
  onReorder: (listId: number, cardId: number, direction: 'up' | 'down') => void;
  onMove: (fromListId: number, card: any, direction: 'left' | 'right') => void;
  onDelete: (listId: number, card: any) => void;
};

function CardActions({
  listId,
  card,
  cardIndex,
  cardsLength,
  onReorder,
  onMove,
  onDelete,
}: CardActionsProps) {
  const stop = (event: MouseEvent | PointerEvent) => event.stopPropagation();

  return (
    <div style={sortableCardStyles.actionsRow}>
      <button
        type="button"
        className="button button-ghost"
        style={sortableCardStyles.actionButton}
        onClick={(event) => {
          stop(event);
          onReorder(listId, card.id, 'up');
        }}
        onPointerDown={stop}
        disabled={cardIndex === 0}
      >
        ↑
      </button>
      <button
        type="button"
        className="button button-ghost"
        style={sortableCardStyles.actionButton}
        onClick={(event) => {
          stop(event);
          onReorder(listId, card.id, 'down');
        }}
        onPointerDown={stop}
        disabled={cardIndex === cardsLength - 1}
      >
        ↓
      </button>
      <button
        type="button"
        className="button button-ghost"
        style={sortableCardStyles.actionButton}
        onClick={(event) => {
          stop(event);
          onMove(listId, card, 'left');
        }}
        onPointerDown={stop}
      >
        ◄
      </button>
      <button
        type="button"
        className="button button-ghost"
        style={sortableCardStyles.actionButton}
        onClick={(event) => {
          stop(event);
          onMove(listId, card, 'right');
        }}
        onPointerDown={stop}
      >
        ►
      </button>
      <button
        type="button"
        className="button button-ghost"
        style={sortableCardStyles.actionButton}
        onClick={(event) => {
          stop(event);
          onDelete(listId, card);
        }}
        onPointerDown={stop}
      >
        🗑
      </button>
    </div>
  );
}

export default CardActions;
