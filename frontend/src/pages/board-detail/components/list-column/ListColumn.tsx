import type { FormEvent, MouseEvent } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { toCardDndId } from '../../utils';
import CardsDropzone from '../CardsDropzone';
import SortableCard from '../SortableCard';
import AddCardButton from './AddCardButton';
import AddCardForm from './AddCardForm';
import ListHeader from './ListHeader';
import ListMeta from './ListMeta';
import { listColumnStyles } from './styles';

type ListColumnProps = {
  list: any;
  listIndex: number;
  lists: any[];
  activeCardListId: number | null;
  newCardTitle: string;
  handleReorderLists: (listId: number, direction: 'left' | 'right') => void;
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
  listIndex,
  lists,
  activeCardListId,
  newCardTitle,
  handleReorderLists,
  handleRenameList,
  handleDeleteList,
  onOpenCardDetails,
  onAddCard,
  onOpenAddCard,
  onCancelAddCard,
  onChangeCardTitle,
}: ListColumnProps) {
  const cards = list.cards || [];

  return (
    <div style={listColumnStyles.column}>
      <ListHeader
        title={list.title}
        listIndex={listIndex}
        listsLength={lists.length}
        onMoveLeft={() => handleReorderLists(list.id, 'left')}
        onMoveRight={() => handleReorderLists(list.id, 'right')}
        onRename={(event) => handleRenameList(event, list.id, list.title)}
        onDelete={(event) => handleDeleteList(event, list.id, list.title)}
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
