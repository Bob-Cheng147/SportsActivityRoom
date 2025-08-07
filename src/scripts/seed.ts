/**import { DataSource } from 'typeorm';
import { Event } from '../entity/event.entity';
import { User } from '../entity/user.entity';
import { EventRegistration } from '../entity/event-registration.entity';
import { EventReview } from '../entity/event-review.entity';
import * as fs from 'fs';
import * as path from 'path';

const dataSource = new DataSource({
  type: 'sqlite',
  database: path.resolve(__dirname, '../../database/app.db'), // ✅ 正确路径
  entities: [
    Event, 
    User,
    EventRegistration,
    EventReview,
  ],
  synchronize: true,
});

async function seedData() {
  try {
    await dataSource.initialize();
    console.log('✅ 数据库连接成功');

    const filePath = path.resolve(__dirname, 'data/seeds.json');
    console.log('✅ 正在读取文件:', filePath);

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log('✅ 读取到数据:', data);

    const eventRepository = dataSource.getRepository(Event);
    await eventRepository.clear();
    console.log('✅ events 表已清空');

    const eventsToSave = data.map(item => {
      const event = new Event();
      event.name = item.name;
      event.participants = item.participants;
      event.maxParticipants = item.maxParticipants;
      event.price = item.price;
      return event;
    });

    const savedEvents = await eventRepository.save(eventsToSave);
    console.log(`✅ 成功插入 ${savedEvents.length} 条活动数据`);

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ 数据初始化失败:', error);
  }
}

seedData();**/