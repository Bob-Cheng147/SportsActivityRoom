import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
function isLogin() {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch (e) {
    return false;
  }
}
const ActivityPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
 const [commentText, setCommentText] = useState(''); // ✅ 新增：评论内容
 const [reviews, setReviews] = useState([]);
  // 获取当前登录用户
  useEffect(() => {
    fetch('http://localhost:7001/api/user/profile', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    })
      .then(res => res.json())
      .then(data => {
              console.log('📥 后端返回的完整用户数据:', data); // ✅ 关键日志
      console.log('📂 data.data 结构:', data.data);
        if (data.success && data.data) {
           
          setCurrentUser({ id: data.data.userId, username: data.data.username });
        } else {
          navigate('/login');
        }
      });
  }, [navigate]);

  // 获取活动列表
  const fetchEvents = () => {
    fetch('http://localhost:7001/api/events', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      cache: 'no-store'
    })
      .then(res => res.json())
      .then(data => {
   

        if (data.success) {
          setEvents(data.data);
        } else {
          alert('获取活动数据失败: ' + (data.message || ''));
        }
      })
      .catch(() => alert('无法加载活动数据'));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 搜索过滤
  const filteredEvents = events.filter(event =>
    (event.name || event.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 跳转到用户主页
  const goToProfile = () => {
    navigate('/profile');
  };

  // 报名活动（直接用 currentUser.id，不做登录验证）
  const handleRegister = async (eventId) => {
    console.log('👤 currentUser:', currentUser);
console.log('🆔 currentUser.id:', currentUser?.id);
    if (!currentUser) {
      alert('未获取到用户信息');
      return;
    }
    try {
      const res = await fetch(`http://localhost:7001/api/events/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventId: eventId,
          userId: currentUser.id // 直接传当前用户ID
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('报名成功');
        fetchEvents();
      } else {
        alert(data.message || '报名失败');
      }
    } catch (e) {
      alert('报名失败');
    }
  };

const handleDetail = async (eventId) => {
  const event = events.find(e => e.id === eventId);
  setCurrentEvent(event);

  try {
    const res = await fetch(`http://127.0.0.1:7001/api/events/${eventId}/reviews`);
    const result = await res.json();
    if (result.success) {
      setReviews(result.data);
    }
  } catch (err) {
    console.error('加载评价失败', err);
  }

  setIsModalOpen(true);
};

// 关闭弹框（可简化）
const closeModal = () => {
  setShowRatingModal(false);
  setCurrentEvent(null);
  setSelectedRating(0);
  setCommentText(''); // 清空输入
};

// 打开评分弹框
const openRatingModal = (eventId) => {
  const event = events.find(e => e.id === eventId);
  if (event) {
    setCurrentEvent(event);
    setShowRatingModal(true);
    setSelectedRating(0);
    setCommentText(''); // 每次打开清空
  }
};

// 评价活动（提交评分 + 评论）
const submitRating = async () => {
  console.log('👤 currentUser:', currentUser);
console.log('🆔 currentUser.id:', currentUser?.id);
  if (!currentUser || !currentEvent || selectedRating === 0) {
    alert('请先选择评分');
    return;
  }
  setRatingSubmitting(true);
  try {
    const res = await fetch('http://localhost:7001/api/events/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_id: currentEvent.id,
        userId: currentUser.id,
        rating: selectedRating,
        comment: commentText.trim() || null // ✅ 发送评论（空字符串转 null）
      })
    });
    const data = await res.json();
    if (data.success) {
      alert('感谢评分');
      setShowRatingModal(false);
      setSelectedRating(0);
      setCommentText('');
      fetchEvents(); // 刷新活动列表
    } else {
      alert(data.message || '评分失败');
    }
  } catch (e) {
    console.error('提交评分失败:', e);
    alert('网络错误，评分失败');
  }
  setRatingSubmitting(false);
};

// 渲染星星
const renderStars = (rating, onClick) => (
  <div className="flex">
    {[1, 2, 3, 4, 5].map(i => (
      <span
        key={i}
        onClick={onClick ? () => onClick(i) : undefined}
        className={`cursor-pointer text-2xl ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        role="button"
        aria-label={`评分 ${i} 星`}
      >
        ★
      </span>
    ))}
  </div>
);
  // 计算平均评分
  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return null;
    const sum = reviews.reduce((acc, val) => acc + (val.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  };

  // 判断用户是否已报名
  const isRegistered = (event) => {
    if (!currentUser || !event.registrations) return false;
    return event.registrations.some(reg => reg.userId === currentUser.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {/* 搜索框 */}
          <div className="flex-1 max-w-lg">
            <input
              type="text"
              placeholder="🔍 搜索活动名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {/* 用户头像按钮 */}
          <button
            onClick={goToProfile}
            className="ml-6 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium shadow hover:shadow-md transition-all duration-200 transform hover:scale-105"
            title={`用户主页 - ${currentUser?.username}`}
          >
            {currentUser?.username?.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="flex-1 py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">所有活动</h1>
          {filteredEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-10">未找到匹配的活动</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const totalPrice = (event.participants || 0) * (event.price || 0);
                const averagePrice = (event.participants || 0) > 0 ? (totalPrice / event.participants).toFixed(1) : 0;
                const averageRating = getAverageRating(event.reviews || []);
                return (
                  <div
                    key={event.id}
                    className="bg-white border-2 border-amber-600 rounded-lg p-6 shadow hover:shadow-lg transition-all duration-200 relative"
                  >
                    {/* 活动名称 */}
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{event.name || event.title}</h3>
                    {/* 活动信息 */}
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p>
                        <strong>当前人数：</strong>
                        {event.participants} / {event.maxParticipants || event.max_participants}
                      </p>
                      <p>
                        <strong>当前价格：</strong>
                        {event.price > 0 ? `¥${event.price}` : '免费'}
                      </p>
                      <p>
                        <strong>平均消费：</strong>
                        {averagePrice > 0 ? `¥${averagePrice}` : '免费'}
                      </p>
                      <p>
                        <strong>平均评分：</strong>
                        {averageRating ? (
                          <span className="text-yellow-400">{averageRating}/5.0</span>
                        ) : (
                          <span className="text-gray-400">暂无评分</span>
                        )}
                      </p>
                    </div>
                    {/* 操作按钮组 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRegister(event.id)}
                        className={`flex-1 ${isRegistered(event)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                          } text-white text-sm py-2 px-3 rounded transition-colors`}
                        disabled={isRegistered(event)}
                      >
                        {isRegistered(event) ? '已报名' : '报名'}
                      </button>
                      <button
                        onClick={() => handleDetail(event.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition-colors"
                      >
                        详情
                      </button>
                      <button
                        onClick={() => openRatingModal(event.id)}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-sm py-2 px-3 rounded transition-colors"
                      >
                        评价
                      </button>
                    </div>
                  </div>
                );
              })}
              
            </div>
          )}
        </div>

      {/* 详情弹框 */}
{isModalOpen && currentEvent && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-screen overflow-auto">
      <h3 className="text-xl font-bold mb-4">
        {currentEvent.name || currentEvent.title}
      </h3>
      <p className="text-gray-700 mb-4">
        {currentEvent.description}
      </p>

      {/* 🔔 评价列表开始 */}
      <div className="mt-6 border-t pt-4">
        <h4 className="text-lg font-semibold mb-3">用户评价</h4>

        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm italic">暂无评价</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="border-b pb-2 last:border-b-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{r.username}</span>
                  <span className="text-yellow-500 text-sm">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </span>
                </div>
                <p className="text-gray-700 mt-1 text-sm">
                  {r.comment || <em className="text-gray-400">无内容</em>}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* 🔔 评价列表结束 */}

      <div className="flex justify-end mt-6">
        <button
          onClick={closeModal}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
)}
        {/* 评分弹框 */}
// 评分弹窗 JSX
{showRatingModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-96">
      <h3 className="text-xl font-bold mb-4">为活动评分</h3>
      
      {/* 活动名称 */}
      <p className="mb-4">
        您正在为 <strong>{currentEvent?.name}</strong> 评分
      </p>

      {/* 评分 */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">您的评分：</label>
        {renderStars(selectedRating, setSelectedRating)}
      </div>

      {/* 评论输入框 */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">评论（可选）：</label>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="分享您的参与体验..."
          className="w-full p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          maxLength={500}
        />
        <div className="text-right text-sm text-gray-500">
          {commentText.length}/500
        </div>
      </div>

      {/* 按钮 */}
      <div className="flex justify-end gap-2">
        <button
          onClick={closeModal}
          disabled={ratingSubmitting}
          className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          取消
        </button>
        <button
          onClick={submitRating}
          disabled={ratingSubmitting || selectedRating === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {ratingSubmitting ? '提交中...' : '提交'}
        </button>
      </div>
    </div>
  </div>
)}
        
      </main>

      {/* 底部 */}
      <footer className="py-4 text-center text-gray-500 text-sm bg-white border-t">
        © 2025 活动管理系统 - 版权所有
      </footer>
    </div>
  );
};

export default ActivityPage;