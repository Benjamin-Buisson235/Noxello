import { useCallback, useState } from 'react';
import type { Dispatch, SetStateAction, FormEvent } from 'react';
import api from '../../../api';

type UseCardActionsParams = {
  boardId?: string;
  lists: any[];
  setLists: Dispatch<SetStateAction<any[]>>;
  setArchivedLists: Dispatch<SetStateAction<any[]>>;
  fetchBoardFull: (options?: { silent?: boolean }) => Promise<void>;
  fetchArchivedLists: () => Promise<void>;
};

type UseCardActionsResult = {
  newCardTitleByList: Record<number, string>;
  activeCardListId: number | null;
  cardToDelete: { id: number; title: string; listId: number; archived?: boolean } | null;
  setActiveCardListId: (value: number | null) => void;
  handleOpenAddCard: (listId: number) => void;
  handleChangeCardTitle: (listId: number, value: string) => void;
  handleAddCard: (event: FormEvent, listId: number) => Promise<void>;
  handleCancelAddCard: (listId: number) => void;
  handleMoveCard: (fromListId: number, card: any, direction: 'left' | 'right') => Promise<void>;
  handleReorderCard: (listId: number, cardId: number, direction: 'up' | 'down') => Promise<void>;
  handleDeleteCard: (listId: number, card: any) => void;
  confirmDeleteCard: () => Promise<void>;
  cancelDeleteCard: () => void;
};

export const useCardActions = ({
  boardId,
  lists,
  setLists,
  setArchivedLists,
  fetchBoardFull,
  fetchArchivedLists,
}: UseCardActionsParams): UseCardActionsResult => {
  const [newCardTitleByList, setNewCardTitleByList] = useState<Record<number, string>>({});
  const [activeCardListId, setActiveCardListId] = useState<number | null>(null);
  const [cardToDelete, setCardToDelete] = useState<
    { id: number; title: string; listId: number; archived?: boolean } | null
  >(null);

  const handleOpenAddCard = useCallback((listId: number) => {
    setActiveCardListId(listId);
    setNewCardTitleByList((prev) => ({
      ...prev,
      [listId]: prev[listId] || '',
    }));
  }, []);

  const handleChangeCardTitle = useCallback((listId: number, value: string) => {
    setNewCardTitleByList((prev) => ({
      ...prev,
      [listId]: value,
    }));
  }, []);

  const handleAddCard = useCallback(
    async (event: FormEvent, listId: number) => {
      event.preventDefault();
      if (!boardId) return;
      const title = (newCardTitleByList[listId] || '').trim();
      if (!title) return;

      try {
        const res = await api.post(`/boards/${boardId}/lists/${listId}/cards`, { title });
        const card = res.data.card;
        setLists((prev) =>
          prev.map((list: any) =>
            list.id === listId
              ? { ...list, cards: [...(list.cards || []), card] }
              : list
          )
        );
        setNewCardTitleByList((prev) => ({ ...prev, [listId]: '' }));
        setActiveCardListId(null);
      } catch (err) {
        console.error('Create card error ====>', err);
      }
    },
    [boardId, newCardTitleByList, setLists]
  );

  const handleCancelAddCard = useCallback((listId: number) => {
    setNewCardTitleByList((prev) => ({ ...prev, [listId]: '' }));
    setActiveCardListId((current) => (current === listId ? null : current));
  }, []);

  const handleMoveCard = useCallback(
    async (fromListId: number, card: any, direction: 'left' | 'right') => {
      if (!boardId || !lists.length) return;

      const currentIndex = lists.findIndex((list: any) => list.id === fromListId);
      if (currentIndex === -1) return;

      const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= lists.length) return;

      const targetList = lists[targetIndex];

      setLists((prev) => {
        const sourceIndex = prev.findIndex((list: any) => list.id === fromListId);
        const targetIndexLocal = prev.findIndex((list: any) => list.id === targetList.id);
        if (sourceIndex === -1 || targetIndexLocal === -1) return prev;

        const sourceList = prev[sourceIndex];
        const targetListLocal = prev[targetIndexLocal];
        const sourceCards = [...(sourceList.cards || [])];
        const targetCards = [...(targetListLocal.cards || [])];

        const idx = sourceCards.findIndex((c: any) => c.id === card.id);
        if (idx === -1) return prev;

        const [removed] = sourceCards.splice(idx, 1);
        removed.listId = targetListLocal.id;
        targetCards.push(removed);

        return prev.map((list: any) => {
          if (list.id === sourceList.id) {
            return { ...list, cards: sourceCards };
          }
          if (list.id === targetListLocal.id) {
            return { ...list, cards: targetCards };
          }
          return list;
        });
      });

      try {
        await api.put(`/boards/${boardId}/lists/${fromListId}/cards/${card.id}/move`, {
          targetListId: targetList.id,
        });
      } catch (err) {
        console.error('Move card error ====>', err);
      }
    },
    [boardId, lists, setLists]
  );

  const handleReorderCard = useCallback(
    async (listId: number, cardId: number, direction: 'up' | 'down') => {
      if (!boardId) return;
      const list = lists.find((item: any) => item.id === listId);
      if (!list) return;
      const cards = list.cards || [];
      const currentIndex = cards.findIndex((card: any) => card.id === cardId);
      if (currentIndex === -1) return;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= cards.length) return;

      const reordered = [...cards];
      const [moved] = reordered.splice(currentIndex, 1);
      reordered.splice(targetIndex, 0, moved);

      setLists((prev) =>
        prev.map((item: any) =>
          item.id === listId
            ? {
                ...item,
                cards: reordered.map((card: any, index: number) => ({
                  ...card,
                  position: index,
                })),
              }
            : item
        )
      );

      try {
        await api.patch(`/boards/${boardId}/lists/${listId}/cards/reorder`, {
          orderedCardIds: reordered.map((card: any) => card.id),
        });
      } catch (err) {
        console.error('Reorder cards error ====>', err);
        fetchBoardFull();
      }
    },
    [boardId, fetchBoardFull, lists, setLists]
  );

  const handleDeleteCard = useCallback((listId: number, card: any) => {
    setCardToDelete({
      id: card.id,
      title: card.title,
      listId,
      archived: !!card.archived,
    });
  }, []);

  const confirmDeleteCard = useCallback(async () => {
    if (!boardId || !cardToDelete) return;

    const { listId, id: cardId, archived } = cardToDelete;

    if (archived) {
      setArchivedLists((prev) =>
        prev
          .map((list: any) =>
            list.id === listId
              ? {
                  ...list,
                  cards: (list.cards || []).filter((c: any) => c.id !== cardId),
                }
              : list
          )
          .filter((list: any) => (list.cards || []).length > 0)
      );
    } else {
      setLists((prev) =>
        prev.map((list: any) =>
          list.id === listId
            ? {
                ...list,
                cards: (list.cards || []).filter((c: any) => c.id !== cardId),
              }
            : list
        )
      );
    }

    try {
      await api.delete(`/boards/${boardId}/lists/${listId}/cards/${cardId}`);
    } catch (err) {
      console.error('Delete card error ====>', err);
    } finally {
      fetchArchivedLists();
      fetchBoardFull({ silent: true });
      setCardToDelete(null);
    }
  }, [boardId, cardToDelete, fetchArchivedLists, fetchBoardFull, setArchivedLists, setLists]);

  const cancelDeleteCard = useCallback(() => {
    setCardToDelete(null);
  }, []);

  return {
    newCardTitleByList,
    activeCardListId,
    cardToDelete,
    setActiveCardListId,
    handleOpenAddCard,
    handleChangeCardTitle,
    handleAddCard,
    handleCancelAddCard,
    handleMoveCard,
    handleReorderCard,
    handleDeleteCard,
    confirmDeleteCard,
    cancelDeleteCard,
  };
};
