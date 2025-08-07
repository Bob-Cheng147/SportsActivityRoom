import { MidwayConfig } from '@midwayjs/core';
import { join,resolve } from 'path';

// ✅ 显式导入所有实体
import { User } from '../entity/user.entity';
import { Event } from '../entity/event.entity';
import { EventRegistration } from '../entity/event-registration.entity';
import { Review } from '../entity/event-review.entity';

export default {
  // 用于 cookie 签名的密钥（生产环境务必更换为随机安全字符串）
  keys: '1753106557885_1651',

  // Koa 框架核心配置
  koa: {
    port: 7001, // 服务监听端口
    cors: {
      // 开发环境建议指定具体前端域名（而非 *），避免安全风险
      origin: 'http://localhost:5173', // 假设前端运行在 5173 端口（Vite 默认）
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允许的 HTTP 方法
      allowHeaders: ['Content-Type', 'Authorization','Cache-Control',       // &#10071; 允许缓存控制头通过预检请求
      'If-None-Match'  ], // 允许的请求头
      credentials: true, // 允许跨域请求携带 Cookie（如需身份验证）
       exposeHeaders: [          // 暴露给前端的关键响应头
      'ETag',
      'Last-Modified',
      'Cache-Control'
    ],
    maxAge: 86400             // 预检请求缓存时间（秒）
    },
  },
// 静态文件服务 - ✅ 关键配置
  staticFile: {
    prefix: '/', // 可以是 '/'，但需确保 API 优先匹配
    dir: resolve(__dirname, '../public'), // 前端构建产物目录
    dynamic: true, // ✅ 重要：只在文件存在时才返回，避免拦截 API
  },

  // TypeORM 数据库配置（SQLite）
// config.default.ts
 typeorm: {
    dataSource: {
      default: {
        type: 'sqlite',
        database: join(__dirname, '../../database/app.db'),
        synchronize: true,
        logging: ['query', 'error', 'schema'], // ✅ 增加 schema 日志
        // ✅ 显式列出所有实体类
        entities: [
          User,
          Event,
          EventRegistration,
          Review
        ],
      },
    },
  },


  // Swagger 接口文档配置
  swagger: {
    enable: process.env.NODE_ENV === 'development', // 仅开发环境启用 Swagger
    title: '运动活动室后端 API',
    description: '包含用户注册、登录及首页基础接口的文档',
    version: '1.0.0',
    path: '/swagger-ui', // 访问路径：http://localhost:7001/swagger-ui
    controllerDirs: [join(__dirname, '../controller')], // 明确扫描控制器目录
    apiInfo: {
      termsOfService: 'https://example.com/terms',
      contact: {
        name: 'API 支持',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    schemes: ['http'], // 开发环境使用 HTTP
    security: [
      {
        bearerAuth: [], // 全局启用 Bearer 认证
      },
    ],
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'JWT 认证令牌，格式：Bearer <token>',
      },
    },
  },

  // 中间件执行顺序（仅保留实际存在的中间件）
  middlewareOrder: [
    'cors', // 跨域中间件优先执行
    // 若已删除 reportMiddleware，移除该配置项，避免找不到模块错误
    // 'reportMiddleware', 
  ],

  // JWT 配置（如果使用 JWT 认证，补充此配置）
  jwt: {
    secret: 'your-super-long-and-random-secret-key-2025!@#', // JWT 加密密钥（与 keys 分开设置）
    expiresIn: '24h', // 令牌有效期
  },
} as MidwayConfig;