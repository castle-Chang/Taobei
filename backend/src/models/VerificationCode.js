const DatabaseManager = require('../config/database');

class VerificationCode {
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
   * 验证验证码格式
   * @param {string} code 
   * @returns {boolean}
   */
  static validateCode(code) {
    if (!code || typeof code !== 'string') {
      return false;
    }
    // 6位数字验证码
    const codeRegex = /^\d{6}$/;
    return codeRegex.test(code);
  }

  /**
   * 生成6位数字验证码
   * @returns {string}
   */
  static generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 保存验证码到数据库
   * @param {string} phoneNumber 
   * @param {string} code 
   * @returns {Promise<Object>}
   */
  static async save(phoneNumber, code, expiresAt = null) {
    if (!this.validatePhoneNumber(phoneNumber)) {
      throw new Error('手机号格式不正确');
    }

    if (!this.validateCode(code)) {
      throw new Error('验证码格式不正确');
    }

    const db = DatabaseManager.getInstance();
    const now = new Date();
    const expiry = expiresAt || new Date(now.getTime() + 5 * 60 * 1000); // 默认5分钟后过期
    
    // 删除旧的验证码（如果存在）
    const deleteStmt = db.prepare('DELETE FROM verification_codes WHERE phoneNumber = ?');
    deleteStmt.run(phoneNumber);
    
    // 插入新的验证码
    const insertStmt = db.prepare(`
      INSERT INTO verification_codes (phoneNumber, code, expiresAt, createdAt) 
      VALUES (?, ?, ?, ?)
    `);
    
    insertStmt.run(phoneNumber, code, expiry.toISOString(), now.toISOString());

    return {
      success: true,
      expiresAt: expiry.toISOString()
    };
  }

  /**
   * 验证验证码
   * @param {string} phoneNumber 
   * @param {string} code 
   * @returns {Promise<Object>}
   */
  static async verify(phoneNumber, code) {
    if (!this.validatePhoneNumber(phoneNumber)) {
      throw new Error('手机号格式不正确');
    }

    const db = DatabaseManager.getInstance();
    const stmt = db.prepare(`
      SELECT * FROM verification_codes 
      WHERE phoneNumber = ? AND code = ?
    `);
    
    const record = stmt.get(phoneNumber, code);

    if (!record) {
      // 检查是否存在该手机号的验证码（但验证码不匹配）
      const phoneStmt = db.prepare(`
        SELECT * FROM verification_codes 
        WHERE phoneNumber = ?
      `);
      const phoneRecord = phoneStmt.get(phoneNumber);
      
      if (phoneRecord) {
        return {
          success: false,
          error: '验证码错误'
        };
      } else {
        return {
          success: false,
          error: '验证码不存在或已过期'
        };
      }
    }

    const now = new Date();
    const expiresAt = new Date(record.expiresAt);

    if (now > expiresAt) {
      // 删除过期的验证码
      const deleteStmt = db.prepare('DELETE FROM verification_codes WHERE id = ?');
      deleteStmt.run(record.id);
      
      return {
        success: false,
        error: '验证码已过期'
      };
    }

    // 验证成功，删除验证码
    const deleteStmt = db.prepare('DELETE FROM verification_codes WHERE id = ?');
    deleteStmt.run(record.id);

    return {
      success: true,
      valid: true
    };
  }
}

module.exports = VerificationCode;