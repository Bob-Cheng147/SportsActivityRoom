/**
 * @description User-Service parameters
 */
export interface IUserOptions {
  uid: number;
}
/**
 * 用户登录结果类型定义
 */
export interface LoginResult {
  success: boolean;
  token?: string; // 登录成功时返回的令牌
  message?: string; // 错误信息（可选）
}

export interface RegisterDTO {
  username: string;
  password: string;
}


// src/dto/review.dto.ts
export interface ReviewDto {
  userId: number; // 用户ID
  event_id: number;
  rating: number;
  comment?: string; // 可选字段
}