const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const jwt = require('jsonwebtoken');

class AuthService {
  // 用于存储发送验证码的时间限制
  static sendCodeTimestamps = new Map();

  /**
   * 验证手机号格式
   * @param {string} phoneNumber 
   * @returns {boolean}
   */
  static validatePhoneNumber(phoneNumber) {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return false;
    }
    // 中国手机号格式：1开头，第二位是3-9，总共11位数字
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * 发送验证码
   * @param {string} phoneNumber 
   * @returns {Promise<Object>}
   */
  static async sendVerificationCode(phoneNumber) {
    if (!this.validatePhoneNumber(phoneNumber)) {
      return {
        success: false,
        error: '手机号格式不正确'
      };
    }

    // 检查发送频率限制（60秒内只能发送一次）
    const now = Date.now();
    const lastSendTime = this.sendCodeTimestamps.get(phoneNumber);
    
    if (lastSendTime && (now - lastSendTime) < 60000) {
      return {
        success: false,
        error: '请稍后再试'
      };
    }

    try {
      // 生成验证码
      const code = VerificationCode.generateCode();
      
      // 保存验证码到数据库
      await VerificationCode.save(phoneNumber, code);
      
      // 记录发送时间
      this.sendCodeTimestamps.set(phoneNumber, now);
      
      // 在实际项目中，这里应该调用短信服务发送验证码
      console.log(`发送验证码 ${code} 到手机号 ${phoneNumber}`);
      
      return {
        success: true,
        message: '验证码发送成功'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 用户登录
   * @param {string} phoneNumber 
   * @param {string} verificationCode 
   * @returns {Promise<Object>}
   */
  static async login(phoneNumber, verificationCode) {
    try {
      // 检查用户是否存在
      const user = await User.findByPhone(phoneNumber);
      if (!user) {
        return {
          success: false,
          error: '用户不存在'
        };
      }

      // 验证验证码
      const verifyResult = await VerificationCode.verify(phoneNumber, verificationCode);
      if (!verifyResult.success) {
        return {
          success: false,
          error: '验证码错误或已过期'
        };
      }

      // 生成JWT token
      const token = jwt.sign(
        { userId: user.id, phoneNumber: user.phoneNumber },
        process.env.JWT_SECRET || 'taobei-secret-key',
        { expiresIn: '7d' }
      );

      return {
        success: true,
        token,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 用户注册
   * @param {string} phoneNumber 
   * @param {string} verificationCode 
   * @param {boolean} agreeToTerms 
   * @returns {Promise<Object>}
   */
  static async register(phoneNumber, verificationCode, agreeToTerms = true) {
    try {
      // 检查用户是否已存在
      const existingUser = await User.findByPhone(phoneNumber);
      if (existingUser) {
        return {
          success: false,
          error: '手机号已注册'
        };
      }

      // 验证验证码
      const verifyResult = await VerificationCode.verify(phoneNumber, verificationCode);
      if (!verifyResult.success) {
        return {
          success: false,
          error: '验证码错误或已过期'
        };
      }

      // 创建新用户
      const user = await User.create({ phoneNumber });

      // 生成JWT token
      const token = jwt.sign(
        { userId: user.id, phoneNumber: user.phoneNumber },
        process.env.JWT_SECRET || 'taobei-secret-key',
        { expiresIn: '7d' }
      );

      return {
        success: true,
        token,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = AuthService;