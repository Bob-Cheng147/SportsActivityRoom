import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';

const EventCreationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    eventType: '',
    eventCapacity: '',
    eventDescription: ''
  });
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // 图片上传处理
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setFormMessage({ text: '请上传PNG、JPG或GIF格式的图片', type: 'error' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormMessage({ text: '图片大小不能超过5MB', type: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormMessage({ text: '', type: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  // 表单校验
  const validateForm = () => {
    const newErrors = {};
    if (!formData.eventName.trim()) newErrors.eventName = '请输入活动名称';
    if (!formData.eventDate) newErrors.eventDate = '请选择活动日期';
    if (!formData.eventTime) newErrors.eventTime = '请选择活动时间';
    if (!formData.eventLocation.trim()) newErrors.eventLocation = '请输入活动地点';
    if (formData.eventCapacity) {
      const capacity = parseInt(formData.eventCapacity);
      if (isNaN(capacity) || capacity < 1) newErrors.eventCapacity = '请输入有效的人数限制';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setFormMessage({ text: '', type: '' });

    try {
      const payload = {
        name: formData.eventName,
        date: formData.eventDate,
        time: formData.eventTime,
        location: formData.eventLocation,
        type: formData.eventType,
        maxParticipants: formData.eventCapacity,
        description: formData.eventDescription,
        // 可扩展图片等
      };
      const res = await fetch('/api/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setFormMessage({ text: '活动创建成功！', type: 'success' });
        setTimeout(() => navigate('/events'), 1200);
      } else {
        setFormMessage({ text: data.message || '创建失败', type: 'error' });
      }
    } catch (error) {
      setFormMessage({ text: '创建活动失败，请稍后重试', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      eventName: '',
      eventDate: '',
      eventTime: '',
      eventLocation: '',
      eventType: '',
      eventCapacity: '',
      eventDescription: ''
    });
    setImagePreview('');
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-neutral-900">创建新活动</h1>
        <p className="text-neutral-600 mt-2">
          填写以下信息创建一个新的活动，带 <span className="text-error">*</span> 的为必填项
        </p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 md:p-8">
        {formMessage.text && (
          <div className={`mb-6 p-4 rounded-lg ${formMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {formMessage.text}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="eventName" className="block text-sm font-medium text-neutral-700 mb-1">
              活动名称 <span className="text-error">*</span>
            </label>
            <input
              type="text"
              id="eventName"
              name="eventName"
              value={formData.eventName}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg ${errors.eventName ? 'border-red-500' : 'border-neutral-300'} focus:outline-none`}
              placeholder="输入活动名称"
            />
            {errors.eventName && <p className="text-red-500 text-xs mt-1">{errors.eventName}</p>}
          </div>

          {/* 活动日期和时间 */}
          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium text-neutral-700 mb-1">
              活动日期 <span className="text-error">*</span>
            </label>
            <input
              type="date"
              id="eventDate"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg transition-all ${errors.eventDate ? 'border-error focus:border-error focus:ring-error/20' :
                'border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                } focus:outline-none`}
            />
            {errors.eventDate && (
              <p className="text-error text-xs mt-1">{errors.eventDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="eventTime" className="block text-sm font-medium text-neutral-700 mb-1">
              活动时间 <span className="text-error">*</span>
            </label>
            <input
              type="time"
              id="eventTime"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg transition-all ${errors.eventTime ? 'border-error focus:border-error focus:ring-error/20' :
                'border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                } focus:outline-none`}
            />
            {errors.eventTime && (
              <p className="text-error text-xs mt-1">{errors.eventTime}</p>
            )}
          </div>

          {/* 活动地点 */}
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="eventLocation" className="block text-sm font-medium text-neutral-700 mb-1">
              活动地点 <span className="text-error">*</span>
            </label>
            <input
              type="text"
              id="eventLocation"
              name="eventLocation"
              value={formData.eventLocation}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg transition-all ${errors.eventLocation ? 'border-error focus:border-error focus:ring-error/20' :
                'border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                } focus:outline-none`}
              placeholder="输入活动地点，如：XX会议中心3楼"
            />
            {errors.eventLocation && (
              <p className="text-error text-xs mt-1">{errors.eventLocation}</p>
            )}
          </div>

          {/* 活动类型 */}
          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-neutral-700 mb-1">
              活动类型
            </label>
            <select
              id="eventType"
              name="eventType"
              value={formData.eventType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
            >
              <option value="">请选择类型</option>
              <option value="conference">会议</option>
              <option value="workshop">工作坊</option>
              <option value="party">聚会</option>
              <option value="exhibition">展览</option>
              <option value="other">其他</option>
            </select>
          </div>

          {/* 参与人数限制 */}
          <div>
            <label htmlFor="eventCapacity" className="block text-sm font-medium text-neutral-700 mb-1">
              参与人数限制
            </label>
            <input
              type="number"
              id="eventCapacity"
              name="eventCapacity"
              value={formData.eventCapacity}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg transition-all ${errors.eventCapacity ? 'border-error focus:border-error focus:ring-error/20' :
                'border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                } focus:outline-none`}
              min="1"
              placeholder="如：50"
            />
            {errors.eventCapacity && (
              <p className="text-error text-xs mt-1">{errors.eventCapacity}</p>
            )}
          </div>

          {/* 活动描述 */}
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="eventDescription" className="block text-sm font-medium text-neutral-700 mb-1">
              活动描述
            </label>
            <textarea
              id="eventDescription"
              name="eventDescription"
              rows="4"
              value={formData.eventDescription}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              placeholder="详细描述活动内容、目的、流程等信息..."
            ></textarea>
          </div>

          {/* 活动图片上传 */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              活动图片
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-lg hover:bg-neutral-50 transition-all cursor-pointer"
              onClick={() => fileInputRef.current?.click()}>
              <div className="space-y-1 text-center">
                <i className="fa fa-cloud-upload text-3xl text-neutral-400"></i>
                <div className="flex text-sm text-neutral-600">
                  <span className="relative cursor-pointer bg-white rounded-lg font-medium text-primary hover:text-primary/80">
                    上传图片
                  </span>
                  <p className="pl-1">或拖放文件</p>
                </div>
                <p className="text-xs text-neutral-500">支持 PNG, JPG, GIF 格式，最大 5MB</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleFileChange}
            />
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="活动图片预览"
                  className="max-h-48 rounded-lg shadow-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* 表单操作按钮 */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
            className="border border-neutral-300 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-100 transition-all duration-200 flex-1 sm:flex-none"
          >
            重置
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:outline-none flex-1 sm:flex-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <i className="fa fa-spinner fa-spin"></i>
                <span>创建中...</span>
              </>
            ) : (
              <>
                <span>创建活动</span>
                <i className="fa fa-arrow-right"></i>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventCreationForm;
