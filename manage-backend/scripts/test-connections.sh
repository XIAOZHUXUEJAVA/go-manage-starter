#!/bin/bash

# 简洁的连接测试脚本
# 快速验证数据库和Redis连接

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔌 开始连接测试...${NC}"
echo ""

# 运行Go连接测试
echo -e "${YELLOW}📋 运行连接测试...${NC}"
if go test ./test/connection/... -v; then
    echo ""
    echo -e "${GREEN}✅ 所有连接测试通过！${NC}"
    echo ""
    echo -e "${YELLOW}🚀 你现在可以启动应用了:${NC}"
    echo "   make dev-local    # 开发环境"
    echo "   make dev-test     # 测试环境"
    echo "   make run-prod     # 生产环境"
else
    echo ""
    echo -e "${RED}❌ 连接测试失败！${NC}"
    echo ""
    echo -e "${YELLOW}🔧 请检查以下项目:${NC}"
    echo "1. PostgreSQL 是否运行在 localhost:5432"
    echo "2. Redis 是否运行在 localhost:6379"
    echo "3. 数据库用户名密码是否正确"
    echo "4. 数据库 go_manage_starter 是否存在"
    echo ""
    echo -e "${YELLOW}💡 快速修复建议:${NC}"
    echo "   make migrate      # 运行数据库迁移"
    echo "   make seed         # 添加示例数据"
    exit 1
fi