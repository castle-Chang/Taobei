const request = require('supertest');
const app = require('../../src/app');

describe('Auth Routes', () => {
  describe('POST /api/auth/send-verification-code', () => {
    it('应该成功发送验证码给有效手机号', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification-code')
        .send({ phoneNumber: '13800138000' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '验证码发送成功');
    });

    it('应该拒绝无效的手机号格式', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification-code')
        .send({ phoneNumber: '123' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', '手机号格式不正确');
    });

    it('应该拒绝空的手机号', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification-code')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('应该限制同一手机号的发送频率', async () => {
      // 第一次发送
      await request(app)
        .post('/api/auth/send-verification-code')
        .send({ phoneNumber: '13800138001' });

      // 立即再次发送
      const response = await request(app)
        .post('/api/auth/send-verification-code')
        .send({ phoneNumber: '13800138001' });

      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty('error', '请稍后再试');
    });
  });

  describe('POST /api/auth/login', () => {
    it('应该成功登录已注册用户', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '13800138000',
          verificationCode: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('phoneNumber', '13800138000');
    });

    it('应该拒绝未注册的手机号', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '13800138999',
          verificationCode: '123456'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', '用户不存在');
    });

    it('应该拒绝错误的验证码', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '13800138000',
          verificationCode: '000000'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', '验证码错误或已过期');
    });

    it('应该拒绝无效的手机号格式', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '123',
          verificationCode: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', '手机号格式不正确');
    });

    it('应该拒绝缺少必填字段', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ phoneNumber: '13800138000' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/register', () => {
    it('应该成功注册新用户', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          phoneNumber: '13800138002',
          verificationCode: '123456'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('phoneNumber', '13800138002');
    });

    it('应该拒绝已注册的手机号', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          phoneNumber: '13800138000',
          verificationCode: '123456'
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', '手机号已注册');
    });

    it('应该拒绝错误的验证码', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          phoneNumber: '13800138003',
          verificationCode: '000000'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', '验证码错误或已过期');
    });

    it('应该拒绝无效的手机号格式', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          phoneNumber: '123',
          verificationCode: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', '手机号格式不正确');
    });

    it('应该拒绝缺少必填字段', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ phoneNumber: '13800138004' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});