import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import RegisterForm from '../../src/components/RegisterForm';

// Mock fetch
global.fetch = vi.fn();

describe('RegisterForm', () => {
  const mockOnRegisterSuccess = vi.fn();
  const mockOnNavigateToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 清理DOM
    document.body.innerHTML = '';
  });

  it('应该渲染注册表单的所有元素', () => {
    render(
      <RegisterForm
        onRegisterSuccess={mockOnRegisterSuccess}
        onNavigateToLogin={mockOnNavigateToLogin}
      />
    );

    expect(screen.getByText('用户注册')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入手机号')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入验证码')).toBeInTheDocument();
    expect(screen.getByText('获取验证码')).toBeInTheDocument();
    expect(screen.getByText('同意《淘贝用户协议》')).toBeInTheDocument();
    expect(screen.getByText('注册')).toBeInTheDocument();
  });

  it('应该验证手机号格式', async () => {
    render(
      <RegisterForm
        onRegisterSuccess={mockOnRegisterSuccess}
        onNavigateToLogin={mockOnNavigateToLogin}
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
      <RegisterForm
        onRegisterSuccess={mockOnRegisterSuccess}
        onNavigateToLogin={mockOnNavigateToLogin}
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
      <RegisterForm
        onRegisterSuccess={mockOnRegisterSuccess}
        onNavigateToLogin={mockOnNavigateToLogin}
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

  it('应该要求勾选用户协议', () => {
    render(
      <RegisterForm
        onRegisterSuccess={mockOnRegisterSuccess}
        onNavigateToLogin={mockOnNavigateToLogin}
      />
    );

    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    const registerButton = screen.getByText('注册');

    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });

    // 未勾选协议时，注册按钮应该被禁用
    expect(registerButton).toBeDisabled();
  });

  it('应该成功注册', async () => {
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
      <RegisterForm
        onRegisterSuccess={mockOnRegisterSuccess}
        onNavigateToLogin={mockOnNavigateToLogin}
      />
    );

    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    const passwordInput = screen.getByPlaceholderText('请设置登录密码（至少8位，包含字母和数字）');
    const agreeCheckbox = screen.getByRole('checkbox');
    const registerButton = screen.getByText('注册');

    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(agreeCheckbox);
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '13800138000',
          verificationCode: '123456',
          password: 'password123',
          agreeToTerms: true
        })
      });
    });

    expect(mockOnRegisterSuccess).toHaveBeenCalledWith(mockUserInfo, mockToken);
  });

  it('应该显示注册按钮的加载状态', async () => {
    (global.fetch as any).mockImplementationOnce(() =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, token: 'test-token', user: { phoneNumber: '13800138000' } })
          });
        }, 100);
      })
    );

    render(
      <RegisterForm
        onRegisterSuccess={mockOnRegisterSuccess}
        onNavigateToLogin={mockOnNavigateToLogin}
      />
    );

    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    const passwordInput = screen.getByPlaceholderText('请设置登录密码（至少8位，包含字母和数字）');
    const agreeCheckbox = screen.getByRole('checkbox');
    const registerButton = screen.getByText('注册');

    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(agreeCheckbox);
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText('注册中...')).toBeInTheDocument();
      expect(screen.getByText('注册中...')).toBeDisabled();
    });
  });

  it('应该验证用户协议必须勾选', () => {
    render(
      <RegisterForm
        onRegisterSuccess={mockOnRegisterSuccess}
        onNavigateToLogin={mockOnNavigateToLogin}
      />
    );

    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    const passwordInput = screen.getByPlaceholderText('请设置登录密码（至少8位，包含字母和数字）');
    const registerButton = screen.getByText('注册');

    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // 未勾选协议时不能注册
    expect(registerButton).toBeDisabled();

    // 勾选协议后可以注册
    const agreeCheckbox = screen.getByRole('checkbox');
    fireEvent.click(agreeCheckbox);
    expect(registerButton).not.toBeDisabled();
  });
});