import { describe, it, expect, afterEach, afterAll } from 'vitest';
import pool from '../../database/postgres/pool.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';
import AddedReply from '../../../Domains/replies/entities/AddedReply.js';

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('addReply', () => {
    it('should persist reply and return AddedReply correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const fakeIdGenerator = () => '123';
      const repo = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const result = await repo.addReply({ content: 'balasan', commentId: 'comment-123', owner: 'user-123' });

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
      expect(result).toBeInstanceOf(AddedReply);
      expect(result.id).toBe('reply-123');
      expect(result.content).toBe('balasan');
      expect(result.owner).toBe('user-123');
    });
  });

  describe('verifyReplyExists', () => {
    it('should throw NotFoundError when reply does not exist', async () => {
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyReplyExists('reply-xxx')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw when reply exists', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyReplyExists('reply-123')).resolves.not.toThrow();
    });
  });

  describe('verifyReplyOwner', () => {
    it('should throw NotFoundError when reply does not exist', async () => {
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyReplyOwner('reply-xxx', 'user-123')).rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when owner does not match', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyReplyOwner('reply-123', 'user-999')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw when owner matches', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrow();
    });
  });

  describe('deleteReply', () => {
    it('should soft delete reply (set is_delete to true)', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const repo = new ReplyRepositoryPostgres(pool, () => '123');

      await repo.deleteReply('reply-123');

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies[0].is_delete).toBe(true);
    });
  });

  describe('getRepliesByCommentIds', () => {
    it('should return empty array when commentIds is empty', async () => {
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      const result = await repo.getRepliesByCommentIds([]);
      expect(result).toEqual([]);
    });

    it('should return replies ordered by date ascending', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-1', commentId: 'comment-123', owner: 'user-123', date: '2021-08-08T07:00:00.000Z' });
      await RepliesTableTestHelper.addReply({ id: 'reply-2', commentId: 'comment-123', owner: 'user-123', date: '2021-08-08T08:00:00.000Z' });
      const repo = new ReplyRepositoryPostgres(pool, () => '123');

      const replies = await repo.getRepliesByCommentIds(['comment-123']);
      expect(replies).toHaveLength(2);
      expect(replies[0].id).toBe('reply-1');
      expect(replies[1].id).toBe('reply-2');
    });
  });
});
