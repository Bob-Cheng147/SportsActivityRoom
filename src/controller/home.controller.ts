import { Controller, Get, Post, Body, Inject, HttpCode } from '@midwayjs/decorator';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@midwayjs/swagger';
import { UserService } from '../service/user.service';
//import { LoginResult } from '../interface';
import { RegisterDTO } from '../interface';
import { Context } from '@midwayjs/koa';
/**
 * 首页控制器：处理基础页面路由及用户相关接口
 */
@ApiTags('首页及用户相关接口') // 合并分类标签
@Controller('/')
export class HomeController {
  // 注入 UserService
  @Inject()
  userService: UserService;
 
   @Inject()
  ctx: Context;
  /**
   * 根路径接口：返回欢迎信息
   */
  @Get('/')
  @ApiOperation({ 
    summary: '根路径默认接口', 
    description: '访问网站根路径时返回欢迎信息，用于验证服务是否正常运行' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '服务正常运行时返回的欢迎文本',
    schema: { type: 'string', example: 'Welcome to Sports Activity Room Backend!' }
  })
  async index(): Promise<string> {
    return 'Welcome to Sports Activity Room Backend!';
  }

  /**
   * 首页信息接口
   */
  @Get('/home')
  @ApiOperation({ 
    summary: '首页页面接口', 
    description: '返回首页展示信息' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '首页文本内容',
    schema: { type: 'string', example: 'Hello Midwayjs! This is Home Page' }
  })
  async home(): Promise<string> {
    return 'Hello Midwayjs! This is Home Page';
  }

  /**
   * 视图页面接口
   */
  @Get('/view')
  @ApiOperation({ 
    summary: '视图页面接口', 
    description: '返回视图页展示信息' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '视图页文本内容',
    schema: { type: 'string', example: 'Hello Midwayjs! This is View Page' }
  })
  async view(): Promise<string> {
    return 'Hello Midwayjs! This is View Page';
  }

  /**
   * 用户注册接口
   */
@Post('/register')
@HttpCode(200)
@ApiOperation({ 
  summary: '用户注册接口', 
  description: '注册新用户并返回结果' 
})
@ApiBody({
  schema: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { 
        type: 'string', 
        example: 'testuser',
        description: '用户名，长度3-20字符'
      },
      password: { 
        type: 'string', 
        example: '123456',
        description: '密码，长度6-20字符'
      }
    }
  }
})
@ApiResponse({
  status: 200,
  description: '注册结果',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' }
    }
  }
})
async register(@Body() body: RegisterDTO) {
  const { username, password } = body;
  

  if (!username || !password) {
    return { success: false, message: '用户名和密码不能为空' };
  }
  
  if (username.length < 3 || username.length > 20) {
    return { success: false, message: '用户名长度应为3-20个字符' };
  }
  
  if (password.length < 6) {
    return { success: false, message: '密码长度不能少于6位' };
  }

  try {
    const result = await this.userService.register(username, password);
    if (result) {
      return { success: true, message: '注册成功' };
    } else {
      return { success: false, message: '用户名已存在' };
    }
  } catch (error) {
    console.error('注册失败:', error);
    return { success: false, message: '注册过程中发生错误' };
  }
}
  /**
 * 用户登录接口
 */
@Post('/login')
@HttpCode(200)
@ApiOperation({ 
  summary: '用户登录接口', 
  description: '验证用户名和密码，正确则返回token' 
})
@ApiBody({
  description: '登录参数',
  required: true,
  schema: {
    type: 'object',
    properties: {
      username: { type: 'string', example: 'testuser' },
      password: { type: 'string', example: '123456' }
    }
  }
})
@ApiResponse({
  status: 200,
  description: '登录结果响应',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: '登录成功' },
      token: { type: 'string', example: 'mock-token-1' }
    }
  }
})
async login(@Body() body: { username: string; password: string }) {
  const { username, password } = body;

  // 1. 校验参数
  if (!username || !password) {
    return { success: false, message: '用户名和密码不能为空' };
  }

  try {
    // 2. 调用 UserService 的 verifyUser 方法
    const result = await this.userService.verifyUser(username, password);
    
    if (result.success) {
      return {
        success: true,
        message: '登录成功',
        token: result.token ,// 使用 UserService 返回的 token
         user: { 
          userId: result.userId, 
          username: result.username,
        } // ✅ 返回用户信息，便于前端存储
      };
    } else {
      return {
        success: false,
        message: '用户名或密码错误'
      };
    }
  } catch (error) {
    console.error('登录失败:', error);
    return {
      success: false,
      message: '登录过程中发生错误'
    };
  }
}
}