class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository, commentLikeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentIds = comments.map((c) => c.id);
    const [replies, likeCounts] = await Promise.all([
      this._replyRepository.getRepliesByCommentIds(commentIds),
      this._commentLikeRepository.getLikeCountByCommentIds(commentIds),
    ]);

    const likeCountMap = likeCounts.reduce((acc, row) => {
      acc[row.comment_id] = parseInt(row.like_count, 10);
      return acc;
    }, {});

    const commentsWithReplies = comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
      likeCount: likeCountMap[comment.id] || 0,
      replies: replies
        .filter((r) => r.comment_id === comment.id)
        .map((r) => ({
          id: r.id,
          content: r.is_delete ? '**balasan telah dihapus**' : r.content,
          date: r.date,
          username: r.username,
        })),
    }));

    return {
      ...thread,
      comments: commentsWithReplies,
    };
  }
}

export default GetThreadDetailUseCase;
