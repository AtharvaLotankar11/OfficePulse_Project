const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getCurrentUser, forgotPassword, verifyOtpAndResetPassword } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtpAndResetPassword);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;