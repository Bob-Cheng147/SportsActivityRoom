import React, { useState } from 'react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sliderVerified, setSliderVerified] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSliderChange = (e) => {
    const value = Number(e.target.value);
    setSliderValue(value);
    if (value === 100) {
      setSliderVerified(true);
    } else {
      setSliderVerified(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage(null);

    // 前端验证
    if (!username || !password || !confirmPassword) {
      setMessage({ type: 'error', text: '所有字段都是必填的' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: '两次输入的密码不一致' });
      return;
    }

    if (!sliderVerified) {
      setMessage({ type: 'error', text: '请先完成滑块验证' });
      return;
    }

    setLoading(true);

    try {
      // ✅ 模仿 LoginForm：直接请求后端地址
      const response = await fetch('http://127.0.0.1:7001/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        throw new Error('服务器响应格式错误，请稍后重试');
      }

      if (!response.ok) {
        throw new Error(result.message || '注册失败');
      }

      // 注册成功
      setMessage({ type: 'success', text: result.message });

    } catch (error) {
      console.error('注册请求失败:', error);
      setMessage({ type: 'error', text: error.message || '网络错误，请稍后重试' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-xs p-6 border border-gray-300 rounded-xl shadow-lg bg-white">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">用户注册</h2>

        {message && (
          <div
            className={`mb-4 p-3 rounded text-sm ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label htmlFor="username" className="block mb-2 text-gray-700 font-medium">
              用户名：
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="请输入用户名"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-2 text-gray-700 font-medium">
              密码：
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="请输入密码"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block mb-2 text-gray-700 font-medium">
              确认密码：
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="请再次输入密码"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-gray-700 font-medium">
              请拖动滑块完成验证：
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={handleSliderChange}
                className="w-full"
                disabled={loading}
              />
              <span
                className={`ml-3 text-sm font-medium ${
                  sliderVerified ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {sliderVerified ? '✅ 验证通过' : '❌ 未验证'}
              </span>
            </div>
          </div>
          <button
            type="submit"
            className={`w-full py-2 text-white rounded-lg text-lg font-semibold transition-colors ${
              loading || !sliderVerified
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={!sliderVerified || loading}
          >
            {loading ? '注册中...' : '立即注册'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;