import React, { useState, useEffect } from 'react';

interface RegisterFormProps {
  onRegisterSuccess: (userInfo: any, token: string) => void;
  onNavigateToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
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
    return phone.length === 11;
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

  // 验证密码强度
  const validatePassword = (pwd: string): boolean => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(pwd);
  };

  const handleRegister = async () => {
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

    if (!password) {
      setError('请输入密码');
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError('密码必须至少8位，包含字母和数字');
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError('请同意用户协议');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          verificationCode,
          password,
          agreeToTerms
        })
      });

      const data = await response.json();

      if (response.ok) {
        onRegisterSuccess(data.user, data.token);
      } else {
        setError(data.error || '注册失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

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
      }}>用户注册</h2>
      
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
        marginBottom: '15px', 
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

      <div style={{ marginBottom: '15px' }}>
        <input
          type="password"
          placeholder="请设置登录密码（至少8位，包含字母和数字）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <input
          type="checkbox"
          checked={agreeToTerms}
          onChange={(e) => setAgreeToTerms(e.target.checked)}
          style={{ marginRight: '8px' }}
        />
        <span style={{ 
          fontSize: '14px',
          color: '#666'
        }}>
          同意《淘贝用户协议》
        </span>
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
        onClick={handleRegister}
        disabled={isLoading || !agreeToTerms}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: (isLoading || !agreeToTerms) ? '#ccc' : '#ff6900',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: (isLoading || !agreeToTerms) ? 'not-allowed' : 'pointer',
          marginBottom: '15px',
          transition: 'background-color 0.3s'
        }}
      >
        {isLoading ? '注册中...' : '注册'}
      </button>

      <div style={{ 
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ color: '#666', fontSize: '14px' }}>已有账号？</span>
        <button
          onClick={onNavigateToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: '#ff6900',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '0',
            textDecoration: 'none',
            transition: 'color 0.3s'
          }}
        >
          立即登录
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;