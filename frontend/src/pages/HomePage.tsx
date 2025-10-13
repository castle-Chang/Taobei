import React from 'react';

interface HomePageProps {
  isLoggedIn: boolean;
  userInfo: any;
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  onLogout: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ 
  isLoggedIn, 
  userInfo, 
  onNavigateToLogin, 
  onNavigateToRegister, 
  onLogout 
}) => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#ff6b35', textAlign: 'center' }}>欢迎来到淘贝</h1>
      
      {!isLoggedIn ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>请登录或注册以享受更多服务</p>
          </div>
          <div>
            <button 
              onClick={onNavigateToLogin}
              style={{
                backgroundColor: '#ff6b35',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                fontSize: '16px',
                borderRadius: '6px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              亲，请登录
            </button>
            <button 
              onClick={onNavigateToRegister}
              style={{
                backgroundColor: '#fff',
                color: '#ff6b35',
                border: '2px solid #ff6b35',
                padding: '12px 24px',
                fontSize: '16px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              免费注册
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '20px', 
            borderRadius: '8px',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <h2 style={{ color: '#333', marginBottom: '20px' }}>欢迎回来！</h2>
            {userInfo && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '16px', color: '#666' }}>
                  手机号: {userInfo.phoneNumber}
                </p>
                <p style={{ fontSize: '14px', color: '#999' }}>
                  用户ID: {userInfo.id}
                </p>
              </div>
            )}
            <button 
              onClick={onLogout}
              style={{
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                fontSize: '14px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;