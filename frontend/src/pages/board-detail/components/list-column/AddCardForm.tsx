import React from 'react';
import { listColumnStyles } from './styles';

type AddCardFormProps = {
  listId: number;
  newCardTitle: string;
  onAddCard: (event: React.FormEvent, listId: number) => void;
  onCancelAddCard: (listId: number) => void;
  onChangeCardTitle: (listId: number, value: string) => void;
};

function AddCardForm({
  listId,
  newCardTitle,
  onAddCard,
  onCancelAddCard,
  onChangeCardTitle,
}: AddCardFormProps) {
  return (
    <form onSubmit={(event) => onAddCard(event, listId)}>
      <input
        type="text"
        value={newCardTitle}
        onChange={(event) => onChangeCardTitle(listId, event.target.value)}
        autoFocus
        placeholder="Card title"
        style={listColumnStyles.addFormInput}
      />
      <div style={listColumnStyles.addFormActions}>
        <button
          type="submit"
          className="button button-primary"
          style={listColumnStyles.addFormPrimaryButton}
        >
          Add card
        </button>
        <button
          type="button"
          className="button button-ghost"
          style={listColumnStyles.addFormCancelButton}
          onClick={() => onCancelAddCard(listId)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default AddCardForm;
