import { useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import {
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import api from '../../../api';
import { parseCardId, parseListId } from '../utils';

type UseCardDnDParams = {
  boardId?: string;
  lists: any[];
  setLists: Dispatch<SetStateAction<any[]>>;
  fetchBoardFull: (options?: { silent?: boolean }) => Promise<void>;
};

type UseCardDnDResult = {
  sensors: ReturnType<typeof useSensors>;
  collisionDetection: typeof closestCenter;
  activeDragCard: any | null;
  dragEnabled: boolean;
  setDragEnabled: (value: boolean) => void;
  columnsScrollRef: React.RefObject<HTMLDivElement>;
  handleDragStart: (event: any) => void;
  handleDragEnd: (event: any) => Promise<void>;
  handleDragOver: (event: any) => void;
  handleDragCancel: () => void;
};

export const useCardDnD = ({
  boardId,
  lists,
  setLists,
  fetchBoardFull,
}: UseCardDnDParams): UseCardDnDResult => {
  const [activeDragCardId, setActiveDragCardId] = useState<number | null>(null);
  const [activeDragListId, setActiveDragListId] = useState<number | null>(null);
  const [dragEnabled, setDragEnabled] = useState(() => {
    return localStorage.getItem('dragEnabled') !== 'false';
  });
  const columnsScrollRef = useRef<HTMLDivElement | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const activeDragCard = useMemo(() => {
    if (!activeDragCardId) return null;
    return lists.flatMap((list: any) => list.cards || []).find((card: any) => card.id === activeDragCardId) || null;
  }, [activeDragCardId, lists]);

  const findListByCardId = (cardId: number) =>
    lists.find((list: any) =>
      (list.cards || []).some((card: any) => card.id === cardId)
    );

  const updateCardPositions = (cards: any[]) =>
    cards.map((card: any, index: number) => ({ ...card, position: index }));

  const handleDragStart = (event: any) => {
    if (!dragEnabled) return;
    const activeCardId = parseCardId(event.active.id);
    if (activeCardId === null) return;
    setActiveDragCardId(activeCardId);
    const sourceList = findListByCardId(activeCardId);
    setActiveDragListId(sourceList ? sourceList.id : null);
  };

  const handleDragEnd = async (event: any) => {
    if (!dragEnabled) return;
    try {
      if (!boardId) return;
      const { active, over } = event;
      if (!over) {
        fetchBoardFull({ silent: true });
        return;
      }

      const activeCardId = parseCardId(active.id);
      if (activeCardId === null) return;

      const overCardId = parseCardId(over.id);
      const overListId = parseListId(over.id);

      const sourceListId =
        activeDragListId ?? findListByCardId(activeCardId)?.id ?? null;
      const sourceList =
        sourceListId != null
          ? lists.find((list: any) => list.id === sourceListId)
          : null;
      if (!sourceList) return;

      const destinationList =
        overCardId !== null
          ? findListByCardId(overCardId)
          : lists.find((list: any) => list.id === overListId);
      if (!destinationList) return;

      const sourceCards = sourceList.cards || [];
      const destinationCards = destinationList.cards || [];
      const sourceIndex = sourceCards.findIndex((c: any) => c.id === activeCardId);
      if (sourceIndex === -1 && sourceList.id === destinationList.id) return;

      if (sourceList.id === destinationList.id) {
        let destinationIndex =
          overCardId !== null
            ? destinationCards.findIndex((c: any) => c.id === overCardId)
            : destinationCards.length - 1;
        if (destinationIndex < 0) destinationIndex = 0;
        if (sourceIndex === destinationIndex) return;

        const reordered = arrayMove(sourceCards, sourceIndex, destinationIndex);
        setLists((prev) =>
          prev.map((list: any) =>
            list.id === sourceList.id
              ? { ...list, cards: updateCardPositions(reordered) }
              : list
          )
        );

        try {
          await api.patch(`/boards/${boardId}/lists/${sourceList.id}/cards/reorder`, {
            orderedCardIds: reordered.map((c: any) => c.id),
          });
        } catch (err) {
          console.error('Drag reorder cards error ====>', err);
          fetchBoardFull({ silent: true });
        }
        return;
      }

      const destinationCardsWithoutActive = destinationCards.filter(
        (c: any) => c.id !== activeCardId
      );
      let destinationIndex =
        overCardId !== null
          ? destinationCardsWithoutActive.findIndex((c: any) => c.id === overCardId)
          : destinationCardsWithoutActive.length;
      if (destinationIndex < 0) destinationIndex = destinationCards.length;

      const movedCard =
        sourceCards[sourceIndex] ??
        destinationCards.find((c: any) => c.id === activeCardId);
      if (!movedCard) return;

      const nextSourceCards = sourceCards.filter((c: any) => c.id !== activeCardId);
      const nextDestinationCards = [...destinationCardsWithoutActive];
      nextDestinationCards.splice(destinationIndex, 0, {
        ...movedCard,
        listId: destinationList.id,
      });

      setLists((prev) =>
        prev.map((list: any) => {
          if (list.id === sourceList.id) {
            return { ...list, cards: updateCardPositions(nextSourceCards) };
          }
          if (list.id === destinationList.id) {
            return { ...list, cards: updateCardPositions(nextDestinationCards) };
          }
          return list;
        })
      );

      try {
        await api.put(
          `/boards/${boardId}/lists/${sourceList.id}/cards/${activeCardId}/move`,
          { targetListId: destinationList.id }
        );
        await Promise.all([
          api.patch(`/boards/${boardId}/lists/${sourceList.id}/cards/reorder`, {
            orderedCardIds: nextSourceCards.map((c: any) => c.id),
          }),
          api.patch(`/boards/${boardId}/lists/${destinationList.id}/cards/reorder`, {
            orderedCardIds: nextDestinationCards.map((c: any) => c.id),
          }),
        ]);
      } catch (err) {
        console.error('Drag move cards error ====>', err);
        fetchBoardFull({ silent: true });
      }
    } finally {
      setActiveDragCardId(null);
      setActiveDragListId(null);
    }
  };

  const handleDragOver = (event: any) => {
    if (!dragEnabled) return;
    const { active, over } = event;
    if (!over) return;

    const activeCardId = parseCardId(active.id);
    if (activeCardId === null) return;

    const overCardId = parseCardId(over.id);
    const overListId = parseListId(over.id);

    const sourceList = findListByCardId(activeCardId);
    if (!sourceList) return;

    const destinationList =
      overCardId !== null
        ? findListByCardId(overCardId)
        : lists.find((list: any) => list.id === overListId);
    if (!destinationList) return;

    if (sourceList.id === destinationList.id) return;

    const sourceCards = sourceList.cards || [];
    const destinationCards = destinationList.cards || [];
    const sourceIndex = sourceCards.findIndex((c: any) => c.id === activeCardId);
    if (sourceIndex === -1) return;

    let destinationIndex =
      overCardId !== null
        ? destinationCards.findIndex((c: any) => c.id === overCardId)
        : destinationCards.length;
    if (destinationIndex < 0) destinationIndex = destinationCards.length;

    const movedCard = sourceCards[sourceIndex];
    const nextSourceCards = sourceCards.filter((c: any) => c.id !== activeCardId);
    const nextDestinationCards = [...destinationCards];
    nextDestinationCards.splice(destinationIndex, 0, {
      ...movedCard,
      listId: destinationList.id,
    });

    setLists((prev) =>
      prev.map((list: any) => {
        if (list.id === sourceList.id) {
          return { ...list, cards: updateCardPositions(nextSourceCards) };
        }
        if (list.id === destinationList.id) {
          return { ...list, cards: updateCardPositions(nextDestinationCards) };
        }
        return list;
      })
    );
  };

  const handleDragCancel = () => {
    setActiveDragCardId(null);
    setActiveDragListId(null);
    fetchBoardFull({ silent: true });
  };

  useEffect(() => {
    if (activeDragCardId == null || !dragEnabled) return;
    const container = columnsScrollRef.current;
    if (!container) return;

    const threshold = 70;
    const speed = 14;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (event.clientX < rect.left + threshold) {
        container.scrollLeft -= speed;
      } else if (event.clientX > rect.right - threshold) {
        container.scrollLeft += speed;
      }
      const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
      const listScroller = target?.closest('[data-list-scroll="true"]') as HTMLElement | null;
      if (!listScroller) return;
      const listRect = listScroller.getBoundingClientRect();
      if (event.clientY < listRect.top + threshold) {
        listScroller.scrollTop -= speed;
      } else if (event.clientY > listRect.bottom - threshold) {
        listScroller.scrollTop += speed;
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [activeDragCardId, dragEnabled]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'dragEnabled') return;
      setDragEnabled(event.newValue !== 'false');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return {
    sensors,
    collisionDetection: closestCenter,
    activeDragCard,
    dragEnabled,
    setDragEnabled,
    columnsScrollRef,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragCancel,
  };
};
