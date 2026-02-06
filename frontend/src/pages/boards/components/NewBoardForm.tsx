import type { FormEvent } from 'react';

type NewBoardFormProps = {
  newTitle: string;
  error: string | null;
  onChangeTitle: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

function NewBoardForm({ newTitle, error, onChangeTitle, onSubmit }: NewBoardFormProps) {
  return (
    <section className="card" style={{ marginBottom: 20 }}>
      <h2 style={{ marginTop: 0, fontSize: 18 }}>New board</h2>
      <form
        onSubmit={onSubmit}
        style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}
      >
        <input
          className="input"
          type="text"
          placeholder="Board title (e.g. Trello project)"
          value={newTitle}
          onChange={(e) => onChangeTitle(e.target.value)}
        />
        <button type="submit" className="button button-primary">
          Create
        </button>
      </form>
      {error && <div className="text-error">{error}</div>}
    </section>
  );
}

export default NewBoardForm;
