const DatabaseManager = require('../src/config/database');
const User = require('../src/models/User');
const VerificationCode = require('../src/models/VerificationCode');

// 设置测试环境
process.env.NODE_ENV = 'test';

beforeEach(async () => {
  // 重置数据库实例
  DatabaseManager.resetInstance();
  
  // 初始化数据库
  const db = new DatabaseManager();
  await db.init();
  
  // 创建测试用户
  try {
    await User.create({ phoneNumber: '13800138000' });
  } catch (error) {
    // 用户可能已存在，忽略错误
  }
  
  // 创建测试验证码
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟后过期
  await VerificationCode.save('13800138000', '123456', expiresAt);
  await VerificationCode.save('13800138002', '123456', expiresAt);
  await VerificationCode.save('13800138003', '123456', expiresAt);
  await VerificationCode.save('13800138004', '123456', expiresAt);
  await VerificationCode.save('13800138005', '123456', expiresAt);
});

afterEach(async () => {
  // 清理数据库
  const db = DatabaseManager.getInstance();
  if (db) {
    db.exec('DELETE FROM users');
    db.exec('DELETE FROM verification_codes');
  }
});

afterAll(async () => {
  // 关闭数据库连接
  DatabaseManager.resetInstance();
});