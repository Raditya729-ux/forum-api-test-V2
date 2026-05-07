import { describe, it, expect } from 'vitest';
import AddedThread from '../AddedThread.js';

describe('AddedThread entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    expect(() => new AddedThread({ id: 'thread-123', title: 'judul' })).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has wrong data type', () => {
    expect(() => new AddedThread({ id: 123, title: 'judul', owner: 'user-123' })).toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedThread correctly', () => {
    const thread = new AddedThread({ id: 'thread-123', title: 'judul', owner: 'user-123' });
    expect(thread.id).toBe('thread-123');
    expect(thread.title).toBe('judul');
    expect(thread.owner).toBe('user-123');
  });
});
