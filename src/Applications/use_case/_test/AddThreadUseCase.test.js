import { describe, it, expect, vi } from 'vitest';
import AddThreadUseCase from '../AddThreadUseCase.js';
import NewThread from '../../../Domains/threads/entities/NewThread.js';

describe('AddThreadUseCase', () => {
  it('should orchestrate add thread correctly', async () => {
    const mockThreadRepository = {
      addThread: vi.fn().mockResolvedValue({
        id: 'thread-123',
        title: 'judul',
        owner: 'user-123',
      }),
    };

    const useCase = new AddThreadUseCase({ threadRepository: mockThreadRepository });
    const result = await useCase.execute({ title: 'judul', body: 'isi', owner: 'user-123' });

    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(new NewThread({ title: 'judul', body: 'isi', owner: 'user-123' }));
    expect(result).toEqual({ id: 'thread-123', title: 'judul', owner: 'user-123' });
  });
});
