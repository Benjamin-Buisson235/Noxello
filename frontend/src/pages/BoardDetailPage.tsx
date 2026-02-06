import React, { useMemo, useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthUser } from '../hooks/useAuthUser';
import { overlayStyle, dialogStyle, dialogButtonsStyle } from '../components/modalStyles';
import ConfirmDialog from '../components/ConfirmDialog';
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

function BoardDetailPage() {
  const navigate = useNavigate();
  const { boardId } = useParams();
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
    fetchBoardLabels,
    fetchArchivedLists,
  } = useBoardData({ boardId, user });

  const {
    newListTitle,
    isAddingList,
    listToDelete,
    setNewListTitle,
    setIsAddingList,
    handleCreateList,
    handleRenameList,
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
    handleMoveCard,
    handleReorderCard,
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
    dragEnabled,
    setDragEnabled,
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
  } = useCardModal({
    boardId,
    setBoardLabels,
    setArchivedLists,
    fetchBoardFull,
    fetchArchivedLists,
    onDeleteCard: handleDeleteCard,
  });

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

  const handleToggleDrag = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setDragEnabled(enabled);
    localStorage.setItem('dragEnabled', enabled ? 'true' : 'false');
  };

  const isOwner = !!board && !!user && board.ownerId === user.id;

  if (loadingUser || loadingBoard) {
    return <p style={{ padding: 24 }}>Loading...</p>;
  }

  if (error) {
    return (
      <div className="boards-page">
        <section className="card">
          <h2 style={{ marginTop: 0 }}>Board</h2>
          <p className="text-error">{error}</p>
          <button className="button button-ghost" onClick={handleBack}>
            Back to boards
          </button>
        </section>
      </div>
    );
  }

  if (!board) {
    return null;
  }

  return (
    <div className="boards-page">
      <BoardHeader
        board={board}
        onBack={handleBack}
        onMembers={openMembers}
        onLogout={handleLogout}
      />

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Card movement</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
          <input type="checkbox" checked={dragEnabled} onChange={handleToggleDrag} />
          Enable drag & drop for cards
        </label>
      </section>

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

      <DndContext
        sensors={dragEnabled ? sensors : []}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <BoardColumns
          filteredLists={filteredLists}
          lists={lists}
          dragEnabled={dragEnabled}
          activeCardListId={activeCardListId}
          newCardTitleByList={newCardTitleByList}
          handleReorderLists={handleReorderLists}
          handleRenameList={handleRenameList}
          handleDeleteList={handleDeleteList}
          handleReorderCard={handleReorderCard}
          handleMoveCard={handleMoveCard}
          handleDeleteCard={handleDeleteCard}
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
        onClose={closeMembers}
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
  );
}

export default BoardDetailPage;
