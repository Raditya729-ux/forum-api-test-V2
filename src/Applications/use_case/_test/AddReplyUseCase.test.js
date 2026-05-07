import { describe, it, expect, vi } from 'vitest';
import AddReplyUseCase from '../AddReplyUseCase.js';
import NewReply from '../../../Domains/replies/entities/NewReply.js';

describe('AddReplyUseCase', () => {
  it('should orchestrate add reply correctly', async () => {
    const mockReplyRepository = {
      addReply: vi.fn().mockResolvedValue({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-123',
      }),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockResolvedValue(),
    };
    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockResolvedValue(),
    };

    const useCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const result = await useCase.execute({
      content: 'sebuah balasan',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    });

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith('comment-123');
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith(
      expect.objectContaining(new NewReply({ content: 'sebuah balasan', commentId: 'comment-123', owner: 'user-123' })),
    );
    expect(result).toEqual({ id: 'reply-123', content: 'sebuah balasan', owner: 'user-123' });
  });
});
