import type { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { toListDndId } from '../utils';

type CardsDropzoneProps = {
  listId: number;
  children: ReactNode;
};

function CardsDropzone({ listId, children }: CardsDropzoneProps) {
  const { setNodeRef } = useDroppable({ id: toListDndId(listId) });

  return (
    <div
      ref={setNodeRef}
      data-list-scroll="true"
      style={{
        marginTop: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flex: 1,
        minHeight: 0,
        marginLeft: -12,
        marginRight: -12,
        paddingTop: 8,
        paddingLeft: 12,
        paddingRight: 12,
        overflowY: 'auto',
        overflowX: 'visible',
        outline: 'none',
        borderRadius: 8,
      }}
    >
      {children}
    </div>
  );
}

export default CardsDropzone;
