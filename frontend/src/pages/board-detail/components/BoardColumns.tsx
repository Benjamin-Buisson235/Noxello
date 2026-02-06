import React from 'react';
import ListColumn from './ListColumn';

type BoardColumnsProps = {
  filteredLists: any[];
  lists: any[];
  dragEnabled: boolean;
  activeCardListId: number | null;
  newCardTitleByList: Record<number, string>;
  handleReorderLists: (listId: number, direction: 'left' | 'right') => void;
  handleRenameList: (event: React.MouseEvent, listId: number, title: string) => void;
  handleDeleteList: (event: React.MouseEvent, listId: number, title: string) => void;
  handleReorderCard: (listId: number, cardId: number, direction: 'up' | 'down') => void;
  handleMoveCard: (fromListId: number, card: any, direction: 'left' | 'right') => void;
  handleDeleteCard: (listId: number, card: any) => void;
  onOpenCardDetails: (card: any, listId: number) => void;
  onAddCard: (event: React.FormEvent, listId: number) => void;
  onOpenAddCard: (listId: number) => void;
  onCancelAddCard: (listId: number) => void;
  onChangeCardTitle: (listId: number, value: string) => void;
  columnsScrollRef: React.RefObject<HTMLDivElement>;
  isAddingList: boolean;
  newListTitle: string;
  onCreateList: (event: React.FormEvent) => void;
  onStartAddList: () => void;
  onCancelAddList: () => void;
  onChangeNewListTitle: (value: string) => void;
};

function BoardColumns({
  filteredLists,
  lists,
  dragEnabled,
  activeCardListId,
  newCardTitleByList,
  handleReorderLists,
  handleRenameList,
  handleDeleteList,
  handleReorderCard,
  handleMoveCard,
  handleDeleteCard,
  onOpenCardDetails,
  onAddCard,
  onOpenAddCard,
  onCancelAddCard,
  onChangeCardTitle,
  columnsScrollRef,
  isAddingList,
  newListTitle,
  onCreateList,
  onStartAddList,
  onCancelAddList,
  onChangeNewListTitle,
}: BoardColumnsProps) {
  return (
    <section className="card">
      <h2 style={{ marginTop: 0, fontSize: 18 }}>Board columns</h2>
      {lists.length === 0 && (
        <p className="text-muted" style={{ marginTop: 4 }}>
          No columns yet. Create one above to start organizing your board.
        </p>
      )}
      <div
        ref={columnsScrollRef}
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          alignItems: 'flex-start',
          paddingBottom: 4,
          marginTop: 8,
        }}
      >
        {filteredLists.map((list: any, listIndex: number) => (
          <ListColumn
            key={list.id}
            list={list}
            listIndex={listIndex}
            lists={lists}
            dragEnabled={dragEnabled}
            activeCardListId={activeCardListId}
            newCardTitle={newCardTitleByList[list.id] || ''}
            handleReorderLists={handleReorderLists}
            handleRenameList={handleRenameList}
            handleDeleteList={handleDeleteList}
            handleReorderCard={handleReorderCard}
            handleMoveCard={handleMoveCard}
            handleDeleteCard={handleDeleteCard}
            onOpenCardDetails={onOpenCardDetails}
            onAddCard={onAddCard}
            onOpenAddCard={onOpenAddCard}
            onCancelAddCard={onCancelAddCard}
            onChangeCardTitle={onChangeCardTitle}
          />
        ))}
        <div
          style={{
            minWidth: 220,
            maxWidth: 260,
            borderRadius: 12,
            padding: 10,
            background: 'rgba(11, 15, 35, 0.45)',
            border: '1px dashed rgba(199,125,255,0.6)',
            height: 'fit-content',
          }}
        >
          {isAddingList ? (
            <form
              onSubmit={onCreateList}
              style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
            >
              <input
                className="input"
                type="text"
                placeholder="Column title"
                value={newListTitle}
                onChange={(e) => onChangeNewListTitle(e.target.value)}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="submit" className="button button-primary">
                  Add
                </button>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={onCancelAddList}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className="button button-ghost"
              style={{ width: '100%', textAlign: 'left' }}
              onClick={onStartAddList}
            >
              + Add another list
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default BoardColumns;
