// src/guard/jwt.auth.guard.ts
import { Provide, Inject } from '@midwayjs/decorator';
import { JwtService } from '@midwayjs/jwt';
import { Context } from '@midwayjs/koa';
import { IGuard } from '@midwayjs/core'; // ✅ 正确的接口导入

@Provide()
export class JwtAuthGuard implements IGuard<Context> { // ✅ 实现 IGuard 接口
  @Inject() jwtService: JwtService;

  async canActivate(context: Context): Promise<boolean> {
    const authHeader = context.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      context.status = 401;
      context.body = { success: false, message: 'Missing or invalid token' };
      return false;
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = await this.jwtService.verify(token);
      context.state.user = decoded;
      return true;
    } catch (err) {
      context.status = 401;
      context.body = { success: false, message: 'Invalid or expired token' };
      return false;
    }
  }
}