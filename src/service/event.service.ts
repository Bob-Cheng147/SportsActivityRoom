// src/service/event.service.ts
import { Provide } from '@midwayjs/decorator';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Event } from '../entity/event.entity';
import { Review } from '../entity/event-review.entity'; // 确保有这个实体
import { EventRegistration } from '../entity/event-registration.entity';
import { User } from '../entity/user.entity'; // 确保有这个实体

@Provide()
export class EventService {
  @InjectEntityModel(Event)
  eventRepository: Repository<Event>;

  @InjectEntityModel(Review)
  reviewRepository: Repository<Review>;

  @InjectEntityModel(EventRegistration)
  registrationRepository: Repository<EventRegistration>;
  

  
  /**
   * 获取所有活动（支持搜索、分页）
   * @param name - 活动名称关键词
   * @param skip - 跳过数量（用于分页）
   * @param take - 每页数量（用于分页）
   */
  async getAllEvents(name?: string, skip: number = 0, take: number = 10) {
    const query = this.eventRepository.createQueryBuilder('event')
      .leftJoinAndSelect('event.registrations', 'registration') // 关联报名记录
      .leftJoinAndSelect('event.reviews', 'review') // 关联评论
      .skip(skip)
      .take(take);

    if (name) {
      query.where('event.name LIKE :name', { name: `%${name}%` }); // 模糊搜索
    }

    try {
      const events = await query.getMany();
      return events;
    } catch (error) {
      throw new Error(`获取活动列表失败: ${error.message}`);
    }
  }

  /**
   * 根据用户 ID 获取已报名活动
   * @param userId - 用户 ID
   */
async getEventsByUserId(userId: number, skip: number = 0, take: number = 10) {
  // 🔔 加日志，方便调试
  console.log(`🔍 查询用户 (ID: ${userId}) 的报名活动，分页: skip=${skip}, take=${take}`);

  try {
    const events = await this.eventRepository
      .createQueryBuilder('event')
      .innerJoin(
        'event.registrations',
        'registration',
        'registration.userId = :userId AND registration.status = :status',
        { userId, status: 'active' } // ✅ 同时检查状态
      )
      .select([
        'event.id',
        'event.name',
        'event.price',
        'event.participants',
        'event.maxParticipants'
      ])
      .skip(skip)
      .take(take)
      .getMany();

    console.log(`✅ 查询到 ${events.length} 个活动:`, events.map(e => e.name)); // 👈 看看有没有数据

    return events;
  } catch (error) {
    console.error(`❌ 获取用户报名活动失败: ${error.message}`);
    throw new Error(`获取用户报名活动失败: ${error.message}`);
  }
}
  /**
   * 报名活动（增加参与人数）
   * @param eventId - 活动 ID
   * @param userId - 用户 ID
   */
  async registerForEvent(eventId: number, userId: number) {
    return await this.registrationRepository.manager.transaction(
      async (manager) => {
        // 1. 检查活动是否存在
        const event = await manager.findOne(Event, { where: { id: eventId } });
        if (!event) throw new Error('活动不存在');
        if (event.participants >= event.maxParticipants) throw new Error('活动人数已满');

        // 2. 检查是否已报名（防止重复）
        const existing = await manager.findOne(EventRegistration, {
          where: { userId, eventId }
        });
        if (existing) throw new Error('请勿重复报名');

        // 3. 更新活动人数
        event.participants += 1;
        await manager.save(Event, event);

        // 4. 创建报名记录
        const registration = manager.create(EventRegistration, {
           userId ,
          eventId ,
          status: 'active'
        });
        await manager.save(EventRegistration, registration);

        return { success: true, message: '报名成功' };
      }
    );
  }
 async getReviewsByEvent(eventId: number) {
    return await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoin(User, 'user', 'review.userId = user.id')
      .select([
        'review.id AS id',
        'review.rating AS rating',
        'review.comment AS comment',
        'review.createdAt AS createdAt',
        'user.username AS username',
      ])
      .where('review.eventId = :eventId', { eventId })
      .orderBy('review.createdAt', 'DESC')
      .getRawMany();
  }


  /**
   * 用户评价活动
   * @param eventId - 活动 ID
   * @param userId - 用户 ID
   * @param rating - 评分（1-5）
   * @param comment - 评论内容（可选）
   * @returns { success: boolean, message: string }
   */
  async reviewEvent(eventId: number, userId: number, rating: number, comment?: string) {
    return await this.reviewRepository.manager.transaction(async manager => {
      // 1. 验证评分范围
      if (!rating || rating < 1 || rating > 5) {
        throw new Error('评分必须为 1 到 5 之间的整数');
      }

      // 2. 检查活动是否存在
      const event = await manager.findOne(Event, { where: { id: eventId } });
      if (!event) {
        throw new Error('活动不存在');
      }

      // 3. 检查用户是否已报名该活动（只有报名用户才能评价）
      const registration = await manager.findOne(EventRegistration, {
        where: { userId, eventId }
      });
      if (!registration) {
        throw new Error('只有报名用户才能评价该活动');
      }

      // 4. 检查是否已评论（根据 UNIQUE(user_id, event_id) 约束）
      const existingReview = await manager.findOne(Review, {
        where: { user: { id: userId }, event: { id: eventId } }
      });
      if (existingReview) {
        throw new Error('您已评论过该活动，不可重复评论');
      }

      // 5. 创建评论
      const review = manager.create(Review, {
        userId,
        eventId,
        rating,
        comment: comment?.trim() || null // 空字符串转为 null
      });

      try {
        await manager.save(Review, review);
        return { success: true, message: '评价成功' };
      } catch (error) {
        // 如果数据库有 UNIQUE 约束，可能会抛出唯一键冲突
        if (error.code === 'SQLITE_CONSTRAINT' || error.code === 'ER_DUP_ENTRY') {
          throw new Error('您已评论过该活动');
        }
        throw error;
      }
    });
  }
  // src/service/event.service.ts

// 新增：减少活动参与人数
async decrementParticipants(eventId: number) {
  const event = await this.eventRepository.findOne({ where: { id: eventId } });
  if (event && event.participants > 0) {
    event.participants -= 1;
    await this.eventRepository.save(event);
  }
}
}