import dotenv from 'dotenv';
import { seeding } from './src/common/db/seed/main';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? 'prod.env' : '.env';
dotenv.config({ path: `./secret/${envFile}` });

async function runSeed() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    await seeding();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

runSeed();
