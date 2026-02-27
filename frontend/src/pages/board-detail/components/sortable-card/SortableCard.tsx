import type { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toCardDndId, toDateInputValue, toLocalDateString } from '../../utils';
import CardHeader from './CardHeader';
import CardLabels from './CardLabels';
import ChecklistBadge from './ChecklistBadge';
import DueDateBadge from './DueDateBadge';
import { sortableCardStyles } from './styles';

type SortableCardProps = {
  card: any;
  list: any;
  onOpenCardDetails: (card: any, listId: number) => void;
};

function SortableCard({
  card,
  list,
  onOpenCardDetails,
}: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: toCardDndId(card.id) });

  const cardStyle: CSSProperties = {
    ...sortableCardStyles.card,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    cursor: 'pointer',
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
      {...attributes}
      {...listeners}
      className={`card-item${isDragging ? ' card-item--dragging' : ''}`}
      style={cardStyle}
      onClick={() => onOpenCardDetails(card, list.id)}
    >
      <div style={sortableCardStyles.content}>
        <CardHeader
          title={card.title}
          onEdit={() => onOpenCardDetails(card, list.id)}
          showEditButton={false}
        />
        <div style={sortableCardStyles.content}>
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
