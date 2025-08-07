import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch() // 不指定具体错误类型，捕获所有异常
export class DefaultErrorFilter {
  async catch(err: Error, ctx: Context) {
    // 1. 打印完整错误日志（便于排查）
    console.error('【全局错误过滤器】捕获异常:', err);
    console.error('异常堆栈:', err.stack);

    // 2. 强制设置响应体（核心：避免 ctx.body 为 undefined）
    ctx.body = {
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? '服务器内部错误，请稍后重试'  // 生产环境隐藏具体错误
        : `错误详情：${err.message}`      // 开发环境显示具体错误
    };

    // 3. 设置状态码（保持 200 避免前端处理跨域错误）
    ctx.status = 200;

    // 4. 过滤器无需返回值，响应由 ctx.body 决定
    // 注意：返回值会被忽略，必须通过 ctx.body 设置响应
  }
}
    
