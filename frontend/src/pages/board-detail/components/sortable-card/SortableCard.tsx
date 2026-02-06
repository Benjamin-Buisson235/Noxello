import type { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toCardDndId, toDateInputValue, toLocalDateString } from '../../utils';
import CardActions from './CardActions';
import CardHeader from './CardHeader';
import CardLabels from './CardLabels';
import ChecklistBadge from './ChecklistBadge';
import DueDateBadge from './DueDateBadge';
import { sortableCardStyles } from './styles';

type SortableCardProps = {
  card: any;
  list: any;
  cardIndex: number;
  cardsLength: number;
  dragEnabled: boolean;
  handleReorderCard: (listId: number, cardId: number, direction: 'up' | 'down') => void;
  handleMoveCard: (fromListId: number, card: any, direction: 'left' | 'right') => void;
  handleDeleteCard: (listId: number, card: any) => void;
  onOpenCardDetails: (card: any, listId: number) => void;
};

function SortableCard({
  card,
  list,
  cardIndex,
  cardsLength,
  dragEnabled,
  handleReorderCard,
  handleMoveCard,
  handleDeleteCard,
  onOpenCardDetails,
}: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: toCardDndId(card.id) });

  const cardStyle: CSSProperties = {
    ...sortableCardStyles.card,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    cursor: dragEnabled ? 'grab' : 'default',
  };

  const dueDateLabel = toDateInputValue(card.dueDate);
  const todayLabel = toLocalDateString(new Date());
  const isOverdue = !!dueDateLabel && dueDateLabel < todayLabel;
  const cardLabels = (card.cardLabels || [])
    .map((entry: any) => entry.label)
    .filter(Boolean);

  return (
    <div
      ref={setNodeRef}
      {...(dragEnabled ? attributes : {})}
      {...(dragEnabled ? listeners : {})}
      style={cardStyle}
    >
      <div style={sortableCardStyles.content}>
        <CardHeader
          title={card.title}
          onEdit={() => onOpenCardDetails(card, list.id)}
        />
        <div style={sortableCardStyles.content}>
          {!dragEnabled && (
            <CardActions
              listId={list.id}
              card={card}
              cardIndex={cardIndex}
              cardsLength={cardsLength}
              onReorder={handleReorderCard}
              onMove={handleMoveCard}
              onDelete={handleDeleteCard}
            />
          )}
          <CardLabels labels={cardLabels} />
          {dueDateLabel && <DueDateBadge label={dueDateLabel} isOverdue={isOverdue} />}
          {card.checklistStats && (
            <ChecklistBadge
              done={card.checklistStats.done}
              total={card.checklistStats.total}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default SortableCard;
