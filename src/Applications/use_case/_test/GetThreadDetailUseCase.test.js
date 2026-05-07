import { describe, it, expect, vi } from 'vitest';
import GetThreadDetailUseCase from '../GetThreadDetailUseCase.js';

describe('GetThreadDetailUseCase', () => {
  it('should return thread detail with comments, replies, and likeCount correctly', async () => {
    const mockThread = {
      id: 'thread-123',
      title: 'judul',
      body: 'isi',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockComments = [
      { id: 'comment-1', username: 'johndoe', date: '2021-08-08T07:22:33.555Z', content: 'komentar', is_delete: false },
      { id: 'comment-2', username: 'dicoding', date: '2021-08-08T07:26:21.338Z', content: 'terhapus', is_delete: true },
    ];

    const mockReplies = [
      { id: 'reply-1', comment_id: 'comment-1', username: 'dicoding', date: '2021-08-08T08:00:00.000Z', content: 'balasan', is_delete: false },
      { id: 'reply-2', comment_id: 'comment-1', username: 'johndoe', date: '2021-08-08T08:01:00.000Z', content: 'terhapus', is_delete: true },
    ];

    const mockLikeCounts = [
      { comment_id: 'comment-1', like_count: '2' },
    ];

    const mockThreadRepository = { getThreadById: vi.fn().mockResolvedValue(mockThread) };
    const mockCommentRepository = { getCommentsByThreadId: vi.fn().mockResolvedValue(mockComments) };
    const mockReplyRepository = { getRepliesByCommentIds: vi.fn().mockResolvedValue(mockReplies) };
    const mockCommentLikeRepository = { getLikeCountByCommentIds: vi.fn().mockResolvedValue(mockLikeCounts) };

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    const result = await useCase.execute('thread-123');

    expect(result.id).toBe('thread-123');
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByCommentIds).toHaveBeenCalledWith(['comment-1', 'comment-2']);
    expect(mockCommentLikeRepository.getLikeCountByCommentIds).toHaveBeenCalledWith(['comment-1', 'comment-2']);
    expect(result.comments).toHaveLength(2);
    expect(result.comments[0].content).toBe('komentar');
    expect(result.comments[0].likeCount).toBe(2);
    expect(result.comments[1].content).toBe('**komentar telah dihapus**');
    expect(result.comments[1].likeCount).toBe(0);
    expect(result.comments[0].replies).toHaveLength(2);
    expect(result.comments[0].replies[0].content).toBe('balasan');
    expect(result.comments[0].replies[1].content).toBe('**balasan telah dihapus**');
  });
});
