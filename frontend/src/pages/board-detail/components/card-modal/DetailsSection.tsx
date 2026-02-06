import React from 'react';
import { inputStyle, labelStyle, rowStyle, sectionColumnStyle, textareaStyle } from './styles';

type DetailsSectionProps = {
  editCardTitle: string;
  editCardDescription: string;
  editCardDueDate: string;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeDueDate: (value: string) => void;
  onClearDueDate: () => void;
};

function DetailsSection({
  editCardTitle,
  editCardDescription,
  editCardDueDate,
  onChangeTitle,
  onChangeDescription,
  onChangeDueDate,
  onClearDueDate,
}: DetailsSectionProps) {
  return (
    <>
      <div style={sectionColumnStyle}>
        <label style={labelStyle}>Title</label>
        <input
          className="input"
          type="text"
          value={editCardTitle}
          onChange={(e) => onChangeTitle(e.target.value)}
        />
      </div>
      <div style={sectionColumnStyle}>
        <label style={labelStyle}>Description</label>
        <textarea
          value={editCardDescription}
          onChange={(e) => onChangeDescription(e.target.value)}
          rows={4}
          style={textareaStyle}
        />
      </div>
      <div style={sectionColumnStyle}>
        <label style={labelStyle}>Due date</label>
        <div style={rowStyle}>
          <input
            type="date"
            value={editCardDueDate}
            onChange={(e) => onChangeDueDate(e.target.value)}
            style={inputStyle}
          />
          <button
            type="button"
            className="button button-ghost"
            onClick={onClearDueDate}
            disabled={!editCardDueDate}
          >
            Clear
          </button>
        </div>
      </div>
    </>
  );
}

export default DetailsSection;
