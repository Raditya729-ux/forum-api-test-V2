import { describe, it, expect, vi } from 'vitest';
import AddCommentUseCase from '../AddCommentUseCase.js';
import NewComment from '../../../Domains/comments/entities/NewComment.js';

describe('AddCommentUseCase', () => {
  it('should orchestrate add comment correctly', async () => {
    const mockCommentRepository = {
      addComment: vi.fn().mockResolvedValue({
        id: 'comment-123',
        content: 'isi komentar',
        owner: 'user-123',
      }),
    };
    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockResolvedValue(),
    };

    const useCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const result = await useCase.execute({
      content: 'isi komentar',
      threadId: 'thread-123',
      owner: 'user-123',
    });

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(new NewComment({ content: 'isi komentar', threadId: 'thread-123', owner: 'user-123' }));
    expect(result).toEqual({ id: 'comment-123', content: 'isi komentar', owner: 'user-123' });
  });
});
