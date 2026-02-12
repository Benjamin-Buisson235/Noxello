import { useState } from 'react';
import type { CSSProperties } from 'react';
import DetailsSection from './card-modal/DetailsSection';
import LabelsSection from './card-modal/LabelsSection';
import ChecklistSection from './card-modal/ChecklistSection';
import CommentsSection from './card-modal/CommentsSection';
import ActionFooter from './card-modal/ActionFooter';
import LabelManagerModal from './card-modal/LabelManagerModal';

type CardModalProps = {
  card: any | null;
  editCardTitle: string;
  editCardDescription: string;
  editCardDueDate: string;
  boardLabels: any[];
  selectedLabelIds: number[];
  newLabelName: string;
  newLabelColor: string;
  checklistItems: any[];
  checklistDoneCount: number;
  checklistTotalCount: number;
  newChecklistText: string;
  comments: any[];
  newCommentContent: string;
  isDirty: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  saveError: string;
  overlayStyle: CSSProperties;
  dialogStyle: CSSProperties;
  dialogButtonsStyle: CSSProperties;
  onOverlayClick: () => void;
  onCancel: () => void;
  onSave: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeDueDate: (value: string) => void;
  onClearDueDate: () => void;
  onToggleLabel: (labelId: number) => void;
  onCreateLabel: () => void;
  onChangeNewLabelName: (value: string) => void;
  onChangeNewLabelColor: (value: string) => void;
  onDeleteLabel: (labelId: number) => void;
  onToggleChecklistItem: (itemId: number, done: boolean) => void;
  onChecklistTextChange: (itemId: number, text: string) => void;
  onSaveChecklistText: (itemId: number, text: string) => void;
  onReorderChecklistItem: (itemId: number, direction: 'up' | 'down') => void;
  onDeleteChecklistItem: (itemId: number) => void;
  onAddChecklistItem: () => void;
  onChangeNewChecklistText: (value: string) => void;
  onAddComment: () => void;
  onChangeNewCommentContent: (value: string) => void;
  onDeleteComment: (commentId: number) => void;
  currentUserId?: number;
};

function CardModal({
  card,
  editCardTitle,
  editCardDescription,
  editCardDueDate,
  boardLabels,
  selectedLabelIds,
  newLabelName,
  newLabelColor,
  checklistItems,
  checklistDoneCount,
  checklistTotalCount,
  newChecklistText,
  comments,
  newCommentContent,
  isDirty,
  saveStatus,
  saveError,
  overlayStyle,
  dialogStyle,
  dialogButtonsStyle,
  onOverlayClick,
  onCancel,
  onSave,
  onArchive,
  onUnarchive,
  onDelete,
  onChangeTitle,
  onChangeDescription,
  onChangeDueDate,
  onClearDueDate,
  onToggleLabel,
  onCreateLabel,
  onChangeNewLabelName,
  onChangeNewLabelColor,
  onDeleteLabel,
  onToggleChecklistItem,
  onChecklistTextChange,
  onSaveChecklistText,
  onReorderChecklistItem,
  onDeleteChecklistItem,
  onAddChecklistItem,
  onChangeNewChecklistText,
  onAddComment,
  onChangeNewCommentContent,
  onDeleteComment,
  currentUserId,
}: CardModalProps) {
  const [showLabelManager, setShowLabelManager] = useState(false);

  if (!card) return null;

  const cardDialogStyle: CSSProperties = {
    ...dialogStyle,
    width: 'min(92vw, 980px)',
    maxWidth: 980,
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
  };

  const bodyStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(220px, 320px)',
    gap: 16,
    overflowY: 'auto',
    paddingRight: 6,
  };

  const leftColumnStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    minWidth: 0,
  };

  const rightColumnStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    minWidth: 0,
  };

  return (
    <div style={overlayStyle} onClick={onOverlayClick}>
      <div style={cardDialogStyle} onClick={(event) => event.stopPropagation()}>
        <h3 style={{ margin: 0, marginBottom: 12, fontSize: 20 }}>Card details</h3>
        <div style={bodyStyle}>
          <div style={leftColumnStyle}>
            <DetailsSection
              editCardTitle={editCardTitle}
              editCardDescription={editCardDescription}
              editCardDueDate={editCardDueDate}
              onChangeTitle={onChangeTitle}
              onChangeDescription={onChangeDescription}
              onChangeDueDate={onChangeDueDate}
              onClearDueDate={onClearDueDate}
            />
            <LabelsSection
              boardLabels={boardLabels}
              selectedLabelIds={selectedLabelIds}
              onOpenManager={() => setShowLabelManager(true)}
            />
            <ChecklistSection
              checklistItems={checklistItems}
              checklistDoneCount={checklistDoneCount}
              checklistTotalCount={checklistTotalCount}
              newChecklistText={newChecklistText}
              onToggleChecklistItem={onToggleChecklistItem}
              onChecklistTextChange={onChecklistTextChange}
              onSaveChecklistText={onSaveChecklistText}
              onReorderChecklistItem={onReorderChecklistItem}
              onDeleteChecklistItem={onDeleteChecklistItem}
              onAddChecklistItem={onAddChecklistItem}
              onChangeNewChecklistText={onChangeNewChecklistText}
            />
          </div>
          <div style={rightColumnStyle}>
            <CommentsSection
              comments={comments}
              newCommentContent={newCommentContent}
              currentUserId={currentUserId}
              onChangeNewCommentContent={onChangeNewCommentContent}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
            />
          </div>
        </div>
        <ActionFooter
          isDirty={isDirty}
          saveStatus={saveStatus}
          saveError={saveError}
          isArchived={!!card.archived}
          onCancel={onCancel}
          onSave={onSave}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          onDelete={onDelete}
          dialogButtonsStyle={dialogButtonsStyle}
        />
      </div>

      <LabelManagerModal
        open={showLabelManager}
        boardLabels={boardLabels}
        selectedLabelIds={selectedLabelIds}
        newLabelName={newLabelName}
        newLabelColor={newLabelColor}
        onToggleLabel={onToggleLabel}
        onCreateLabel={onCreateLabel}
        onDeleteLabel={onDeleteLabel}
        onChangeNewLabelName={onChangeNewLabelName}
        onChangeNewLabelColor={onChangeNewLabelColor}
        onClose={() => setShowLabelManager(false)}
        overlayStyle={overlayStyle}
        dialogStyle={dialogStyle}
        dialogButtonsStyle={dialogButtonsStyle}
      />
    </div>
  );
}

export default CardModal;
