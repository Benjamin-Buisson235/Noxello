import { labelStyle, sectionColumnStyle, textareaStyle } from './styles';

type CommentsSectionProps = {
  comments: any[];
  newCommentContent: string;
  currentUserId?: number;
  onChangeNewCommentContent: (value: string) => void;
  onAddComment: () => void;
  onDeleteComment: (commentId: number) => void;
};

function CommentsSection({
  comments,
  newCommentContent,
  currentUserId,
  onChangeNewCommentContent,
  onAddComment,
  onDeleteComment,
}: CommentsSectionProps) {
  return (
    <div style={sectionColumnStyle}>
      <label style={labelStyle}>Comments</label>
      <textarea
        value={newCommentContent}
        onChange={(event) => onChangeNewCommentContent(event.target.value)}
        rows={3}
        placeholder="Write a comment"
        style={textareaStyle}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            onAddComment();
          }
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="button button-ghost" onClick={onAddComment}>
          Add comment
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {comments.length === 0 && (
          <span style={{ fontSize: 12, color: 'rgba(226,232,240,0.7)' }}>
            No comments yet.
          </span>
        )}
        {comments.map((comment: any) => {
          const authorName = comment.author?.name || comment.author?.email || 'Unknown';
          const isOwnComment = comment.author?.id === currentUserId;
          return (
            <div
              key={comment.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                padding: 8,
                borderRadius: 8,
                backgroundColor: 'rgba(11, 15, 35, 0.6)',
                border: '1px solid rgba(157,78,221,0.35)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  color: 'rgba(226,232,240,0.8)',
                }}
              >
                <span>{authorName}</span>
                <span>
                  {new Date(comment.createdAt).toLocaleString('en-US', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#f9f5ff' }}>{comment.content}</div>
              {isOwnComment && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="button button-ghost"
                    onClick={() => onDeleteComment(comment.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CommentsSection;
