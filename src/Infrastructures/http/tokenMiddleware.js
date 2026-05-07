import AuthenticationTokenManager from '../../Applications/security/AuthenticationTokenManager.js';

const tokenMiddleware = (container) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'fail',
        message: 'Missing authentication',
      });
    }

    const token = authHeader.slice(7);
    const tokenManager = container.getInstance(AuthenticationTokenManager.name);
    const { id } = await tokenManager.decodePayload(token);

    // verify token is valid (not expired, correct signature)
    try {
      await tokenManager.verifyAccessToken(token);
    } catch {
      return res.status(401).json({
        status: 'fail',
        message: 'Token tidak valid',
      });
    }

    req.userId = id;
    return next();
  } catch (error) {
    return next(error);
  }
};

export default tokenMiddleware;
