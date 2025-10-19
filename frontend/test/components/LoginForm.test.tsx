import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import LoginForm from '../../src/components/LoginForm';

// Mock fetch
global.fetch = vi.fn();

describe('LoginForm', () => {
  const mockOnLoginSuccess = vi.fn();
  const mockOnNavigateToRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染登录表单的所有元素', () => {
    render(
      <LoginForm
        onLoginSuccess={mockOnLoginSuccess}
        onNavigateToRegister={mockOnNavigateToRegister}
      />
    );

    expect(screen.getByText('用户登录')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入手机号')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入验证码')).toBeInTheDocument();
    expect(screen.getByText('获取验证码')).toBeInTheDocument();
    expect(screen.getByText('登录')).toBeInTheDocument();
  });

  it('应该验证手机号格式', async () => {
    render(
      <LoginForm
        onLoginSuccess={mockOnLoginSuccess}
        onNavigateToRegister={mockOnNavigateToRegister}
      />
    );

    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const sendCodeButton = screen.getByText('获取验证码');

    fireEvent.change(phoneInput, { target: { value: '123' } });
    fireEvent.click(sendCodeButton);

    await waitFor(() => {
      expect(screen.getByText(/手机号格式不正确/)).toBeInTheDocument();
    });
  });

  it('应该成功发送验证码', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: '验证码发送成功' })
    });

    render(
      <LoginForm
        onLoginSuccess={mockOnLoginSuccess}
        onNavigateToRegister={mockOnNavigateToRegister}
      />
    );

    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const sendCodeButton = screen.getByText('获取验证码');

    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.click(sendCodeButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '13800138000' })
      });
    });
  });

  it('应该显示验证码发送倒计时', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: '验证码发送成功' })
    });

    render(
      <LoginForm
        onLoginSuccess={mockOnLoginSuccess}
        onNavigateToRegister={mockOnNavigateToRegister}
      />
    );

    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const sendCodeButton = screen.getByText('获取验证码');

    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.click(sendCodeButton);

    await waitFor(() => {
      expect(screen.getByText(/\d+秒后重试/)).toBeInTheDocument();
    });

    expect(sendCodeButton).toBeDisabled();
  });

  it('应该成功登录', async () => {
    const mockUserInfo = { id: 1, phoneNumber: '13800138000' };
    const mockToken = 'mock-jwt-token';

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: mockUserInfo,
        token: mockToken
      })
    });

    render(
      <LoginForm
        onLoginSuccess={mockOnLoginSuccess}
        onNavigateToRegister={mockOnNavigateToRegister}
      />
    );

    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    const loginButton = screen.getByText('登录');

    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '13800138000',
          loginType: 'code',
          verificationCode: '123456'
        })
      });
    });

    expect(mockOnLoginSuccess).toHaveBeenCalledWith(mockUserInfo, mockToken);
  });

  it('应该显示登录错误信息', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: '验证码错误或已过期' })
    });

    render(
      <LoginForm
        onLoginSuccess={mockOnLoginSuccess}
        onNavigateToRegister={mockOnNavigateToRegister}
      />
    );

    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    const loginButton = screen.getByText('登录');

    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.change(codeInput, { target: { value: '000000' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('验证码错误')).toBeInTheDocument();
    });
  });

  it('应该禁用空表单的登录按钮', () => {
    render(
      <LoginForm
        onLoginSuccess={mockOnLoginSuccess}
        onNavigateToRegister={mockOnNavigateToRegister}
      />
    );

    const loginButton = screen.getByText('登录');
    expect(loginButton).toBeDisabled();
  });

  it('应该在登录过程中显示加载状态', async () => {
    (fetch as any).mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <LoginForm
        onLoginSuccess={mockOnLoginSuccess}
        onNavigateToRegister={mockOnNavigateToRegister}
      />
    );

    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    const loginButton = screen.getByText('登录');

    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(loginButton);

    expect(screen.getByText('登录中...')).toBeInTheDocument();
    expect(loginButton).toBeDisabled();
  });
});