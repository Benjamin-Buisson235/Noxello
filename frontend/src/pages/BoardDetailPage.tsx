// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const toCardDndId = (cardId: number) => `card-${cardId}`;
const toListDndId = (listId: number) => `list-${listId}`;
const parseCardId = (dndId: string | number) => {
  const value = String(dndId);
  if (!value.startsWith('card-')) return null;
  const parsed = Number(value.replace('card-', ''));
  return Number.isNaN(parsed) ? null : parsed;
};
const parseListId = (dndId: string | number) => {
  const value = String(dndId);
  if (!value.startsWith('list-')) return null;
  const parsed = Number(value.replace('list-', ''));
  return Number.isNaN(parsed) ? null : parsed;
};
const toDateInputValue = (value?: string | null) => {
  if (!value) return '';
  return value.slice(0, 10);
};
const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const sameLabelIds = (a: number[], b: number[]) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((value, index) => value === sortedB[index]);
};

function CardsDropzone({
  listId,
  activeListId,
  children,
}: {
  listId: number;
  activeListId: number | null;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id: toListDndId(listId) });
  return (
    <div
      ref={setNodeRef}
      style={{
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        minHeight: 24,
        outline: 'none',
        borderRadius: 8,
      }}
    >
      {children}
    </div>
  );
}

function SortableCard({
  card,
  list,
  lists,
  moveTargets,
  currentBoardTitle,
  cardIndex,
  cardsLength,
  handleMoveCardToList,
  handleReorderCard,
  handleMoveCard,
  handleDeleteCard,
  onOpenCardDetails,
}: {
  card: any;
  list: any;
  lists: any[];
  moveTargets: any[];
  currentBoardTitle: string;
  cardIndex: number;
  cardsLength: number;
  handleMoveCardToList: (
    fromListId: number,
    card: any,
    targetBoardId: number,
    targetListId: number
  ) => void;
  handleReorderCard: (listId: number, cardId: number, direction: 'up' | 'down') => void;
  handleMoveCard: (fromListId: number, card: any, direction: 'left' | 'right') => void;
  handleDeleteCard: (listId: number, card: any) => void;
  onOpenCardDetails: (card: any, listId: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: toCardDndId(card.id) });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };
  const targets = moveTargets.length
    ? moveTargets
    : lists.map((l: any) => ({
        boardId: list.boardId,
        boardTitle: currentBoardTitle,
        listId: l.id,
        listTitle: l.title,
      }));
  const selectedValue = `${list.boardId}:${list.id}`;
  const dueDateLabel = toDateInputValue(card.dueDate);
  const todayLabel = toLocalDateString(new Date());
  const isOverdue = !!dueDateLabel && dueDateLabel < todayLabel;
  const cardLabels = (card.cardLabels || [])
    .map((entry: any) => entry.label)
    .filter(Boolean);

  return (
    <div
      ref={setNodeRef}
      onClick={() => onOpenCardDetails(card, list.id)}
      style={{
        ...style,
        borderRadius: 8,
        padding: '6px 8px',
        backgroundColor: 'rgba(11, 15, 35, 0.9)',
        border: '1px solid rgba(157,78,221,0.55)',
        fontSize: 12,
        color: '#f9f5ff',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            {...attributes}
            {...listeners}
            title="Drag card"
            style={{
              cursor: 'grab',
              padding: '2px 4px',
              borderRadius: 4,
              border: '1px solid rgba(157,78,221,0.4)',
              fontSize: 11,
              lineHeight: 1,
              color: 'rgba(226,232,240,0.9)',
              userSelect: 'none',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            ⠿
          </span>
          <span>{card.title}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <select
            value={selectedValue}
            onChange={(e) => {
              const [targetBoardId, targetListId] = e.target.value
                .split(':')
                .map((value) => Number(value));
              if (Number.isNaN(targetBoardId) || Number.isNaN(targetListId)) {
                return;
              }
              handleMoveCardToList(list.id, card, targetBoardId, targetListId);
            }}
            style={{
              borderRadius: 6,
              padding: '2px 6px',
              fontSize: 10,
              border: '1px solid rgba(157,78,221,0.55)',
              backgroundColor: 'rgba(11, 15, 35, 0.9)',
              color: '#f9f5ff',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {targets.map((target: any) => (
              <option
                key={`${target.boardId}:${target.listId}`}
                value={`${target.boardId}:${target.listId}`}
              >
                {target.boardTitle}: {target.listTitle}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="button button-ghost"
            style={{
              padding: '2px 6px',
              fontSize: 10,
              lineHeight: 1,
            }}
            onClick={(event) => {
              event.stopPropagation();
              handleReorderCard(list.id, card.id, 'up');
            }}
            disabled={cardIndex === 0}
          >
            ↑
          </button>
          <button
            type="button"
            className="button button-ghost"
            style={{
              padding: '2px 6px',
              fontSize: 10,
              lineHeight: 1,
            }}
            onClick={(event) => {
              event.stopPropagation();
              handleReorderCard(list.id, card.id, 'down');
            }}
            disabled={cardIndex === cardsLength - 1}
          >
            ↓
          </button>
          <button
            type="button"
            className="button button-ghost"
            style={{
              padding: '2px 6px',
              fontSize: 10,
              lineHeight: 1,
            }}
            onClick={(event) => {
              event.stopPropagation();
              handleMoveCard(list.id, card, 'left');
            }}
          >
            ◄
          </button>
          <button
            type="button"
            className="button button-ghost"
            style={{
              padding: '2px 6px',
              fontSize: 10,
              lineHeight: 1,
            }}
            onClick={(event) => {
              event.stopPropagation();
              handleMoveCard(list.id, card, 'right');
            }}
          >
            ►
          </button>
          <button
            type="button"
            className="button button-ghost"
            style={{
              padding: '2px 6px',
              fontSize: 10,
              lineHeight: 1,
            }}
            onClick={(event) => {
              event.stopPropagation();
              handleDeleteCard(list.id, card);
            }}
          >
            🗑
          </button>
        </div>
        {cardLabels.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {cardLabels.map((label: any) => {
              const color = label.color || 'rgba(157,78,221,0.35)';
              return (
                <span
                  key={label.id}
                  style={{
                    fontSize: 10,
                    padding: '2px 6px',
                    borderRadius: 999,
                    backgroundColor: color,
                    border: '1px solid rgba(157,78,221,0.45)',
                    color: '#f9f5ff',
                  }}
                >
                  {label.name}
                </span>
              );
            })}
          </div>
        )}
        {dueDateLabel && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span
              style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 999,
                backgroundColor: isOverdue
                  ? 'rgba(248, 113, 113, 0.2)'
                  : 'rgba(125, 247, 200, 0.15)',
                border: isOverdue
                  ? '1px solid rgba(248, 113, 113, 0.6)'
                  : '1px solid rgba(125, 247, 200, 0.4)',
                color: isOverdue
                  ? 'rgba(248, 113, 113, 0.95)'
                  : 'rgba(125, 247, 200, 0.95)',
              }}
            >
              Due: {dueDateLabel}
            </span>
            {isOverdue && (
              <span style={{ fontSize: 10, color: 'rgba(248, 113, 113, 0.95)' }}>
                Overdue
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BoardDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [boardLabels, setBoardLabels] = useState([]);
  const [moveTargets, setMoveTargets] = useState([]);
  const [newListTitle, setNewListTitle] = useState('');
  const [newCardTitleByList, setNewCardTitleByList] = useState<{ [key: number]: string }>({});
  const [activeCardListId, setActiveCardListId] = useState<number | null>(null);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [error, setError] = useState(null);

  const [listToDelete, setListToDelete] = useState<null | { id: number; title: string }>(null);
  const [cardToDelete, setCardToDelete] = useState<
    null | { id: number; title: string; listId: number }
  >(null);
  const [activeDragCardId, setActiveDragCardId] = useState<number | null>(null);
  const [activeDragListId, setActiveDragListId] = useState<number | null>(null);
  const [cardToEdit, setCardToEdit] = useState<
    null | {
      id: number;
      title: string;
      description?: string | null;
      dueDate?: string | null;
      listId: number;
    }
  >(null);
  const [editCardTitle, setEditCardTitle] = useState('');
  const [editCardDescription, setEditCardDescription] = useState('');
  const [editCardDueDate, setEditCardDueDate] = useState('');
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([]);
  const [initialLabelIds, setInitialLabelIds] = useState<number[]>([]);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const saveStatusTimeout = React.useRef<number | null>(null);

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(3, 0, 20, 0.72)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(3px)',
  };
  const dialogStyle: React.CSSProperties = {
    minWidth: 340,
    maxWidth: 420,
    borderRadius: 20,
    padding: 20,
    background:
      'radial-gradient(circle at top, rgba(157,78,221,0.25), transparent 55%), linear-gradient(145deg, #240046, #10002b)',
    border: '1px solid rgba(199,125,255,0.8)',
    boxShadow: '0 18px 45px rgba(6, 3, 34, 0.9)',
    color: '#f9f5ff',
  };
  const dialogButtonsStyle: React.CSSProperties = {
    marginTop: 18,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
  };
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const findListByCardId = (cardId: number) =>
    lists.find((list: any) =>
      (list.cards || []).some((card: any) => card.id === cardId)
    );

  const updateCardPositions = (cards: any[]) =>
    cards.map((card: any, index: number) => ({ ...card, position: index }));

  const fetchBoardFull = async () => {
    if (!user || !id) return;
    try {
      setLoadingBoard(true);
      setError(null);
      const res = await api.get(`/boards/${id}/full`);
      setBoard(res.data.board);
      setLists(res.data.lists || []);
    } catch (err) {
      console.error('Fetch board full error ====>', err);
      const status = err?.response?.status;
      if (status === 404) {
        setError("This board doesn't exist or doesn't belong to you.");
      } else {
        setError('Unable to load this board.');
      }
    } finally {
      setLoadingBoard(false);
    }
  };

  const fetchMoveTargets = async () => {
    if (!user || !id) return;
    try {
      const res = await api.get(`/boards/${id}/move-targets`);
      setMoveTargets(res.data.targets || []);
    } catch (err) {
      console.error('Fetch move targets error ====>', err);
      fetchBoardFull();
    }
  };

  const fetchBoardLabels = async () => {
    if (!user || !id) return;
    try {
      const res = await api.get(`/boards/${id}/labels`);
      setBoardLabels(res.data.labels || []);
    } catch (err) {
      console.error('Fetch labels error ====>', err);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
    } catch (err) {
      console.error('Error parsing user from localStorage', err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
      return;
    } finally {
      setLoadingUser(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchBoardFull();
    fetchMoveTargets();
    fetchBoardLabels();
  }, [user, id]);

  const handleBack = () => {
    navigate('/boards');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    try {
      const res = await api.post(`/boards/${id}/lists`, {
        title: newListTitle.trim(),
      });
      const list = res.data.list;
      setLists((prev) => [...prev, { ...list, cards: [] }]);
      setNewListTitle('');
    } catch (err) {
      console.error('Create list error ====>', err);
    }
  };

  const handleRenameList = async (
    e: React.MouseEvent,
    listId: number,
    currentTitle: string
  ) => {
    e.preventDefault();

    const newTitle = window.prompt('New column title', currentTitle);
    if (!newTitle || newTitle.trim() === '' || newTitle.trim() === currentTitle) {
      return;
    }

    try {
      const res = await api.put(`/boards/${id}/lists/${listId}`, {
        title: newTitle.trim(),
      });
      const updated = res.data.list;
      setLists((prev) =>
        prev.map((l: any) => (l.id === listId ? { ...l, title: updated.title } : l))
      );
    } catch (err) {
      console.error('Rename list error ====>', err);
    }
  };

  const handleReorderLists = async (listId: number, direction: 'left' | 'right') => {
    if (!lists.length) return;

    const currentIndex = lists.findIndex((l: any) => l.id === listId);
    if (currentIndex === -1) return;

    const targetIndex =
      direction === 'left' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= lists.length) return;

    const reordered = [...lists];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setLists(reordered.map((list: any, index: number) => ({ ...list, position: index })));

    try {
      await api.patch(`/boards/${id}/lists/reorder`, {
        orderedListIds: reordered.map((l: any) => l.id),
      });
    } catch (err) {
      console.error('Reorder lists error ====>', err);
      fetchBoardFull();
    }
  };

  const handleDeleteList = (
    e: React.MouseEvent,
    listId: number,
    title: string
  ) => {
    e.preventDefault();
    setListToDelete({ id: listId, title });
  };

  const confirmDeleteList = async () => {
    if (!listToDelete) return;
    try {
      await api.delete(`/boards/${id}/lists/${listToDelete.id}`);
      setLists((prev) => prev.filter((l: any) => l.id !== listToDelete.id));
    } catch (err) {
      console.error('Delete list error ====>', err);
    } finally {
      setListToDelete(null);
    }
  };

  const cancelDeleteList = () => {
    setListToDelete(null);
  };

  const handleOpenAddCard = (listId: number) => {
    setActiveCardListId(listId);
    setNewCardTitleByList((prev) => ({
      ...prev,
      [listId]: prev[listId] || '',
    }));
  };

  const handleChangeCardTitle = (listId: number, value: string) => {
    setNewCardTitleByList((prev) => ({
      ...prev,
      [listId]: value,
    }));
  };

  const handleAddCard = async (e: React.FormEvent, listId: number) => {
    e.preventDefault();
    const title = (newCardTitleByList[listId] || '').trim();
    if (!title) return;

    try {
      const res = await api.post(`/boards/${id}/lists/${listId}/cards`, {
        title,
      });
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
  };

  const handleCancelAddCard = (listId: number) => {
    setNewCardTitleByList((prev) => ({ ...prev, [listId]: '' }));
    setActiveCardListId((current) => (current === listId ? null : current));
  };

  const handleMoveCard = async (
    fromListId: number,
    card: any,
    direction: 'left' | 'right'
  ) => {
    if (!lists.length) return;

    const currentIndex = lists.findIndex((l: any) => l.id === fromListId);
    if (currentIndex === -1) return;

    const targetIndex =
      direction === 'left' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= lists.length) return;

    const targetList = lists[targetIndex];

    setLists((prev) => {
      const sourceIndex = prev.findIndex((l: any) => l.id === fromListId);
      const targetIndexLocal = prev.findIndex(
        (l: any) => l.id === targetList.id
      );
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
      await api.put(
        `/boards/${id}/lists/${fromListId}/cards/${card.id}/move`,
        { targetListId: targetList.id }
      );
    } catch (err) {
      console.error('Move card error ====>', err);
    }
  };

  const handleMoveCardToList = async (
    fromListId: number,
    card: any,
    targetBoardId: number,
    targetListId: number
  ) => {
    const sourceBoardId = Number(id);
    if (
      sourceBoardId === targetBoardId &&
      fromListId === targetListId
    ) {
      return;
    }

    try {
      await api.put(
        `/boards/${id}/lists/${fromListId}/cards/${card.id}/move-to-list`,
        { targetBoardId, targetListId }
      );
      fetchBoardFull();
    } catch (err) {
      console.error('Move card to list error ====>', err);
      fetchBoardFull();
    }
  };

  const handleReorderCard = async (
    listId: number,
    cardId: number,
    direction: 'up' | 'down'
  ) => {
    const list = lists.find((l: any) => l.id === listId);
    if (!list) return;
    const cards = list.cards || [];
    const currentIndex = cards.findIndex((c: any) => c.id === cardId);
    if (currentIndex === -1) return;

    const targetIndex =
      direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= cards.length) return;

    const reordered = [...cards];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setLists((prev) =>
      prev.map((l: any) =>
        l.id === listId
          ? {
              ...l,
              cards: reordered.map((c: any, index: number) => ({
                ...c,
                position: index,
              })),
            }
          : l
      )
    );

    try {
      await api.patch(`/boards/${id}/lists/${listId}/cards/reorder`, {
        orderedCardIds: reordered.map((c: any) => c.id),
      });
    } catch (err) {
      console.error('Reorder cards error ====>', err);
      fetchBoardFull();
    }
  };

  const handleDragStart = (event: any) => {
    const activeCardId = parseCardId(event.active.id);
    if (activeCardId === null) return;
    setActiveDragCardId(activeCardId);
    const sourceList = findListByCardId(activeCardId);
    setActiveDragListId(sourceList ? sourceList.id : null);
  };

  const handleDragEnd = async (event: any) => {
    try {
      const { active, over } = event;
      if (!over) {
        fetchBoardFull();
        return;
      }

      const activeCardId = parseCardId(active.id);
      if (activeCardId === null) return;

      const overCardId = parseCardId(over.id);
      const overListId = parseListId(over.id);

      const sourceList = findListByCardId(activeCardId);
      if (!sourceList) return;

      const destinationList = overCardId !== null
        ? findListByCardId(overCardId)
        : lists.find((list: any) => list.id === overListId);
      if (!destinationList) return;

      const sourceCards = sourceList.cards || [];
      const destinationCards = destinationList.cards || [];
      const sourceIndex = sourceCards.findIndex((c: any) => c.id === activeCardId);
      if (sourceIndex === -1) return;

      if (sourceList.id === destinationList.id) {
        let destinationIndex = overCardId !== null
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
          await api.patch(`/boards/${id}/lists/${sourceList.id}/cards/reorder`, {
            orderedCardIds: reordered.map((c: any) => c.id),
          });
        } catch (err) {
          console.error('Drag reorder cards error ====>', err);
          fetchBoardFull();
        }
        return;
      }

      let destinationIndex = overCardId !== null
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

      try {
        await api.put(
          `/boards/${id}/lists/${sourceList.id}/cards/${activeCardId}/move`,
          { targetListId: destinationList.id }
        );
        await Promise.all([
          api.patch(`/boards/${id}/lists/${sourceList.id}/cards/reorder`, {
            orderedCardIds: nextSourceCards.map((c: any) => c.id),
          }),
          api.patch(`/boards/${id}/lists/${destinationList.id}/cards/reorder`, {
            orderedCardIds: nextDestinationCards.map((c: any) => c.id),
          }),
        ]);
      } catch (err) {
        console.error('Drag move cards error ====>', err);
        fetchBoardFull();
      }
    } finally {
      setActiveDragCardId(null);
      setActiveDragListId(null);
    }
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeCardId = parseCardId(active.id);
    if (activeCardId === null) return;

    const overCardId = parseCardId(over.id);
    const overListId = parseListId(over.id);

    const sourceList = findListByCardId(activeCardId);
    if (!sourceList) return;

    const destinationList = overCardId !== null
      ? findListByCardId(overCardId)
      : lists.find((list: any) => list.id === overListId);
    if (!destinationList) return;

    if (sourceList.id === destinationList.id) return;

    const sourceCards = sourceList.cards || [];
    const destinationCards = destinationList.cards || [];
    const sourceIndex = sourceCards.findIndex((c: any) => c.id === activeCardId);
    if (sourceIndex === -1) return;

    let destinationIndex = overCardId !== null
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
    fetchBoardFull();
  };

  const handleDeleteCard = (listId: number, card: any) => {
    setCardToDelete({
      id: card.id,
      title: card.title,
      listId,
    });
  };

  const confirmDeleteCard = async () => {
    if (!cardToDelete) return;

    const { listId, id: cardId } = cardToDelete;

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

    try {
      await api.delete(`/boards/${id}/lists/${listId}/cards/${cardId}`);
    } catch (err) {
      console.error('Delete card error ====>', err);
    } finally {
      setCardToDelete(null);
    }
  };

  const cancelDeleteCard = () => {
    setCardToDelete(null);
  };

  const handleOpenCardDetails = (card: any, listId: number) => {
    const labelIds = (card.cardLabels || [])
      .map((entry: any) => entry.labelId ?? entry.label?.id)
      .filter((value: any) => Number.isFinite(value));
    setCardToEdit({
      id: card.id,
      title: card.title,
      description: card.description ?? '',
      dueDate: card.dueDate ?? null,
      listId,
    });
    setEditCardTitle(card.title || '');
    setEditCardDescription(card.description ?? '');
    setEditCardDueDate(toDateInputValue(card.dueDate));
    setSelectedLabelIds(labelIds);
    setInitialLabelIds(labelIds);
    setIsDirty(false);
    setSaveStatus('idle');
    setSaveError('');
  };

  const handleSaveCardDetails = async (forcedDueDate?: string | null) => {
    if (!cardToEdit) return;
    const trimmedTitle = editCardTitle.trim();
    if (!trimmedTitle) {
      setSaveStatus('error');
      setSaveError('Title is required');
      return;
    }
    const initialDueDate = toDateInputValue(cardToEdit.dueDate);
    const dueDateChanged =
      forcedDueDate !== undefined
        ? true
        : editCardDueDate !== initialDueDate;
    const dueDateValue =
      forcedDueDate !== undefined
        ? forcedDueDate
        : dueDateChanged
          ? editCardDueDate || null
          : undefined;
    const labelsChanged = !sameLabelIds(selectedLabelIds, initialLabelIds);

    try {
      setSaveStatus('saving');
      setSaveError('');
      await api.patch(
        `/boards/${id}/lists/${cardToEdit.listId}/cards/${cardToEdit.id}`,
        {
          title: trimmedTitle,
          description: editCardDescription,
          ...(dueDateValue !== undefined ? { dueDate: dueDateValue } : {}),
        }
      );
      if (labelsChanged) {
        await api.put(
          `/boards/${id}/lists/${cardToEdit.listId}/cards/${cardToEdit.id}/labels`,
          { labelIds: selectedLabelIds }
        );
      }
      setCardToEdit({
        ...cardToEdit,
        title: trimmedTitle,
        description: editCardDescription,
        dueDate:
          dueDateValue === undefined
            ? cardToEdit.dueDate ?? null
            : dueDateValue
              ? `${dueDateValue}T00:00:00.000Z`
              : null,
      });
      if (dueDateValue !== undefined) {
        setEditCardDueDate(dueDateValue ? dueDateValue : '');
      }
      if (labelsChanged) {
        setInitialLabelIds([...selectedLabelIds]);
      }
      setIsDirty(false);
      setSaveStatus('saved');
      fetchBoardFull();
      if (saveStatusTimeout.current) {
        window.clearTimeout(saveStatusTimeout.current);
      }
      saveStatusTimeout.current = window.setTimeout(() => {
        setSaveStatus('idle');
      }, 1500);
    } catch (err) {
      console.error('Update card error ====>', err);
      setSaveStatus('error');
      setSaveError('Unable to save card');
    }
  };

  const handleCancelCardDetails = () => {
    if (isDirty) {
      const confirmClose = window.confirm('Discard unsaved changes?');
      if (!confirmClose) return;
    }
    setCardToEdit(null);
  };

  const handleClearDueDate = async () => {
    setEditCardDueDate('');
    await handleSaveCardDetails(null);
  };

  const handleToggleLabel = (labelId: number) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleCreateLabel = async () => {
    const name = newLabelName.trim();
    if (!name) return;

    try {
      const res = await api.post(`/boards/${id}/labels`, {
        name,
        color: newLabelColor.trim() || undefined,
      });
      const label = res.data.label;
      setBoardLabels((prev) => [...prev, label]);
      setSelectedLabelIds((prev) => [...prev, label.id]);
      setNewLabelName('');
      setNewLabelColor('');
    } catch (err) {
      console.error('Create label error ====>', err);
    }
  };

  const handleModalOverlayClick = () => {
    handleCancelCardDetails();
  };

  useEffect(() => {
    if (!cardToEdit) return;
    const initialTitle = cardToEdit.title ?? '';
    const initialDescription = cardToEdit.description ?? '';
    const initialDueDate = toDateInputValue(cardToEdit.dueDate);
    setIsDirty(
      editCardTitle.trim() !== initialTitle ||
        editCardDescription !== initialDescription ||
        editCardDueDate !== initialDueDate ||
        !sameLabelIds(selectedLabelIds, initialLabelIds)
    );
  }, [
    cardToEdit,
    editCardTitle,
    editCardDescription,
    editCardDueDate,
    selectedLabelIds,
    initialLabelIds,
  ]);

  useEffect(() => {
    if (!cardToEdit) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCancelCardDetails();
      }
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        handleSaveCardDetails();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cardToEdit]);

  if (loadingUser || loadingBoard) {
    return <p style={{ padding: 24 }}>Loading…</p>;
  }

  if (error) {
    return (
      <div className="boards-page">
        <header className="boards-header">
          <div>
            <h1 className="boards-title">Board not found</h1>
            <p className="boards-user">{error}</p>
          </div>
          <div className="boards-toolbar">
            <button className="button button-ghost" onClick={handleBack}>
              Back to boards
            </button>
          </div>
        </header>
      </div>
    );
  }

  if (!board) {
    return null;
  }

  return (
    <div className="boards-page">
      <header className="boards-header">
        <div>
          <h1 className="boards-title">{board.title}</h1>
          <p className="boards-user">
            Board #{board.id} — created on{' '}
            {new Date(board.createdAt).toLocaleString('en-US', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </p>
        </div>
        <div className="boards-toolbar">
          <button className="button button-ghost" onClick={handleBack}>
            Back to boards
          </button>
          <button className="button button-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Create list form */}
      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Add a column</h2>
        <form
          onSubmit={handleCreateList}
          style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}
        >
          <input
            className="input"
            type="text"
            placeholder="Column title (e.g. To do)"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
          />
          <button type="submit" className="button button-primary">
            Add
          </button>
        </form>
        {loadingBoard && (
          <p className="text-muted" style={{ marginTop: 8 }}>
            Loading columns…
          </p>
        )}
      </section>

      {/* Lists as Trello-style columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <section className="card">
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Board columns</h2>
          {lists.length === 0 ? (
            <p className="text-muted" style={{ marginTop: 4 }}>
              No columns yet. Create one above to start organizing your board.
            </p>
          ) : (
            <div
              style={{
                display: 'flex',
                gap: 12,
                overflowX: 'auto',
                paddingBottom: 4,
                marginTop: 8,
              }}
            >
              {lists.map((list: any, listIndex: number) => {
                const cards = list.cards || [];
                const cardTitle = newCardTitleByList[list.id] || '';

                return (
                  <div
                    key={list.id}
                    style={{
                      minWidth: 220,
                      maxWidth: 260,
                      borderRadius: 12,
                      padding: 10,
                      background:
                        'linear-gradient(145deg, rgba(55,10,98,0.96), rgba(92,28,168,0.96))',
                      border: '1px solid rgba(199,125,255,0.75)',
                    }}
                  >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      marginBottom: 4,
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 15,
                        color: '#fdfcff',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {list.title}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      <div style={{ display: 'flex', gap: 3 }}>
                        <button
                          className="button button-ghost"
                          style={{
                            padding: '2px 6px',
                            fontSize: 10,
                            lineHeight: 1,
                          }}
                          onClick={() => handleReorderLists(list.id, 'left')}
                          disabled={listIndex === 0}
                        >
                          ←
                        </button>
                        <button
                          className="button button-ghost"
                          style={{
                            padding: '2px 6px',
                            fontSize: 10,
                            lineHeight: 1,
                          }}
                          onClick={() => handleReorderLists(list.id, 'right')}
                          disabled={listIndex === lists.length - 1}
                        >
                          →
                        </button>
                      </div>
                      <button
                        className="button button-ghost"
                        style={{
                          padding: '2px 6px',
                          fontSize: 10,
                          lineHeight: 1,
                        }}
                        onClick={(e) =>
                          handleRenameList(e, list.id, list.title)
                        }
                      >
                        Rename
                      </button>
                      <button
                        className="button button-ghost"
                        style={{
                          padding: '2px 6px',
                          fontSize: 10,
                          lineHeight: 1,
                        }}
                        onClick={(e) =>
                          handleDeleteList(e, list.id, list.title)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: 'rgba(226,232,240,0.9)',
                    }}
                  >
                    Position: {list.position}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      marginTop: 2,
                      fontSize: 11,
                      color: 'rgba(226,232,240,0.75)',
                    }}
                  >
                    Created on{' '}
                    {new Date(list.createdAt).toLocaleString('en-US', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>

                  {/* cards */}
                  <SortableContext
                    items={cards.map((card: any) => toCardDndId(card.id))}
                    strategy={verticalListSortingStrategy}
                  >
                    <CardsDropzone
                      listId={list.id}
                      activeListId={activeDragListId}
                    >
                      {cards.map((card: any, cardIndex: number) => (
                        <SortableCard
                          key={card.id}
                          card={card}
                          list={list}
                          lists={lists}
                          moveTargets={moveTargets}
                          currentBoardTitle={board?.title || 'Board'}
                          cardIndex={cardIndex}
                          cardsLength={cards.length}
                          handleMoveCardToList={handleMoveCardToList}
                          handleReorderCard={handleReorderCard}
                          handleMoveCard={handleMoveCard}
                          handleDeleteCard={handleDeleteCard}
                          onOpenCardDetails={handleOpenCardDetails}
                        />
                      ))}

                      {activeCardListId === list.id ? (
                        <form onSubmit={(e) => handleAddCard(e, list.id)}>
                          <input
                            type="text"
                            value={cardTitle}
                            onChange={(e) =>
                              handleChangeCardTitle(list.id, e.target.value)
                            }
                            autoFocus
                            placeholder="Card title"
                            style={{
                              width: '100%',
                              borderRadius: 8,
                              padding: 6,
                              border: '1px solid rgba(199,125,255,0.7)',
                              backgroundColor: 'rgba(6, 5, 24, 0.95)',
                              color: '#f9f5ff',
                              fontSize: 12,
                              marginBottom: 6,
                            }}
                          />
                          <div
                            style={{
                              display: 'flex',
                              gap: 6,
                              alignItems: 'center',
                            }}
                          >
                            <button
                              type="submit"
                              className="button button-primary"
                              style={{ padding: '4px 10px', fontSize: 12 }}
                            >
                              Add card
                            </button>
                            <button
                              type="button"
                              className="button button-ghost"
                              style={{ padding: '4px 8px', fontSize: 12 }}
                              onClick={() => handleCancelAddCard(list.id)}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenAddCard(list.id)}
                          style={{
                            marginTop: 2,
                            borderRadius: 8,
                            padding: '6px 8px',
                            width: '100%',
                            textAlign: 'left',
                            fontSize: 12,
                            border: '1px dashed rgba(199,125,255,0.6)',
                            backgroundColor: 'transparent',
                            color: 'rgba(240, 237, 255, 0.9)',
                            cursor: 'pointer',
                          }}
                        >
                          + Add a card
                        </button>
                      )}
                    </CardsDropzone>
                  </SortableContext>
                </div>
              );
            })}
          </div>
        )}
      </section>

      </DndContext>

      {/* card details modal */}
      {cardToEdit && (
        <div style={overlayStyle} onClick={handleModalOverlayClick}>
          <div style={dialogStyle} onClick={(event) => event.stopPropagation()}>
            <h3 style={{ margin: 0, marginBottom: 12, fontSize: 18 }}>
              Card details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, color: 'rgba(226,232,240,0.9)' }}>
                  Title
                </label>
                <input
                  className="input"
                  type="text"
                  value={editCardTitle}
                  onChange={(e) => setEditCardTitle(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, color: 'rgba(226,232,240,0.9)' }}>
                  Description
                </label>
                <textarea
                  value={editCardDescription}
                  onChange={(e) => setEditCardDescription(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    padding: 8,
                    border: '1px solid rgba(199,125,255,0.7)',
                    backgroundColor: 'rgba(6, 5, 24, 0.95)',
                    color: '#f9f5ff',
                    fontSize: 12,
                    resize: 'vertical',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, color: 'rgba(226,232,240,0.9)' }}>
                  Due date
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="date"
                    value={editCardDueDate}
                    onChange={(e) => setEditCardDueDate(e.target.value)}
                    style={{
                      borderRadius: 8,
                      padding: '6px 8px',
                      border: '1px solid rgba(199,125,255,0.7)',
                      backgroundColor: 'rgba(6, 5, 24, 0.95)',
                      color: '#f9f5ff',
                      fontSize: 12,
                    }}
                  />
                  <button
                    type="button"
                    className="button button-ghost"
                    onClick={handleClearDueDate}
                    disabled={!editCardDueDate}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, color: 'rgba(226,232,240,0.9)' }}>
                  Labels
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {boardLabels.length === 0 && (
                    <span style={{ fontSize: 12, color: 'rgba(226,232,240,0.7)' }}>
                      No labels yet.
                    </span>
                  )}
                  {boardLabels.map((label: any) => (
                    <label
                      key={label.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 12,
                        color: '#f9f5ff',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedLabelIds.includes(label.id)}
                        onChange={() => handleToggleLabel(label.id)}
                      />
                      <span>{label.name}</span>
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="New label name"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    style={{
                      flex: 1,
                      borderRadius: 8,
                      padding: '6px 8px',
                      border: '1px solid rgba(199,125,255,0.7)',
                      backgroundColor: 'rgba(6, 5, 24, 0.95)',
                      color: '#f9f5ff',
                      fontSize: 12,
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Color (optional)"
                    value={newLabelColor}
                    onChange={(e) => setNewLabelColor(e.target.value)}
                    style={{
                      width: 120,
                      borderRadius: 8,
                      padding: '6px 8px',
                      border: '1px solid rgba(199,125,255,0.7)',
                      backgroundColor: 'rgba(6, 5, 24, 0.95)',
                      color: '#f9f5ff',
                      fontSize: 12,
                    }}
                  />
                  <button
                    type="button"
                    className="button button-ghost"
                    onClick={handleCreateLabel}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 12 }}>
              {isDirty && (
                <span style={{ color: 'rgba(226,232,240,0.9)' }}>
                  Unsaved changes
                </span>
              )}
              {!isDirty && saveStatus === 'saved' && (
                <span style={{ color: 'rgba(125, 247, 200, 0.95)' }}>
                  Saved ✓
                </span>
              )}
              {saveStatus === 'saving' && (
                <span style={{ color: 'rgba(226,232,240,0.9)' }}>
                  Saving…
                </span>
              )}
              {saveStatus === 'error' && (
                <span style={{ color: 'rgba(248, 113, 113, 0.95)' }}>
                  {saveError || 'Unable to save'}
                </span>
              )}
            </div>
            <div style={dialogButtonsStyle}>
              <button
                className="button button-ghost"
                type="button"
                onClick={handleCancelCardDetails}
              >
                Cancel
              </button>
              <button
                className="button button-primary"
                type="button"
                onClick={() => handleSaveCardDetails()}
                disabled={saveStatus === 'saving'}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* custom delete modal for lists */}
      {listToDelete && (
        <div style={overlayStyle}>
          <div style={dialogStyle}>
            <h3 style={{ margin: 0, marginBottom: 8, fontSize: 18 }}>
              Delete this column?
            </h3>
            <p
              style={{
                margin: 0,
                marginBottom: 4,
                fontSize: 14,
                color: 'rgba(226,232,240,0.95)',
              }}
            >
              “{listToDelete.title}” will be permanently removed.
            </p>
            <p
              style={{
                margin: 0,
                marginTop: 4,
                fontSize: 12,
                color: 'rgba(226,232,240,0.7)',
              }}
            >
              This action cannot be undone.
            </p>
            <div style={dialogButtonsStyle}>
              <button
                className="button button-ghost"
                type="button"
                onClick={cancelDeleteList}
              >
                Cancel
              </button>
              <button
                className="button button-primary"
                type="button"
                onClick={confirmDeleteList}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* custom delete modal for cards */}
      {cardToDelete && (
        <div style={overlayStyle}>
          <div style={dialogStyle}>
            <h3 style={{ margin: 0, marginBottom: 8, fontSize: 18 }}>
              Delete this card?
            </h3>
            <p
              style={{
                margin: 0,
                marginBottom: 4,
                fontSize: 14,
                color: 'rgba(226,232,240,0.95)',
              }}
            >
              “{cardToDelete.title || 'Untitled card'}” will be permanently removed.
            </p>
            <p
              style={{
                margin: 0,
                marginTop: 4,
                fontSize: 12,
                color: 'rgba(226,232,240,0.7)',
              }}
            >
              This action cannot be undone.
            </p>
            <div style={dialogButtonsStyle}>
              <button
                className="button button-ghost"
                type="button"
                onClick={cancelDeleteCard}
              >
                Cancel
              </button>
              <button
                className="button button-primary"
                type="button"
                onClick={confirmDeleteCard}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoardDetailPage;
