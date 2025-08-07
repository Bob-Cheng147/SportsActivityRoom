// src/entity/event-registration.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Event } from './event.entity';

@Entity('event_registrations')
export class EventRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ 显式定义外键字段：数据库字段 user_id
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  // ✅ 显式定义外键字段：数据库字段 event_id
  @Column({ name: 'event_id', type: 'int' })
  eventId: number;

  // ✅ 关联实体（用于加载用户和活动对象）
  @ManyToOne(() => User, user => user.registrations)
  @JoinColumn({ name: 'user_id' }) // ✅ 明确指定数据库字段名
  user: User;

  @ManyToOne(() => Event, event => event.registrations)
  @JoinColumn({ name: 'event_id' }) // ✅ 明确指定数据库字段名
  event: Event;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn({ name: 'register_time' })
  registerTime: Date;
}