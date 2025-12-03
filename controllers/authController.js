const bcrypt = require('bcryptjs');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const db = require('../models'); 
const { User, RefreshToken } = db;
require('dotenv').config();

const COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME || 'refreshToken';
const COOKIE_MAXAGE = parseInt(process.env.REFRESH_TOKEN_COOKIE_MAXAGE || '604800000', 10); // ms

// ----------------- Login -----------------
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) 
      return res.status(400).json({ message: 'Username & password required' });

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

const match = await bcrypt.compare(password, user.password_hash);

    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.is_active) return res.status(403).json({ message: 'Account inactive' });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Save refresh token in DB
    const decoded = require('jsonwebtoken').decode(refreshToken);
    await RefreshToken.create({
      token_hash: refreshToken,          // store raw token
      user_id: user.user_id,
      user_agent: req.get('User-Agent') || null,
      ip_address: req.ip || null,
      expires_at: new Date(decoded.exp * 1000),
      revoked: false,
    });

    // Set HttpOnly cookie
    res.cookie(COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: COOKIE_MAXAGE,
      path: '/',
    });

    res.json({
      accessToken,
      user: { user_id: user.user_id, username: user.username, full_name: user.full_name, role: user.role },
    });

  } catch (err) {
    console.error('auth.login error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ----------------- Refresh -----------------
exports.refresh = async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME] || req.body.refreshToken;
    if (!token) return res.status(401).json({ message: 'Refresh token required' });

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (err) {
      return res.status(403).json({ message: 'Invalid/expired refresh token' });
    }

    // Find token in DB
// Find token in DB
const stored = await RefreshToken.findOne({
  where: {
    token_hash: token,
    revoked: false
  }
});


    if (!stored || stored.revoked) {
      return res.status(403).json({ message: 'Refresh token revoked or not found' });
    }

    if (new Date(stored.expires_at) < new Date()) {
      stored.revoked = true;
      await stored.save();
      return res.status(403).json({ message: 'Refresh token expired' });
    }

    // Rotate: issue new access & refresh token
    const user = await User.findByPk(payload.user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    // Save new refresh token
    const decodedNew = require('jsonwebtoken').decode(newRefreshToken);
    const newRecord = await RefreshToken.create({
      token_hash: newRefreshToken,
      user_id: user.user_id,
      user_agent: req.get('User-Agent') || null,
      ip_address: req.ip || null,
      expires_at: new Date(decodedNew.exp * 1000),
      revoked: false,
    });

    // Revoke old token
    stored.revoked = true;
    stored.replaced_by = newRecord.id;
    await stored.save();

    // Set new cookie
    res.cookie(COOKIE_NAME, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: COOKIE_MAXAGE,
      path: '/',
    });

    res.json({ accessToken: newAccessToken });

  } catch (err) {
    console.error('auth.refresh error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ----------------- Logout -----------------
exports.logout = async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME] || req.body.refreshToken;
    if (token) {
      const stored = await RefreshToken.findOne({ where: { token_hash: token } });

      if (stored) {
        stored.revoked = true;
        await stored.save();
      }
    }

    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.json({ message: 'Logged out' });

  } catch (err) {
    console.error('auth.logout error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Get current logged-in user
exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findByPk(req.user.user_id, {
      attributes: { exclude: ["password_hash"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Error fetching current user" });
  }
};