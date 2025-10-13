import React, { useState, useEffect } from 'react';

interface LoginFormProps {
  onLoginSuccess: (userInfo: any, token: string) => void;
  onNavigateToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canSendCode, setCanSendCode] = useState(true);

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanSendCode(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 验证手机号格式
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSendCode = async () => {
    setError('');
    
    if (!validatePhoneNumber(phoneNumber)) {
      setError('手机号格式不正确');
      return;
    }

    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });

      const data = await response.json();

      if (response.ok) {
        setCountdown(60);
        setCanSendCode(false);
      } else {
        setError(data.error || '发送验证码失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    }
  };

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);

    if (!validatePhoneNumber(phoneNumber)) {
      setError('手机号格式不正确');
      setIsLoading(false);
      return;
    }

    if (!verificationCode) {
      setError('请输入验证码');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          verificationCode
        })
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.user, data.token);
      } else {
        setError(data.error || '登录失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 检查表单是否可以提交
  const canSubmit = phoneNumber && verificationCode && !isLoading;

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        color: '#ff6900',
        marginBottom: '30px'
      }}>用户登录</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <input
          type="tel"
          placeholder="请输入手机号"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>
      
      <div style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        gap: '10px' 
      }}>
        <input
          type="text"
          placeholder="请输入验证码"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
        <button 
          onClick={handleSendCode}
          disabled={!canSendCode || countdown > 0}
          style={{
            padding: '12px 16px',
            backgroundColor: countdown > 0 ? '#ccc' : '#ff6900',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: countdown > 0 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            whiteSpace: 'nowrap'
          }}
        >
          {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
        </button>
      </div>
      
      {error && (
        <div style={{ 
          color: '#ff4d4f', 
          marginBottom: '15px',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
      
      <button 
        onClick={handleLogin}
        disabled={!canSubmit}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: !canSubmit ? '#ccc' : '#ff6900',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: !canSubmit ? 'not-allowed' : 'pointer',
          marginBottom: '15px'
        }}
      >
        {isLoading ? '登录中...' : '登录'}
      </button>

      <div style={{ textAlign: 'center' }}>
        <span style={{ color: '#666', fontSize: '14px' }}>还没有账号？</span>
        <button
          onClick={onNavigateToRegister}
          style={{
            background: 'none',
            border: 'none',
            color: '#ff6900',
            cursor: 'pointer',
            fontSize: '14px',
            textDecoration: 'underline'
          }}
        >
          立即注册
        </button>
      </div>
    </div>
  );
};

export default LoginForm;