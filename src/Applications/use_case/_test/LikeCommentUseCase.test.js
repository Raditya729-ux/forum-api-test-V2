import { describe, it, expect, vi } from 'vitest';
import LikeCommentUseCase from '../LikeCommentUseCase.js';

describe('LikeCommentUseCase', () => {
  const mockThreadRepository = { verifyThreadExists: vi.fn().mockResolvedValue() };
  const mockCommentRepository = { verifyCommentExists: vi.fn().mockResolvedValue() };

  it('should like comment when not yet liked', async () => {
    const mockCommentLikeRepository = {
      isCommentLikedByUser: vi.fn().mockResolvedValue(false),
      likeComment: vi.fn().mockResolvedValue(),
      unlikeComment: vi.fn().mockResolvedValue(),
    };

    const useCase = new LikeCommentUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await useCase.execute({ threadId: 'thread-123', commentId: 'comment-123', owner: 'user-123' });

    expect(mockCommentLikeRepository.likeComment).toHaveBeenCalledWith('comment-123', 'user-123');
    expect(mockCommentLikeRepository.unlikeComment).not.toHaveBeenCalled();
  });

  it('should unlike comment when already liked', async () => {
    const mockCommentLikeRepository = {
      isCommentLikedByUser: vi.fn().mockResolvedValue(true),
      likeComment: vi.fn().mockResolvedValue(),
      unlikeComment: vi.fn().mockResolvedValue(),
    };

    const useCase = new LikeCommentUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await useCase.execute({ threadId: 'thread-123', commentId: 'comment-123', owner: 'user-123' });

    expect(mockCommentLikeRepository.unlikeComment).toHaveBeenCalledWith('comment-123', 'user-123');
    expect(mockCommentLikeRepository.likeComment).not.toHaveBeenCalled();
  });
});
