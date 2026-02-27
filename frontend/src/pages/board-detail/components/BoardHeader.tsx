type BoardHeaderProps = {
  board: any;
  onMembers: () => void;
};

function BoardHeader({ board, onMembers }: BoardHeaderProps) {
  return (
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
        <button className="button button-ghost" onClick={onMembers}>
          Members
        </button>
      </div>
    </header>
  );
}

export default BoardHeader;
