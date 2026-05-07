import { describe, it, expect, vi } from 'vitest';
import DeleteCommentUseCase from '../DeleteCommentUseCase.js';

describe('DeleteCommentUseCase', () => {
  it('should orchestrate delete comment correctly', async () => {
    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockResolvedValue(),
      verifyCommentOwner: vi.fn().mockResolvedValue(),
      deleteComment: vi.fn().mockResolvedValue(),
    };
    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockResolvedValue(),
    };

    const useCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await useCase.execute({ threadId: 'thread-123', commentId: 'comment-123', owner: 'user-123' });

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith('comment-123');
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith('comment-123', 'user-123');
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith('comment-123');
  });
});
