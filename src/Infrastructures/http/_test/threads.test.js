import { describe, it, expect, afterEach, afterAll } from 'vitest';
import request from 'supertest';
import container from '../../container.js';
import createServer from '../createServer.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';

const registerAndLogin = async (app, username = 'threaduser') => {
  await request(app).post('/users').send({ username, password: 'secret', fullname: 'Thread User' });
  const loginRes = await request(app).post('/authentications').send({ username, password: 'secret' });
  return loginRes.body.data.accessToken;
};

describe('Threads API', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('POST /threads', () => {
    it('should response 201 and return addedThread', async () => {
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'isi thread' });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.addedThread).toBeDefined();
      expect(response.body.data.addedThread.id).toBeDefined();
      expect(response.body.data.addedThread.title).toBe('sebuah thread');
    });

    it('should response 400 when payload incomplete', async () => {
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'judul saja' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('should response 401 when no access token', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .post('/threads')
        .send({ title: 'judul', body: 'isi' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /threads/:threadId', () => {
    it('should response 200 and return thread detail with comments and replies', async () => {
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'isi thread' });

      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah komentar' });

      const { id: commentId } = commentRes.body.data.addedComment;

      await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah balasan' });

      const response = await request(app).get(`/threads/${threadId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.thread).toBeDefined();
      expect(response.body.data.thread.comments).toHaveLength(1);
      expect(response.body.data.thread.comments[0].replies).toHaveLength(1);
    });

    it('should response 404 when thread not found', async () => {
      const app = await createServer(container);

      const response = await request(app).get('/threads/thread-xxx');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
    });
  });

  describe('POST /threads/:threadId/comments', () => {
    it('should response 201 and return addedComment', async () => {
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'judul', body: 'isi' });

      const { id: threadId } = threadRes.body.data.addedThread;

      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah komentar' });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.addedComment).toBeDefined();
    });

    it('should response 404 when thread not found', async () => {
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      const response = await request(app)
        .post('/threads/thread-xxx/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'komentar' });

      expect(response.status).toBe(404);
    });

    it('should response 400 when payload incomplete', async () => {
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'judul', body: 'isi' });

      const { id: threadId } = threadRes.body.data.addedThread;

      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /threads/:threadId/comments/:commentId', () => {
    it('should response 200 when comment deleted successfully', async () => {
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'judul', body: 'isi' });

      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'komentar' });

      const { id: commentId } = commentRes.body.data.addedComment;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should response 403 when not the comment owner', async () => {
      const app = await createServer(container);
      const accessToken1 = await registerAndLogin(app, 'commentowner1');
      const accessToken2 = await registerAndLogin(app, 'commentowner2');

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({ title: 'judul', body: 'isi' });

      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({ content: 'komentar' });

      const { id: commentId } = commentRes.body.data.addedComment;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken2}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /threads/:threadId/comments/:commentId/replies', () => {
    it('should response 201 and return addedReply', async () => {
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'judul', body: 'isi' });

      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'komentar' });

      const { id: commentId } = commentRes.body.data.addedComment;

      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah balasan' });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.addedReply).toBeDefined();
    });

    it('should response 404 when comment not found', async () => {
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'judul', body: 'isi' });

      const { id: threadId } = threadRes.body.data.addedThread;

      const response = await request(app)
        .post(`/threads/${threadId}/comments/comment-xxx/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'balasan' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /threads/:threadId/comments/:commentId/replies/:replyId', () => {
    it('should response 200 when reply deleted successfully', async () => {
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'judul', body: 'isi' });

      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'komentar' });

      const { id: commentId } = commentRes.body.data.addedComment;

      const replyRes = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'balasan' });

      const { id: replyId } = replyRes.body.data.addedReply;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should response 403 when not the reply owner', async () => {
      const app = await createServer(container);
      const accessToken1 = await registerAndLogin(app, 'replyowner1');
      const accessToken2 = await registerAndLogin(app, 'replyowner2');

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({ title: 'judul', body: 'isi' });

      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({ content: 'komentar' });

      const { id: commentId } = commentRes.body.data.addedComment;

      const replyRes = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({ content: 'balasan' });

      const { id: replyId } = replyRes.body.data.addedReply;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken2}`);

      expect(response.status).toBe(403);
    });
  });
});
