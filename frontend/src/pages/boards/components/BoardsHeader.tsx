type BoardsHeaderProps = {
  userEmail: string;
};

function BoardsHeader({ userEmail }: BoardsHeaderProps) {
  return (
    <header className="boards-header">
      <div>
        <h1 className="boards-title">Boards</h1>
        <p className="boards-user">Signed in as {userEmail}</p>
      </div>
    </header>
  );
}

export default BoardsHeader;
