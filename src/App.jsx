import React, { useState } from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import Register from './components/Register';
import WelcomePage from './components/WelcomePage';
import EventCreationForm from './components/EventCreationForm';
import ActivityPage from './components/ActivityPage'; // 新增：假设这是您的活动展示页
import { Routes, Route, Navigate, useNavigate } from 'react-router';
import UserProfile from './components/UserProfile';

// 包装 App 内容，使用 useNavigate
const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    // ✅ 登录成功后，立即跳转到活动页面
    navigate('/events', { replace: true });
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    navigate('/', { replace: true });
  };

  return (
    <Routes>
      {/* 未登录时可访问的页面 */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginForm onSuccess={handleLogin} />} />
      <Route path="/register" element={<Register />} />

      {/* 受保护的活动管理路由 */}
      <Route path="/events/*" element={
        isAuthenticated ? (
          <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
            <header className="w-full max-w-4xl py-6 border-b border-gray-200 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">活动管理系统</h1>
              {user && (
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">欢迎, {user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </header>

            <main className="w-full max-w-4xl flex-grow py-8">
              <Routes>
                {/* 默认显示 ActivityPage */}
                <Route index element={<ActivityPage />} />

                {/* 创建活动 */}
                <Route path="/create" element={<EventCreationForm />} />
              </Routes>
            </main>

            <footer className="w-full max-w-4xl py-4 text-center text-gray-500 text-sm">
              © 2025 活动管理系统 - 版权所有
            </footer>
          </div>
        ) : (
          // 未登录则重定向到登录页
          <Navigate to="/login" replace />
        )
      } />
      {/* 用户个人主页 */}
      <Route path="/profile" element={<UserProfile />} />
      {/* 404 路由 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// 根组件
const App = () => {
  return <AppContent />;
};

export default App;