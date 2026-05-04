#!/bin/bash
# 光伏储能地图站 - 一键部署脚本
# 用法: bash scripts/deploy.sh [--dev|--prod|--migrate|--seed]

set -e

MODE="${1:---dev}"
echo "=== 光伏储能地图站部署 ==="
echo "模式: $MODE"

# 检查依赖
command -v docker >/dev/null 2>&1 || { echo "错误: 需要安装 Docker"; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "错误: 需要安装 Docker Compose"; exit 1; }

# 环境文件
if [ ! -f .env ]; then
  echo "创建 .env 文件..."
  cp .env.example .env
fi

case "$MODE" in
  --migrate)
    echo "运行数据库迁移..."
    docker compose exec web npx tsx scripts/db-migrate.ts
    echo "迁移完成!"
    exit 0
    ;;
  --seed)
    echo "导入种子数据..."
    docker compose exec web npx tsx scripts/db-seed.ts
    echo "种子数据导入完成!"
    exit 0
    ;;
  --prod)
    echo "生产模式部署..."
    NODE_ENV=production docker compose up -d --build
    ;;
  *)
    echo "开发模式部署..."
    docker compose up -d --build
    ;;
esac

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 检查健康状态
echo "检查服务状态..."
echo ""
echo "--- Web 服务 ---"
curl -s http://localhost:5000/api/health 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Web服务启动中..."
echo ""
echo "--- Ollama 服务 ---"
curl -s http://localhost:11434/api/tags 2>/dev/null | head -c 200 || echo "Ollama服务启动中..."
echo ""

echo ""
echo "=== 部署完成 ==="
echo "Web:      http://localhost:5000"
echo "数据看板: http://localhost:5000/dashboard"
echo "AI助手:   http://localhost:5000/ai"
echo "健康检查: http://localhost:5000/api/health"
echo "Ollama:   http://localhost:11434"
echo ""
echo "首次使用 Ollama 需要拉取模型:"
echo "  docker compose exec ollama ollama pull qwen2.5:7b"
echo ""
echo "数据库操作:"
echo "  bash scripts/deploy.sh --migrate   # 运行迁移"
echo "  bash scripts/deploy.sh --seed      # 导入数据"
