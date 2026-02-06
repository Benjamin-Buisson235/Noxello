import React from 'react';
import { listColumnStyles } from './styles';

type AddCardButtonProps = {
  onOpenAddCard: () => void;
};

function AddCardButton({ onOpenAddCard }: AddCardButtonProps) {
  return (
    <button
      type="button"
      onClick={onOpenAddCard}
      style={listColumnStyles.addCardButton}
    >
      + Add a card
    </button>
  );
}

export default AddCardButton;
