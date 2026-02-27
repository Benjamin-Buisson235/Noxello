import type { MouseEvent } from 'react';
import BoardCard from './BoardCard';

type BoardsGridProps = {
  boards: any[];
  loading: boolean;
  userId: number;
  onOpen: (boardId: number) => void;
  onRename: (event: MouseEvent, boardId: number, title: string) => void;
  onDelete: (event: MouseEvent, boardId: number) => void;
};

function BoardsGrid({ boards, loading, userId, onOpen, onRename, onDelete }: BoardsGridProps) {
  return (
    <section className="card">
      <h2 style={{ marginTop: 0, fontSize: 18 }}>Your boards</h2>
      {loading ? (
        <p>Loading boards…</p>
      ) : boards.length === 0 ? (
        <p className="text-muted">No boards yet. Create one above to get started.</p>
      ) : (
        <div className="boards-grid">
          {boards.map((board: any) => (
            <BoardCard
              key={board.id}
              board={board}
              isOwner={board.ownerId === userId}
              onOpen={() => onOpen(board.id)}
              onRename={(event) => onRename(event, board.id, board.title)}
              onDelete={(event) => onDelete(event, board.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default BoardsGrid;
