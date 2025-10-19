const AuthService = require('../../src/services/AuthService');

describe('AuthService', () => {
  describe('validatePhoneNumber', () => {
    it('应该验证有效的中国手机号', () => {
      const validNumbers = [
        '13800138000',
        '15912345678',
        '18612345678',
        '17712345678'
      ];

      validNumbers.forEach(number => {
        expect(AuthService.validatePhoneNumber(number)).toBe(true);
      });
    });

    it('应该拒绝无效的手机号', () => {
      const invalidNumbers = [
        '123',
        '1234567890',
        '12345678901',
        '10012345678',
        '12812345678',
        '',
        null,
        undefined
      ];

      invalidNumbers.forEach(number => {
        expect(AuthService.validatePhoneNumber(number)).toBe(false);
      });
    });
  });

  describe('sendVerificationCode', () => {
    it('应该成功发送验证码给有效手机号', async () => {
      const result = await AuthService.sendVerificationCode('13800138000');
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', '验证码发送成功');
    });

    it('应该拒绝无效的手机号', async () => {
      const result = await AuthService.sendVerificationCode('123');
      
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error', '手机号格式不正确');
    });

    it('应该限制发送频率', async () => {
      // 第一次发送
      await AuthService.sendVerificationCode('13800138001');
      
      // 立即再次发送
      const result = await AuthService.sendVerificationCode('13800138001');
      
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error', '请稍后再试');
    });
  });

  describe('login', () => {
    it('应该成功登录已注册用户', async () => {
      const result = await AuthService.login('13800138000', 'code', '123456');
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('phoneNumber', '13800138000');
    });

    it('应该拒绝未注册的用户', async () => {
      const result = await AuthService.login('13800138999', 'code', '123456');
      
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error', '用户不存在');
    });

    it('应该拒绝错误的验证码', async () => {
      const result = await AuthService.login('13800138000', 'code', '000000');
      
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error', '验证码错误或已过期');
    });
  });

  describe('register', () => {
    it('应该成功注册新用户', async () => {
      const result = await AuthService.register('13800138002', '123456', 'password123');
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('phoneNumber', '13800138002');
    });

    it('应该拒绝已注册的手机号', async () => {
      const result = await AuthService.register('13800138000', '123456', 'password123');
      
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error', '手机号已注册');
    });

    it('应该拒绝错误的验证码', async () => {
      const result = await AuthService.register('13800138003', '000000', 'password123');
      
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error', '验证码错误或已过期');
    });
  });
});