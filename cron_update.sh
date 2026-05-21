#!/bin/bash
# 定时更新脚本 - 每日凌晨2点执行
# 创建cron任务: crontab -e 添加: 0 2 * * * /path/to/cron_update.sh

cd "$(dirname "$0")"

echo "========== $(date) 开始更新数据 =========="

# 依次执行爬虫
echo "1. 更新国家能源局数据..."
python3 crawler/crawl_nea.py

echo "2. 更新北极星光伏网数据..."
python3 crawler/crawl_bjx.py

echo "3. 更新CNESA储能数据..."
python3 crawler/crawl_cnesa.py

echo "4. 更新招投标数据..."
python3 crawler/crawl_bidding.py

echo "5. 整合数据..."
python3 crawler/merge_data.py

echo "========== $(date) 数据更新完成 =========="
