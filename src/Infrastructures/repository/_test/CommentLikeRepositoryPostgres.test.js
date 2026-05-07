import { describe, it, expect, afterEach, afterAll } from 'vitest';
import pool from '../../database/postgres/pool.js';
import CommentLikeRepositoryPostgres from '../CommentLikeRepositoryPostgres.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import CommentLikesTableTestHelper from '../../../../tests/CommentLikesTableTestHelper.js';

describe('CommentLikeRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  const setup = async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
  };

  describe('likeComment', () => {
    it('should insert a like record', async () => {
      await setup();
      const repo = new CommentLikeRepositoryPostgres(pool, () => '123');

      await repo.likeComment('comment-123', 'user-123');

      const likes = await CommentLikesTableTestHelper.findLike('comment-123', 'user-123');
      expect(likes).toHaveLength(1);
    });

    it('should not throw on duplicate like (idempotent)', async () => {
      await setup();
      const repo = new CommentLikeRepositoryPostgres(pool, () => '123');

      await repo.likeComment('comment-123', 'user-123');
      await expect(repo.likeComment('comment-123', 'user-123')).resolves.not.toThrow();
    });
  });

  describe('unlikeComment', () => {
    it('should remove the like record', async () => {
      await setup();
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });
      const repo = new CommentLikeRepositoryPostgres(pool, () => '123');

      await repo.unlikeComment('comment-123', 'user-123');

      const likes = await CommentLikesTableTestHelper.findLike('comment-123', 'user-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('isCommentLikedByUser', () => {
    it('should return true when liked', async () => {
      await setup();
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });
      const repo = new CommentLikeRepositoryPostgres(pool, () => '123');

      const result = await repo.isCommentLikedByUser('comment-123', 'user-123');
      expect(result).toBe(true);
    });

    it('should return false when not liked', async () => {
      await setup();
      const repo = new CommentLikeRepositoryPostgres(pool, () => '123');

      const result = await repo.isCommentLikedByUser('comment-123', 'user-123');
      expect(result).toBe(false);
    });
  });

  describe('getLikeCountByCommentIds', () => {
    it('should return like counts for given comment ids', async () => {
      await setup();
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });
      const repo = new CommentLikeRepositoryPostgres(pool, () => '123');

      const result = await repo.getLikeCountByCommentIds(['comment-123']);
      expect(result).toHaveLength(1);
      expect(result[0].comment_id).toBe('comment-123');
      expect(parseInt(result[0].like_count, 10)).toBe(1);
    });

    it('should return empty array when no comment ids given', async () => {
      const repo = new CommentLikeRepositoryPostgres(pool, () => '123');
      const result = await repo.getLikeCountByCommentIds([]);
      expect(result).toHaveLength(0);
    });
  });
});
