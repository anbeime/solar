/**
 * 数据库种子脚本 - 从 JSON 文件导入数据到 PostgreSQL
 * 用法: npx tsx scripts/db-seed.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pvmap';

async function seed() {
  console.log('=== 数据库种子导入 ===');

  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: DATABASE_URL, connectionTimeoutMillis: 10000 });

  try {
    const client = await pool.connect();
    console.log('✓ 数据库连接成功');

    // 导入项目数据
    const projectFile = path.join(DATA_DIR, 'projects.json');
    if (fs.existsSync(projectFile)) {
      const projects = JSON.parse(fs.readFileSync(projectFile, 'utf-8'));
      let imported = 0;
      for (const p of projects) {
        try {
          await client.query(`
            INSERT INTO projects (id, name, type, province, capacity, amount, company, summary, date, source_url, source_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name, type = EXCLUDED.type, province = EXCLUDED.province,
              capacity = EXCLUDED.capacity, amount = EXCLUDED.amount, company = EXCLUDED.company,
              summary = EXCLUDED.summary, date = EXCLUDED.date, updated_at = NOW()
          `, [p.id, p.name, p.type || '综合能源', p.province, p.capacity, p.amount, p.company, p.summary, p.date, p.sourceUrl, p.sourceName]);
          imported++;
        } catch { /* skip */ }
      }
      console.log(`✓ 项目: ${imported}/${projects.length}`);
    }

    // 导入招标数据
    const biddingFile = path.join(DATA_DIR, 'bidding.json');
    if (fs.existsSync(biddingFile)) {
      const items = JSON.parse(fs.readFileSync(biddingFile, 'utf-8'));
      let imported = 0;
      for (const b of items) {
        try {
          await client.query(`
            INSERT INTO bidding_items (id, title, province, category, summary, capacity, amount, company, date, status, source_url, source_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title, status = EXCLUDED.status, updated_at = NOW()
          `, [b.id, b.title, b.province, b.category, b.summary, b.capacity, b.amount, b.company, b.date, b.status || '报名中', b.sourceUrl, b.sourceName]);
          imported++;
        } catch { /* skip */ }
      }
      console.log(`✓ 招标: ${imported}/${items.length}`);
    }

    // 导入中标数据
    const awardsFile = path.join(DATA_DIR, 'awards.json');
    if (fs.existsSync(awardsFile)) {
      const items = JSON.parse(fs.readFileSync(awardsFile, 'utf-8'));
      let imported = 0;
      for (const a of items) {
        try {
          await client.query(`
            INSERT INTO award_items (id, title, province, category, summary, capacity, amount, company, date, status, source_url, source_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title, status = EXCLUDED.status, updated_at = NOW()
          `, [a.id, a.title, a.province, a.category, a.summary, a.capacity, a.amount, a.company, a.date, a.status || '已公示', a.sourceUrl, a.sourceName]);
          imported++;
        } catch { /* skip */ }
      }
      console.log(`✓ 中标: ${imported}/${items.length}`);
    }

    // 导入充电桩数据
    const chargersFile = path.join(DATA_DIR, 'chargers.json');
    if (fs.existsSync(chargersFile)) {
      const items = JSON.parse(fs.readFileSync(chargersFile, 'utf-8'));
      let imported = 0;
      for (const c of items) {
        try {
          await client.query(`
            INSERT INTO charger_items (id, title, province, summary, capacity, company, date, source_url, source_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title, updated_at = NOW()
          `, [c.id, c.title, c.province, c.summary, c.capacity, c.company, c.date, c.sourceUrl, c.sourceName]);
          imported++;
        } catch { /* skip */ }
      }
      console.log(`✓ 充电桩: ${imported}/${items.length}`);
    }

    client.release();
  } catch (error) {
    console.error('✗ 导入失败:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await pool.end();
  }

  console.log('\n种子数据导入完成!');
}

seed();
