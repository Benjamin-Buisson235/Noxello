import { useEffect, useMemo, useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthUser } from '../hooks/useAuthUser';
import AppSidebar from '../components/AppSidebar';
import { overlayStyle, dialogStyle, dialogButtonsStyle } from '../components/modalStyles';
import ConfirmDialog from '../components/ConfirmDialog';
import PromptDialog from '../components/PromptDialog';
import InvitesModal from './boards/components/InvitesModal';
import api from '../api';
import BoardHeader from './board-detail/components/BoardHeader';
import FiltersPanel from './board-detail/components/FiltersPanel';
import BoardColumns from './board-detail/components/BoardColumns';
import ArchivedSection from './board-detail/components/ArchivedSection';
import MembersModal from './board-detail/components/MembersModal';
import CardModal from './board-detail/components/CardModal';
import DragPreview from './board-detail/components/DragPreview';
import { buildFilteredLists } from './board-detail/filters';
import { useBoardData } from './board-detail/hooks/useBoardData';
import { useListActions } from './board-detail/hooks/useListActions';
import { useCardActions } from './board-detail/hooks/useCardActions';
import { useCardDnD } from './board-detail/hooks/useCardDnD';
import { useMembers } from './board-detail/hooks/useMembers';
import { useCardModal } from './board-detail/hooks/useCardModal';
import { useBoardsList } from '../hooks/useBoardsList';
import { useInvites } from '../hooks/useInvites';

function BoardDetailPage() {
  const navigate = useNavigate();
  const { id: boardId } = useParams();
  const { user, loadingUser } = useAuthUser(navigate);

  const {
    board,
    lists,
    boardLabels,
    archivedLists,
    loadingBoard,
    error,
    setLists,
    setBoardLabels,
    setArchivedLists,
    fetchBoardFull,
    fetchArchivedLists,
  } = useBoardData({ boardId, user });

  const {
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
  } = useListActions({
    boardId,
    lists,
    setLists,
    fetchBoardFull,
  });

  const {
    newCardTitleByList,
    activeCardListId,
    cardToDelete,
    handleOpenAddCard,
    handleChangeCardTitle,
    handleAddCard,
    handleCancelAddCard,
    handleDeleteCard,
    confirmDeleteCard,
    cancelDeleteCard,
  } = useCardActions({
    boardId,
    lists,
    setLists,
    setArchivedLists,
    fetchBoardFull,
    fetchArchivedLists,
  });

  const {
    sensors,
    collisionDetection,
    activeDragCard,
    columnsScrollRef,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useCardDnD({
    boardId,
    lists,
    setLists,
    fetchBoardFull,
  });

  const {
    showMembersModal,
    members,
    membersLoading,
    membersError,
    inviteEmail,
    inviteStatus,
    inviteMessage,
    setInviteEmail,
    openMembers,
    closeMembers,
    inviteMember,
    removeMember,
  } = useMembers({ boardId, enabled: !!board });

  const {
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
    showDiscardConfirm,
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
    confirmDiscardChanges,
    cancelDiscardChanges,
    clearDueDate,
    toggleLabel,
    createLabel,
    deleteLabel,
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
  } = useCardModal({
    boardId,
    setBoardLabels,
    setArchivedLists,
    fetchBoardFull,
    fetchArchivedLists,
    onDeleteCard: handleDeleteCard,
  });

  const { boards: navBoards, refreshBoards: refreshNavBoards } = useBoardsList({
    user,
  });
  const {
    invites,
    loading: loadingInvites,
    error: invitesError,
    acceptInvite,
    declineInvite,
  } = useInvites({ user });

  const [showInvitesModal, setShowInvitesModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [collaboratorsCount, setCollaboratorsCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'overdue' | 'dueSoon'>('all');
  const [filterLabelIds, setFilterLabelIds] = useState<number[]>([]);

  const { filteredLists, resultCount, filtersActive } = useMemo(
    () =>
      buildFilteredLists({
        lists,
        searchQuery,
        dateFilter,
        filterLabelIds,
      }),
    [lists, searchQuery, dateFilter, filterLabelIds]
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/boards');
  };

  const handleOpenSettings = () => {
    navigate('/settings');
  };

  const handleAcceptInviteAndOpen = async (inviteId: number) => {
    const acceptedBoardId = await acceptInvite(inviteId);
    if (acceptedBoardId) {
      refreshNavBoards({ silent: true });
      setShowInvitesModal(false);
      navigate(`/boards/${acceptedBoardId}`);
    }
  };

  const requestDeleteBoard = () => {
    const count = Math.max(0, members.length - 1);
    setCollaboratorsCount(count);
    setShowDeleteConfirm(true);
  };

  const requestLeaveBoard = () => {
    setShowLeaveConfirm(true);
  };

  const confirmDeleteBoard = async () => {
    if (!board) return;
    try {
      await api.delete(`/boards/${board.id}`);
      setShowDeleteConfirm(false);
      navigate('/boards');
    } catch (err) {
      console.error('Delete board error ====>', err);
      setShowDeleteConfirm(false);
    }
  };

  const confirmLeaveBoard = async () => {
    if (!board || !user) return;
    try {
      await api.delete(`/boards/${board.id}/members/${user.id}`);
      setShowLeaveConfirm(false);
      navigate('/boards');
    } catch (err) {
      console.error('Leave board error ====>', err);
      setShowLeaveConfirm(false);
    }
  };

  const isOwner = !!board && !!user && board.ownerId === user.id;

  useEffect(() => {
    if (error && error.includes("don't have permission")) {
      navigate('/boards');
    }
  }, [error, navigate]);

  if (loadingUser || loadingBoard) {
    return <p style={{ padding: 24 }}>Loading...</p>;
  }

  if (error) {
    return (
      <div className="app-shell">
      <AppSidebar
        boards={navBoards}
        activeBoardId={board?.id ?? null}
        activeSection="board"
        userName={user?.name}
        userEmail={user?.email}
        onHome={handleBack}
        onSelectBoard={(id) => navigate(`/boards/${id}`)}
        onOpenSettings={handleOpenSettings}
          onLogout={handleLogout}
          onOpenInvites={() => setShowInvitesModal(true)}
          invitesCount={invites.length}
        />
        <div className="app-main">
          <div className="boards-page">
            <section className="card">
              <h2 style={{ marginTop: 0 }}>Board</h2>
              <p className="text-error">{error}</p>
              <button className="button button-ghost" onClick={handleBack}>
                Back to boards
              </button>
            </section>

            <InvitesModal
              open={showInvitesModal}
              invites={invites}
              loading={loadingInvites}
              error={invitesError}
              onAccept={handleAcceptInviteAndOpen}
              onDecline={declineInvite}
              onClose={() => setShowInvitesModal(false)}
              overlayStyle={overlayStyle}
              dialogStyle={dialogStyle}
              dialogButtonsStyle={dialogButtonsStyle}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!board) {
    return null;
  }

  return (
    <div className="app-shell">
      <AppSidebar
        boards={navBoards}
        activeBoardId={board.id}
        activeSection="board"
        userName={user?.name}
        userEmail={user?.email}
        onHome={handleBack}
        onSelectBoard={(id) => navigate(`/boards/${id}`)}
        onOpenSettings={handleOpenSettings}
        onLogout={handleLogout}
        onOpenInvites={() => setShowInvitesModal(true)}
        invitesCount={invites.length}
      />
      <div className="app-main">
        <div className="boards-page">
          <BoardHeader board={board} onMembers={openMembers} />

          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <BoardColumns
              filteredLists={filteredLists}
              lists={lists}
              activeCardListId={activeCardListId}
              newCardTitleByList={newCardTitleByList}
              handleReorderLists={handleReorderLists}
              handleRenameList={handleRenameList}
              handleDeleteList={handleDeleteList}
              onOpenCardDetails={openCardDetails}
              onAddCard={handleAddCard}
              onOpenAddCard={handleOpenAddCard}
              onCancelAddCard={handleCancelAddCard}
              onChangeCardTitle={handleChangeCardTitle}
              columnsScrollRef={columnsScrollRef}
              isAddingList={isAddingList}
              newListTitle={newListTitle}
              onCreateList={handleCreateList}
              onStartAddList={() => setIsAddingList(true)}
              onCancelAddList={() => {
                setIsAddingList(false);
                setNewListTitle('');
              }}
              onChangeNewListTitle={setNewListTitle}
            />
            <DragOverlay zIndex={99999}>
              <DragPreview card={activeDragCard} />
            </DragOverlay>
          </DndContext>

          <FiltersPanel
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            boardLabels={boardLabels}
            filterLabelIds={filterLabelIds}
            onLabelFilterChange={(labelId) =>
              setFilterLabelIds(labelId == null ? [] : [labelId])
            }
            filtersActive={filtersActive}
            resultCount={resultCount}
            onClearFilters={() => {
              setSearchQuery('');
              setDateFilter('all');
              setFilterLabelIds([]);
            }}
          />

          <ArchivedSection lists={archivedLists} onOpenCardDetails={openCardDetails} />

          <MembersModal
            open={showMembersModal}
            members={members}
            membersLoading={membersLoading}
            membersError={membersError}
            isOwner={isOwner}
            inviteEmail={inviteEmail}
            inviteMessage={inviteMessage}
            inviteStatus={inviteStatus}
            onInviteEmailChange={setInviteEmail}
            onInviteSubmit={inviteMember}
            onRemoveMember={removeMember}
            onLeaveBoard={requestLeaveBoard}
            onDeleteBoard={requestDeleteBoard}
            onClose={closeMembers}
            overlayStyle={overlayStyle}
            dialogStyle={dialogStyle}
            dialogButtonsStyle={dialogButtonsStyle}
          />

          <InvitesModal
            open={showInvitesModal}
            invites={invites}
            loading={loadingInvites}
            error={invitesError}
            onAccept={handleAcceptInviteAndOpen}
            onDecline={declineInvite}
            onClose={() => setShowInvitesModal(false)}
            overlayStyle={overlayStyle}
            dialogStyle={dialogStyle}
            dialogButtonsStyle={dialogButtonsStyle}
          />
          <CardModal
            card={cardToEdit}
            editCardTitle={editCardTitle}
            editCardDescription={editCardDescription}
            editCardDueDate={editCardDueDate}
            boardLabels={boardLabels}
            selectedLabelIds={selectedLabelIds}
            newLabelName={newLabelName}
            newLabelColor={newLabelColor}
            checklistItems={checklistItems}
            checklistDoneCount={checklistDoneCount}
            checklistTotalCount={checklistTotalCount}
            newChecklistText={newChecklistText}
            comments={comments}
            newCommentContent={newCommentContent}
            isDirty={isDirty}
            saveStatus={saveStatus}
            saveError={saveError}
            overlayStyle={overlayStyle}
            dialogStyle={dialogStyle}
            dialogButtonsStyle={dialogButtonsStyle}
            onOverlayClick={overlayClick}
            onCancel={cancelCardDetails}
            onSave={() => saveCardDetails()}
            onArchive={archiveCard}
            onUnarchive={unarchiveCard}
            onDelete={deleteCardFromModal}
            onChangeTitle={setEditCardTitle}
            onChangeDescription={setEditCardDescription}
            onChangeDueDate={setEditCardDueDate}
            onClearDueDate={clearDueDate}
            onToggleLabel={toggleLabel}
            onCreateLabel={createLabel}
            onChangeNewLabelName={setNewLabelName}
            onChangeNewLabelColor={setNewLabelColor}
            onDeleteLabel={deleteLabel}
            onToggleChecklistItem={toggleChecklistItem}
            onChecklistTextChange={checklistTextChange}
            onSaveChecklistText={saveChecklistText}
            onReorderChecklistItem={reorderChecklistItem}
            onDeleteChecklistItem={deleteChecklistItem}
            onAddChecklistItem={addChecklistItem}
            onChangeNewChecklistText={setNewChecklistText}
            onAddComment={addComment}
            onChangeNewCommentContent={setNewCommentContent}
            onDeleteComment={deleteComment}
            currentUserId={user?.id}
          />

          <ConfirmDialog
            open={showDeleteConfirm}
            title="Delete board?"
            description={`Do you want to delete this board? There are currently ${collaboratorsCount} people collaborating with you on it, and all of its lists/cards?`}
            confirmLabel="Delete"
            onConfirm={confirmDeleteBoard}
            onCancel={() => setShowDeleteConfirm(false)}
            overlayStyle={overlayStyle}
            dialogStyle={dialogStyle}
            dialogButtonsStyle={dialogButtonsStyle}
          />

          <ConfirmDialog
            open={showLeaveConfirm}
            title="Leave board?"
            description="Do you want to leave this collaborative board?"
            confirmLabel="Leave"
            onConfirm={confirmLeaveBoard}
            onCancel={() => setShowLeaveConfirm(false)}
            overlayStyle={overlayStyle}
            dialogStyle={dialogStyle}
            dialogButtonsStyle={dialogButtonsStyle}
          />

          <ConfirmDialog
            open={showDiscardConfirm}
            title="Discard changes"
            description="Discard unsaved changes to this card?"
            confirmLabel="Discard"
            onConfirm={confirmDiscardChanges}
            onCancel={cancelDiscardChanges}
            overlayStyle={overlayStyle}
            dialogStyle={dialogStyle}
            dialogButtonsStyle={dialogButtonsStyle}
          />

          <PromptDialog
            open={!!listToRename}
            title="Rename list"
            description={`Rename list \"${listToRename?.title || ''}\"`}
            value={renameValue}
            placeholder="List title"
            confirmLabel="Save"
            onChange={setRenameValue}
            onConfirm={confirmRenameList}
            onCancel={cancelRenameList}
            overlayStyle={overlayStyle}
            dialogStyle={dialogStyle}
            dialogButtonsStyle={dialogButtonsStyle}
          />

          <ConfirmDialog
            open={!!listToDelete}
            title="Delete list"
            description={`Delete list "${listToDelete?.title || ''}"?`}
            note="Cards in this list will be deleted."
            confirmLabel="Delete"
            onConfirm={confirmDeleteList}
            onCancel={cancelDeleteList}
            overlayStyle={overlayStyle}
            dialogStyle={dialogStyle}
            dialogButtonsStyle={dialogButtonsStyle}
          />

          <ConfirmDialog
            open={!!cardToDelete}
            title={cardToDelete?.archived ? 'Delete archived card' : 'Delete card'}
            description={`Delete card "${cardToDelete?.title || ''}"?`}
            confirmLabel="Delete"
            onConfirm={confirmDeleteCard}
            onCancel={cancelDeleteCard}
            overlayStyle={overlayStyle}
            dialogStyle={dialogStyle}
            dialogButtonsStyle={dialogButtonsStyle}
          />
        </div>
      </div>
    </div>
  );
}

export default BoardDetailPage;
