const express = require('express');
const AuthService = require('../services/AuthService');

const router = express.Router();

// POST /api/auth/send-verification-code
router.post('/send-verification-code', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: '手机号不能为空' });
    }

    const result = await AuthService.sendVerificationCode(phoneNumber);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      // 根据错误类型返回不同的状态码
      if (result.error === '手机号格式不正确') {
        res.status(400).json(result);
      } else if (result.error === '请稍后再试') {
        res.status(429).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phoneNumber, loginType, verificationCode, password } = req.body;
    
    // 首先检查手机号格式
    if (phoneNumber && !AuthService.validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: '手机号格式不正确' });
    }
    
    // 然后检查必填字段
    if (!phoneNumber || !loginType) {
      return res.status(400).json({ error: '手机号和登录方式不能为空' });
    }

    if (loginType === 'code' && !verificationCode) {
      return res.status(400).json({ error: '验证码不能为空' });
    }

    if (loginType === 'password' && !password) {
      return res.status(400).json({ error: '密码不能为空' });
    }

    const result = await AuthService.login(phoneNumber, loginType, verificationCode, password);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      // 根据错误类型返回不同的状态码
      if (result.error === '用户不存在') {
        res.status(404).json(result);
      } else if (result.error.includes('验证码') || result.error.includes('密码')) {
        res.status(400).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { phoneNumber, verificationCode, password, agreeToTerms } = req.body;
    
    // 首先检查手机号格式
    if (phoneNumber && !AuthService.validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: '手机号格式不正确' });
    }
    
    // 然后检查必填字段
    if (!phoneNumber || !verificationCode || !password) {
      return res.status(400).json({ error: '手机号、验证码和密码不能为空' });
    }

    if (!AuthService.validatePassword(password)) {
      return res.status(400).json({ error: '密码必须至少8位，包含字母和数字' });
    }

    const result = await AuthService.register(phoneNumber, verificationCode, password, agreeToTerms);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      // 根据错误类型返回不同的状态码
      if (result.error === '手机号已注册') {
        res.status(409).json(result);
      } else if (result.error === '验证码错误或已过期') {
        res.status(400).json(result);
      } else if (result.error.includes('密码')) {
        res.status(400).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;