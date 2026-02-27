type ArchivedSectionProps = {
  lists: any[];
  onOpenCardDetails: (card: any, listId: number) => void;
};

function ArchivedSection({ lists, onOpenCardDetails }: ArchivedSectionProps) {
  return (
    <section className="card" style={{ marginTop: 24 }}>
      <h2 style={{ marginTop: 0, fontSize: 18 }}>Archived cards</h2>
      {lists.length === 0 ? (
        <p className="text-muted" style={{ marginTop: 4 }}>
          No archived cards.
        </p>
      ) : (
        <div
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 4,
            marginTop: 8,
          }}
        >
          {lists.map((list: any) => (
            <div
              key={list.id}
              style={{
                minWidth: 220,
                maxWidth: 260,
                borderRadius: 12,
                padding: 10,
                background:
                  'linear-gradient(145deg, rgba(30,30,45,0.96), rgba(50,40,70,0.96))',
                border: '1px solid rgba(199,125,255,0.45)',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: '#fdfcff',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                }}
              >
                {list.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {(list.cards || []).map((card: any) => (
                  <div
                    key={card.id}
                    onClick={() => onOpenCardDetails(card, list.id)}
                    style={{
                      borderRadius: 8,
                      padding: '6px 8px',
                      backgroundColor: 'rgba(11, 15, 35, 0.7)',
                      border: '1px solid rgba(157,78,221,0.4)',
                      fontSize: 12,
                      color: '#f9f5ff',
                      cursor: 'pointer',
                    }}
                  >
                    {card.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ArchivedSection;
