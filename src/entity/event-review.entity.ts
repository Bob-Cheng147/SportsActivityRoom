// src/entity/event-review.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Event } from './event.entity';
import { User } from './user.entity';

@Entity('event_reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, event => event.id)
  event: Event;

  @ManyToOne(() => User, user => user.id)
  user: User;

  @Column({ type: 'int', nullable: true })
  rating: number; // 评分 1-5

  @Column({ type: 'text', nullable: true })
  comment: string; // 评论内容

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;


   @CreateDateColumn({ name: 'createdAt' }) // ⚠️ 这个字段必须存在
  createdAt: Date;

}