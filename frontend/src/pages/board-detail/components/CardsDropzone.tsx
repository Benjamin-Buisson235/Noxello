import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { toListDndId } from '../utils';

type CardsDropzoneProps = {
  listId: number;
  children: React.ReactNode;
};

function CardsDropzone({ listId, children }: CardsDropzoneProps) {
  const { setNodeRef } = useDroppable({ id: toListDndId(listId) });

  return (
    <div
      ref={setNodeRef}
      data-list-scroll="true"
      style={{
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingRight: 4,
        outline: 'none',
        borderRadius: 8,
      }}
    >
      {children}
    </div>
  );
}

export default CardsDropzone;
