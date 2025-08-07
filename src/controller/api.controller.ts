// src/controller/api.controller.ts
import { Controller,Del, Provide, Get, Param, Post, Inject, Body, UseGuard } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { EventService } from '../service/event.service';
import { Result } from '../utils/result'; // ✅ 导入 Result 工具
import { JwtAuthGuard } from '../guard/jwt.auth.guard';
import { ReviewDto } from '../interface'; // ✅ 导入 ReviewDto 接口
 // ✅ 导入 JWT 认证守卫
@Provide()
@Controller('/api')
export class ApiController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Inject()
  eventService: EventService;

@Get('/test')
async test() {
  return { success: true, message: 'test ok' };
}

  /**
   * 获取当前用户信息
   */
  @Get('/user/profile')
  @UseGuard(JwtAuthGuard) // ✅ 加上这一行！
  async getProfile() {
    const rawUser = this.ctx.state.user;
     console.log('📎 请求头 Authorization:', this.ctx.get('Authorization'));
  console.log('🔐 this.ctx.state.user =', rawUser); // 🔥 关键：打印看看有没有 userId

  const userId = rawUser?.userId;

    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        return Result.fail('用户不存在');
      }
      const registeredEvents = await this.eventService.getEventsByUserId(userId);
      return Result.success({
        userId: user.id,
        username: user.username,
        registeredEvents
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return Result.fail('服务器错误');
    }
  }

  @Get('/events')
  async getAllEvents() {
    try {
      const events = await this.eventService.getAllEvents(); // 调用 EventService 方法
      return Result.success(events); // 返回活动列表
    } catch (error) {
      this.ctx.logger.error('获取活动列表失败:', error);
      return Result.fail('服务器错误');
    }
  }


  // src/controller/api.controller.ts

@Get('/events/:id/reviews')
async getEventReviews(@Param('id') eventId: number) {
  try {
    const reviews = await this.eventService.getReviewsByEvent(eventId);
    return Result.success(reviews);
  } catch (error) {
    this.ctx.logger.error('获取评价失败:', error);
    return Result.fail('服务器错误');
  }
}
  /**
   * 获取用户报名的活动
   */
  @Get('/user/events')
  async getUserEvents() {
    const userId = this.ctx.state.user?.userId;
    const skip = parseInt(this.ctx.query.skip as string) || 0;
    const take = parseInt(this.ctx.query.take as string) || 10;
    try {
      const events = await this.eventService.getEventsByUserId(userId, skip, take);
      return Result.success(events);
    } catch (error) {
      this.ctx.logger.error('获取用户活动失败:', error);
      return Result.fail('服务器错误');
    }
  }

 

 @Post('/events/register')
async registerForEvent(
  @Body() body: { eventId: number; userId: number } // ✅ 接收整个 body 对象
) {console.log('🔴 接收到的 body:', body); // ✅ 打印看看
  const { eventId, userId } = body;

  if (!eventId || !userId) {
    return Result.fail('缺少必要参数：eventId 或 userId');
  }

  try {
    const result = await this.eventService.registerForEvent(eventId, userId);
    return Result.success(result);
  } catch (error) {
    return Result.fail(error.message);
  }
}


@Post('/events/reviews')
async reviewEvent(
  @Body() dto: ReviewDto // ✅ 使用 DTO 接收参数
) { console.log('⭐ 接收到的 dto:', dto); // 打印
  const { event_id, userId, rating, comment } = dto;

  if (!event_id || !userId || !rating) {
    return Result.fail('缺少必要参数');
  }

  console.log(`⭐ reviewEvent 被调用，eventId = ${event_id}, rating = ${rating}, userId = ${userId}`);

  try {
    const result = await this.eventService.reviewEvent(event_id, userId, rating, comment);
    return Result.success(result);
  } catch (error) {
    return Result.fail(error.message);
  }
}


@Del('/events/:eventId/cancel')
@UseGuard(JwtAuthGuard)
async cancelRegistration(
  @Param('eventId') eventId: number,
  @Body() body: { userId: number } // 也可以从 token 拿 userId
) {
  const userId = body.userId || this.ctx.state.user?.userId;

  if (!userId) {
    return Result.fail('未登录或用户信息缺失');
  }

  try {
    // 1. 查找报名记录
    const registration = await this.eventService.registrationRepository.findOne({
      where: {
        userId,
        eventId,
        status: 'active'
      }
    });

    if (!registration) {
      return Result.fail('未找到有效的报名记录，无法退选');
    }

    // 2. 更新状态为 cancelled
    registration.status = 'cancelled';
    await this.eventService.registrationRepository.save(registration);

    // 3. 可选：减少活动的 participants 数量
    await this.eventService.decrementParticipants(eventId);

    return Result.success(null);
  } catch (error) {
    console.error('退选失败:', error);
    return Result.fail('服务器错误');
  }
}


}
