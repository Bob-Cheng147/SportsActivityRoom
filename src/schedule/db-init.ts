import { Provide, Schedule, Inject } from '@midwayjs/core';
import { readFileSync } from 'fs';
import { join } from 'path';

@Provide()
@Schedule({
  cron: '0 0 0 * * *', // 每天执行一次（实际只需执行一次）
  type: 'worker'
})
export class DBInitTask {
  @Inject()
  sequelize: any;

  async exec() {
    const sql = readFileSync(join(__dirname, '../../database/init.sql'), 'utf8');
    await this.sequelize.query(sql);
  }
}