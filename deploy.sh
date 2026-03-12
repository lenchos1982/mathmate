#!/bin/bash
# MathMate Vercel 部署脚本

echo "========================================="
echo "MathMate 部署脚本"
echo "========================================="

# 检查是否已登录Vercel
echo "检查Vercel登录状态..."
vercel whoami &>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ 未登录Vercel，请先执行: vercel login"
    exit 1
fi

echo "✅ 已登录Vercel"

# 部署
echo "开始部署..."
cd "$(dirname "$0")"

vercel --prod --yes

echo ""
echo "========================================="
echo "部署完成！"
echo "========================================="
