-- 光伏储能地图站 - 数据库初始化 SQL
-- 用法: psql -d pvmap -f scripts/init.sql

-- Enums
DO $$ BEGIN
  CREATE TYPE project_type AS ENUM ('光伏', '储能', '风电', '充电', '氢能', '综合能源');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE bidding_status AS ENUM ('报名中', '已截止');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 项目表
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  type project_type DEFAULT '综合能源',
  province VARCHAR(20),
  capacity VARCHAR(50),
  amount VARCHAR(50),
  company VARCHAR(200),
  summary TEXT,
  date VARCHAR(20),
  source_url TEXT,
  source_name VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 招标表
CREATE TABLE IF NOT EXISTS bidding_items (
  id VARCHAR(50) PRIMARY KEY,
  title TEXT NOT NULL,
  province VARCHAR(20),
  category VARCHAR(20),
  summary TEXT,
  capacity VARCHAR(50),
  amount VARCHAR(50),
  company VARCHAR(200),
  date VARCHAR(20),
  status bidding_status DEFAULT '报名中',
  source_url TEXT,
  source_name VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 中标表
CREATE TABLE IF NOT EXISTS award_items (
  id VARCHAR(50) PRIMARY KEY,
  title TEXT NOT NULL,
  province VARCHAR(20),
  category VARCHAR(20),
  summary TEXT,
  capacity VARCHAR(50),
  amount VARCHAR(50),
  company VARCHAR(200),
  date VARCHAR(20),
  status VARCHAR(20),
  source_url TEXT,
  source_name VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 充电桩表
CREATE TABLE IF NOT EXISTS charger_items (
  id VARCHAR(50) PRIMARY KEY,
  title TEXT NOT NULL,
  province VARCHAR(20),
  summary TEXT,
  capacity VARCHAR(50),
  company VARCHAR(200),
  date VARCHAR(20),
  source_url TEXT,
  source_name VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 爬取日志
CREATE TABLE IF NOT EXISTS crawl_logs (
  id SERIAL PRIMARY KEY,
  source VARCHAR(50) NOT NULL,
  source_url TEXT,
  success INTEGER DEFAULT 0,
  count INTEGER DEFAULT 0,
  message TEXT,
  crawled_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI分析日志
CREATE TABLE IF NOT EXISTS ai_analysis_logs (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  input_content TEXT,
  result_summary TEXT,
  key_points JSONB,
  risk_level VARCHAR(10),
  sentiment VARCHAR(10),
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_province ON projects(province);
CREATE INDEX IF NOT EXISTS idx_projects_date ON projects(date);
CREATE INDEX IF NOT EXISTS idx_bidding_status ON bidding_items(status);
CREATE INDEX IF NOT EXISTS idx_bidding_province ON bidding_items(province);
CREATE INDEX IF NOT EXISTS idx_award_province ON award_items(province);
CREATE INDEX IF NOT EXISTS idx_charger_province ON charger_items(province);
CREATE INDEX IF NOT EXISTS idx_crawl_logs_source ON crawl_logs(source);
CREATE INDEX IF NOT EXISTS idx_ai_logs_type ON ai_analysis_logs(type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON ai_analysis_logs(created_at);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projects_updated ON projects;
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_bidding_updated ON bidding_items;
CREATE TRIGGER trg_bidding_updated BEFORE UPDATE ON bidding_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_awards_updated ON award_items;
CREATE TRIGGER trg_awards_updated BEFORE UPDATE ON award_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_chargers_updated ON charger_items;
CREATE TRIGGER trg_chargers_updated BEFORE UPDATE ON charger_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
