/**
 * 数据库迁移脚本 - 创建所有表
 * 用法: npx tsx scripts/db-migrate.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pvmap';

async function migrate() {
  console.log('=== 数据库迁移 ===');
  console.log(`数据库: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);

  // 动态导入 pg
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: DATABASE_URL, connectionTimeoutMillis: 10000 });

  try {
    const client = await pool.connect();
    console.log('✓ 数据库连接成功');

    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
    await client.query(sql);
    console.log('✓ 数据表创建成功');

    client.release();
  } catch (error) {
    console.error('✗ 迁移失败:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await pool.end();
  }

  console.log('\n迁移完成!');
}

migrate();
