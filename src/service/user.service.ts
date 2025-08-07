// src/service/user.service.ts
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import * as bcrypt from 'bcrypt';
import { Provide, Inject } from '@midwayjs/decorator';
import { JwtService } from '@midwayjs/jwt';

@Provide()
export class UserService {
  @InjectEntityModel(User)
  userRepository: Repository<User>;

  @Inject()
  jwtService: JwtService;

  // 注册
  async register(username: string, password: string): Promise<boolean> {
    const existing = await this.userRepository.findOne({ where: { username } });
    if (existing) return false;

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.userRepository.save({
      username,
      passwordHash: hashedPassword, // ✅ 修复：使用 passwordHash
    });

    return true;
  }
  
  async findById(id: number) {
    return await this.userRepository.findOne({ where: { id } });
  }
async verifyUser(
  username: string, 
  password: string
): Promise<{ success: boolean; token?: string; userId?: number; username?: string}> {
  const user = await this.userRepository.findOne({ where: { username } });
  if (!user) return { success: false };

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return { success: false };

  // ✅ 使用 this.jwtService.sign
  const token = await this.jwtService.sign(
    { userId: user.id, username: user.username },
    { expiresIn: '24h' } // ⚠️ 可以覆盖 config 的 expiresIn
  );
  // ⬆️ secret 会自动从 config.default.ts 读取，无需手动传！

  return { success: true, token, userId: user.id,username: user.username };
}
  /**
   * 获取用户统计信息
   * @param userId - 用户 ID
   */
  async getUserStats(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['createdEvents', 'registrations', 'reviews']
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    return {
      createdEventsCount: user.createdEvents?.length || 0,
      registeredEventsCount: user.registrations?.length || 0,
      reviewsCount: user.reviews?.length || 0,
      // 可以添加更多统计，如平均评分等
    };
  }
}