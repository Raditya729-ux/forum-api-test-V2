import { describe, it, expect, afterEach, afterAll } from 'vitest';
import pool from '../../database/postgres/pool.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('addComment', () => {
    it('should persist comment and return AddedComment correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const fakeIdGenerator = () => '123';
      const repo = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const result = await repo.addComment({ content: 'isi', threadId: 'thread-123', owner: 'user-123' });

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
      expect(result).toBeInstanceOf(AddedComment);
      expect(result.id).toBe('comment-123');
      expect(result.content).toBe('isi');
      expect(result.owner).toBe('user-123');
    });
  });

  describe('verifyCommentExists', () => {
    it('should throw NotFoundError when comment does not exist', async () => {
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyCommentExists('comment-xxx')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw when comment exists', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyCommentExists('comment-123')).resolves.not.toThrow();
    });
  });

  describe('verifyCommentOwner', () => {
    it('should throw AuthorizationError when owner does not match', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyCommentOwner('comment-123', 'user-999')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw when owner matches', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrow();
    });
  });

  describe('deleteComment', () => {
    it('should soft delete comment (set is_delete to true)', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');

      await repo.deleteComment('comment-123');

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments[0].is_delete).toBe(true);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return comments ordered by date ascending', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', threadId: 'thread-123', owner: 'user-123', date: '2021-08-08T07:00:00.000Z' });
      await CommentsTableTestHelper.addComment({ id: 'comment-2', threadId: 'thread-123', owner: 'user-123', date: '2021-08-08T08:00:00.000Z' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');

      const comments = await repo.getCommentsByThreadId('thread-123');
      expect(comments).toHaveLength(2);
      expect(comments[0].id).toBe('comment-1');
      expect(comments[1].id).toBe('comment-2');
    });
  });
});
