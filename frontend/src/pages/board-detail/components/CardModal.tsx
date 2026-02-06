import type { CSSProperties } from 'react';
import DetailsSection from './card-modal/DetailsSection';
import LabelsSection from './card-modal/LabelsSection';
import ChecklistSection from './card-modal/ChecklistSection';
import CommentsSection from './card-modal/CommentsSection';
import ActionFooter from './card-modal/ActionFooter';

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
  if (!card) return null;

  return (
    <div style={overlayStyle} onClick={onOverlayClick}>
      <div style={dialogStyle} onClick={(event) => event.stopPropagation()}>
        <h3 style={{ margin: 0, marginBottom: 12, fontSize: 18 }}>Card details</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
            newLabelName={newLabelName}
            newLabelColor={newLabelColor}
            onToggleLabel={onToggleLabel}
            onCreateLabel={onCreateLabel}
            onChangeNewLabelName={onChangeNewLabelName}
            onChangeNewLabelColor={onChangeNewLabelColor}
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
          <CommentsSection
            comments={comments}
            newCommentContent={newCommentContent}
            currentUserId={currentUserId}
            onChangeNewCommentContent={onChangeNewCommentContent}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
          />
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
    </div>
  );
}

export default CardModal;
