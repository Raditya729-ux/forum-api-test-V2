class LikeCommentUseCase {
  constructor({ commentLikeRepository, commentRepository, threadRepository }) {
    this._commentLikeRepository = commentLikeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({ threadId, commentId, owner }) {
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);

    const isLiked = await this._commentLikeRepository.isCommentLikedByUser(commentId, owner);

    if (isLiked) {
      await this._commentLikeRepository.unlikeComment(commentId, owner);
    } else {
      await this._commentLikeRepository.likeComment(commentId, owner);
    }
  }
}

export default LikeCommentUseCase;
