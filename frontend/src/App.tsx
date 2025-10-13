import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

type Page = 'home' | 'login' | 'register';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [token, setToken] = useState<string>('');

  const handleLoginSuccess = (userInfo: any, token: string) => {
    setUserInfo(userInfo);
    setToken(token);
    setIsLoggedIn(true);
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    setCurrentPage('home');
  };

  const handleRegisterSuccess = (userInfo: any, token: string) => {
    setUserInfo(userInfo);
    setToken(token);
    setIsLoggedIn(true);
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUserInfo(null);
    setToken('');
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setCurrentPage('home');
  };

  // 初始化时检查本地存储的登录状态
  React.useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUserInfo = localStorage.getItem('userInfo');
    
    if (savedToken && savedUserInfo) {
      setToken(savedToken);
      setUserInfo(JSON.parse(savedUserInfo));
      setIsLoggedIn(true);
    }
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setCurrentPage('register')}
          />
        );
      case 'register':
        return (
          <RegisterForm
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateToLogin={() => setCurrentPage('login')}
          />
        );
      default:
        return (
          <HomePage
            isLoggedIn={isLoggedIn}
            userInfo={userInfo}
            onNavigateToLogin={() => setCurrentPage('login')}
            onNavigateToRegister={() => setCurrentPage('register')}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
}

export default App;