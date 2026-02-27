import type { FormEvent, MouseEvent } from 'react';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toCardDndId, toListDndId } from '../../utils';
import CardsDropzone from '../CardsDropzone';
import SortableCard from '../SortableCard';
import AddCardButton from './AddCardButton';
import AddCardForm from './AddCardForm';
import ListHeader from './ListHeader';
import ListMeta from './ListMeta';
import { listColumnStyles } from './styles';

type ListColumnProps = {
  list: any;
  activeCardListId: number | null;
  newCardTitle: string;
  handleRenameList: (event: MouseEvent, listId: number, title: string) => void;
  handleDeleteList: (event: MouseEvent, listId: number, title: string) => void;
  onOpenCardDetails: (card: any, listId: number) => void;
  onAddCard: (event: FormEvent, listId: number) => void;
  onOpenAddCard: (listId: number) => void;
  onCancelAddCard: (listId: number) => void;
  onChangeCardTitle: (listId: number, value: string) => void;
};

function ListColumn({
  list,
  activeCardListId,
  newCardTitle,
  handleRenameList,
  handleDeleteList,
  onOpenCardDetails,
  onAddCard,
  onOpenAddCard,
  onCancelAddCard,
  onChangeCardTitle,
}: ListColumnProps) {
  const cards = list.cards || [];
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: toListDndId(list.id) });

  return (
    <div
      ref={setNodeRef}
      style={{
        ...listColumnStyles.column,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.75 : 1,
      }}
    >
      <ListHeader
        title={list.title}
        onRename={(event) => handleRenameList(event, list.id, list.title)}
        onDelete={(event) => handleDeleteList(event, list.id, list.title)}
        dragAttributes={attributes}
        dragListeners={listeners}
      />

      <ListMeta createdAt={list.createdAt} />

      <SortableContext
        items={cards.map((card: any) => toCardDndId(card.id))}
        strategy={verticalListSortingStrategy}
      >
        <CardsDropzone listId={list.id}>
          {cards.map((card: any) => (
            <SortableCard
              key={card.id}
              card={card}
              list={list}
              onOpenCardDetails={onOpenCardDetails}
            />
          ))}

          {activeCardListId === list.id ? (
            <AddCardForm
              listId={list.id}
              newCardTitle={newCardTitle}
              onAddCard={onAddCard}
              onCancelAddCard={onCancelAddCard}
              onChangeCardTitle={onChangeCardTitle}
            />
          ) : (
            <AddCardButton onOpenAddCard={() => onOpenAddCard(list.id)} />
          )}
        </CardsDropzone>
      </SortableContext>
    </div>
  );
}

export default ListColumn;
