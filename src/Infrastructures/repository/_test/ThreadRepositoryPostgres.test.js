import { describe, it, expect, afterEach, afterAll } from 'vitest';
import pool from '../../database/postgres/pool.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('addThread', () => {
    it('should persist thread and return AddedThread correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const fakeIdGenerator = () => '123';
      const repo = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const result = await repo.addThread({ title: 'judul', body: 'isi', owner: 'user-123' });

      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
      expect(result).toBeInstanceOf(AddedThread);
      expect(result.id).toBe('thread-123');
      expect(result.title).toBe('judul');
      expect(result.owner).toBe('user-123');
    });
  });

  describe('verifyThreadExists', () => {
    it('should throw NotFoundError when thread does not exist', async () => {
      const repo = new ThreadRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyThreadExists('thread-xxx')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw when thread exists', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const repo = new ThreadRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyThreadExists('thread-123')).resolves.not.toThrow();
    });
  });

  describe('getThreadById', () => {
    it('should throw NotFoundError when thread does not exist', async () => {
      const repo = new ThreadRepositoryPostgres(pool, () => '123');
      await expect(repo.getThreadById('thread-xxx')).rejects.toThrowError(NotFoundError);
    });

    it('should return thread detail correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'judul', body: 'isi', owner: 'user-123' });
      const repo = new ThreadRepositoryPostgres(pool, () => '123');

      const thread = await repo.getThreadById('thread-123');
      expect(thread.id).toBe('thread-123');
      expect(thread.title).toBe('judul');
      expect(thread.body).toBe('isi');
      expect(thread.username).toBe('dicoding');
    });
  });
});
