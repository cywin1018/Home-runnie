import { Controller, Get, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/common/db/constants';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/common/db/schema';

@Controller()
export class HealthController {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  @Get('health')
  checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('db-test')
  async checkDb() {
    try {
      const result = await this.db.execute(sql`SELECT 1 as "isAlive"`);
      return {
        status: 'ok',
        db: 'connected',
        result: result.rows,
      };
    } catch (error: unknown) {
      return {
        status: 'error',
        db: 'disconnected',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
