import { describe, it, expect } from 'vitest';
import AddedReply from '../AddedReply.js';

describe('AddedReply entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    expect(() => new AddedReply({ id: 'reply-123', content: 'isi' })).toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has wrong data type', () => {
    expect(() => new AddedReply({ id: 123, content: 'isi', owner: 'user-123' })).toThrowError('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedReply correctly', () => {
    const reply = new AddedReply({ id: 'reply-123', content: 'isi', owner: 'user-123' });
    expect(reply.id).toBe('reply-123');
    expect(reply.content).toBe('isi');
    expect(reply.owner).toBe('user-123');
  });
});
