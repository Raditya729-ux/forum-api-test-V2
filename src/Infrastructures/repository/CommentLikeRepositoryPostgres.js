import CommentLikeRepository from '../../Domains/comments/CommentLikeRepository.js';

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async likeComment(commentId, owner) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3) ON CONFLICT (comment_id, owner) DO NOTHING',
      values: [id, commentId, owner],
    };
    await this._pool.query(query);
  }

  async unlikeComment(commentId, owner) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };
    await this._pool.query(query);
  }

  async isCommentLikedByUser(commentId, owner) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };
    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async getLikeCountByCommentIds(commentIds) {
    if (!commentIds.length) return [];
    const query = {
      text: 'SELECT comment_id, COUNT(*) AS like_count FROM comment_likes WHERE comment_id = ANY($1) GROUP BY comment_id',
      values: [commentIds],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}

export default CommentLikeRepositoryPostgres;
