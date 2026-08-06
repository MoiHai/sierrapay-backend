const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Get JWT secrets from environment
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '30d';

console.log('🔐 JWT_SECRET loaded:', JWT_SECRET ? '✅ SET (length: ' + JWT_SECRET.length + ')' : '❌ MISSING');

class TokenService {
  generateAccessToken(payload) {
    try {
      if (!JWT_SECRET || JWT_SECRET === 'fallback_secret_change_me') {
        console.warn('⚠️  Using fallback JWT_SECRET. Set it in .env for production!');
      }
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    } catch (error) {
      throw new Error(`Failed to generate access token: ${error.message}`);
    }
  }

  generateRefreshToken() {
    try {
      return crypto.randomBytes(64).toString('hex');
    } catch (error) {
      throw new Error(`Failed to generate refresh token: ${error.message}`);
    }
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid access token');
      }
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  verifyRefreshToken(token, storedToken) {
    if (token !== storedToken) {
      throw new Error('Invalid refresh token');
    }
    return true;
  }

  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  generateTokenPair(userId, deviceId) {
    const payload = { userId, deviceId };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken();
    return { accessToken, refreshToken };
  }
}

module.exports = new TokenService();
