import { Configuration, App } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as cors from '@koa/cors';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as jwt from '@midwayjs/jwt';
// import { JwtMiddleware } from '@midwayjs/jwt'; // ❌ 不需要直接导入
import * as swagger from '@midwayjs/swagger';
import * as orm from '@midwayjs/typeorm';
import { join } from 'path';
import { SwaggerMiddleware } from '@midwayjs/swagger';
import { AuthMiddleware } from './middleware/auth.middleware'; // ✅ 引入身份验证中间件
@Configuration({
  imports: [
    koa,
    orm,
    cors,
    swagger,
    jwt,
    validate,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  static middleware = [AuthMiddleware];

  @App()
  app: koa.Application;

  async onReady() {
    this.app.useMiddleware(SwaggerMiddleware);

    // 跨域配置
    this.app.use(cors({
      origin: 'http://localhost:5173',
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
      credentials: true,
      maxAge: 86400,
      vary: true
    }));

    // 🔴 删除您手动添加的全局异常和 404 处理中间件！
    // this.app.use(async (ctx, next) => { ... })
  }

  async onServerReady() {
    const port = this.app.getConfig('koa.port') || 7001;
    console.log(`✅ Server running at http://localhost:${port}`);
  }
}