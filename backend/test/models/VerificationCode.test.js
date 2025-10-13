const VerificationCode = require('../../src/models/VerificationCode');

describe('VerificationCode Model', () => {
  describe('generateCode', () => {
    it('应该生成6位数字验证码', () => {
      const code = VerificationCode.generateCode();
      
      expect(code).toMatch(/^\d{6}$/);
      expect(code.length).toBe(6);
    });

    it('应该生成不同的验证码', () => {
      const code1 = VerificationCode.generateCode();
      const code2 = VerificationCode.generateCode();
      
      // 虽然理论上可能相同，但概率极低
      expect(code1).not.toBe(code2);
    });
  });

  describe('save', () => {
    it('应该成功保存验证码', async () => {
      const result = await VerificationCode.save('13800138000', '123456');
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('expiresAt');
      expect(new Date(result.expiresAt)).toBeInstanceOf(Date);
    });

    it('应该设置5分钟过期时间', async () => {
      const beforeSave = new Date();
      const result = await VerificationCode.save('13800138001', '123456');
      const afterSave = new Date();
      
      const expiresAt = new Date(result.expiresAt);
      const expectedExpiry = new Date(beforeSave.getTime() + 5 * 60 * 1000);
      
      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(expectedExpiry.getTime() - 1000);
      expect(expiresAt.getTime()).toBeLessThanOrEqual(new Date(afterSave.getTime() + 5 * 60 * 1000).getTime());
    });

    it('应该覆盖同一手机号的旧验证码', async () => {
      await VerificationCode.save('13800138002', '111111');
      const result = await VerificationCode.save('13800138002', '222222');
      
      expect(result).toHaveProperty('success', true);
    });

    it('应该拒绝无效的手机号', async () => {
      await expect(VerificationCode.save('123', '123456')).rejects.toThrow('手机号格式不正确');
    });

    it('应该拒绝无效的验证码格式', async () => {
      await expect(VerificationCode.save('13800138003', '12345')).rejects.toThrow('验证码格式不正确');
      await expect(VerificationCode.save('13800138003', '1234567')).rejects.toThrow('验证码格式不正确');
      await expect(VerificationCode.save('13800138003', 'abcdef')).rejects.toThrow('验证码格式不正确');
    });
  });

  describe('verify', () => {
    it('应该验证正确的验证码', async () => {
      await VerificationCode.save('13800138004', '123456');
      const result = await VerificationCode.verify('13800138004', '123456');
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('valid', true);
    });

    it('应该拒绝错误的验证码', async () => {
      await VerificationCode.save('13800138005', '123456');
      const result = await VerificationCode.verify('13800138005', '654321');
      
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error', '验证码错误');
    });

    it('应该拒绝过期的验证码', async () => {
      // 创建一个已过期的验证码
      const pastTime = new Date(Date.now() - 60 * 1000); // 1分钟前过期
      await VerificationCode.save('13800138006', '123456', pastTime);
      
      const result = await VerificationCode.verify('13800138006', '123456');
      
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error', '验证码已过期');
    });

    it('应该拒绝不存在的验证码', async () => {
      const result = await VerificationCode.verify('13800138999', '123456');
      
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error', '验证码不存在或已过期');
    });

    it('验证成功后应该删除验证码', async () => {
      await VerificationCode.save('13800138007', '123456');
      await VerificationCode.verify('13800138007', '123456');
      
      // 再次验证应该失败
      const result = await VerificationCode.verify('13800138007', '123456');
      expect(result).toHaveProperty('success', false);
    });

    it('应该拒绝无效的手机号格式', async () => {
      await expect(VerificationCode.verify('123', '123456')).rejects.toThrow('手机号格式不正确');
    });
  });
});