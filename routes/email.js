const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// ===== Middleware chặn IP theo thời gian =====
const BLOCK_TIME_SECONDS = 10;
const MAX_REQUESTS = 5;
const REQUEST_WINDOW_SECONDS = 30;

const blockDurationMs = BLOCK_TIME_SECONDS * 1000;
const requestWindowMs = REQUEST_WINDOW_SECONDS * 1000;
const blockedIPs = new Map();

const ipBlocker = (req, res, next) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const now = Date.now();
  const entry = blockedIPs.get(ip);

  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return res.status(429).json({
      success: false,
      message: `🚫 Tạm thời bị chặn vì gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${BLOCK_TIME_SECONDS} giây.`
    });
  }

  if (entry) {
    if (now - entry.lastAccess < requestWindowMs) {
      entry.count += 1;
    } else {
      entry.count = 1;
    }

    entry.lastAccess = now;

    if (entry.count > MAX_REQUESTS) {
      blockedIPs.set(ip, {
        ...entry,
        blockedUntil: now + blockDurationMs
      });
      return res.status(429).json({
        success: false,
        message: `⚠️ IP ${ip} đã bị giới hạn. Tạm khóa trong ${BLOCK_TIME_SECONDS} giây.`
      });
    }
  } else {
    blockedIPs.set(ip, {
      count: 1,
      lastAccess: now
    });
  }

  next();
};

// ===== ROUTES =====

// Hiển thị giao diện nhận mã
router.get('/get-code', emailController.showGetCodeForm);

// Nhận code (chặn nếu spam)
router.post('/get-code', ipBlocker, emailController.getCode);

// Lấy danh sách email
router.get('/listmail', emailController.getEmailList);

// Chi tiết email
router.get('/mail/:id', emailController.getMailDetails);

// Nội dung email
router.get('/message/:id', emailController.getMessageContent);

module.exports = router;
