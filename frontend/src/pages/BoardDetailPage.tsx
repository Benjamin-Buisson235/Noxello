// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

function BoardDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
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
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 6,
                      marginBottom: 4,
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        marginBottom: 2,
                        fontSize: 15,
                        color: '#fdfcff',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {list.title}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
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
                  <div
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    {cards.map((card: any, cardIndex: number) => (
                      <div
                        key={card.id}
                        style={{
                          borderRadius: 8,
                          padding: '6px 8px',
                          backgroundColor: 'rgba(11, 15, 35, 0.9)',
                          border: '1px solid rgba(157,78,221,0.55)',
                          fontSize: 12,
                          color: '#f9f5ff',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <span>{card.title}</span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              type="button"
                              className="button button-ghost"
                              style={{
                                padding: '2px 6px',
                                fontSize: 10,
                                lineHeight: 1,
                              }}
                              onClick={() =>
                                handleReorderCard(list.id, card.id, 'up')
                              }
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
                              onClick={() =>
                                handleReorderCard(list.id, card.id, 'down')
                              }
                              disabled={cardIndex === cards.length - 1}
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
                              onClick={() =>
                                handleMoveCard(list.id, card, 'left')
                              }
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
                              onClick={() =>
                                handleMoveCard(list.id, card, 'right')
                              }
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
                              onClick={() =>
                                handleDeleteCard(list.id, card)
                              }
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      </div>
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

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
