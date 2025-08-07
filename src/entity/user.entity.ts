// src/entity/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Event } from './event.entity';
import { EventRegistration } from './event-registration.entity';
import { Review } from './event-review.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ name: 'password_hash', length: 100 })
  passwordHash: string;

  @Column({ nullable: true, length: 100 })
  email?: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @OneToMany(() => Event, event => event.createdBy) // ✅ 修复：使用类引用
  createdEvents: Event[];

  @OneToMany(() => EventRegistration, registration => registration.user)
  registrations: EventRegistration[];

  @OneToMany(() => Review, review => review.user)
  reviews: Review[];
}