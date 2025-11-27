// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function BoardsPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState(null);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  const [boardToDelete, setBoardToDelete] = useState<number | null>(null);
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
    if (!user) return;

    const fetchBoards = async () => {
      try {
        setLoadingBoards(true);
        setError(null);
        const res = await api.get('/boards');
        setBoards(res.data.boards || []);
      } catch (err) {
        console.error('Fetch boards error ====>', err);
        setError('Unable to load boards.');
      } finally {
        setLoadingBoards(false);
      }
    };

    fetchBoards();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newTitle.trim()) {
      setError('Title is required.');
      return;
    }

    try {
      const res = await api.post('/boards', { title: newTitle.trim() });
      const board = res.data.board;
      setBoards((prev) => [...prev, board]);
      setNewTitle('');
    } catch (err) {
      console.error('Create board error ====>', err);
      setError('Unable to create board.');
    }
  };

  const handleRenameBoard = async (
    event: React.MouseEvent,
    id: number,
    currentTitle: string
  ) => {
    event.stopPropagation();

    const newTitle = window.prompt('New board title', currentTitle);
    if (!newTitle || newTitle.trim() === '' || newTitle.trim() === currentTitle) {
      return;
    }

    try {
      const res = await api.put(`/boards/${id}`, { title: newTitle.trim() });
      const updated = res.data.board;
      setBoards((prev) =>
        prev.map((b: any) => (b.id === id ? { ...b, title: updated.title } : b))
      );
    } catch (err) {
      console.error('Rename board error ====>', err);
      setError('Unable to rename board.');
    }
  };

  const handleDeleteBoard = (event: React.MouseEvent, id: number) => {
    event.stopPropagation();
    setBoardToDelete(id);
  };

  const confirmDeleteBoard = async () => {
    if (boardToDelete == null) return;
    try {
      await api.delete(`/boards/${boardToDelete}`);
      setBoards((prev) => prev.filter((b: any) => b.id !== boardToDelete));
    } catch (err) {
      console.error('Delete board error ====>', err);
      setError('Unable to delete board.');
    } finally {
      setBoardToDelete(null);
    }
  };

  const cancelDeleteBoard = () => {
    setBoardToDelete(null);
  };

  if (loadingUser) {
    return <p style={{ padding: 24 }}>Loading…</p>;
  }

  if (!user) {
    return null;
  }

  const boardBeingDeleted =
    boardToDelete != null
      ? boards.find((b: any) => b.id === boardToDelete)
      : null;

  return (
    <div className="boards-page">
      <header className="boards-header">
        <div>
          <h1 className="boards-title">Boards</h1>
          <p className="boards-user">Signed in as {user.email}</p>
        </div>
        <div className="boards-toolbar">
          <button
            className="button button-ghost"
            onClick={() => navigate('/settings')}
          >
            Settings
          </button>
          <button className="button button-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>New board</h2>
        <form
          onSubmit={handleCreateBoard}
          style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}
        >
          <input
            className="input"
            type="text"
            placeholder="Board title (e.g. Trello project)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button type="submit" className="button button-primary">
            Create
          </button>
        </form>
        {error && <div className="text-error">{error}</div>}
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Your boards</h2>
        {loadingBoards ? (
          <p>Loading boards…</p>
        ) : boards.length === 0 ? (
          <p className="text-muted">
            No boards yet. Create one above to get started.
          </p>
        ) : (
          <div className="boards-grid">
            {boards.map((board: any, index: number) => (
              <div
                key={board.id}
                className="board-card"
                onClick={() => navigate(`/boards/${board.id}`)}
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
                    gap: 8,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        marginBottom: 6,
                        fontSize: 15,
                        color: '#fdfcff',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {board.title}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: 'rgba(226,232,240,0.9)',
                      }}
                    >
                      Position: {index}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        marginTop: 4,
                        fontSize: 11,
                        color: 'rgba(226,232,240,0.75)',
                      }}
                    >
                      Created on{' '}
                      {new Date(board.createdAt).toLocaleString('en-US', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <button
                      className="button button-ghost"
                      style={{
                        padding: '3px 8px',
                        fontSize: 11,
                        lineHeight: 1,
                      }}
                      onClick={(e) => handleRenameBoard(e, board.id, board.title)}
                    >
                      Rename
                    </button>
                    <button
                      className="button button-ghost"
                      style={{
                        padding: '3px 8px',
                        fontSize: 11,
                        lineHeight: 1,
                      }}
                      onClick={(e) => handleDeleteBoard(e, board.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Custom delete modal */}
      {boardToDelete != null && (
        <div style={overlayStyle}>
          <div style={dialogStyle}>
            <h3 style={{ margin: 0, marginBottom: 8, fontSize: 18 }}>
              Delete this board?
            </h3>
            <p
              style={{
                margin: 0,
                marginBottom: 4,
                fontSize: 14,
                color: 'rgba(226,232,240,0.95)',
              }}
            >
              {boardBeingDeleted
                ? `“${boardBeingDeleted.title}” will be permanently removed.`
                : 'This board will be permanently removed.'}
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
                onClick={cancelDeleteBoard}
              >
                Cancel
              </button>
              <button
                className="button button-primary"
                type="button"
                onClick={confirmDeleteBoard}
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

export default BoardsPage;
