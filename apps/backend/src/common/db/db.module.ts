import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DATABASE_CONNECTION } from '@/common/db/constants';
import * as schema from '@/common/db/schema';

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isMigrating = configService.get<string>('DB_MIGRATING') === 'true';
        const isSeeding = configService.get<string>('DB_SEEDING') === 'true';

        const pool = new Pool({
          connectionString: configService.getOrThrow('DATABASE_URL'),
          max: isMigrating || isSeeding ? 1 : 10,
          ssl: {
            rejectUnauthorized: false,
          },
        });

        return drizzle(pool, {
          schema,
        });
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DbModule {}
