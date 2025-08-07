// src/entity/event.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { EventRegistration } from './event-registration.entity';
import { Review } from './event-review.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'max_participants' })
  maxParticipants: number;

  @Column({ default: 0 })
  participants: number;

  @Column({ default: 0 })
  price: number;

  @ManyToOne(() => User, user => user.createdEvents) // ✅ 修复：指向 User 的 createdEvents
  createdBy: User;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @OneToMany(() => EventRegistration, registration => registration.event)
  registrations: EventRegistration[];

  @OneToMany(() => Review, review => review.event)
  reviews: Review[];
}