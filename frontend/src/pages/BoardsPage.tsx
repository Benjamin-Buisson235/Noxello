import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthUser } from '../hooks/useAuthUser';
import { overlayStyle, dialogStyle, dialogButtonsStyle } from '../components/modalStyles';
import ConfirmDialog from '../components/ConfirmDialog';
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
    setNewTitle,
    handleCreateBoard,
    handleRenameBoard,
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

  if (loadingUser) {
    return <p style={{ padding: 24 }}>Loading...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="boards-page">
      <BoardsHeader
        userEmail={user.email}
        invitesCount={invites.length}
        onOpenInvites={() => setShowInvitesModal(true)}
        onOpenSettings={handleOpenSettings}
        onLogout={handleLogout}
      />

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
        onAccept={handleAcceptInvite}
        onDecline={handleDeclineInvite}
        onClose={() => setShowInvitesModal(false)}
        overlayStyle={overlayStyle}
        dialogStyle={dialogStyle}
        dialogButtonsStyle={dialogButtonsStyle}
      />

      <ConfirmDialog
        open={boardToDelete != null}
        title="Delete board"
        description="Delete this board and all of its lists/cards?"
        confirmLabel="Delete"
        onConfirm={confirmDeleteBoard}
        onCancel={cancelDeleteBoard}
        overlayStyle={overlayStyle}
        dialogStyle={dialogStyle}
        dialogButtonsStyle={dialogButtonsStyle}
      />
    </div>
  );
}

export default BoardsPage;
