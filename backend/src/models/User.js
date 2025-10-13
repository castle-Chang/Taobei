const DatabaseManager = require('../config/database');

class User {
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
   * 根据手机号查找用户
   * @param {string} phoneNumber 
   * @returns {Promise<Object|null>}
   */
  static async findByPhone(phoneNumber) {
    if (!phoneNumber) {
      throw new Error('手机号不能为空');
    }

    if (!this.validatePhoneNumber(phoneNumber)) {
      throw new Error('手机号格式不正确');
    }

    const db = DatabaseManager.getInstance();
    const stmt = db.prepare('SELECT * FROM users WHERE phoneNumber = ?');
    const user = stmt.get(phoneNumber);

    if (user) {
      return {
        id: user.id,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt
      };
    }

    return null;
  }

  /**
   * 创建新用户
   * @param {Object} userData 
   * @returns {Promise<Object>}
   */
  static async create(userData) {
    if (!userData || !userData.phoneNumber) {
      throw new Error('手机号不能为空');
    }

    if (!this.validatePhoneNumber(userData.phoneNumber)) {
      throw new Error('手机号格式不正确');
    }

    // 检查用户是否已存在
    const existingUser = await this.findByPhone(userData.phoneNumber);
    if (existingUser) {
      throw new Error('手机号已存在');
    }

    const db = DatabaseManager.getInstance();
    const createdAt = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO users (phoneNumber, createdAt) 
      VALUES (?, ?)
    `);
    
    const result = stmt.run(userData.phoneNumber, createdAt);

    return {
      id: result.lastInsertRowid,
      phoneNumber: userData.phoneNumber,
      createdAt: createdAt
    };
  }
}

module.exports = User;