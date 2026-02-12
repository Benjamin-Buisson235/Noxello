import { useCallback, useState } from 'react';
import type { Dispatch, SetStateAction, FormEvent, MouseEvent } from 'react';
import api from '../../../api';

type UseListActionsParams = {
  boardId?: string;
  lists: any[];
  setLists: Dispatch<SetStateAction<any[]>>;
  fetchBoardFull: (options?: { silent?: boolean }) => Promise<void>;
};

type UseListActionsResult = {
  newListTitle: string;
  isAddingList: boolean;
  listToRename: { id: number; title: string } | null;
  renameValue: string;
  listToDelete: { id: number; title: string } | null;
  setNewListTitle: (value: string) => void;
  setIsAddingList: (value: boolean) => void;
  setRenameValue: (value: string) => void;
  handleCreateList: (event: FormEvent) => Promise<void>;
  handleRenameList: (event: MouseEvent, listId: number, title: string) => void;
  confirmRenameList: () => Promise<void>;
  cancelRenameList: () => void;
  handleReorderLists: (listId: number, direction: 'left' | 'right') => Promise<void>;
  handleDeleteList: (event: MouseEvent, listId: number, title: string) => void;
  confirmDeleteList: () => Promise<void>;
  cancelDeleteList: () => void;
};

export const useListActions = ({
  boardId,
  lists,
  setLists,
  fetchBoardFull,
}: UseListActionsParams): UseListActionsResult => {
  const [newListTitle, setNewListTitle] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [listToRename, setListToRename] = useState<
    { id: number; title: string } | null
  >(null);
  const [renameValue, setRenameValue] = useState('');
  const [listToDelete, setListToDelete] = useState<
    { id: number; title: string } | null
  >(null);

  const handleCreateList = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!boardId || !newListTitle.trim()) return;

      try {
        const res = await api.post(`/boards/${boardId}/lists`, {
          title: newListTitle.trim(),
        });
        const list = res.data.list;
        setLists((prev) => [...prev, { ...list, cards: [] }]);
        setNewListTitle('');
        setIsAddingList(false);
      } catch (err) {
        console.error('Create list error ====>', err);
      }
    },
    [boardId, newListTitle, setLists]
  );

  const handleRenameList = useCallback(
    (event: MouseEvent, listId: number, currentTitle: string) => {
      event.preventDefault();
      setListToRename({ id: listId, title: currentTitle });
      setRenameValue(currentTitle);
    },
    []
  );

  const confirmRenameList = useCallback(async () => {
    if (!boardId || !listToRename) return;
    const newTitle = renameValue.trim();
    if (!newTitle || newTitle === listToRename.title) {
      setListToRename(null);
      return;
    }

    try {
      const res = await api.put(`/boards/${boardId}/lists/${listToRename.id}`, {
        title: newTitle,
      });
      const updated = res.data.list;
      setLists((prev) =>
        prev.map((list: any) =>
          list.id === listToRename.id ? { ...list, title: updated.title } : list
        )
      );
    } catch (err) {
      console.error('Rename list error ====>', err);
    } finally {
      setListToRename(null);
    }
  }, [boardId, listToRename, renameValue, setLists]);

  const cancelRenameList = useCallback(() => {
    setListToRename(null);
    setRenameValue('');
  }, []);

  const handleReorderLists = useCallback(
    async (listId: number, direction: 'left' | 'right') => {
      if (!boardId || !lists.length) return;

      const currentIndex = lists.findIndex((list: any) => list.id === listId);
      if (currentIndex === -1) return;

      const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= lists.length) return;

      const reordered = [...lists];
      const [moved] = reordered.splice(currentIndex, 1);
      reordered.splice(targetIndex, 0, moved);

      setLists(reordered.map((list: any, index: number) => ({ ...list, position: index })));

      try {
        await api.patch(`/boards/${boardId}/lists/reorder`, {
          orderedListIds: reordered.map((list: any) => list.id),
        });
      } catch (err) {
        console.error('Reorder lists error ====>', err);
        fetchBoardFull({ silent: true });
      }
    },
    [boardId, fetchBoardFull, lists, setLists]
  );

  const handleDeleteList = useCallback(
    (event: MouseEvent, listId: number, title: string) => {
      event.preventDefault();
      setListToDelete({ id: listId, title });
    },
    []
  );

  const confirmDeleteList = useCallback(async () => {
    if (!boardId || !listToDelete) return;
    try {
      await api.delete(`/boards/${boardId}/lists/${listToDelete.id}`);
      setLists((prev) => prev.filter((list: any) => list.id !== listToDelete.id));
    } catch (err) {
      console.error('Delete list error ====>', err);
    } finally {
      setListToDelete(null);
    }
  }, [boardId, listToDelete, setLists]);

  const cancelDeleteList = useCallback(() => {
    setListToDelete(null);
  }, []);

  return {
    newListTitle,
    isAddingList,
    listToRename,
    renameValue,
    listToDelete,
    setNewListTitle,
    setIsAddingList,
    setRenameValue,
    handleCreateList,
    handleRenameList,
    confirmRenameList,
    cancelRenameList,
    handleReorderLists,
    handleDeleteList,
    confirmDeleteList,
    cancelDeleteList,
  };
};
