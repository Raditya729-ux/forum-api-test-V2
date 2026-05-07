import { describe, it, expect } from 'vitest';
import AddedComment from '../AddedComment.js';

describe('AddedComment entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    expect(() => new AddedComment({ id: 'comment-123', content: 'isi' })).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has wrong data type', () => {
    expect(() => new AddedComment({ id: 123, content: 'isi', owner: 'user-123' })).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedComment correctly', () => {
    const comment = new AddedComment({ id: 'comment-123', content: 'isi', owner: 'user-123' });
    expect(comment.id).toBe('comment-123');
    expect(comment.content).toBe('isi');
    expect(comment.owner).toBe('user-123');
  });
});
