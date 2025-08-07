// src/middleware/auth.middleware.ts
import { Middleware, Provide, Inject } from '@midwayjs/decorator';
import { Context, NextFunction } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';

@Middleware()
@Provide()
export class AuthMiddleware {
  @Inject()
  jwtService: JwtService;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      if (ctx.path.startsWith('/api')) {
        const auth = ctx.get('Authorization');

        if (auth && auth.startsWith('Bearer ')) {
          const token = auth.replace('Bearer ', '');
          try {
            const payload = await this.jwtService.verify(token);
      

            // ✅ 正确设置用户信息
            ctx.state.user = payload;
            // ✅ 继续执行，不要 return
           return await next();
            // ✅ 提前返回，避免走下面的“未登录”逻辑
          } catch (e) {
             let message = '无效的登录凭证';
            if (e.name === 'TokenExpiredError') {
              message = '登录已过期';
            }
            ctx.body = { success: false, message};
            ctx.status = 200;
            return;
          }
        }

        // ❌ 没有 token
        ctx.body = { success: false, message: '未登录' };
        ctx.status = 200;
        return;
      }

      await next();
    };
  }

  static getName(): string {
    return 'auth';
  }
}