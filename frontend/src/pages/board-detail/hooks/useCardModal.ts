import { useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import api from '../../../api';
import { sameLabelIds, toDateInputValue } from '../utils';

type UseCardModalParams = {
  boardId?: string;
  setBoardLabels: Dispatch<SetStateAction<any[]>>;
  setArchivedLists: Dispatch<SetStateAction<any[]>>;
  fetchBoardFull: (options?: { silent?: boolean }) => Promise<void>;
  fetchArchivedLists: () => Promise<void>;
  onDeleteCard: (listId: number, card: any) => void;
};

type CardEditState = {
  id: number;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  archived?: boolean;
  listId: number;
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type UseCardModalResult = {
  cardToEdit: CardEditState | null;
  editCardTitle: string;
  editCardDescription: string;
  editCardDueDate: string;
  selectedLabelIds: number[];
  newLabelName: string;
  newLabelColor: string;
  checklistItems: any[];
  newChecklistText: string;
  comments: any[];
  newCommentContent: string;
  isDirty: boolean;
  saveStatus: SaveStatus;
  saveError: string;
  checklistDoneCount: number;
  checklistTotalCount: number;
  setEditCardTitle: (value: string) => void;
  setEditCardDescription: (value: string) => void;
  setEditCardDueDate: (value: string) => void;
  setNewLabelName: (value: string) => void;
  setNewLabelColor: (value: string) => void;
  setNewChecklistText: (value: string) => void;
  setNewCommentContent: (value: string) => void;
  openCardDetails: (card: any, listId: number) => void;
  saveCardDetails: (forcedDueDate?: string | null) => Promise<void>;
  cancelCardDetails: () => void;
  clearDueDate: () => Promise<void>;
  toggleLabel: (labelId: number) => void;
  createLabel: () => Promise<void>;
  addChecklistItem: () => Promise<void>;
  toggleChecklistItem: (itemId: number, done: boolean) => Promise<void>;
  checklistTextChange: (itemId: number, text: string) => void;
  saveChecklistText: (itemId: number, text: string) => Promise<void>;
  deleteChecklistItem: (itemId: number) => Promise<void>;
  reorderChecklistItem: (itemId: number, direction: 'up' | 'down') => Promise<void>;
  addComment: () => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  archiveCard: () => Promise<void>;
  unarchiveCard: () => Promise<void>;
  deleteCardFromModal: () => void;
  overlayClick: () => void;
};

export const useCardModal = ({
  boardId,
  setBoardLabels,
  setArchivedLists,
  fetchBoardFull,
  fetchArchivedLists,
  onDeleteCard,
}: UseCardModalParams): UseCardModalResult => {
  const [cardToEdit, setCardToEdit] = useState<CardEditState | null>(null);
  const [editCardTitle, setEditCardTitle] = useState('');
  const [editCardDescription, setEditCardDescription] = useState('');
  const [editCardDueDate, setEditCardDueDate] = useState('');
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([]);
  const [initialLabelIds, setInitialLabelIds] = useState<number[]>([]);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('');
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState('');
  const saveStatusTimeout = useRef<number | null>(null);

  const fetchChecklistItems = async (cardId: number, listId: number) => {
    if (!boardId) return;
    try {
      const res = await api.get(
        `/boards/${boardId}/lists/${listId}/cards/${cardId}/checklist`
      );
      setChecklistItems(res.data.items || []);
    } catch (err) {
      console.error('Fetch checklist error ====>', err);
      setChecklistItems([]);
    }
  };

  const fetchComments = async (cardId: number, listId: number) => {
    if (!boardId) return;
    try {
      const res = await api.get(
        `/boards/${boardId}/lists/${listId}/cards/${cardId}/comments`
      );
      setComments(res.data.comments || []);
    } catch (err) {
      console.error('Fetch comments error ====>', err);
      setComments([]);
    }
  };

  const openCardDetails = (card: any, listId: number) => {
    const labelIds = (card.cardLabels || [])
      .map((entry: any) => entry.labelId ?? entry.label?.id)
      .filter((value: any) => Number.isFinite(value));
    setCardToEdit({
      id: card.id,
      title: card.title,
      description: card.description ?? '',
      dueDate: card.dueDate ?? null,
      archived: !!card.archived,
      listId,
    });
    setEditCardTitle(card.title || '');
    setEditCardDescription(card.description ?? '');
    setEditCardDueDate(toDateInputValue(card.dueDate));
    setSelectedLabelIds(labelIds);
    setInitialLabelIds(labelIds);
    setNewChecklistText('');
    fetchChecklistItems(card.id, listId);
    setNewCommentContent('');
    fetchComments(card.id, listId);
    setIsDirty(false);
    setSaveStatus('idle');
    setSaveError('');
  };

  const saveCardDetails = async (forcedDueDate?: string | null) => {
    if (!cardToEdit || !boardId) return;
    const trimmedTitle = editCardTitle.trim();
    if (!trimmedTitle) {
      setSaveStatus('error');
      setSaveError('Title is required');
      return;
    }
    const initialDueDate = toDateInputValue(cardToEdit.dueDate);
    const dueDateChanged =
      forcedDueDate !== undefined ? true : editCardDueDate !== initialDueDate;
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
        `/boards/${boardId}/lists/${cardToEdit.listId}/cards/${cardToEdit.id}`,
        {
          title: trimmedTitle,
          description: editCardDescription,
          ...(dueDateValue !== undefined ? { dueDate: dueDateValue } : {}),
        }
      );
      if (labelsChanged) {
        await api.put(
          `/boards/${boardId}/lists/${cardToEdit.listId}/cards/${cardToEdit.id}/labels`,
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
      await fetchBoardFull({ silent: true });
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

  const cancelCardDetails = () => {
    if (isDirty) {
      const confirmClose = window.confirm('Discard unsaved changes?');
      if (!confirmClose) return;
    }
    setCardToEdit(null);
    setChecklistItems([]);
    setNewChecklistText('');
    setComments([]);
    setNewCommentContent('');
  };

  const clearDueDate = async () => {
    setEditCardDueDate('');
    await saveCardDetails(null);
  };

  const toggleLabel = (labelId: number) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  const createLabel = async () => {
    if (!boardId) return;
    const name = newLabelName.trim();
    if (!name) return;

    try {
      const res = await api.post(`/boards/${boardId}/labels`, {
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

  const addChecklistItem = async () => {
    if (!cardToEdit || !boardId) return;
    const text = newChecklistText.trim();
    if (!text) return;

    try {
      const res = await api.post(
        `/boards/${boardId}/lists/${cardToEdit.listId}/cards/${cardToEdit.id}/checklist`,
        { text }
      );
      const item = res.data.item;
      setChecklistItems((prev) => [...prev, item]);
      setNewChecklistText('');
    } catch (err) {
      console.error('Add checklist item error ====>', err);
    }
  };

  const toggleChecklistItem = async (itemId: number, done: boolean) => {
    if (!cardToEdit || !boardId) return;
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, done } : item))
    );
    try {
      const res = await api.patch(
        `/boards/${boardId}/lists/${cardToEdit.listId}/cards/${cardToEdit.id}/checklist/${itemId}`,
        { done }
      );
      const updated = res.data.item;
      setChecklistItems((prev) =>
        prev.map((item) => (item.id === itemId ? updated : item))
      );
    } catch (err) {
      console.error('Toggle checklist item error ====>', err);
      fetchChecklistItems(cardToEdit.id, cardToEdit.listId);
    }
  };

  const checklistTextChange = (itemId: number, text: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, text } : item))
    );
  };

  const saveChecklistText = async (itemId: number, text: string) => {
    if (!cardToEdit || !boardId) return;
    const trimmed = text.trim();
    if (!trimmed) {
      fetchChecklistItems(cardToEdit.id, cardToEdit.listId);
      return;
    }

    try {
      const res = await api.patch(
        `/boards/${boardId}/lists/${cardToEdit.listId}/cards/${cardToEdit.id}/checklist/${itemId}`,
        { text: trimmed }
      );
      const updated = res.data.item;
      setChecklistItems((prev) =>
        prev.map((item) => (item.id === itemId ? updated : item))
      );
    } catch (err) {
      console.error('Update checklist item error ====>', err);
      fetchChecklistItems(cardToEdit.id, cardToEdit.listId);
    }
  };

  const deleteChecklistItem = async (itemId: number) => {
    if (!cardToEdit || !boardId) return;
    setChecklistItems((prev) => prev.filter((item) => item.id !== itemId));
    try {
      await api.delete(
        `/boards/${boardId}/lists/${cardToEdit.listId}/cards/${cardToEdit.id}/checklist/${itemId}`
      );
    } catch (err) {
      console.error('Delete checklist item error ====>', err);
      fetchChecklistItems(cardToEdit.id, cardToEdit.listId);
    }
  };

  const reorderChecklistItem = async (
    itemId: number,
    direction: 'up' | 'down'
  ) => {
    if (!cardToEdit || !boardId) return;
    const currentIndex = checklistItems.findIndex((item) => item.id === itemId);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= checklistItems.length) return;

    const reordered = [...checklistItems];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    setChecklistItems(reordered);

    try {
      await api.patch(
        `/boards/${boardId}/lists/${cardToEdit.listId}/cards/${cardToEdit.id}/checklist/reorder`,
        { orderedItemIds: reordered.map((item) => item.id) }
      );
    } catch (err) {
      console.error('Reorder checklist error ====>', err);
      fetchChecklistItems(cardToEdit.id, cardToEdit.listId);
    }
  };

  const addComment = async () => {
    if (!cardToEdit || !boardId) return;
    const content = newCommentContent.trim();
    if (!content) return;

    try {
      const res = await api.post(
        `/boards/${boardId}/lists/${cardToEdit.listId}/cards/${cardToEdit.id}/comments`,
        { content }
      );
      const comment = res.data.comment;
      setComments((prev) => [...prev, comment]);
      setNewCommentContent('');
    } catch (err) {
      console.error('Add comment error ====>', err);
    }
  };

  const deleteComment = async (commentId: number) => {
    if (!cardToEdit || !boardId) return;
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    try {
      await api.delete(
        `/boards/${boardId}/lists/${cardToEdit.listId}/cards/${cardToEdit.id}/comments/${commentId}`
      );
    } catch (err) {
      console.error('Delete comment error ====>', err);
      fetchComments(cardToEdit.id, cardToEdit.listId);
    }
  };

  const archiveCard = async () => {
    if (!cardToEdit || !boardId) return;
    try {
      await api.patch(
        `/boards/${boardId}/lists/${cardToEdit.listId}/cards/${cardToEdit.id}/archive`
      );
      setCardToEdit(null);
      await fetchBoardFull({ silent: true });
      await fetchArchivedLists();
    } catch (err) {
      console.error('Archive card error ====>', err);
    }
  };

  const unarchiveCard = async () => {
    if (!cardToEdit || !boardId) return;
    const archivedCard = cardToEdit;
    try {
      await api.patch(
        `/boards/${boardId}/lists/${cardToEdit.listId}/cards/${cardToEdit.id}/unarchive`
      );
      setCardToEdit(null);
      setArchivedLists((prev) =>
        prev
          .map((list: any) =>
            list.id === archivedCard.listId
              ? {
                  ...list,
                  cards: (list.cards || []).filter(
                    (c: any) => c.id !== archivedCard.id
                  ),
                }
              : list
          )
          .filter((list: any) => (list.cards || []).length > 0)
      );
      await fetchBoardFull({ silent: true });
      await fetchArchivedLists();
    } catch (err) {
      console.error('Unarchive card error ====>', err);
    }
  };

  const deleteCardFromModal = () => {
    if (!cardToEdit) return;
    onDeleteCard(cardToEdit.listId, { id: cardToEdit.id, title: cardToEdit.title });
    setCardToEdit(null);
    fetchArchivedLists();
  };

  const overlayClick = () => {
    cancelCardDetails();
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
        cancelCardDetails();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        saveCardDetails();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cardToEdit, saveCardDetails]);

  const checklistDoneCount = useMemo(
    () => checklistItems.filter((item) => item.done).length,
    [checklistItems]
  );
  const checklistTotalCount = checklistItems.length;

  return {
    cardToEdit,
    editCardTitle,
    editCardDescription,
    editCardDueDate,
    selectedLabelIds,
    newLabelName,
    newLabelColor,
    checklistItems,
    newChecklistText,
    comments,
    newCommentContent,
    isDirty,
    saveStatus,
    saveError,
    checklistDoneCount,
    checklistTotalCount,
    setEditCardTitle,
    setEditCardDescription,
    setEditCardDueDate,
    setNewLabelName,
    setNewLabelColor,
    setNewChecklistText,
    setNewCommentContent,
    openCardDetails,
    saveCardDetails,
    cancelCardDetails,
    clearDueDate,
    toggleLabel,
    createLabel,
    addChecklistItem,
    toggleChecklistItem,
    checklistTextChange,
    saveChecklistText,
    deleteChecklistItem,
    reorderChecklistItem,
    addComment,
    deleteComment,
    archiveCard,
    unarchiveCard,
    deleteCardFromModal,
    overlayClick,
  };
};
