// routes/authRoutes.js
const express = require('express');
const authRouter = express.Router();
// const rateLimit = require('express-rate-limit');

const { login, refresh, logout, getCurrentUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
//   max: parseInt(process.env.RATE_LIMIT_MAX || '10', 10),
//   message: 'Too many requests, please try again later.',
// });

// login and refresh should be rate-limited
authRouter.post('/login', login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout',logout);
authRouter.get('/profile', authMiddleware, getCurrentUser);
// authRouter.post('/revoke-all',revokeAll); // protect with admin middleware if needed
authRouter.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

module.exports = authRouter;

