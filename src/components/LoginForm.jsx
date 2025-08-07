import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router'; // ✅ 修正：从 react-router-dom 导入

const LoginForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    // 表单验证
    if (!username.trim()) {
      setError('用户名不能为空');
      return;
    }
    if (!password.trim()) {
      setError('密码不能为空');
      return;
    }
    if (password.length < 6) {
      setError('密码长度不能少于 6 位');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:7001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('服务器响应格式错误，请稍后重试');
      }

      if (!response.ok) {
        throw new Error(data.message || '登录失败，请检查用户名或密码');
      }

      // ✅ 检查是否返回 token
      if (!data.token) {
        throw new Error('登录失败：未获取到身份令牌');
      }

      // ✅ 保存 token 到本地存储
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));

      // ✅ 构造用户数据，优先使用后端返回的 username
   // ✅ 正确写法
const userData = {
  username: data.user?.username || username,
  userId: data.user?.userId,
  token: data.token,
};

      // ✅ 调用父组件回调，更新全局登录状态
      if (onSuccess) {
        onSuccess(userData);
      }

      // ✅ 可选：跳转（主要由 App 控制，但保留以防万一）
      // navigate('/events', { replace: true });

    } catch (err) {
      setError(err.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 border border-gray-300 rounded-xl shadow-lg bg-white">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">用户登录</h2>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block mb-2 text-gray-700 font-medium">
              用户名
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入用户名"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-gray-700 font-medium">
              密码
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入密码（至少6位）"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 flex justify-center items-center text-white rounded-lg text-lg font-semibold transition-colors
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                登录中...
              </>
            ) : '登录'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/register" className="text-sm text-blue-600 hover:text-blue-800">
            还没有账号？立即注册
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;