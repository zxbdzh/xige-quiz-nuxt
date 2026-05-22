#!/bin/bash
# Docker 构建脚本（适用于 NAS / 本地服务器）

set -e

# 启用 BuildKit 构建缓存
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== 习概练习题库 Docker 构建 ===${NC}"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker 未安装${NC}"
    exit 1
fi

# 检查 docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}警告: docker-compose 未安装，尝试使用 docker compose${NC}"
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# 解析参数
ACTION=${1:-build}

case $ACTION in
    build)
        echo -e "${GREEN}构建镜像...${NC}"
        $COMPOSE_CMD build --no-cache
        echo -e "${GREEN}构建完成！${NC}"
        ;;
    up)
        echo -e "${GREEN}启动容器...${NC}"
        $COMPOSE_CMD up -d
        echo -e "${GREEN}容器已启动，访问 http://localhost:3000${NC}"
        ;;
    down)
        echo -e "${YELLOW}停止容器...${NC}"
        $COMPOSE_CMD down
        ;;
    restart)
        echo -e "${YELLOW}重启容器...${NC}"
        $COMPOSE_CMD restart
        ;;
    logs)
        $COMPOSE_CMD logs -f
        ;;
    rebuild)
        echo -e "${YELLOW}清理并重新构建...${NC}"
        $COMPOSE_CMD down
        $COMPOSE_CMD build --no-cache
        $COMPOSE_CMD up -d
        echo -e "${GREEN}重建完成！${NC}"
        ;;
    *)
        echo "用法: $0 {build|up|down|restart|logs|rebuild}"
        echo ""
        echo "  build   - 构建镜像（不使用缓存）"
        echo "  up      - 启动容器"
        echo "  down    - 停止容器"
        echo "  restart - 重启容器"
        echo "  logs    - 查看日志"
        echo "  rebuild - 清理重建（完整重装）"
        exit 1
        ;;
esac
