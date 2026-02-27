import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthUser } from '../hooks/useAuthUser';
import AppSidebar from '../components/AppSidebar';
import { overlayStyle, dialogStyle, dialogButtonsStyle } from '../components/modalStyles';
import ConfirmDialog from '../components/ConfirmDialog';
import PromptDialog from '../components/PromptDialog';
import { useBoardsData } from './boards/hooks/useBoardsData';
import BoardsHeader from './boards/components/BoardsHeader';
import NewBoardForm from './boards/components/NewBoardForm';
import BoardsGrid from './boards/components/BoardsGrid';
import InvitesModal from './boards/components/InvitesModal';

function BoardsPage() {
  const navigate = useNavigate();
  const { user, loadingUser } = useAuthUser(navigate);
  const {
    boards,
    invites,
    newTitle,
    error,
    invitesError,
    loadingBoards,
    loadingInvites,
    boardToDelete,
    boardToRename,
    renameValue,
    setNewTitle,
    setRenameValue,
    handleCreateBoard,
    handleRenameBoard,
    confirmRenameBoard,
    cancelRenameBoard,
    handleDeleteBoard,
    confirmDeleteBoard,
    cancelDeleteBoard,
    handleAcceptInvite,
    handleDeclineInvite,
  } = useBoardsData({ user });

  const [showInvitesModal, setShowInvitesModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleOpenSettings = () => {
    navigate('/settings');
  };

  const handleOpenBoard = (boardId: number) => {
    navigate(`/boards/${boardId}`);
  };

  const handleAcceptInviteAndOpen = async (inviteId: number) => {
    const boardId = await handleAcceptInvite(inviteId);
    if (boardId) {
      setShowInvitesModal(false);
      navigate(`/boards/${boardId}`);
    }
  };

  if (loadingUser) {
    return <p style={{ padding: 24 }}>Loading...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="app-shell">
      <AppSidebar
        boards={boards}
        activeBoardId={null}
        activeSection="home"
        userName={user.name}
        userEmail={user.email}
        onHome={() => navigate('/boards')}
        onSelectBoard={handleOpenBoard}
        onOpenSettings={handleOpenSettings}
        onLogout={handleLogout}
        onOpenInvites={() => setShowInvitesModal(true)}
        invitesCount={invites.length}
      />

      <div className="app-main">
        <div className="boards-page">
          <BoardsHeader userEmail={user.email} />

          <NewBoardForm
            newTitle={newTitle}
            error={error}
            onChangeTitle={setNewTitle}
            onSubmit={handleCreateBoard}
          />

          <BoardsGrid
            boards={boards}
            loading={loadingBoards}
            userId={user.id}
            onOpen={handleOpenBoard}
            onRename={handleRenameBoard}
            onDelete={handleDeleteBoard}
          />

          <InvitesModal
            open={showInvitesModal}
            invites={invites}
            loading={loadingInvites}
            error={invitesError}
            onAccept={handleAcceptInviteAndOpen}
            onDecline={handleDeclineInvite}
            onClose={() => setShowInvitesModal(false)}
            overlayStyle={overlayStyle}
            dialogStyle={dialogStyle}
            dialogButtonsStyle={dialogButtonsStyle}
          />

          <PromptDialog
            open={!!boardToRename}
            title="Rename board"
            description={`Rename board \"${boardToRename?.title || ''}\"`}
            value={renameValue}
            placeholder="Board title"
            confirmLabel="Save"
            onChange={setRenameValue}
            onConfirm={confirmRenameBoard}
            onCancel={cancelRenameBoard}
            overlayStyle={overlayStyle}
            dialogStyle={dialogStyle}
            dialogButtonsStyle={dialogButtonsStyle}
          />

          <ConfirmDialog
            open={boardToDelete != null}
            title={boardToDelete?.isOwner ? 'Delete board?' : 'Leave board?'}
            description={
              boardToDelete?.isOwner
                ? `Do you want to delete this board? There are currently ${
                    boardToDelete.collaboratorsCount
                  } people collaborating with you on it, and all of its lists/cards?`
                : 'Do you want to leave this collaborative board?'
            }
            confirmLabel={boardToDelete?.isOwner ? 'Delete' : 'Leave'}
            onConfirm={confirmDeleteBoard}
            onCancel={cancelDeleteBoard}
            overlayStyle={overlayStyle}
            dialogStyle={dialogStyle}
            dialogButtonsStyle={dialogButtonsStyle}
          />
        </div>
      </div>
    </div>
  );
}

export default BoardsPage;
