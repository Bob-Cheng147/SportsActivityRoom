import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export default function UserProfile({ onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setProfile(null);
    navigate('/login');
    onClose?.();
  };

  // ✅ 修复1：把 handleCancel 移到 useEffect 外部
  const handleCancel = async (eventId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('请先登录');
      return;
    }

    if (!window.confirm('确定要退选这个活动吗？')) return;

    try {
      const res = await fetch(`http://127.0.0.1:7001/api/events/${eventId}/cancel`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await res.json();

      if (result.success) {
        alert('退选成功');
        // 重新加载用户信息
        const profileRes = await fetch('http://127.0.0.1:7001/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        if (profileData.success) {
          setProfile({
            username: profileData.data.username,
            registeredEvents: profileData.data.registeredEvents || [],
          });
        }
      } else {
        alert(result.message || '退选失败');
      }
    } catch (err) {
      console.error('退选请求失败:', err);
      alert('网络错误，请检查服务是否运行');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('未登录');

        const res = await fetch('http://127.0.0.1:7001/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const result = await res.json();

        if (result.success && result.data) {
          const userData = {
            username: result.data.username,
            id: result.data.id,
          };
          setUser(userData);
          setIsAuthenticated(true);
          setProfile({
            username: result.data.username,
            registeredEvents: Array.isArray(result.data.registeredEvents)
              ? result.data.registeredEvents
              : [],
          });
        } else {
          setError(result.message || '加载用户信息失败');
          setProfile(null);
        }
      } catch (err) {
        console.error('加载用户信息失败:', err);
        setError(err.message === '未登录' ? '请先登录' : '网络错误，请检查服务是否启动');
        setProfile(null);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecommendedEvents = async () => {
      try {
        const res = await fetch('http://127.0.0.1:7001/api/events?take=3');
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          const sorted = result.data
            .sort((a, b) => b.participants - a.participants)
            .slice(0, 3);
          setRecommendedEvents(sorted);
        }
      } catch (err) {
        console.error('获取推荐活动失败:', err);
      }
    };

    fetchProfile();
    fetchRecommendedEvents();
  }, [navigate]); // ✅ 依赖正确

  if (loading) return <div>加载中...</div>;

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px' }}>
        <p>{error || '未登录'}</p>
        <button
          onClick={() => {
            navigate('/login');
            onClose?.();
          }}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          去登录
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <header className="flex justify-between items-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">活动管理系统</h1>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">欢迎, {user.username}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              退出登录
            </button>
          </div>
        )}
      </header>

      <h2 className="text-xl font-semibold mb-2">用户中心</h2>

      {/* 我报名的活动 */}
      <h3 className="text-lg mb-4">我报名的活动</h3>
      {profile.registeredEvents.length > 0 ? (
        <ul className="space-y-4">
          {profile.registeredEvents.map((event) => (
            <li key={event.id} className="border-b pb-2 flex justify-between items-start">
              <div>
                <strong className="block text-lg">{event.name}</strong>
                {/* ✅ 修复2：价格显示错误，原来是 event.price/event.participants */}
                <p className="text-sm text-gray-600">
                  价格：¥{event.price} | 当前人数：{event.participants}/{event.maxParticipants}
                </p>
              </div>
              {/* 退选按钮 */}
              <button
                onClick={() => handleCancel(event.id)}
                className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
              >
                退选
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">暂无报名活动</p>
      )}

      {/* 热门推荐 */}
      <h3 className="text-lg mb-4 mt-8">热门推荐</h3>
      {recommendedEvents.length > 0 ? (
        <ul className="space-y-4">
          {recommendedEvents.map((event) => (
            <li key={event.id} className="border rounded p-3 bg-gray-50">
              <strong className="block text-md">{event.name}</strong>
              <p className="text-sm text-gray-600 mt-1">
                价格：¥{event.price} | 报名：{event.participants}人
              </p>
              <button
                onClick={() => {
                  navigate(`/events/${event.id}`);
                  onClose?.();
                }}
                className="mt-2 text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                查看详情
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">暂无推荐活动</p>
      )}

      {/* 返回按钮 */}
      <button
        type="button"
        onClick={() => {
          navigate('/events');
          onClose?.();
        }}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        返回活动列表
      </button>
    </div>
  );
}