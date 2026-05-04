/**
 * 数据库层 - Drizzle ORM + PostgreSQL
 * 
 * Schema:
 * - projects: 光伏储能项目
 * - bidding_items: 招标公告
 * - award_items: 中标公示
 * - charger_items: 充电桩
 * - crawl_logs: 爬取日志
 * - ai_analysis_logs: AI分析日志
 */

import { pgTable, text, timestamp, integer, jsonb, pgEnum, varchar, real } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// ===== Enum =====

export const projectTypeEnum = pgEnum('project_type', ['光伏', '储能', '风电', '充电', '氢能', '综合能源']);
export const biddingStatusEnum = pgEnum('bidding_status', ['报名中', '已截止']);

// ===== 表定义 =====

export const projects = pgTable('projects', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: text('name').notNull(),
  type: projectTypeEnum('type').default('综合能源'),
  province: varchar('province', { length: 20 }),
  capacity: varchar('capacity', { length: 50 }),
  amount: varchar('amount', { length: 50 }),
  company: varchar('company', { length: 200 }),
  summary: text('summary'),
  date: varchar('date', { length: 20 }),
  sourceUrl: text('source_url'),
  sourceName: varchar('source_name', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const biddingItems = pgTable('bidding_items', {
  id: varchar('id', { length: 50 }).primaryKey(),
  title: text('title').notNull(),
  province: varchar('province', { length: 20 }),
  category: varchar('category', { length: 20 }),
  summary: text('summary'),
  capacity: varchar('capacity', { length: 50 }),
  amount: varchar('amount', { length: 50 }),
  company: varchar('company', { length: 200 }),
  date: varchar('date', { length: 20 }),
  status: biddingStatusEnum('status').default('报名中'),
  sourceUrl: text('source_url'),
  sourceName: varchar('source_name', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const awardItems = pgTable('award_items', {
  id: varchar('id', { length: 50 }).primaryKey(),
  title: text('title').notNull(),
  province: varchar('province', { length: 20 }),
  category: varchar('category', { length: 20 }),
  summary: text('summary'),
  capacity: varchar('capacity', { length: 50 }),
  amount: varchar('amount', { length: 50 }),
  company: varchar('company', { length: 200 }),
  date: varchar('date', { length: 20 }),
  status: varchar('status', { length: 20 }),
  sourceUrl: text('source_url'),
  sourceName: varchar('source_name', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const chargerItems = pgTable('charger_items', {
  id: varchar('id', { length: 50 }).primaryKey(),
  title: text('title').notNull(),
  province: varchar('province', { length: 20 }),
  summary: text('summary'),
  capacity: varchar('capacity', { length: 50 }),
  company: varchar('company', { length: 200 }),
  date: varchar('date', { length: 20 }),
  sourceUrl: text('source_url'),
  sourceName: varchar('source_name', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const crawlLogs = pgTable('crawl_logs', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  source: varchar('source', { length: 50 }).notNull(),
  sourceUrl: text('source_url'),
  success: integer('success'), // 0 or 1
  count: integer('count'),
  message: text('message'),
  crawledAt: timestamp('crawled_at').defaultNow(),
});

export const aiAnalysisLogs = pgTable('ai_analysis_logs', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  type: varchar('type', { length: 20 }).notNull(),
  inputContent: text('input_content'),
  resultSummary: text('result_summary'),
  keyPoints: jsonb('key_points'),
  riskLevel: varchar('risk_level', { length: 10 }),
  sentiment: varchar('sentiment', { length: 10 }),
  latencyMs: integer('latency_ms'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ===== Zod Schemas =====

export const insertProjectSchema = createInsertSchema(projects);
export const selectProjectSchema = createSelectSchema(projects);
export const insertBiddingSchema = createInsertSchema(biddingItems);
export const insertAwardSchema = createInsertSchema(awardItems);
export const insertChargerSchema = createInsertSchema(chargerItems);
