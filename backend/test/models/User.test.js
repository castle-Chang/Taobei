const User = require('../../src/models/User');

describe('User Model', () => {
  describe('findByPhone', () => {
    it('应该找到已存在的用户', async () => {
      const user = await User.findByPhone('13800138000');
      
      expect(user).toBeTruthy();
      expect(user).toHaveProperty('phoneNumber', '13800138000');
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('createdAt');
    });

    it('应该返回null当用户不存在时', async () => {
      const user = await User.findByPhone('13800138999');
      
      expect(user).toBeNull();
    });

    it('应该拒绝无效的手机号格式', async () => {
      await expect(User.findByPhone('123')).rejects.toThrow('手机号格式不正确');
    });

    it('应该拒绝空的手机号', async () => {
      await expect(User.findByPhone('')).rejects.toThrow();
      await expect(User.findByPhone(null)).rejects.toThrow();
      await expect(User.findByPhone(undefined)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('应该成功创建新用户', async () => {
      const userData = {
        phoneNumber: '13800138002'
      };
      
      const user = await User.create(userData);
      
      expect(user).toBeTruthy();
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('phoneNumber', '13800138002');
      expect(user).toHaveProperty('createdAt');
    });

    it('应该拒绝重复的手机号', async () => {
      const userData = {
        phoneNumber: '13800138000'
      };
      
      await expect(User.create(userData)).rejects.toThrow('手机号已存在');
    });

    it('应该拒绝无效的手机号格式', async () => {
      const userData = {
        phoneNumber: '123'
      };
      
      await expect(User.create(userData)).rejects.toThrow('手机号格式不正确');
    });

    it('应该拒绝缺少必填字段', async () => {
      await expect(User.create({})).rejects.toThrow();
      await expect(User.create({ phoneNumber: '' })).rejects.toThrow();
      await expect(User.create({ phoneNumber: null })).rejects.toThrow();
    });

    it('应该自动设置创建时间', async () => {
      const userData = {
        phoneNumber: '13800138003'
      };
      
      const user = await User.create(userData);
      
      expect(user.createdAt).toBeTruthy();
      expect(new Date(user.createdAt)).toBeInstanceOf(Date);
    });
  });
});