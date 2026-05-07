import { describe, it, expect } from 'vitest';
import NewReply from '../NewReply.js';

describe('NewReply entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    expect(() => new NewReply({ content: 'isi' })).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has wrong data type', () => {
    expect(() => new NewReply({ content: 123, commentId: 'comment-123', owner: 'user-123' })).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewReply correctly', () => {
    const reply = new NewReply({ content: 'isi', commentId: 'comment-123', owner: 'user-123' });
    expect(reply.content).toBe('isi');
    expect(reply.commentId).toBe('comment-123');
    expect(reply.owner).toBe('user-123');
  });
});
